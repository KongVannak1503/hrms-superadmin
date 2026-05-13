import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 15000,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
    }
});

// Request interceptor for token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('superadmin_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            localStorage.removeItem('superadmin_token');
            window.location.href = '/login'; // Or your superadmin login route
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;