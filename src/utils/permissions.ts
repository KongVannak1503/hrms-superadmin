import type { AuthUser, Permission } from '../types';

export function hasPermission(user: AuthUser | null, permission: string): boolean {
    if (!user) return false;
    if (user.permissions.includes('full_access')) return true;
    return user.permissions.includes(permission);
}

export function hasAnyPermission(user: AuthUser | null, permissions: string[]): boolean {
    if (!user) return false;
    if (user.permissions.includes('full_access')) return true;
    return permissions.some((p) => user.permissions.includes(p));
}

export function hasAllPermissions(user: AuthUser | null, permissions: string[]): boolean {
    if (!user) return false;
    if (user.permissions.includes('full_access')) return true;
    return permissions.every((p) => user.permissions.includes(p));
}

export function getUserPermissions(user: AuthUser | null): string[] {
    if (!user) return [];
    if (user.permissions.includes('full_access')) return ['*'];
    return user.permissions;
}

export function groupPermissionsByGroup(permissions: Permission[]): Record<string, Permission[]> {
    return permissions.reduce((acc, permission) => {
        const group = permission.group || 'General';
        if (!acc[group]) acc[group] = [];
        acc[group].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);
}

export function filterPermissionsByGroup(
    permissions: Permission[],
    group: string
): Permission[] {
    return permissions.filter((p) => p.group === group);
}

export const PERMISSION_GROUPS = [
    'Company Management',
    'User Management',
    'Employee Management',
    'Attendance & Leaves',
    'Payroll & Billing',
    'Reports & Analytics',
    'System Settings',
] as const;

export type PermissionGroup = typeof PERMISSION_GROUPS[number];

export const SUPERADMIN_PERMISSIONS: Record<PermissionGroup, string[]> = {
    'Company Management': [
        'companies.view',
        'companies.create',
        'companies.edit',
        'companies.delete',
        'companies.modules',
        'companies.billing',
    ],
    'User Management': [
        'users.view',
        'users.create',
        'users.edit',
        'users.delete',
        'users.permissions',
    ],
    'Employee Management': [
        'employees.view',
        'employees.create',
        'employees.edit',
        'employees.delete',
    ],
    'Attendance & Leaves': [
        'attendance.view',
        'attendance.manage',
        'leaves.view',
        'leaves.approve',
        'leaves.reject',
    ],
    'Payroll & Billing': [
        'payroll.view',
        'payroll.manage',
        'billing.view',
        'billing.manage',
    ],
    'Reports & Analytics': [
        'reports.view',
        'reports.export',
        'analytics.view',
    ],
    'System Settings': [
        'settings.view',
        'settings.manage',
        'audit.view',
    ],
};