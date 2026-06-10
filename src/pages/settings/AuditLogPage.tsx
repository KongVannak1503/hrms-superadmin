import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { AuditService } from '../../services/audit.service';
import { useFilterState } from '../../hooks';

const AuditLogPage: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [actions, setActions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<any>(null);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useFilterState(
        { search: '', page: 1, limit: 50, action: '', from: '', to: '' },
        { numberFields: ['page', 'limit'] }
    );
    const toast = useRef<Toast>(null);

    useEffect(() => {
        AuditService.getActions().then(setActions).catch(() => {});
    }, []);

    useEffect(() => {
        if (filters.from && filters.to) {
            setDateRange([new Date(filters.from), new Date(filters.to)]);
        }
    }, []);

    async function loadLogs() {
        setLoading(true);
        try {
            const params: any = { page: filters.page, per_page: filters.limit };
            if (filters.search) params.search = filters.search;
            if (filters.action) params.action = filters.action;
            if (filters.from) params.from = filters.from;
            if (filters.to) params.to = filters.to;
            const data = await AuditService.getAll(params);
            setLogs(data.data || []);
            setTotal(data.total || 0);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load audit logs' });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadLogs();
    }, [filters.search, filters.page, filters.limit, filters.action, filters.from, filters.to]);

    const actionTemplate = (rowData: any) => {
        const colorMap: Record<string, string> = {
            config_updated: 'info',
            billing_updated: 'warn',
            module_enabled: 'success',
            module_disabled: 'danger',
        };
        return (
            <Tag value={rowData.action?.replace(/_/g, ' ').toUpperCase()} severity={(colorMap[rowData.action] as any) || 'info'} className="text-xs font-bold" />
        );
    };

    const userTemplate = (rowData: any) => (
        <span className="font-bold text-900">{rowData.user_name || 'System'}</span>
    );

    return (
        <div className="p-4 mx-auto w-full" style={{ maxWidth: '1400px' }}>
            <Toast ref={toast} />

            <div className="mb-5">
                <h1 className="m-0 text-3xl font-bold text-900 tracking-tight">Audit Trail</h1>
                <p className="text-500 mt-1">System-wide activity log for compliance and monitoring.</p>
            </div>

            <div className="flex flex-column md:flex-row gap-3 mb-4 align-items-start md:align-items-center">
                <span className="p-input-icon-left flex-1">
                    <i className="pi pi-search ml-2" />
                    <InputText
                        value={filters.search}
                        onChange={(e) => { setFilters({ search: e.target.value, page: 1 }); }}
                        placeholder="Search logs..."
                        className="w-full pl-5 border-round-lg"
                    />
                </span>
                <Dropdown
                    value={filters.action || null}
                    onChange={(e) => { setFilters({ action: e.value || '', page: 1 }); }}
                    options={actions}
                    placeholder="All Actions"
                    showClear
                    className="w-full md:w-14rem border-round-lg"
                />
                <Calendar
                    value={dateRange}
                    onChange={(e) => {
                        setDateRange(e.value);
                        if (e.value?.[0]) {
                            setFilters({ from: (e.value[0] as Date).toISOString().split('T')[0], to: e.value[1] ? (e.value[1] as Date).toISOString().split('T')[0] : '', page: 1 });
                        } else {
                            setFilters({ from: '', to: '', page: 1 });
                        }
                    }}
                    selectionMode="range"
                    placeholder="Date Range"
                    className="w-full md:w-16rem border-round-lg"
                    showIcon
                />
                <Button icon="pi pi-refresh" rounded outlined onClick={loadLogs} tooltip="Refresh" />
            </div>

            <div className="card shadow-1 border-1 border-round-2xl overflow-hidden bg-white" style={{ borderColor: '#e5e7eb' }}>
                <DataTable
                    value={logs}
                    loading={loading}
                    paginator
                    rows={filters.limit}
                    totalRecords={total}
                    lazy
                    first={(filters.page - 1) * filters.limit}
                    onPage={(e: any) => setFilters({ page: (e.page || 0) + 1, limit: e.rows })}
                    rowsPerPageOptions={[25, 50, 100]}
                    emptyMessage="No audit logs found."
                    className="p-datatable-sm"
                    rowHover
                    size="small"
                >
                    <Column header="ACTION" body={actionTemplate} style={{ width: '150px' }} />
                    <Column header="USER" body={userTemplate} style={{ width: '160px' }} />
                    <Column field="description" header="DESCRIPTION" className="text-600" />
                    <Column field="entity_type" header="ENTITY" body={(r) => <span className="text-500 font-mono text-sm">{r.entity_type}</span>} style={{ width: '130px' }} />
                    <Column field="ip_address" header="IP" className="text-500 font-mono text-sm" style={{ width: '130px' }} />
                    <Column field="created_at" header="TIMESTAMP" body={(r) => <span className="text-500 text-sm">{new Date(r.created_at).toLocaleString()}</span>} style={{ width: '170px' }} />
                </DataTable>
            </div>
        </div>
    );
};

export default AuditLogPage;
