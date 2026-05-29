import axiosInstance from '../config/axios';

export const RosterService = {
    getAll: async (params?: any) => {
        const response = await axiosInstance.get('/super-admin/rosters', { params });
        return response.data.data ?? response.data;
    },
    getById: async (id: number | string) => {
        const response = await axiosInstance.get(`/super-admin/rosters/${id}`);
        return response.data.data ?? response.data;
    }
};
