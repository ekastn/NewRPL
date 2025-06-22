import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { getMeetings } from '../services/meetingService';
import '../styles/MeetingManagement.css';

function MeetingManagement() {
    const { user } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                setLoading(true);
                const response = await getMeetings();
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
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard-main">
            <Sidebar />
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Meeting Management</h2>
                </div>
                {loading ? (
                    <div className="loading-spinner">Loading meetings...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="meetings-list">
                        {meetings.map(meeting => (
                            <div key={meeting.id} className="meeting-card">
                                <h3>{meeting.title}</h3>
                                <p>Date: {meeting.date}</p>
                                <p>Time: {meeting.time}</p>
                                <p>Participants: {meeting.participants.join(', ')}</p>
                                <button className="btn-edit">Edit</button>
                                <button className="btn-delete">Delete</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MeetingManagement;