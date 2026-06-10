import type { Branch } from './company.types';

export interface Employee {
    id: number;
    employee_id: string;
    name_en: string;
    name_kh?: string;
    email?: string;
    phone?: string;
    gender?: 'M' | 'F' | 'O';
    date_of_birth?: string;
    hire_date?: string;
    department?: string;
    position?: string;
    location?: string;
    branch_id?: number;
    branch?: Branch;
    company_id: number;
    profile_image?: string;
    status: 'active' | 'inactive' | 'terminated';
    created_at: string;
    updated_at: string;
}

export interface EmployeeAttendance {
    id: number;
    employee_id: number;
    date: string;
    check_in?: string;
    check_out?: string;
    status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
    late_minutes?: number;
    overtime_minutes?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface EmployeeCountByCompany {
    company: string;
    total: number;
    branches: Array<{
        name: string;
        count: number;
    }>;
}

export interface AttendanceSummary {
    total_records: number;
    present: number;
    absent: number;
    late: number;
    avg_late_minutes: number;
}