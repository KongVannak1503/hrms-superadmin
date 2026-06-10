import type { Employee } from './employee.types';
import type { Module } from './module.types';
import type { Billing } from './billing.types';

export interface Company {
    id: number;
    name: string;
    domain: string;
    website?: string;
    logo_url?: string;
    status: 'Active' | 'Pending' | 'Flagged' | 'Inactive';
    admin_email: string;
    admin_name: string;
    employee_id_prefix: string;
    employee_id_next_number: number;
    employee_id_length: number;
    created_at: string;
    updated_at: string;
    employees_count?: number;
    branches_count?: number;
    users_count?: number;
    branches?: Branch[];
    employees?: Employee[];
    modules?: Module[];
    billing?: Billing;
}

export interface Branch {
    id: number;
    company_id: number;
    name: string;
    address: string;
    phone_number?: string;
    latitude?: string | number;
    longitude?: string | number;
    radius?: number;
    created_at: string;
    updated_at: string;
    employees?: Employee[];
}

export interface CompanyCreateData {
    name: string;
    domain: string;
    website?: string;
    admin_email: string;
    admin_name: string;
    admin_password: string;
    employee_id_prefix?: string;
    employee_id_length?: number;
}

export interface CompanyUpdateData extends Partial<CompanyCreateData> {
    id: number | string;
}

export interface CompanyDetailResponse {
    company: Company;
    admin: AdminUser;
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    profile_image?: string;
    role: string;
    permissions?: string[];
}