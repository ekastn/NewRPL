// filepath: src/components/MeetingManagement.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { getMeetings } from '../services/meetingService'; // Pastikan Anda memiliki service untuk mengambil data meeting
import '../styles/MeetingManagement.css'; // Gaya CSS untuk tampilan

function MeetingManagement() {
    const { user } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                setLoading(true);
                const response = await getMeetings(); // Ambil data meeting dari API
                setMeetings(response);
                setError(null);
            } catch (err) {
                console.error('Error fetching meetings:', err);
                setError('Failed to load meetings. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchMeetings();
    }, []);

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
            <Sidebar />

            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Meeting Management</h2>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading meetings...</p>
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="meetings-list">
                        {meetings.map(meeting => (
                            <div key={meeting.id} className="meeting-card">
                                <h3>{meeting.title}</h3>
                                <p>Date: {new Date(meeting.date).toLocaleDateString()}</p>
                                <p>Time: {meeting.time}</p>
                                <p>Participants: {meeting.participants.join(', ')}</p>
                                <div className="meeting-actions">
                                    <button className="btn-edit">Edit</button>
                                    <button className="btn-delete">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MeetingManagement;