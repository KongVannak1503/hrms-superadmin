import { useState } from 'react';
import type { Shift } from '../types';
import { ShiftsService } from '../services/shifts.service';
import { useApi } from './useApi';

export function useShifts(companyId?: number | string) {
    const [shifts, setShifts] = useState<Shift[]>([]);

    const { execute: loadShifts, loading, error } = useApi<Shift[], [params?: any]>(
        (params?: any) => ShiftsService.getAll({ ...params, company_id: companyId }),
        {
            onSuccess: (data) => setShifts(Array.isArray(data) ? data : (data as any)?.data ?? []),
        }
    );

    const { execute: getShift } = useApi<Shift, [number | string]>(
        (id: number | string) => ShiftsService.getById(id)
    );

    return {
        shifts,
        loading,
        error,
        loadShifts,
        getShift,
        setShifts,
    };
}