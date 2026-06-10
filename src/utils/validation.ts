export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
}

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function isStrongPassword(password: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('At least one number');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('At least one special character');
    return { valid: errors.length === 0, errors };
}

export function isValidDate(date: string): boolean {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
}

export function isFutureDate(date: string): boolean {
    return new Date(date) > new Date();
}

export function isPastDate(date: string): boolean {
    return new Date(date) < new Date();
}

export function required(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
}

export function minLength(value: string, min: number): boolean {
    return value.length >= min;
}

export function maxLength(value: string, max: number): boolean {
    return value.length <= max;
}

export function minValue(value: number, min: number): boolean {
    return value >= min;
}

export function maxValue(value: number, max: number): boolean {
    return value <= max;
}

export function validateForm<T extends Record<string, any>>(
    values: T,
    rules: Record<keyof T, ((value: any) => string | null)[]>
): Record<keyof T, string> {
    const errors: Partial<Record<keyof T, string>> = {};
    for (const [field, fieldRules] of Object.entries(rules)) {
        for (const rule of fieldRules) {
            const error = rule(values[field]);
            if (error) {
                errors[field as keyof T] = error;
                break;
            }
        }
    }
    return errors as Record<keyof T, string>;
}

export const Validators = {
    required: (message = 'This field is required') => (value: any) =>
        required(value) ? null : message,
    email: (message = 'Invalid email address') => (value: string) =>
        isValidEmail(value) ? null : message,
    minLength: (min: number, message?: string) => (value: string) =>
        minLength(value, min) ? null : message || `Minimum ${min} characters`,
    maxLength: (max: number, message?: string) => (value: string) =>
        maxLength(value, max) ? null : message || `Maximum ${max} characters`,
    min: (min: number, message?: string) => (value: number) =>
        minValue(value, min) ? null : message || `Minimum value is ${min}`,
    max: (max: number, message?: string) => (value: number) =>
        maxValue(value, max) ? null : message || `Maximum value is ${max}`,
    pattern: (regex: RegExp, message: string) => (value: string) =>
        regex.test(value) ? null : message,
    custom: (validator: (value: any) => boolean, message: string) => (value: any) =>
        validator(value) ? null : message,
};