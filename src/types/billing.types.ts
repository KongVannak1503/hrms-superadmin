export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';

export interface Billing {
    id: number;
    company_id: number;
    plan: SubscriptionPlan;
    trial_ends_at?: string;
    subscription_ends_at?: string;
    billing_email?: string;
    monthly_fee?: number;
    currency?: string;
    billing_cycle?: 'monthly' | 'yearly';
    status: 'active' | 'trial' | 'expired' | 'cancelled';
    created_at: string;
    updated_at: string;
}

export interface BillingUpdateData {
    plan?: SubscriptionPlan;
    trial_ends_at?: string;
    subscription_ends_at?: string;
    billing_email?: string;
    monthly_fee?: number;
}

export interface BillingPlanConfig {
    plan: SubscriptionPlan;
    name: string;
    price: number;
    features: string[];
    limits: {
        employees?: number;
        branches?: number;
        storage_gb?: number;
        api_calls_per_month?: number;
    };
}