import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthService } from '../services/auth.service';

interface AuthContextType {
    user: any | null;
    isAuthenticated: boolean;
    loading: boolean;
    setUser: (user: any | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    loading: true,
    setUser: () => {},
    logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('superadmin_token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const userData = await AuthService.getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error('Failed to fetch superadmin', error);
                localStorage.removeItem('superadmin_token');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const logout = () => {
        AuthService.logout().finally(() => {
            setUser(null);
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            loading,
            setUser,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);