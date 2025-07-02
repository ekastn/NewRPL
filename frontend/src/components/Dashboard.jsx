// filepath: d:\KULIAH\SEMESTER 4\Rekayasa Perangkat Lunak\code\NewRPL\frontend\src\components\Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import '../styles/Dashboard.css';


// Import EmotionChart secara kondisional untuk menghindari error di awal
let EmotionChart = () => <div>Loading chart component...</div>;
// Fungsi untuk load EmotionChart secara dinamis
import('./EmotionChart').then(module => {
    EmotionChart = module.default;
}).catch(error => {
    console.error('Error loading EmotionChart:', error);
});

// Import secara terpisah untuk mencegah konflik
import * as emotionService from '../services/emotionService';

function Dashboard() {
    const { user } = useContext(AuthContext);
    const [mood, setMood] = useState(null);
    const [moodNote, setMoodNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ text: '', type: '' });
    const [emotionStats, setEmotionStats] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const navigate = useNavigate();

    // Initial useEffect to fetch emotion stats
    useEffect(() => {
        const fetchEmotionStats = async () => {
            try {
                setLoadingStats(true);
                const data = await emotionService.getEmotionStats('week');
                setEmotionStats(data);
            } catch (error) {
                console.error('Gagal mengambil statistik emosi:', error);
                // Tetapkan data dummy jika gagal mengambil data
                setEmotionStats([
                    { mood: 'happy', count: 14 },
                    { mood: 'neutral', count: 8 },
                    { mood: 'tired', count: 6 },
                    { mood: 'stressed', count: 4 },
                    { mood: 'excited', count: 10 }
                ]);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchEmotionStats();
    }, []);

    const handleMoodSubmit = async () => {
        if (!mood) {
            setSubmitMessage({ text: 'Silakan pilih mood terlebih dahulu', type: 'error' });
            return;
        }

        setSubmitting(true);
        setSubmitMessage({ text: '', type: '' });

        try {
            // Pastikan user memiliki id yang valid
            if (!user || !user.id) {
                throw new Error('Data pengguna tidak valid');
            }

            // Simpan data emosi ke database
            await emotionService.saveEmotion({
                user_id: user.id,
                user_name: user.nama || 'Anonymous User',
                mood: mood,
                note: moodNote
            });

            // Tampilkan pesan sukses
            setSubmitMessage({ text: 'Mood Anda telah dicatat!', type: 'success' });
            
            // Bersihkan form
            setMood(null);
            setMoodNote('');
            
            // Refresh statistik emosi
            const newStats = await emotionService.getEmotionStats('week');
            setEmotionStats(newStats);
        } catch (error) {
            console.error('Error menyimpan mood:', error);
            setSubmitMessage({ 
                text: 'Gagal mencatat mood Anda. Silakan coba lagi.', 
                type: 'error' 
            });
        } finally {
            setSubmitting(false);
        }
    };
    
    if (!user) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Memuat...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-main">
            {/* Komponen Sidebar */}
            <Sidebar />

            {/* Konten Utama */}
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <div className="search-container">
                        <input type="text" placeholder="Cari..." className="search-input" />
                    </div>
                    <div className="header-actions">
                        <button className="btn-new-meeting">
                            <i className="icon-plus"></i> Meeting Baru
                        </button>
                        <div className="notification-icon">
                            <i className="icon-bell"></i>
                            <span className="notification-badge">1</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-body">
                    {/* Bagian Welcome */}
                    <div className="welcome-section">
                        <div className="welcome-text">
                            <h2>Selamat datang kembali, {user.nama || 'User'}!</h2>
                            <p>Bagaimana perasaan Anda hari ini?</p>
                        </div>

                        <div className="emotion-check-in">
                            <h3>Emotional Check-In</h3>
                            {submitMessage.text && (
                                <div className={`message ${submitMessage.type}`}>
                                    {submitMessage.text}
                                </div>
                            )}
                            <div className="mood-selection">
                                <div 
                                    className={`mood-option ${mood === 'happy' ? 'selected' : ''}`} 
                                    onClick={() => setMood('happy')}
                                >
                                    <span className="mood-emoji">😊</span>
                                    <span>Senang</span>
                                </div>
                                <div 
                                    className={`mood-option ${mood === 'neutral' ? 'selected' : ''}`} 
                                    onClick={() => setMood('neutral')}
                                >
                                    <span className="mood-emoji">😐</span>
                                    <span>Netral</span>
                                </div>
                                <div 
                                    className={`mood-option ${mood === 'tired' ? 'selected' : ''}`} 
                                    onClick={() => setMood('tired')}
                                >
                                    <span className="mood-emoji">😔</span>
                                    <span>Lelah</span>
                                </div>
                                <div 
                                    className={`mood-option ${mood === 'stressed' ? 'selected' : ''}`} 
                                    onClick={() => setMood('stressed')}
                                >
                                    <span className="mood-emoji">😠</span>
                                    <span>Stres</span>
                                </div>
                                <div 
                                    className={`mood-option ${mood === 'excited' ? 'selected' : ''}`} 
                                    onClick={() => setMood('excited')}
                                >
                                    <span className="mood-emoji">😃</span>
                                    <span>Bersemangat</span>
                                </div>
                            </div>
                            <textarea 
                                className="mood-note" 
                                placeholder="Tambahkan catatan tentang perasaan Anda..." 
                                value={moodNote}
                                onChange={(e) => setMoodNote(e.target.value)}
                            ></textarea>
                            <button 
                                className="submit-button" 
                                onClick={handleMoodSubmit}
                                disabled={submitting}
                            >
                                {submitting ? 'Mengirim...' : 'Kirim'}
                            </button>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        {/* Peta Emosi Tim */}
                        <div className="dashboard-card team-emotion">
                            <div className="card-header">
                                <h3>Peta Emosi Tim</h3>
                                <span className="sub-title">Gambaran emosional tim hari ini</span>
                            </div>
                            <div className="emotion-chart">
                                {loadingStats ? (
                                    <div className="chart-loading">
                                        <div className="loading-spinner"></div>
                                        <p>Memuat data emosi...</p>
                                    </div>
                                ) : emotionStats && emotionStats.length > 0 ? (
                                    <EmotionChart emotionStats={emotionStats} />
                                ) : (
                                    <div className="no-data">
                                        <p>Belum ada data emosi.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Meetings */}
                        <div className="dashboard-card upcoming-meetings">
                            <div className="card-header">
                                <h3>Upcoming Meetings</h3>
                                <Link to="/meetings" className="view-all">View All</Link>
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