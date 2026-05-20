import axiosInstance from '../config/axios';

export const BillingService = {
    getByCompany: async (companyId: number | string) => {
        const response = await axiosInstance.get(`/super-admin/companies/${companyId}/billing`);
        return response.data;
    },
    update: async (companyId: number | string, data: any) => {
        const response = await axiosInstance.put(`/super-admin/companies/${companyId}/billing`, data);
        return response.data;
    }
};
