import axiosInstance from '../config/axios';

export const EmployeeService = {
    getAll: async (params?: any) => {
        const response = await axiosInstance.get('/super-admin/employees', { params });
        return response.data.data ?? response.data;
    },
    getById: async (id: number | string) => {
        const response = await axiosInstance.get(`/super-admin/employees/${id}`);
        return response.data.data ?? response.data;
    },
    attendance: async (id: number | string, params?: any) => {
        const response = await axiosInstance.get(`/super-admin/employees/${id}/attendance`, { params });
        return response.data.data ?? response.data;
    },
    countByCompany: async () => {
        const response = await axiosInstance.get('/super-admin/employees/count-by-company');
        return response.data.data ?? response.data;
    }
};
