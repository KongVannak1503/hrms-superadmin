import { useState } from 'react';
import type { DashboardResponse } from '../types';
import { DashboardService } from '../services/dashboard.service';
import { useApi } from './useApi';

export function useDashboard() {
    const [data, setData] = useState<DashboardResponse | null>(null);

    const { execute: loadDashboard, loading, error } = useApi<DashboardResponse, []>(
        () => DashboardService.getStats(),
        {
            onSuccess: (data) => setData(data),
        }
    );

    return {
        data,
        loading,
        error,
        loadDashboard,
        setData,
    };
}