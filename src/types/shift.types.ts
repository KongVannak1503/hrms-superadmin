export interface Shift {
    id: number;
    company_id: number;
    name: string;
    code: string;
    start_time: string;
    end_time: string;
    break_duration?: number;
    color?: string;
    is_flexible: boolean;
    flexible_start?: string;
    flexible_end?: string;
    grace_period_minutes?: number;
    late_threshold_minutes?: number;
    early_leave_threshold_minutes?: number;
    created_at: string;
    updated_at: string;
    employees_count?: number;
}

export interface ShiftCreateData {
    name: string;
    code: string;
    start_time: string;
    end_time: string;
    break_duration?: number;
    color?: string;
    is_flexible?: boolean;
    flexible_start?: string;
    flexible_end?: string;
    grace_period_minutes?: number;
    late_threshold_minutes?: number;
    early_leave_threshold_minutes?: number;
}

export interface ShiftUpdateData extends Partial<ShiftCreateData> {
    id: number | string;
}