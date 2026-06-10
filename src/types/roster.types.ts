import type { Shift } from './shift.types';
import type { EmployeeSummary } from './leave.types';

export interface Roster {
    id: number;
    company_id: number;
    branch_id?: number;
    employee_id: number;
    shift_id: number;
    shift?: Shift;
    employee?: EmployeeSummary;
    branch?: BranchSummary;
    date_from: string;
    date_to: string;
    pattern?: RosterPattern;
    is_recurring: boolean;
    recurrence_rule?: string;
    status: 'draft' | 'published' | 'archived';
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface BranchSummary {
    id: number;
    name: string;
    address: string;
}

export type RosterPattern = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';

export interface RosterCreateData {
    employee_id: number;
    shift_id: number;
    branch_id?: number;
    date_from: string;
    date_to: string;
    pattern?: RosterPattern;
    is_recurring?: boolean;
    recurrence_rule?: string;
    notes?: string;
}

export interface RosterUpdateData extends Partial<RosterCreateData> {
    id: number | string;
    status?: 'draft' | 'published' | 'archived';
}