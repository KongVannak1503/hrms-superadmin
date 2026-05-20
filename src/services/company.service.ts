import axiosInstance from '../config/axios';

export const CompanyService = {
    getAll: async (params?: any) => {
        const response = await axiosInstance.get('/super-admin/companies', { params });
        return response.data.data ?? response.data;
    },
    getById: async (id: number | string) => {
        const response = await axiosInstance.get(`/super-admin/companies/${id}`);
        return response.data.data ?? response.data;
    },
    getBranchDetails: async (companyId: number | string, branchId: number | string) => {
        const response = await axiosInstance.get(`/super-admin/companies/${companyId}/branches/${branchId}`);
        return response.data.data ?? response.data;
    },
    create: async (data: any) => {
        const response = await axiosInstance.post('/super-admin/companies', data);
        return response.data.data ?? response.data;
    },
    update: async (id: number | string, data: any) => {
        const response = await axiosInstance.put(`/super-admin/companies/${id}`, data);
        return response.data.data ?? response.data;
    },
    delete: async (id: number | string) => {
        const response = await axiosInstance.delete(`/super-admin/companies/${id}`);
        return response.data.data ?? response.data;
    },
    uploadLogo: async (id: number | string, file: File) => {
        const formData = new FormData();
        formData.append('logo', file);
        const response = await axiosInstance.post(`/super-admin/companies/${id}/upload-logo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data ?? response.data;
    }
};