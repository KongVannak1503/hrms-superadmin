import axiosInstance from '../config/axios';

export const UserService = {
    getAll: async (params?: any) => {
        const response = await axiosInstance.get('/super-admin/users', { params });
        return response.data.data ?? response.data;
    },
    create: async (data: any) => {
        const response = await axiosInstance.post('/super-admin/users', data);
        return response.data.data ?? response.data;
    },
    update: async (id: number | string, data: any) => {
        const response = await axiosInstance.put(`/super-admin/users/${id}`, data);
        return response.data.data ?? response.data;
    },
    delete: async (id: number | string) => {
        const response = await axiosInstance.delete(`/super-admin/users/${id}`);
        return response.data.data ?? response.data;
    },
    uploadImage: async (id: number | string, file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await axiosInstance.post(`/super-admin/users/${id}/upload-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data ?? response.data;
    },
    getPermissionsList: async () => {
        const response = await axiosInstance.get('/super-admin/users/permissions-list');
        return response.data.data ?? response.data;
    }
};
