import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';

interface AuthGuardProps {
    children: React.ReactNode;
    requiredPermissions?: string | string[];
    requireAll?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    requiredPermissions,
    requireAll = false,
}) => {
    const { isAuthenticated, loading, hasAnyPermission, hasAllPermissions } =
        useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center h-screen">
                <div className="text-center">
                    <div className="pi pi-spin pi-spinner text-3xl text-primary mb-3" />
                    <p className="text-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredPermissions) {
        const permissions = Array.isArray(requiredPermissions)
            ? requiredPermissions
            : [requiredPermissions];

        const hasAccess = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);

        if (!hasAccess) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <>{children}</>;
};

export const GuestGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center h-screen">
                <div className="text-center">
                    <div className="pi pi-spin pi-spinner text-3xl text-primary mb-3" />
                    <p className="text-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;
    }

    return <>{children}</>;
};

export const PermissionGuard: React.FC<{
    children: React.ReactNode;
    permission: string;
    fallback?: React.ReactNode;
}> = ({ children, permission, fallback }) => {
    const { hasPermission } = useAuth();

    if (!hasPermission(permission)) {
        return <>{fallback || null}</>;
    }

    return <>{children}</>;
};