import axiosInstance from '../config/axios';

export const TimesheetService = {
    export: async (employeeId: number | string, params?: any) => {
        const response = await axiosInstance.get(`/super-admin/timesheet/${employeeId}`, {
            params,
            responseType: 'blob',
        });
        return response.data;
    }
};
