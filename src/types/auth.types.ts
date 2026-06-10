export interface AuthCredentials {
    email: string;
    password: string;
    remember?: boolean;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    profile_image?: string;
    role: string;
    permissions: string[];
    access_token?: string;
    token_type?: string;
    expires_in?: number;
}

export interface LoginResponse {
    user: AuthUser;
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface Permission {
    key: string;
    label: string;
    group: string;
    description?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    profile_image?: string;
    role: string;
    permissions: string[];
    created_at: string;
    updated_at: string;
}

export interface UserCreateData {
    name: string;
    email: string;
    password: string;
    permissions?: string[];
    profile_image?: File;
}

export interface UserUpdateData {
    name: string;
    email: string;
    password?: string;
    permissions?: string[];
    profile_image?: File;
}

export interface UserPermissionsResponse {
    permissions: Permission[];
}