import axiosInstance from '../config/axios';

export const AuditService = {
    getAll: async (params?: any) => {
        const response = await axiosInstance.get('/super-admin/audit-logs', { params });
        return response.data;
    },
    getActions: async () => {
        const response = await axiosInstance.get('/super-admin/audit-logs/actions');
        return response.data;
    }
};
