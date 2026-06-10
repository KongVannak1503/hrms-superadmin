export interface Module {
    key: string;
    label: string;
    description: string;
    enabled: boolean;
    icon?: string;
    category?: string;
}

export interface ModuleUpdatePayload {
    key: string;
    enabled: boolean;
}

export interface CompanyModulesResponse {
    modules: Module[];
}

export const MODULE_CATEGORIES = [
    'core',
    'attendance',
    'leave',
    'payroll',
    'hr',
    'reporting',
] as const;

export type ModuleCategory = typeof MODULE_CATEGORIES[number];