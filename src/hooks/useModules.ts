import { useState, useCallback } from 'react';
import type { Module, ModuleUpdatePayload } from '../types';
import { ModuleService } from '../services/module.service';
import { useApi } from './useApi';

export function useModules(companyId: number | string | null) {
    const [modules, setModules] = useState<Module[]>([]);

    const { execute: loadModules, loading, error } = useApi<Module[], []>(
        () => ModuleService.getByCompany(companyId!),
        {
            onSuccess: (data) => setModules(Array.isArray(data) ? data : (data as any)?.modules ?? []),
        }
    );

    const { execute: updateModules } = useApi<Module[], [ModuleUpdatePayload[]]>(
        (payload: ModuleUpdatePayload[]) => ModuleService.update(companyId!, payload),
        {
            onSuccess: () => loadModules(),
        }
    );

    const toggleModule = useCallback(
        (key: string) => {
            setModules((prev) =>
                prev.map((m) => (m.key === key ? { ...m, enabled: !m.enabled } : m))
            );
        },
        []
    );

    return {
        modules,
        loading,
        error,
        loadModules,
        updateModules,
        toggleModule,
        setModules,
    };
}