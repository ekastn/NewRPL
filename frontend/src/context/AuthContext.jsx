import { createContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';

// Tambahkan base URL API
const API_URL = 'http://localhost:8080';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper untuk memastikan URL foto lengkap
    const ensureFullImageUrl = (userData) => {
        if (!userData) return userData;
        
        const newUserData = {...userData};
        // Perbaikan: cek jika imageUrl dimulai dengan /uploads
        if (newUserData.profileImage && newUserData.profileImage.startsWith('/uploads')) {
            newUserData.profileImage = API_URL + newUserData.profileImage;
        }
        return newUserData;
    };

    useEffect(() => {
        const initAuth = () => {
            try {
                const currentUser = getCurrentUser();
                // Pastikan URL gambar lengkap
                if (currentUser) {
                    const processedUser = ensureFullImageUrl(currentUser);
                    console.log("User with processed image URL:", processedUser);
                    setUser(processedUser);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const loginUser = (userData) => {
        // Pastikan URL gambar lengkap sebelum menyimpan
        const processedUser = ensureFullImageUrl(userData);
        console.log("Processed user on login:", processedUser);
        setUser(processedUser);
        localStorage.setItem('user', JSON.stringify(processedUser));
    };

    const logoutUser = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    // Update user dengan properti baru
    const updateUser = (newUserData) => {
        const updatedUser = {...user, ...newUserData};
        const processedUser = ensureFullImageUrl(updatedUser);
        console.log("User updated with new image URL:", processedUser);
        setUser(processedUser);
        localStorage.setItem('user', JSON.stringify(processedUser));
        return processedUser;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loginUser, logoutUser, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};