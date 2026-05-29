import axiosInstance from '../config/axios';

export const LeavesService = {
    getAll: async (params?: any) => {
        const response = await axiosInstance.get('/super-admin/leaves', { params });
        return response.data.data ?? response.data;
    },
    stats: async (params?: any) => {
        const response = await axiosInstance.get('/super-admin/leaves/stats', { params });
        return response.data.data ?? response.data;
    },
    approve: async (id: number | string) => {
        const response = await axiosInstance.patch(`/super-admin/leaves/${id}/approve`);
        return response.data.data ?? response.data;
    },
    reject: async (id: number | string) => {
        const response = await axiosInstance.patch(`/super-admin/leaves/${id}/reject`);
        return response.data.data ?? response.data;
    }
};
