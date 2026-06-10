import { useState } from 'react';
import type { Billing, BillingUpdateData } from '../types';
import { BillingService } from '../services/billing.service';
import { useApi } from './useApi';

export function useBilling(companyId: number | string | null) {
    const [billing, setBilling] = useState<Billing | null>(null);

    const { execute: loadBilling, loading, error } = useApi<Billing, []>(
        () => BillingService.getByCompany(companyId!),
        {
            onSuccess: (data) => setBilling(data),
        }
    );

    const { execute: updateBilling } = useApi<Billing, [BillingUpdateData]>(
        (data: BillingUpdateData) => BillingService.update(companyId!, data),
        {
            onSuccess: () => loadBilling(),
        }
    );

    return {
        billing,
        loading,
        error,
        loadBilling,
        updateBilling,
        setBilling,
    };
}