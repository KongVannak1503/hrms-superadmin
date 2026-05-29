import React, { createContext, useState, useEffect, useContext } from 'react';

interface AuthContextType {
    user: any | null;
    isAuthenticated: boolean;
    loading: boolean;
    setUser: (user: any | null) => void;
    logout: () => void;
    hasPermission: (permission: string) => boolean;
    can: (resource: string, action: string) => boolean;
    permissions: string[];
    isFullAccess: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    loading: true,
    setUser: () => {},
    logout: () => {},
    hasPermission: () => false,
    can: () => false,
    permissions: [],
    isFullAccess: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('superadmin_token');
        if (!token) {
            setLoading(false);
            return;
        }
        import('../services/auth.service').then(({ AuthService }) => {
            AuthService.getCurrentUser()
                .then((userData) => setUser(userData))
                .catch(() => localStorage.removeItem('superadmin_token'))
                .finally(() => setLoading(false));
        });
    }, []);

    const getPermissions = (): string[] => user?.permissions ?? [];

    const isFullAccess = (): boolean => {
        const perms = getPermissions();
        return perms.length === 0 || perms.includes('full_access');
    };

    const hasPermission = (permission: string): boolean => {
        if (isFullAccess()) return true;
        return getPermissions().includes(permission);
    };

    const can = (resource: string, action: string): boolean =>
        hasPermission(`${resource}.${action}`);

    const logout = () => {
        import('../services/auth.service').then(({ AuthService }) => {
            AuthService.logout().finally(() => setUser(null));
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            loading,
            setUser,
            logout,
            hasPermission,
            can,
            permissions: getPermissions(),
            isFullAccess: isFullAccess(),
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
