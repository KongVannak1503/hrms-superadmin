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

const AuditLogPage: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [actions, setActions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedAction, setSelectedAction] = useState<any>(null);
    const [dateRange, setDateRange] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        AuditService.getActions().then(setActions).catch(() => {});
    }, []);

    async function loadLogs() {
        setLoading(true);
        try {
            const params: any = { page, per_page: 50 };
            if (search) params.search = search;
            if (selectedAction) params.action = selectedAction;
            if (dateRange?.[0]) params.from = dateRange[0].toISOString().split('T')[0];
            if (dateRange?.[1]) params.to = dateRange[1].toISOString().split('T')[0];
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
    }, [page, search, selectedAction, dateRange]);

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
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search logs..."
                        className="w-full pl-5 border-round-lg"
                    />
                </span>
                <Dropdown
                    value={selectedAction}
                    onChange={(e) => { setSelectedAction(e.value); setPage(1); }}
                    options={actions}
                    placeholder="All Actions"
                    showClear
                    className="w-full md:w-14rem border-round-lg"
                />
                <Calendar
                    value={dateRange}
                    onChange={(e) => { setDateRange(e.value); setPage(1); }}
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
                    rows={50}
                    totalRecords={total}
                    lazy
                    onPage={(e: any) => setPage((e.page || 0) + 1)}
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
