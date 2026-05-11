import axiosInstance from '../config/axios';

export const UserService = {
    getAll: async () => {
        const response = await axiosInstance.get('/users');
        return response.data;
    },
    create: async (data: any) => {
        const response = await axiosInstance.post('/users', data);
        return response.data;
    },
    update: async (id: number | string, data: any) => {
        const response = await axiosInstance.put(`/users/${id}`, data);
        return response.data;
    },
    delete: async (id: number | string) => {
        const response = await axiosInstance.delete(`/users/${id}`);
        return response.data;
    },
    uploadImage: async (id: number | string, file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await axiosInstance.post(`/users/${id}/upload-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
