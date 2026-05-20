import axiosInstance from '../config/axios';

export const ConfigService = {
    getAll: async () => {
        const response = await axiosInstance.get('/super-admin/config');
        return response.data;
    },
    update: async (configurations: { key: string; value: any }[]) => {
        const response = await axiosInstance.put('/super-admin/config', { configurations });
        return response.data;
    }
};
