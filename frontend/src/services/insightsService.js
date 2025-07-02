import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const insightsService = {
    // Get emotion stats by period (today, week, month)
    getEmotionStats: async (period) => {
        try {
            const response = await axios.get(`${API_URL}/emotions/stats`, {
                params: { period },
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching emotion stats:', error);

            // Return dummy data for development
            if (period === 'today') {
                return [
                    { mood: 'happy', count: 8 },
                    { mood: 'very_happy', count: 3 },
                    { mood: 'neutral', count: 5 },
                    { mood: 'sad', count: 2 },
                    { mood: 'very_sad', count: 1 }
                ];
            } else {
                return [
                    { mood: 'happy', count: 24 },
                    { mood: 'very_happy', count: 12 },
                    { mood: 'neutral', count: 18 },
                    { mood: 'sad', count: 7 },
                    { mood: 'very_sad', count: 3 }
                ];
            }
        }
    },

    // Get team metrics (happiness, collaboration, stress, communication)
    getTeamMetrics: async (period) => {
        try {
            const response = await axios.get(`${API_URL}/emotions/metrics`, {
                params: { period },
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching team metrics:', error);

            // Return dummy data for development
            return {
                happiness: {
                    value: 85,
                    trend: 5,
                    trend_direction: 'up'
                },
                collaboration: {
                    value: 92,
                    trend: 3,
                    trend_direction: 'up'
                },
                stress: {
                    value: 12,
                    trend: 2,
                    trend_direction: 'down'
                },
                communication: {
                    value: 88,
                    trend: 4,
                    trend_direction: 'up'
                }
            };
        }
    },

    // Get chart data for emotional trends
    getEmotionalTrendsData: async (period) => {
        try {
            const response = await axios.get(`${API_URL}/emotions/trends`, {
                params: { period },
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching emotional trends:', error);

            // Return dummy data
            return {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'Happy',
                        data: [12, 14, 10, 15, 18, 14, 16]
                    },
                    {
                        label: 'Neutral',
                        data: [8, 7, 9, 8, 6, 7, 5]
                    },
                    {
                        label: 'Sad',
                        data: [3, 2, 4, 1, 0, 2, 2]
                    }
                ]
            };
        }
    },

    // Get emotion distribution data
    getEmotionDistribution: async (period) => {
        try {
            const response = await axios.get(`${API_URL}/emotions/distribution`, {
                params: { period },
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching emotion distribution:', error);

            // Return dummy data
            return {
                labels: ['Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad'],
                data: [25, 40, 20, 10, 5]
            };
        }
    },

    // Get meeting emotional impact data
    getMeetingEmotionalImpact: async () => {
        try {
            const response = await axios.get(`${API_URL}/meetings/emotional-impact`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching meeting emotional impact:', error);

            // Return dummy data
            return {
                before: { positive: 65, neutral: 25, negative: 10 },
                during: { positive: 80, neutral: 15, negative: 5 },
                after: { positive: 75, neutral: 20, negative: 5 }
            };
        }
    }
};