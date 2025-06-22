import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import '../styles/Dashboard.css';

function Dashboard() {
    const { user } = useContext(AuthContext);
    const [mood, setMood] = useState(null);
    const [moodNote, setMoodNote] = useState('');
    const navigate = useNavigate();

    const handleMoodSubmit = () => {
        console.log("Mood submitted:", { mood, moodNote });
        // Implementasi API untuk menyimpan mood bisa ditambahkan di sini
    };

    if (!user) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-main">
            {/* Sidebar Component */}
            <Sidebar />

            {/* Main Content */}
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <div className="search-container">
                        <input type="text" placeholder="Search..." className="search-input" />
                    </div>
                    <div className="header-actions">
                        <button className="btn-new-meeting">
                            <i className="icon-plus"></i> New Meeting
                        </button>
                        <div className="notification-icon">
                            <i className="icon-bell"></i>
                            <span className="notification-badge">1</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-body">
                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <div className="welcome-text">
                            <h2>Welcome back, {user.nama}!</h2>
                            <p>How are you feeling today?</p>
                        </div>

                        <div className="emotion-check-in">
                            <h3>Emotional Check-In</h3>
                            <div className="mood-selection">
                                <div className={`mood-option ${mood === 'happy' ? 'selected' : ''}`} onClick={() => setMood('happy')}>
                                    <span className="mood-emoji">😊</span>
                                    <span>Happy</span>
                                </div>
                                <div className={`mood-option ${mood === 'neutral' ? 'selected' : ''}`} onClick={() => setMood('neutral')}>
                                    <span className="mood-emoji">😐</span>
                                    <span>Neutral</span>
                                </div>
                                <div className={`mood-option ${mood === 'tired' ? 'selected' : ''}`} onClick={() => setMood('tired')}>
                                    <span className="mood-emoji">😔</span>
                                    <span>Tired</span>
                                </div>
                                <div className={`mood-option ${mood === 'stressed' ? 'selected' : ''}`} onClick={() => setMood('stressed')}>
                                    <span className="mood-emoji">😠</span>
                                    <span>Stressed</span>
                                </div>
                                <div className={`mood-option ${mood === 'excited' ? 'selected' : ''}`} onClick={() => setMood('excited')}>
                                    <span className="mood-emoji">😃</span>
                                    <span>Excited</span>
                                </div>
                            </div>
                            <textarea 
                                className="mood-note" 
                                placeholder="Add a note about how you're feeling..." 
                                value={moodNote}
                                onChange={(e) => setMoodNote(e.target.value)}
                            ></textarea>
                            <button className="submit-button" onClick={handleMoodSubmit}>Submit</button>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        {/* Team Emotion Map */}
                        <div className="dashboard-card team-emotion">
                            <div className="card-header">
                                <h3>Team Emotion Map</h3>
                                <span className="sub-title">Today's emotional landscape</span>
                            </div>
                            <div className="emotion-chart">
                                <img src="https://via.placeholder.com/600x200?text=Emotion+Graph" alt="Emotion Chart" />
                            </div>
                        </div>

                        {/* Upcoming Meetings */}
                        <div className="dashboard-card upcoming-meetings">
                            <div className="card-header">
                                <h3>Upcoming Meetings</h3>
                                <a href="#" className="view-all">View All</a>
                            </div>
                            <div className="meetings-list">
                                <div className="meeting-item">
                                    <div className="meeting-time">
                                        <div className="time">10:00 AM</div>
                                        <div className="day">Today</div>
                                    </div>
                                    <div className="meeting-details">
                                        <h4>Project Kickoff</h4>
                                        <p>5 participants</p>
                                    </div>
                                    <button className="btn-join">Join</button>
                                </div>
                                <div className="meeting-item">
                                    <div className="meeting-time">
                                        <div className="time">2:30 PM</div>
                                        <div className="day">Today</div>
                                    </div>
                                    <div className="meeting-details">
                                        <h4>Weekly Standup</h4>
                                        <p>8 participants</p>
                                    </div>
                                    <button className="btn-join">Join</button>
                                </div>
                                <div className="meeting-item">
                                    <div className="meeting-time">
                                        <div className="time">11:00 AM</div>
                                        <div className="day">Tomorrow</div>
                                    </div>
                                    <div className="meeting-details">
                                        <h4>Design Review</h4>
                                        <p>4 participants</p>
                                    </div>
                                    <button className="btn-schedule">Schedule</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;