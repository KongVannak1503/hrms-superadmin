import { useState, useCallback, useEffect } from 'react';
import type { AuthUser, AuthCredentials } from '../types';
import { AuthService } from '../services/auth.service';

const TOKEN_KEY = 'superadmin_token';
const USER_KEY = 'superadmin_user';

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (credentials: AuthCredentials): Promise<AuthUser | null> => {
        try {
            const response = await AuthService.login(credentials);
            const userData = response.user;
            const token = response.access_token;

            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Login failed:', error);
            return null;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await AuthService.logout();
        } finally {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setUser(null);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const userData = await AuthService.getCurrentUser();
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Failed to refresh user:', error);
            logout();
            return null;
        }
    }, [logout]);

    const hasPermission = useCallback(
        (permission: string): boolean => {
            if (!user) return false;
            if (user.permissions.includes('full_access')) return true;
            return user.permissions.includes(permission);
        },
        [user]
    );

    const hasAnyPermission = useCallback(
        (permissions: string[]): boolean => {
            if (!user) return false;
            if (user.permissions.includes('full_access')) return true;
            return permissions.some((p) => user.permissions.includes(p));
        },
        [user]
    );

    const hasAllPermissions = useCallback(
        (permissions: string[]): boolean => {
            if (!user) return false;
            if (user.permissions.includes('full_access')) return true;
            return permissions.every((p) => user.permissions.includes(p));
        },
        [user]
    );

    return {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
}