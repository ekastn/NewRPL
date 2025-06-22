import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import * as faceapi from 'face-api.js';
import '../styles/MeetingRoom.css';

function MeetingRoom() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { meetingId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [participants, setParticipants] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [emotionData, setEmotionData] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [pinnedUser, setPinnedUser] = useState(null);
    const [lastEmotion, setLastEmotion] = useState(null);


    const videoRef = useRef();
    const canvasRef = useRef();
    const streamRef = useRef();
    const detectionIntervalRef = useRef();

    // Mock participants data - in a real app, this would come from your backend
    const mockParticipants = [
        { id: 1, name: 'Nabil Rashad', image: 'https://randomuser.me/api/portraits/men/32.jpg', isSpeaking: false },
        { id: 2, name: 'Jada Grimes', image: 'https://randomuser.me/api/portraits/women/44.jpg', isSpeaking: false },
        { id: 3, name: 'Josh Nelson', image: 'https://randomuser.me/api/portraits/men/55.jpg', isSpeaking: false },
        { id: 4, name: 'Dayami Yoshino', image: 'https://randomuser.me/api/portraits/women/66.jpg', isSpeaking: false },
        { id: 5, name: 'Tanya Hartz', image: 'https://randomuser.me/api/portraits/women/89.jpg', isSpeaking: false },
        { id: 6, name: 'Victoria Reyes', image: 'https://randomuser.me/api/portraits/women/29.jpg', isSpeaking: false },
        { id: 7, name: 'Casey Cunningham', image: 'https://randomuser.me/api/portraits/men/78.jpg', isSpeaking: false },
        {
            id: 'marketing-huddle', name: 'Marketing Huddle', isGroup: true, members: [
                { id: 101, name: 'Emma Chen', image: 'https://randomuser.me/api/portraits/women/33.jpg' },
                { id: 102, name: 'Mike Roberts', image: 'https://randomuser.me/api/portraits/men/41.jpg' },
                { id: 103, name: 'Alex Kim', image: 'https://randomuser.me/api/portraits/men/52.jpg' }
            ]
        }
    ];

    // Load face-api models
    useEffect(() => {
        const loadModelsAndStartVideo = async () => {
            setIsLoading(true);
            // Gunakan CDN untuk model face-api
            const MODEL_URL = '/models';

            try {
                console.log('Loading face-api models from CDN...');

                // Load models sequentially to avoid race conditions
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                console.log('Loaded tinyFaceDetector model');

                await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
                console.log('Loaded faceExpressionNet model');

                console.log('All face-api models loaded successfully');

                // Start video capture after models are loaded
                await startVideo();
            } catch (error) {
                console.error('Error loading face-api models:', error);
                setIsLoading(false);
                alert('Failed to load face recognition models. Please try again later.');

                // Start video even if models fail to load
                await startVideo();
            }
        };

        // Add current user and mock participants
        setParticipants([
            {
                id: 'current-user',
                name: user?.nama || 'You',
                isCurrentUser: true,
                image: user?.profileImage || null
            },
            ...mockParticipants
        ]);

        loadModelsAndStartVideo();

        return () => {
            // Cleanup when component unmounts
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
            }
        };
    }, [user]);

    const startVideo = async () => {
        try {
            setIsLoading(true);
            console.log("Requesting camera access...");

            // Request with video constraints that work on more browsers
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: true
            });

            console.log("Camera access granted:", stream);
            streamRef.current = stream;

            if (videoRef.current) {
                console.log("Setting video source...");
                videoRef.current.srcObject = stream;

                // Listen for video to start playing
                videoRef.current.onloadedmetadata = () => {
                    console.log("Video metadata loaded");
                    videoRef.current.play().then(() => {
                        console.log("Video playing");
                        setIsLoading(false);
                        // Start face detection after a short delay to ensure video is playing
                        setTimeout(() => startFaceDetection(), 500);
                    }).catch(err => {
                        console.error("Error playing video:", err);
                        setIsLoading(false);
                    });
                };

                // Add extra error handlers
                videoRef.current.onerror = (err) => {
                    console.error("Video element error:", err);
                    setIsLoading(false);
                };
            } else {
                console.error("Video ref is not available");
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setIsLoading(false);
            alert(`Unable to access camera: ${error.message}. Please check your camera permissions.`);
        }
    };

    const startFaceDetection = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const videoEl = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match video
        canvas.width = videoEl.clientWidth;
        canvas.height = videoEl.clientHeight;

        console.log(`Canvas dimensions set: ${canvas.width}x${canvas.height}`);

        // Run face detection at regular intervals
        detectionIntervalRef.current = setInterval(async () => {
            if (videoEl.paused || videoEl.ended) {
                return;
            }

            try {
                // Make sure the models are loaded
                if (!faceapi.nets.tinyFaceDetector.params) {
                    console.log("Face detection models not yet loaded");
                    return;
                }

                // Perform basic face detection first
                const detections = await faceapi.detectAllFaces(
                    videoEl,
                    new faceapi.TinyFaceDetectorOptions()
                );

                // Only try emotion detection if face detection worked
                let detectionsWithExpressions = detections;
                try {
                    detectionsWithExpressions = await faceapi.detectAllFaces(
                        videoEl,
                        new faceapi.TinyFaceDetectorOptions()
                    ).withFaceExpressions();
                } catch (expError) {
                    console.warn("Could not detect expressions:", expError);
                }

                // Clear the canvas and draw the new detections
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw detections
                const resizedDetections = faceapi.resizeResults(detectionsWithExpressions, {
                    width: canvas.width,
                    height: canvas.height
                });

                if (resizedDetections.length > 0) {
                    // Draw face boxes
                    faceapi.draw.drawDetections(canvas, resizedDetections);

                    // Only draw expressions if available
                    if (resizedDetections[0].expressions) {
                        // Extract emotion data
                        const emotions = resizedDetections[0].expressions;
                        setEmotionData(emotions);

                        // Get current dominant emotion
                        const currentEmotion = getDominantEmotion();

                        // Notify if emotion changed significantly
                        if (lastEmotion && currentEmotion && lastEmotion !== currentEmotion) {
                            console.log(`Emotion changed: ${lastEmotion} -> ${currentEmotion}`);
                        }

                        // Update last emotion
                        setLastEmotion(currentEmotion);

                        // Draw expressions if available
                        try {
                            faceapi.draw.drawFaceExpressions(canvas, resizedDetections, 0.05);
                        } catch (drawError) {
                            console.warn("Could not draw expressions:", drawError);
                        }
                    }
                }
            } catch (error) {
                console.error("Error in face detection:", error);
            }
        }, 200); // Increased interval to reduce CPU usage
    };

    // Tambahkan fungsi ini untuk mendapatkan emoji berdasarkan emosi
    const getEmotionEmoji = (emotion) => {
        if (!emotion) return '😐';

        switch (emotion.toLowerCase()) {
            case 'happy': return '😊';
            case 'sad': return '😢';
            case 'angry': return '😠';
            case 'fearful': return '😨';
            case 'disgusted': return '🤢';
            case 'surprised': return '😲';
            case 'neutral': return '😐';
            default: return '😐';
        }
    };

    // Kemudian perbarui bagian emotion indicator

    const toggleMute = () => {
        if (streamRef.current) {
            const audioTracks = streamRef.current.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = isMuted;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (streamRef.current) {
            const videoTracks = streamRef.current.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = isVideoOff;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            // Return to camera
            startVideo();
            setIsScreenSharing(false);
            return;
        }

        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true
            });

            if (streamRef.current) {
                // Stop current video tracks
                streamRef.current.getVideoTracks().forEach(track => track.stop());
            }

            // Replace video track with screen share track
            screenStream.getVideoTracks()[0].onended = () => {
                // When screen sharing ends, go back to camera
                startVideo();
                setIsScreenSharing(false);
            };

            streamRef.current = screenStream;
            videoRef.current.srcObject = screenStream;
            setIsScreenSharing(true);
        } catch (error) {
            console.error('Error sharing screen:', error);
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            id: Date.now(),
            sender: user?.nama || 'You',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, message]);
        setNewMessage('');
    };

    const leaveMeeting = () => {
        // Stop all tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Clear detection interval
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
        }

        // Navigate back to meetings
        navigate('/meetings');
    };

    const toggleMenu = (participantId) => {
        setMenuOpen(menuOpen === participantId ? null : participantId);
    };

    const togglePin = (participant) => {
        setPinnedUser(pinnedUser?.id === participant.id ? null : participant);
        setMenuOpen(null);
    };

    const removeSpotlight = () => {
        setPinnedUser(null);
        setMenuOpen(null);
    };

    const getDominantEmotion = () => {
        if (!emotionData) return null;

        let maxEmotion = null;
        let maxValue = 0;

        Object.entries(emotionData).forEach(([emotion, value]) => {
            if (value > maxValue) {
                maxValue = value;
                maxEmotion = emotion;
            }
        });

        return maxEmotion;
    };

    // Get the emotion tracking label
    const getEmotionLabel = () => {
        const emotion = getDominantEmotion();
        if (!emotion) return null;

        // Format the emotion name for display
        return emotion.charAt(0).toUpperCase() + emotion.slice(1);
    };

    return (
        <div className="meeting-room">
            <header className="meeting-header">
                <h2>Zoom Meeting</h2>
            </header>

            <div className="meeting-content">
                {/* Participants gallery */}
                <div className="participants-gallery">
                    {/* Pinned participant (if any) */}
                    {pinnedUser && (
                        <div className="pinned-participant">
                            {pinnedUser.isCurrentUser ? (
                                <div className="video-container current-user-video">
                                    {isLoading ? (
                                        <div className="loading-indicator">Loading camera...</div>
                                    ) : (
                                        <>
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted={pinnedUser.isCurrentUser}
                                                className={isVideoOff ? 'hidden' : ''}
                                            />
                                            <canvas ref={canvasRef} className="face-canvas" />
                                            {isVideoOff && (
                                                <div className="video-off-placeholder">
                                                    <span>{user?.nama?.charAt(0) || 'Y'}</span>
                                                </div>
                                            )}
                                            <div className="participant-info">
                                                {isMuted && <span className="muted-icon"><i className="fas fa-microphone-slash"></i></span>}
                                                <span className="participant-name">{user?.nama || 'You'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="video-container">
                                    {pinnedUser.isGroup ? (
                                        <div className="group-container">
                                            {pinnedUser.members.map(member => (
                                                <div key={member.id} className="group-member">
                                                    <img src={member.image} alt={member.name} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <img src={pinnedUser.image} alt={pinnedUser.name} />
                                    )}
                                    <div className="participant-info">
                                        <span className="participant-name">{pinnedUser.name}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Participants grid */}
                    <div className={`participants-grid ${pinnedUser ? 'with-pinned' : ''}`}>
                        {participants.filter(p => !pinnedUser || p.id !== pinnedUser.id).map(participant => (
                            <div
                                key={participant.id}
                                className={`participant-tile ${participant.isCurrentUser ? 'current-user' : ''}`}
                                onClick={() => toggleMenu(participant.id)}
                            >
                                {participant.isCurrentUser ? (
                                    <>
                                        {isLoading && !pinnedUser ? (
                                            <div className="loading-indicator">Loading camera...</div>
                                        ) : !pinnedUser && (
                                            <>
                                                <video
                                                    ref={pinnedUser ? null : videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    className={isVideoOff ? 'hidden' : ''}
                                                />
                                                <canvas ref={pinnedUser ? null : canvasRef} className="face-canvas" />
                                                {isVideoOff && (
                                                    <div className="video-off-placeholder">
                                                        <span>{user?.nama?.charAt(0) || 'Y'}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                ) : participant.isGroup ? (
                                    <div className="group-container">
                                        {participant.members.map(member => (
                                            <div key={member.id} className="group-member">
                                                <img src={member.image} alt={member.name} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <img src={participant.image} alt={participant.name} />
                                )}

                                <div className="participant-info">
                                    {participant.isCurrentUser && isMuted && (
                                        <span className="muted-icon">
                                            <i className="fas fa-microphone-slash"></i>
                                        </span>
                                    )}
                                    <span className="participant-name">
                                        {participant.name} {participant.isCurrentUser && '(You)'}
                                    </span>
                                </div>

                                {menuOpen === participant.id && (
                                    <div className="participant-menu">
                                        <button onClick={() => togglePin(participant)}>
                                            <i className="fas fa-thumbtack"></i> Pin
                                        </button>
                                        {participant.id === pinnedUser?.id && (
                                            <button onClick={removeSpotlight}>
                                                <i className="fas fa-times"></i> Remove Spotlight
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat panel */}
                {isChatOpen && (
                    <div className="chat-panel">
                        <div className="chat-header">
                            <h3>Chat</h3>
                            <button className="close-chat" onClick={() => setIsChatOpen(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="chat-messages">
                            {messages.length === 0 ? (
                                <div className="no-messages">No messages yet</div>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className="chat-message">
                                        <div className="message-header">
                                            <span className="message-sender">{msg.sender}</span>
                                            <span className="message-time">{msg.time}</span>
                                        </div>
                                        <div className="message-text">{msg.text}</div>
                                    </div>
                                ))
                            )}
                        </div>
                        <form className="chat-input" onSubmit={sendMessage}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit">
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Emotion tracking indicator */}
            {emotionData && (
                <div className="emotion-indicator">
                    <i className="fas fa-heart"></i>
                    <span>Current Emotion: {getEmotionEmoji(getEmotionLabel())} {getEmotionLabel() || 'Neutral'}</span>
                </div>
            )}

            {/* Controls bar */}
            <div className="meeting-controls">
                <div className="control-button-group">
                    <button
                        className={`control-button ${isMuted ? 'active' : ''}`}
                        onClick={toggleMute}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                        <span>Mute</span>
                    </button>

                    <button
                        className={`control-button ${isVideoOff ? 'active' : ''}`}
                        onClick={toggleVideo}
                        title={isVideoOff ? 'Start Video' : 'Stop Video'}
                    >
                        <i className={`fas ${isVideoOff ? 'fa-video-slash' : 'fa-video'}`}></i>
                        <span>Stop Video</span>
                    </button>
                </div>

                <div className="control-button-group">
                    <button
                        className={`control-button ${isScreenSharing ? 'active' : ''}`}
                        onClick={toggleScreenShare}
                        title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                    >
                        <i className="fas fa-desktop"></i>
                        <span>Share Screen</span>
                    </button>

                    <button className="control-button" title="Security">
                        <i className="fas fa-shield-alt"></i>
                        <span>Security</span>
                    </button>

                    <button className="control-button" title="Participants">
                        <i className="fas fa-users"></i>
                        <span>Participants</span>
                        <span className="participants-count">{participants.length}</span>
                    </button>

                    <button
                        className={`control-button ${isChatOpen ? 'active' : ''}`}
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        title="Chat"
                    >
                        <i className="fas fa-comment"></i>
                        <span>Chat</span>
                    </button>

                    <button className="control-button" title="Record">
                        <i className="fas fa-record-vinyl"></i>
                        <span>Record</span>
                    </button>

                    <button className="control-button" title="Reactions">
                        <i className="fas fa-smile"></i>
                        <span>Reactions</span>
                    </button>
                </div>

                <button className="leave-button" onClick={leaveMeeting}>
                    Leave
                </button>
            </div>
        </div>
    );
}

export default MeetingRoom;