import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/Meetings.css';

function Meetings() {
    const { user } = useContext(AuthContext);
    const [month, setMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState('upcoming');
    const navigate = useNavigate();

    const joinMeeting = (meetingId) => {
        navigate(`/meeting-room/${meetingId}`);
    };

    // Generate calendar data
    const generateCalendarDays = () => {
        const year = month.getFullYear();
        const monthIndex = month.getMonth();

        const days = []; 

        // Get first day of the month and last day of the month
        const firstDay = new Date(year, monthIndex, 1);
        const lastDay = new Date(year, monthIndex + 1, 0);

        // Get the day of the week for first day (0-6, 0 is Sunday)
        const firstDayOfWeek = firstDay.getDay();

        // Array to store all        
        // Add days from previous month to fill the first row
        const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                month: monthIndex - 1,
                year: year,
                isCurrentMonth: false
            });
        }

        // Add all days from current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({
                day: i,
                month: monthIndex,
                year: year,
                isCurrentMonth: true,
                isToday: new Date(year, monthIndex, i).toDateString() === new Date().toDateString(),
                isSelected: new Date(year, monthIndex, i).toDateString() === selectedDate.toDateString()
            });
        }

        // Fill remaining slots with days from next month
        const totalCells = Math.ceil((firstDayOfWeek + lastDay.getDate()) / 7) * 7;
        const nextMonthDays = totalCells - days.length;
        for (let i = 1; i <= nextMonthDays; i++) {
            days.push({
                day: i,
                month: monthIndex + 1,
                year: year,
                isCurrentMonth: false
            });
        }

        return days;
    };

    // Previous month
    const prevMonth = () => {
        setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
    };

    // Next month
    const nextMonth = () => {
        setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
    };

    // Mock data for today's meetings
    const todaysMeetings = [
        {
            id: 1,
            title: "Project Kickoff",
            description: "Discuss the new project goals and timeline",
            time: "10:00 AM",
            duration: 30, // in minutes
            participants: [
                { id: 1, name: "John Doe", avatar: null },
                { id: 2, name: "Jane Smith", avatar: null },
                { id: 3, name: "Alice Johnson", avatar: null },
            ],
            emotionTrackingEnabled: true
        },
        {
            id: 2,
            title: "Weekly Standup",
            description: "Team progress updates and blockers",
            time: "2:30 PM",
            duration: 45, // in minutes
            participants: [
                { id: 1, name: "John Doe", avatar: null },
                { id: 2, name: "Jane Smith", avatar: null },
                { id: 3, name: "Alice Johnson", avatar: null },
                { id: 4, name: "Bob Williams", avatar: null }
            ],
            emotionTrackingEnabled: true
        }
    ];

    // Mock data for tomorrow's meetings
    const tomorrowsMeetings = [
        {
            id: 3,
            title: "Design Review",
            description: "Review UI/UX design proposals",
            time: "11:00 AM",
            duration: 60, // in minutes
            participants: [
                { id: 1, name: "John Doe", avatar: null },
                { id: 5, name: "Emily Clark", avatar: null }
            ],
            emotionTrackingEnabled: true
        }
    ];

    // List of weekday names
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="dashboard-main">
            <Sidebar />

            <div className="dashboard-content">
                <div className="meetings-header">
                    <h2>Meetings</h2>

                    <div className="meetings-actions">
                        <div className="search-bar">
                            <input type="text" placeholder="Search meetings..." />
                            <i className="fas fa-search"></i>
                        </div>
                        <button className="btn-new-meeting">
                            <i className="fas fa-plus"></i> New Meeting
                        </button>
                    </div>
                </div>

                <div className="meetings-view-tabs">
                    <button
                        className={view === 'upcoming' ? 'active' : ''}
                        onClick={() => setView('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button
                        className={view === 'past' ? 'active' : ''}
                        onClick={() => setView('past')}
                    >
                        Past
                    </button>
                    <button
                        className={view === 'all' ? 'active' : ''}
                        onClick={() => setView('all')}
                    >
                        All
                    </button>
                </div>

                <div className="calendar-container">
                    <div className="calendar-header">
                        <button className="btn-prev-month" onClick={prevMonth}>
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <h3>{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                        <button className="btn-next-month" onClick={nextMonth}>
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>

                    <div className="calendar-grid">
                        <div className="weekdays">
                            {weekdays.map(day => (
                                <div key={day} className="weekday">{day}</div>
                            ))}
                        </div>
                        <div className="days">
                            {generateCalendarDays().map((day, index) => (
                                <div
                                    key={index}
                                    className={`day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''}`}
                                    onClick={() => setSelectedDate(new Date(day.year, day.month, day.day))}
                                >
                                    {day.day}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="meetings-section">
                    <h3>Today's Meetings</h3>
                    <div className="meeting-list">
                        {todaysMeetings.map(meeting => (
                            <div key={meeting.id} className="meeting-item">
                                <div className="meeting-time">
                                    <div className="time">{meeting.time}</div>
                                    <div className="duration">{meeting.duration} min</div>
                                </div>
                                <div className="meeting-details">
                                    <h4>{meeting.title}</h4>
                                    <p>{meeting.description}</p>
                                    <div className="meeting-participants">
                                        {meeting.participants.slice(0, 3).map((participant, index) => (
                                            <div key={participant.id} className="participant">
                                                {participant.avatar ? (
                                                    <img src={participant.avatar} alt={participant.name} />
                                                ) : (
                                                    <div className="text-avatar">
                                                        {participant.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {meeting.participants.length > 3 && (
                                            <div className="participant-count">+{meeting.participants.length - 3}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="meeting-actions">
                                    <button className="btn-join-now" onClick={() => joinMeeting(meeting.id)}>Join Now</button>
                                    <button className="btn-details">Details</button>
                                </div>
                                {meeting.emotionTrackingEnabled && (
                                    <div className="emotion-tracking-badge">
                                        <i className="fas fa-heart"></i> Emotion Tracking Enabled
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="meetings-section">
                    <h3>Tomorrow's Meetings</h3>
                    <div className="meeting-list">
                        {tomorrowsMeetings.map(meeting => (
                            <div key={meeting.id} className="meeting-item">
                                <div className="meeting-time">
                                    <div className="time">{meeting.time}</div>
                                    <div className="duration">{meeting.duration} min</div>
                                </div>
                                <div className="meeting-details">
                                    <h4>{meeting.title}</h4>
                                    <p>{meeting.description}</p>
                                    <div className="meeting-participants">
                                        {meeting.participants.slice(0, 3).map((participant, index) => (
                                            <div key={participant.id} className="participant">
                                                {participant.avatar ? (
                                                    <img src={participant.avatar} alt={participant.name} />
                                                ) : (
                                                    <div className="text-avatar">
                                                        {participant.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {meeting.participants.length > 3 && (
                                            <div className="participant-count">+{meeting.participants.length - 3}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="meeting-actions">
                                    <button className="btn-details">Details</button>
                                </div>
                                {meeting.emotionTrackingEnabled && (
                                    <div className="emotion-tracking-badge">
                                        <i className="fas fa-heart"></i> Emotion Tracking Enabled
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Meetings;