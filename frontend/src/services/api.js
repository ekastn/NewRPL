import axios from 'axios';

// Ganti URL sesuai dengan konfigurasi backend Anda
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Tambahkan timeout untuk menghindari menunggu terlalu lama
    timeout: 5000
});

// Intercept permintaan untuk menambahkan token otentikasi jika tersedia
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;