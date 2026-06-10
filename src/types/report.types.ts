export interface DashboardStats {
    total_companies: number;
    total_employees: number;
    total_branches: number;
    total_users: number;
}

export interface DashboardResponse {
    stats: DashboardStats;
    recent_companies: CompanySummary[];
}

export interface CompanySummary {
    id: number;
    name: string;
    website?: string;
    created_at: string;
    status: string;
}

export interface AttendanceSummaryReport {
    total_records: number;
    present: number;
    absent: number;
    late: number;
    avg_late_minutes: number;
}

export interface AbsenteeismReport {
    total_leaves: number;
    sick_leave: number;
    annual_leave: number;
    unpaid_leave: number;
}

export interface OvertimeCostReport {
    total_hours: number;
    total_records: number;
    total_cost?: number;
    by_company?: Array<{
        company: string;
        hours: number;
        cost: number;
    }>;
}

export interface EmployeeCountReport {
    company: string;
    total: number;
    branches: Array<{
        name: string;
        count: number;
    }>;
}

export interface LeaveUtilizationReport {
    total_approved: number;
    by_type: Array<{
        leave_type: string;
        count: number;
    }>;
}

export interface ReportParams {
    company_id?: number | string;
    date_from?: string;
    date_to?: string;
    branch_id?: number | string;
    department_id?: number | string;
    [key: string]: any;
}