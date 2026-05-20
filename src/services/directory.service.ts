import axiosInstance from '../config/axios';

export const DirectoryService = {
    getUsers: async (params?: any) => {
        const response = await axiosInstance.get('/super-admin/directory/users', { params });
        return response.data;
    },
    getCompanies: async () => {
        const response = await axiosInstance.get('/super-admin/directory/companies');
        return response.data;
    }
};
