import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import * as emotionService from '../services/emotionService';
import '../styles/Insights.css';

function Insights() {
    const { user } = useContext(AuthContext);
    const [selectedPeriod, setSelectedPeriod] = useState('Last 7 Days');
    const [selectedTeam, setSelectedTeam] = useState('Development Team');
    
    // Data states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [metrics, setMetrics] = useState({
        happiness: { value: 0, trend: 0, trend_direction: 'up' },
        collaboration: { value: 0, trend: 0, trend_direction: 'up' },
        stress: { value: 0, trend: 0, trend_direction: 'down' },
        communication: { value: 0, trend: 0, trend_direction: 'up' }
    });

    // New states for Team Mood Overview
    const [todayMood, setTodayMood] = useState([]);
    const [weeklyMood, setWeeklyMood] = useState([]);
    const [isLoadingMood, setIsLoadingMood] = useState(true);

    // Convert selected period to API parameter
    const getPeriodParam = () => {
        switch(selectedPeriod) {
            case 'Last 7 Days': return 'week';
            case 'Last 30 Days': return 'month';
            case 'Last 3 Months': return 'quarter';
            default: return 'week';
        }
    };

    // Load data based on selected period and team
    useEffect(() => {
        const loadInsightsData = async () => {
            try {
                setLoading(true);
                setIsLoadingMood(true);
                setError('');
                
                // Get today's mood data
                const todayData = await emotionService.getEmotionStats('day');
                setTodayMood(todayData);
                
                // Get weekly mood data for trends
                const weeklyData = await emotionService.getEmotionStats('week');
                setWeeklyMood(weeklyData);
                
                // Calculate mock metrics based on real mood data
                if (weeklyData.length > 0) {
                    const totalEmotions = weeklyData.reduce((sum, item) => sum + item.count, 0);
                    const positiveEmotions = weeklyData
                        .filter(e => ['happy', 'very_happy', 'excited'].includes(e.mood))
                        .reduce((sum, item) => sum + item.count, 0);
                    
                    const happinessValue = totalEmotions > 0 
                        ? Math.round((positiveEmotions / totalEmotions) * 100)
                        : 0;
                    
                    setMetrics({
                        happiness: { 
                            value: happinessValue,
                            trend: 5,
                            trend_direction: 'up'
                        },
                        collaboration: { 
                            value: Math.min(happinessValue + 10, 100), 
                            trend: 3,
                            trend_direction: 'up'
                        },
                        stress: { 
                            value: Math.max(100 - happinessValue - 20, 0),
                            trend: 2,
                            trend_direction: 'down'
                        },
                        communication: { 
                            value: Math.min(happinessValue + 15, 100),
                            trend: 4,
                            trend_direction: 'up'
                        }
                    });
                }
                
            } catch (err) {
                console.error('Error loading insights data:', err);
                setError('Failed to load insights data. Please try again later.');
            } finally {
                setLoading(false);
                setIsLoadingMood(false);
            }
        };
        
        loadInsightsData();
    }, [selectedPeriod, selectedTeam]);

    // Helper functions for Team Mood Overview
    const getMoodEmoji = (mood) => {
        const emojiMap = {
            'very_happy': '😄',
            'happy': '😊',
            'neutral': '😐',
            'tired': '😔',
            'sad': '😢',
            'stressed': '😠',
            'excited': '😃',
            'very_sad': '😭'
        };
        return emojiMap[mood] || '😐';
    };

    const getMoodName = (mood) => {
        const nameMap = {
            'very_happy': 'Sangat Senang',
            'happy': 'Senang',
            'neutral': 'Netral',
            'tired': 'Lelah',
            'sad': 'Sedih',
            'stressed': 'Stres',
            'excited': 'Bersemangat',
            'very_sad': 'Sangat Sedih'
        };
        return nameMap[mood] || 'Netral';
    };

    const getMoodCategory = (mood) => {
        const positiveList = ['very_happy', 'happy', 'excited'];
        const negativeList = ['sad', 'very_sad', 'stressed', 'tired'];
        
        if (positiveList.includes(mood)) return 'positive';
        if (negativeList.includes(mood)) return 'negative';
        return 'neutral';
    };
    
    // Group moods by category for the overview section
    const groupMoodsByCategory = (moodData) => {
        const grouped = {
            positive: { count: 0, moods: [] },
            neutral: { count: 0, moods: [] },
            negative: { count: 0, moods: [] }
        };
        
        if (!moodData || moodData.length === 0) return grouped;
        
        const totalCount = moodData.reduce((sum, item) => sum + item.count, 0);
        
        moodData.forEach(item => {
            const category = getMoodCategory(item.mood);
            grouped[category].count += item.count;
            grouped[category].moods.push(item);
        });
        
        // Calculate percentages
        Object.keys(grouped).forEach(category => {
            grouped[category].percentage = totalCount > 0 
                ? Math.round((grouped[category].count / totalCount) * 100) 
                : 0;
        });
        
        return grouped;
    };
    
    const getFormattedDate = () => {
        return new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };
    
    const generateInsight = (moodData) => {
        const groupedMoods = groupMoodsByCategory(moodData);
        const totalMembers = moodData.reduce((sum, item) => sum + item.count, 0);
        
        if (totalMembers === 0) {
            return "Belum ada data mood tim hari ini.";
        }
        
        const positivePercentage = groupedMoods.positive.percentage;
        
        if (positivePercentage >= 70) {
            return `Tim dalam kondisi yang sangat baik! ${positivePercentage}% anggota tim merasa positif hari ini. Pertahankan momentum ini dengan memberikan apresiasi kepada tim.`;
        } else if (positivePercentage >= 50) {
            return `Tim dalam kondisi cukup baik dengan ${positivePercentage}% anggota tim merasa positif. Mungkin perlu sedikit motivasi tambahan untuk meningkatkan semangat tim.`;
        } else {
            return `Tim sedang menghadapi tantangan dengan hanya ${positivePercentage}% anggota yang merasa positif. Pertimbangkan untuk mengadakan team building atau diskusi one-on-one dengan anggota tim.`;
        }
    };

    if (!user) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    const groupedMoods = groupMoodsByCategory(todayMood);

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

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Loading insights data...</p>
                    </div>
                ) : (
                    <div className="insights-body">
                        {/* Team Mood Overview */}
                        <div className="team-mood-overview">
                            <div className="overview-header">
                                <h3>Team Mood Overview</h3>
                                <span className="overview-date">{getFormattedDate()}</span>
                            </div>
                            
                            {isLoadingMood ? (
                                <div className="loading-overlay">
                                    <div className="loading-spinner"></div>
                                    <p>Loading mood data...</p>
                                </div>
                            ) : todayMood && todayMood.length > 0 ? (
                                <>
                                    <div className="mood-distribution">
                                        <div className="mood-group positive">
                                            <div className="mood-category">Positive</div>
                                            <div className="mood-emoji-group">
                                                <span>😄</span>
                                                <span>😊</span>
                                            </div>
                                            <div className="mood-percentage">{groupedMoods.positive.percentage}%</div>
                                            <div className="mood-count">{groupedMoods.positive.count} team members</div>
                                        </div>
                                        
                                        <div className="mood-group neutral">
                                            <div className="mood-category">Neutral</div>
                                            <div className="mood-emoji-group">
                                                <span>😐</span>
                                            </div>
                                            <div className="mood-percentage">{groupedMoods.neutral.percentage}%</div>
                                            <div className="mood-count">{groupedMoods.neutral.count} team members</div>
                                        </div>
                                        
                                        <div className="mood-group negative">
                                            <div className="mood-category">Negative</div>
                                            <div className="mood-emoji-group">
                                                <span>😔</span>
                                                <span>😠</span>
                                            </div>
                                            <div className="mood-percentage">{groupedMoods.negative.percentage}%</div>
                                            <div className="mood-count">{groupedMoods.negative.count} team members</div>
                                        </div>
                                    </div>
                                    
                                    <div className="mood-details">
                                        {todayMood.map(moodItem => (
                                            <div className="mood-detail-item" key={moodItem.mood}>
                                                <div className="mood-emoji">{getMoodEmoji(moodItem.mood)}</div>
                                                <div className="mood-name">{getMoodName(moodItem.mood)}</div>
                                                <div className="mood-value">{moodItem.count}</div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="insight-card">
                                        <h4><i className="fas fa-lightbulb"></i> Team Mood Insight</h4>
                                        <p>{generateInsight(todayMood)}</p>
                                        <button className="insight-action">
                                            <i className="fas fa-calendar-plus"></i> Schedule Team Activity
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="chart-no-data">
                                    Tidak ada data mood tim untuk hari ini
                                </div>
                            )}
                        </div>

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
                                            {metrics.happiness.value}% 
                                            <span className={`trend ${metrics.happiness.trend_direction}`}>
                                                {metrics.happiness.trend_direction === 'up' ? '↑' : '↓'} {metrics.happiness.trend}%
                                            </span>
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
                                            {metrics.collaboration.value}%
                                            <span className={`trend ${metrics.collaboration.trend_direction}`}>
                                                {metrics.collaboration.trend_direction === 'up' ? '↑' : '↓'} {metrics.collaboration.trend}%
                                            </span>
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
                                            {metrics.stress.value}%
                                            <span className={`trend ${metrics.stress.trend_direction}`}>
                                                {metrics.stress.trend_direction === 'up' ? '↑' : '↓'} {metrics.stress.trend}%
                                            </span>
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
                                            {metrics.communication.value}%
                                            <span className={`trend ${metrics.communication.trend_direction}`}>
                                                {metrics.communication.trend_direction === 'up' ? '↑' : '↓'} {metrics.communication.trend}%
                                            </span>
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
                                    {weeklyMood && weeklyMood.length > 0 ? (
                                        <div className="chart-placeholder">
                                            <img src="https://via.placeholder.com/1000x250?text=Emotional+Trends+Chart" alt="Emotional Trends" />
                                        </div>
                                    ) : (
                                        <div className="chart-no-data">No data available</div>
                                    )}
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
                                        {weeklyMood && weeklyMood.length > 0 ? (
                                            <div className="chart-placeholder">
                                                <img src="https://via.placeholder.com/480x250?text=Emotion+Distribution+Chart" alt="Emotion Distribution" />
                                            </div>
                                        ) : (
                                            <div className="chart-no-data">No data available</div>
                                        )}
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
                                        <div className="chart-no-data">No data available</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Insights;