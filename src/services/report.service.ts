import axiosInstance from '../config/axios';

export const ReportService = {
    attendanceSummary: async (params?: any) => {
        const response = await axiosInstance.get('/super-admin/reports/attendance-summary', { params });
        return response.data.data ?? response.data;
    },
    absenteeism: async (params?: any) => {
        const response = await axiosInstance.get('/super-admin/reports/absenteeism', { params });
        return response.data.data ?? response.data;
    },
    overtimeCost: async (params?: any) => {
        const response = await axiosInstance.get('/super-admin/reports/overtime-cost', { params });
        return response.data.data ?? response.data;
    },
    employeeCounts: async (params?: any) => {
        const response = await axiosInstance.get('/super-admin/reports/employee-counts', { params });
        return response.data.data ?? response.data;
    },
    leaveUtilization: async (params?: any) => {
        const response = await axiosInstance.get('/super-admin/reports/leave-utilization', { params });
        return response.data.data ?? response.data;
    }
};
