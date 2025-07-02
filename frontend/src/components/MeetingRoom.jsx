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
    const [isLeaving, setIsLeaving] = useState(false); // State baru untuk animasi ketika leaving
    const [waitingForOthers, setWaitingForOthers] = useState(true); // State untuk menunjukkan menunggu peserta lain

    // Tambahkan ref untuk video element yang di-pin
    const videoRef = useRef();
    const pinnedVideoRef = useRef(); 
    const canvasRef = useRef();
    const pinnedCanvasRef = useRef();
    const streamRef = useRef();
    const detectionIntervalRef = useRef();

    // Load face-api models dan inisialisasi video
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

        // Add only current user to participants
        if (user) {
            setParticipants([
                {
                    id: 'current-user',
                    name: user.nama || 'You',
                    isCurrentUser: true,
                    image: user.profileImage || null
                }
            ]);
        }

        loadModelsAndStartVideo();

        // Simulasi pesan sistem untuk menunjukkan bahwa user adalah satu-satunya peserta
        setTimeout(() => {
            setMessages([
                {
                    id: Date.now(),
                    sender: 'System',
                    text: 'You are the only participant in this meeting. Share the meeting link for others to join.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isSystem: true
                }
            ]);
        }, 2000);

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

                // Set the same stream to pinnedVideoRef if it exists
                if (pinnedVideoRef.current) {
                    pinnedVideoRef.current.srcObject = stream;
                }

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
            if (videoEl.paused || videoEl.ended || isLeaving) {
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
                
                // Jika ada pinnedCanvasRef dan video saya sendiri di-pin, lakukan deteksi juga
                if (pinnedCanvasRef.current && pinnedUser && pinnedUser.isCurrentUser) {
                    updatePinnedCanvas(resizedDetections);
                }
            } catch (error) {
                console.error("Error in face detection:", error);
            }
        }, 200); // Increased interval to reduce CPU usage
    };
    
    // Fungsi untuk memperbarui canvas yang di-pin
    const updatePinnedCanvas = (resizedDetections) => {
        if (!pinnedCanvasRef.current || !pinnedVideoRef.current) return;
        
        const canvas = pinnedCanvasRef.current;
        canvas.width = pinnedVideoRef.current.clientWidth;
        canvas.height = pinnedVideoRef.current.clientHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Sesuaikan ukuran deteksi untuk canvas yang di-pin
        const pinnedDetections = faceapi.resizeResults(resizedDetections, {
            width: canvas.width,
            height: canvas.height
        });
        
        if (pinnedDetections.length > 0) {
            // Gambar kotak wajah
            faceapi.draw.drawDetections(canvas, pinnedDetections);
            
            // Gambar ekspresi jika tersedia
            if (pinnedDetections[0].expressions) {
                try {
                    faceapi.draw.drawFaceExpressions(canvas, pinnedDetections, 0.05);
                } catch (drawError) {
                    console.warn("Could not draw expressions on pinned canvas:", drawError);
                }
            }
        }
    };

    // Fungsi untuk mendapatkan emoji berdasarkan emosi
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
            
            // Update pinned video if it's me
            if (pinnedVideoRef.current && pinnedUser && pinnedUser.isCurrentUser) {
                pinnedVideoRef.current.srcObject = screenStream;
            }
            
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

    const copyMeetingLink = () => {
    const meetingUrl = window.location.href;
    navigator.clipboard.writeText(meetingUrl).then(() => {
        // Sembunyikan waiting message
        setWaitingForOthers(false);
        
        // Tambahkan pesan sistem bahwa link sudah disalin
        setMessages(prev => [
            ...prev, 
            {
                id: Date.now(),
                sender: 'System',
                text: 'Meeting link copied to clipboard! Share it with others to invite them.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSystem: true
            }
        ]);
    });
};

    const leaveMeeting = () => {
        // Tampilkan overlay dan matikan kamera
        setIsLeaving(true);

        // Matikan semua track video dan audio dan benar-benar lepaskan sumber daya
        if (streamRef.current) {
            // Untuk setiap track dalam stream, hentikan track tersebut
            streamRef.current.getTracks().forEach(track => {
                // Disable track terlebih dahulu
                track.enabled = false;
                // Kemudian benar-benar menghentikan track untuk melepaskan resource
                track.stop();
            });

            // Lepaskan referensi stream dari elemen video
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            if (pinnedVideoRef.current) {
                pinnedVideoRef.current.srcObject = null;
            }

            // Hapus referensi stream
            streamRef.current = null;
        }

        // Hapus interval deteksi wajah
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
        }

        // Update state
        setIsMuted(true);
        setIsVideoOff(true);

        // Beri waktu untuk menampilkan overlay "Camera Off" sebelum navigasi
        setTimeout(() => {
            // Navigasi kembali ke halaman meetings
            navigate('/meetings');
        }, 1500);
    };

    const toggleMenu = (participantId) => {
        setMenuOpen(menuOpen === participantId ? null : participantId);
    };

    const togglePin = (participant) => {
        // Update video stream jika pinnedUser berubah
        if (participant.isCurrentUser) {
            setPinnedUser(participant);
            
            // Pastikan setTimeout untuk memastikan DOM sudah dirender
            setTimeout(() => {
                if (pinnedVideoRef.current && streamRef.current) {
                    pinnedVideoRef.current.srcObject = streamRef.current;
                    
                    // Play video secara otomatis
                    pinnedVideoRef.current.play().catch(e => 
                        console.error("Error playing pinned video:", e)
                    );
                }
            }, 100);
        } else {
            setPinnedUser(pinnedUser?.id === participant.id ? null : participant);
        }
        setMenuOpen(null);
    };

    // Fungsi untuk unpin user
    const unpinUser = () => {
        setPinnedUser(null);
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
                <h2>Meeting: {meetingId}</h2>
                <div className="meeting-info">
                    <button className="copy-link-btn" onClick={copyMeetingLink}>
                        <i className="fas fa-link"></i> Copy Meeting Link
                    </button>
                </div>
            </header>

            <div className="meeting-content">
                {/* Participants gallery */}
                <div className="participants-gallery">
                    {waitingForOthers && participants.length === 1 && !pinnedUser && (
                        <div className={`waiting-message ${!waitingForOthers ? 'hidden' : ''}`}>
                            <i className="fas fa-users"></i>
                            <h3>You're the only one here</h3>
                            <p>Share the meeting link to invite others</p>
                            <button className="copy-meeting-link" onClick={copyMeetingLink}>
                                <i className="fas fa-copy"></i> Copy Meeting Link
                            </button>
                        </div>
                    )}
                    
                    {/* Pinned participant (if any) */}
                    {pinnedUser && (
                        <div className="pinned-participant">
                            {/* Tombol Unpin */}
                            <button className="unpin-button" onClick={unpinUser}>
                                <i className="fas fa-times"></i> Unpin
                            </button>

                            {pinnedUser.isCurrentUser ? (
                                <div className="video-container current-user-video">
                                    {isLoading ? (
                                        <div className="loading-indicator">Loading camera...</div>
                                    ) : (
                                        <>
                                            <video
                                                ref={pinnedVideoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className={isVideoOff ? 'hidden' : ''}
                                            />
                                            <canvas ref={pinnedCanvasRef} className="face-canvas" />
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
                            ) : null}
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
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    className={isVideoOff ? 'hidden' : ''}
                                                />
                                                <canvas ref={canvasRef} className="face-canvas" />
                                                {isVideoOff && (
                                                    <div className="video-off-placeholder">
                                                        <span>{user?.nama?.charAt(0) || 'Y'}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                ) : null}

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
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat panel - selalu terbuka karena hanya ada satu peserta */}
                <div className={`chat-panel ${isChatOpen ? 'open' : ''}`}>
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
                                <div key={msg.id} className={`chat-message ${msg.isSystem ? 'system-message' : ''}`}>
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

            {/* Overlay when leaving */}
            {isLeaving && (
                <div className="camera-off-overlay">
                    <i className="fas fa-video-slash" style={{ fontSize: '48px' }}></i>
                    <div className="camera-off-message">Camera Off - Leaving Meeting...</div>
                </div>
            )}
        </div>
    );
}

export default MeetingRoom;