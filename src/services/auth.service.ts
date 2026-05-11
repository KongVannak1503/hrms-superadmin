import axiosInstance from '../config/axios';

export const AuthService = {
    login: async (credentials: any) => {
        const response = await axiosInstance.post('/login', credentials);
        const data = response.data.data;
        if (data && data.access_token) {
            localStorage.setItem('superadmin_token', data.access_token);
        }
        return data;
    },
    logout: async () => {
        try {
            await axiosInstance.post('/logout');
        } finally {
            localStorage.removeItem('superadmin_token');
        }
    },
    getCurrentUser: async () => {
        const response = await axiosInstance.get('/me');
        return response.data;
    }
};