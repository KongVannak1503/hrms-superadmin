import { useState } from 'react';
import type { User, UserCreateData, UserUpdateData, Permission } from '../types';
import { UserService } from '../services/user.service';
import { useApi } from './useApi';

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);

    const { execute: loadUsers, loading, error } = useApi<User[], []>(
        () => UserService.getAll(),
        {
            onSuccess: (data) => setUsers(Array.isArray(data) ? data : (data as any)?.data ?? []),
        }
    );

    const { execute: createUser } = useApi<User, [UserCreateData]>(
        (data: UserCreateData) => UserService.create(data),
        {
            onSuccess: () => loadUsers(),
        }
    );

    const { execute: updateUser } = useApi<User, [number | string, UserUpdateData]>(
        (id: number | string, data: UserUpdateData) => UserService.update(id, data),
        {
            onSuccess: () => loadUsers(),
        }
    );

    const { execute: deleteUser } = useApi<void, [number | string]>(
        (id: number | string) => UserService.delete(id),
        {
            onSuccess: () => loadUsers(),
        }
    );

    const { execute: uploadImage } = useApi<void, [number | string, File]>(
        (id: number | string, file: File) => UserService.uploadImage(id, file),
        {
            onSuccess: () => loadUsers(),
        }
    );

    const { execute: loadPermissions } = useApi<Permission[], []>(
        () => UserService.getPermissionsList(),
        {
            onSuccess: (data) => setPermissions(Array.isArray(data) ? data : (data as any)?.data ?? []),
        }
    );

    return {
        users,
        permissions,
        loading,
        error,
        loadUsers,
        createUser,
        updateUser,
        deleteUser,
        uploadImage,
        loadPermissions,
        setUsers,
    };
}