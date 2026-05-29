import axiosInstance from '../config/axios';

export const ShiftsService = {
    getAll: async (params?: any) => {
        const response = await axiosInstance.get('/super-admin/shifts', { params });
        return response.data.data ?? response.data;
    },
    getById: async (id: number | string) => {
        const response = await axiosInstance.get(`/super-admin/shifts/${id}`);
        return response.data.data ?? response.data;
    }
};
