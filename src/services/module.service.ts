import axiosInstance from '../config/axios';

export const ModuleService = {
    getByCompany: async (companyId: number | string) => {
        const response = await axiosInstance.get(`/super-admin/companies/${companyId}/modules`);
        return response.data;
    },
    update: async (companyId: number | string, modules: { key: string; enabled: boolean }[]) => {
        const response = await axiosInstance.put(`/super-admin/companies/${companyId}/modules`, { modules });
        return response.data;
    }
};
