export interface LeaveRequest {
    id: number;
    employee_id: number;
    employee?: EmployeeSummary;
    company_id: number;
    leave_type_id: number;
    leave_type?: LeaveType;
    date_from: string;
    date_to: string;
    total_days: number;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approved_by?: number;
    approved_at?: string;
    rejection_reason?: string;
    created_at: string;
    updated_at: string;
}

export interface EmployeeSummary {
    id: number;
    employee_id: string;
    name_en: string;
    department?: string;
    position?: string;
    branch?: string;
}

export interface LeaveType {
    id: number;
    name: string;
    code: string;
    color?: string;
    is_paid: boolean;
    requires_attachment: boolean;
    max_days_per_year?: number;
    accrual_rate?: number;
    created_at: string;
    updated_at: string;
}

export interface LeaveStats {
    total_requests: number;
    pending: number;
    approved: number;
    rejected: number;
    by_type: Array<{
        leave_type: string;
        count: number;
    }>;
}

export interface LeaveUtilization {
    total_approved: number;
    by_type: Array<{
        leave_type: string;
        count: number;
    }>;
}


