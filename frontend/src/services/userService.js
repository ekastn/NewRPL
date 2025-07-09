import api from './api';

// Get all users
// Get all users
export const getUsers = async () => {
    try {
        console.log('Fetching users from:', api.defaults.baseURL + '/users');
        const response = await api.get('/users');
        console.log('API response:', response);
        
        // Tambahkan baseURL ke profileImage jika ada
        const users = response.data.map(user => {
            if (user.profileImage && !user.profileImage.startsWith('http')) {
                user.profileImage = api.defaults.baseURL + user.profileImage;
            }
            return user;
        });
        
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        
        // Fallback data jika API gagal
        console.log('Providing fallback user data');
        return [
            {
                id: '1',
                nama: 'Reyhan Dwiyan',
                email: 'reyhan@example.com',
                role: 'Team Leader',
                profileImage: null
            },
            // other fallback users...
        ];
    }
};

// Get user by ID
export const getUserById = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}`);
        
        // Tambahkan baseURL ke profileImage jika ada
        const user = response.data;
        if (user.profileImage && !user.profileImage.startsWith('http')) {
            user.profileImage = api.defaults.baseURL + user.profileImage;
        }
        
        return user;
    } catch (error) {
        console.error(`Error fetching user with ID ${userId}:`, error);
        throw error;
    }
};

// Update user
export const updateUser = async (userId, userData) => {
    try {
        // Coba dengan format /api/users/:id
        try {
            const response = await api.put(`/api/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            // Jika gagal, coba dengan format /users/:id
            const response = await api.put(`/users/${userId}`, userData);
            return response.data;
        }
    } catch (error) {
        console.error(`Error updating user with ID ${userId}:`, error);
        throw error;
    }
};

// Upload profile image
export const uploadProfileImage = async (formData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        const uploadInstance = axios.create({
            baseURL: api.defaults.baseURL,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Uploading to:', api.defaults.baseURL + '/api/upload-profile-image');
        const response = await uploadInstance.post('/api/upload-profile-image', formData);
        
        console.log('Upload response:', response.data);
        
        // Ensure imageUrl is full URL
        if (response.data.imageUrl && response.data.imageUrl.startsWith('/uploads')) {
            response.data.imageUrl = api.defaults.baseURL + response.data.imageUrl;
            console.log('Image URL with domain:', response.data.imageUrl);
        }
        
        return response.data;
    } catch (error) {
        console.error('Error uploading profile image:', error);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        throw error;
    }
};