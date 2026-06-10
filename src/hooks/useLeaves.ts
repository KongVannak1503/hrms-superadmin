import { useState } from 'react';
import type { LeaveRequest, LeaveStats } from '../types';
import { LeavesService } from '../services/leaves.service';
import { useApi } from './useApi';

export function useLeaves() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [stats, setStats] = useState<LeaveStats | null>(null);

    const { execute: loadLeaves, loading, error } = useApi<LeaveRequest[], [params?: any]>(
        (params?: any) => LeavesService.getAll(params),
        {
            onSuccess: (data) => setLeaves(Array.isArray(data) ? data : (data as any)?.data ?? []),
        }
    );

    const { execute: loadStats } = useApi<LeaveStats, [params?: any]>(
        (params?: any) => LeavesService.stats(params),
        {
            onSuccess: (data) => setStats(data),
        }
    );

    const { execute: approveLeave } = useApi<void, [number | string]>(
        (id: number | string) => LeavesService.approve(id),
        {
            onSuccess: () => loadLeaves(),
        }
    );

    const { execute: rejectLeave } = useApi<void, [number | string]>(
        (id: number | string) => LeavesService.reject(id),
        {
            onSuccess: () => loadLeaves(),
        }
    );

    return {
        leaves,
        stats,
        loading,
        error,
        loadLeaves,
        loadStats,
        approveLeave,
        rejectLeave,
        setLeaves,
    };
}