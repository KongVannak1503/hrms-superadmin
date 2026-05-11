import axiosInstance from '../config/axios';

export const CompanyService = {
    getAll: async (params?: any) => {
        const response = await axiosInstance.get('/companies', { params });
        return response.data;
    },
    getById: async (id: number | string) => {
        const response = await axiosInstance.get(`/companies/${id}`);
        return response.data;
    },
    getBranchDetails: async (companyId: number | string, branchId: number | string) => {
        const response = await axiosInstance.get(`/companies/${companyId}/branches/${branchId}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await axiosInstance.post('/companies', data);
        return response.data;
    },
    update: async (id: number | string, data: any) => {
        const response = await axiosInstance.put(`/companies/${id}`, data);
        return response.data;
    },
    delete: async (id: number | string) => {
        const response = await axiosInstance.delete(`/companies/${id}`);
        return response.data;
    },
    uploadLogo: async (id: number | string, file: File) => {
        const formData = new FormData();
        formData.append('logo', file);
        const response = await axiosInstance.post(`/companies/${id}/upload-logo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};