import axiosInstance from '../config/axios';

export const DashboardService = {
    getStats: async () => {
        const response = await axiosInstance.get('/dashboard');
        return response.data;
    }
};
