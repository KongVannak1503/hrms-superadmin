import { useState } from 'react';
import type { Company, CompanyCreateData, CompanyUpdateData } from '../types';
import { CompanyService } from '../services/company.service';
import { useApi } from './useApi';

export function useCompanies() {
    const [companies, setCompanies] = useState<Company[]>([]);

    const { execute: loadCompanies, loading, error } = useApi<Company[], [params?: any]>(
        (params?: any) => CompanyService.getAll(params),
        {
            onSuccess: (data) => setCompanies(Array.isArray(data) ? data : (data as any)?.data ?? []),
        }
    );

    const { execute: createCompany } = useApi<Company, [CompanyCreateData]>(
        (data: CompanyCreateData) => CompanyService.create(data),
        {
            onSuccess: () => loadCompanies(),
        }
    );

    const { execute: updateCompany } = useApi<Company, [number | string, CompanyUpdateData]>(
        (id: number | string, data: CompanyUpdateData) => CompanyService.update(id, data),
        {
            onSuccess: () => loadCompanies(),
        }
    );

    const { execute: deleteCompany } = useApi<void, [number | string]>(
        (id: number | string) => CompanyService.delete(id),
        {
            onSuccess: () => loadCompanies(),
        }
    );

    const { execute: getCompany } = useApi<Company, [number | string]>(
        (id: number | string) => CompanyService.getById(id)
    );

    return {
        companies,
        loading,
        error,
        loadCompanies,
        createCompany,
        updateCompany,
        deleteCompany,
        getCompany,
        setCompanies,
    };
}