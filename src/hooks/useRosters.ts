import { useState } from 'react';
import type { Roster } from '../types';
import { RosterService } from '../services/roster.service';
import { useApi } from './useApi';

export function useRosters(companyId?: number | string) {
    const [rosters, setRosters] = useState<Roster[]>([]);

    const { execute: loadRosters, loading, error } = useApi<Roster[], [params?: any]>(
        (params?: any) => RosterService.getAll({ ...params, company_id: companyId }),
        {
            onSuccess: (data) => setRosters(Array.isArray(data) ? data : (data as any)?.data ?? []),
        }
    );

    const { execute: getRoster } = useApi<Roster, [number | string]>(
        (id: number | string) => RosterService.getById(id)
    );

    return {
        rosters,
        loading,
        error,
        loadRosters,
        getRoster,
        setRosters,
    };
}