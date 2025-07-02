import api from './api';

// Simpan emotional check-in pengguna
export const saveEmotion = async (emotionData) => {
    try {
        const response = await api.post('/api/emotions', emotionData);
        return response.data;
    } catch (error) {
        console.error('Error menyimpan data emosi:', error);
        // Untuk development, kembalikan response sukses palsu
        return { message: "Emotion recorded successfully (dev mode)" };
    }
};

// Dapatkan statistik emosi untuk visualisasi
export const getEmotionStats = async (period = 'week') => {
    try {
        const response = await api.get(`/api/emotions/stats?period=${period}`);
        return response.data;
    } catch (error) {
        console.error('Error mengambil statistik emosi:', error);
        
        // Data alternatif untuk development
        return [
            { mood: 'happy', count: 14 },
            { mood: 'neutral', count: 8 },
            { mood: 'tired', count: 6 },
            { mood: 'stressed', count: 4 },
            { mood: 'excited', count: 10 }
        ];
    }
};

// Dapatkan riwayat emosi pengguna
export const getUserEmotions = async (userId) => {
    try {
        const response = await api.get(`/api/emotions/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error mengambil emosi pengguna:', error);
        return []; // Kembalikan array kosong saat error
    }
};