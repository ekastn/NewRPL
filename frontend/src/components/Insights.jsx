import { useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import '../styles/Insights.css';

function Insights() {
    const { user } = useContext(AuthContext);
    const [selectedPeriod, setSelectedPeriod] = useState('Last 7 Days');
    const [selectedTeam, setSelectedTeam] = useState('Development Team');

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
                    <div className="insights-filters">
                        <div className="filter-group">
                            <label>Time Period:</label>
                            <select 
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="filter-select"
                            >
                                <option value="Last 7 Days">Last 7 Days</option>
                                <option value="Last 30 Days">Last 30 Days</option>
                                <option value="Last 3 Months">Last 3 Months</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Team:</label>
                            <select 
                                value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}
                                className="filter-select"
                            >
                                <option value="Development Team">Development Team</option>
                                <option value="Design Team">Design Team</option>
                                <option value="Marketing Team">Marketing Team</option>
                            </select>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="btn-export">
                            <i className="icon-export"></i> Export
                        </button>
                        <div className="notification-icon">
                            <i className="icon-bell"></i>
                            <span className="notification-badge">1</span>
                        </div>
                    </div>
                </div>

                <div className="insights-body">
                    {/* Main Title */}
                    <div className="insights-title">
                        <h2>Emotional Intelligence Insights</h2>
                        <p>Analyzing team emotional patterns and collaboration dynamics</p>
                    </div>

                    {/* Metrics Cards */}
                    <div className="metrics-container">
                        <div className="metric-card">
                            <div className="metric-icon happy">
                                <i className="fas fa-smile"></i>
                            </div>
                            <div className="metric-info">
                                <div className="metric-header">
                                    <h3>Team Happiness</h3>
                                    <div className="metric-value">
                                        85% <span className="trend up">↑ 5%</span>
                                    </div>
                                </div>
                                <div className="metric-description">
                                    Overall positive emotions
                                </div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon collaboration">
                                <i className="fas fa-handshake"></i>
                            </div>
                            <div className="metric-info">
                                <div className="metric-header">
                                    <h3>Collaboration Score</h3>
                                    <div className="metric-value">
                                        92% <span className="trend up">↑ 3%</span>
                                    </div>
                                </div>
                                <div className="metric-description">
                                    Team synergy and cooperation
                                </div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon stress">
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <div className="metric-info">
                                <div className="metric-header">
                                    <h3>Stress Indicators</h3>
                                    <div className="metric-value">
                                        12% <span className="trend down">↓ 2%</span>
                                    </div>
                                </div>
                                <div className="metric-description">
                                    Detected stress patterns
                                </div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon communication">
                                <i className="fas fa-comments"></i>
                            </div>
                            <div className="metric-info">
                                <div className="metric-header">
                                    <h3>Communication Health</h3>
                                    <div className="metric-value">
                                        88% <span className="trend up">↑ 4%</span>
                                    </div>
                                </div>
                                <div className="metric-description">
                                    Effective team communication
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="charts-container">
                        {/* Emotions Trend Chart */}
                        <div className="chart-card full-width">
                            <div className="chart-header">
                                <h3>Emotional Trends Over Time</h3>
                                <div className="chart-actions">
                                    <button className="btn-expand"><i className="fas fa-expand"></i></button>
                                    <button className="btn-download"><i className="fas fa-download"></i></button>
                                </div>
                            </div>
                            <div className="chart-content trend-chart">
                                <div className="chart-placeholder">
                                    <img src="https://via.placeholder.com/1000x250?text=Emotional+Trends+Chart" alt="Emotional Trends" />
                                </div>
                            </div>
                        </div>

                        {/* Two Column Charts */}
                        <div className="charts-grid">
                            <div className="chart-card">
                                <div className="chart-header">
                                    <h3>Emotion Distribution</h3>
                                    <div className="chart-actions">
                                        <button className="btn-expand"><i className="fas fa-expand"></i></button>
                                        <button className="btn-download"><i className="fas fa-download"></i></button>
                                    </div>
                                </div>
                                <div className="chart-content">
                                    <div className="chart-placeholder">
                                        <img src="https://via.placeholder.com/480x250?text=Emotion+Distribution+Chart" alt="Emotion Distribution" />
                                    </div>
                                </div>
                            </div>

                            <div className="chart-card">
                                <div className="chart-header">
                                    <h3>Meeting Emotional Impact</h3>
                                    <div className="chart-actions">
                                        <button className="btn-expand"><i className="fas fa-expand"></i></button>
                                        <button className="btn-download"><i className="fas fa-download"></i></button>
                                    </div>
                                </div>
                                <div className="chart-content">
                                    <div className="chart-placeholder">
                                        <img src="https://via.placeholder.com/480x250?text=Meeting+Impact+Chart" alt="Meeting Emotional Impact" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Insights;