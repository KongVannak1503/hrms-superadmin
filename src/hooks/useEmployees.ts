import { useState } from 'react';
import type { Employee } from '../types';
import { EmployeeService } from '../services/employee.service';
import { useApi } from './useApi';

export function useEmployees() {
    const [employees, setEmployees] = useState<Employee[]>([]);

    const { execute: loadEmployees, loading, error } = useApi<Employee[], [params?: any]>(
        (params?: any) => EmployeeService.getAll(params),
        {
            onSuccess: (data) => setEmployees(Array.isArray(data) ? data : (data as any)?.data ?? []),
        }
    );

    const { execute: getEmployee } = useApi<Employee, [number | string]>(
        (id: number | string) => EmployeeService.getById(id)
    );

    const { execute: getAttendance } = useApi<any, [number | string, params?: any]>(
        (id: number | string, params?: any) => EmployeeService.attendance(id, params)
    );

    const { execute: getCountByCompany } = useApi<any, []>(
        () => EmployeeService.countByCompany(),
        {
            onSuccess: (data) => setEmployees(Array.isArray(data) ? data : []),
        }
    );

    return {
        employees,
        loading,
        error,
        loadEmployees,
        getEmployee,
        getAttendance,
        getCountByCompany,
        setEmployees,
    };
}