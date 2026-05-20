import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { DirectoryService } from '../../services/directory.service';

const AllUsersPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const toast = useRef<Toast>(null);

    const STORAGE_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api', '') + '/storage/';

    useEffect(() => {
        loadCompanies();
    }, []);

    async function loadCompanies() {
        try {
            const data = await DirectoryService.getCompanies();
            setCompanies(data || []);
        } catch (error) {
            console.error('Failed to load companies', error);
        }
    };

    async function loadUsers() {
        setLoading(true);
        try {
            const params: any = { page, per_page: 20 };
            if (search) params.search = search;
            if (selectedCompany) params.company_id = selectedCompany.id;
            if (selectedRole) params.role = selectedRole;
            const data = await DirectoryService.getUsers(params);
            setUsers(data.data || []);
            setTotal(data.total || 0);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [page, search, selectedCompany, selectedRole]);

    const roleTemplate = (rowData: any) => {
        const roles = rowData.role;
        const roleLabel = typeof roles === 'string' ? roles : (Array.isArray(roles) ? roles[0] : 'user');
        const colorMap: Record<string, string> = {
            admin: 'blue',
            user: 'gray',
            manager: 'purple',
            hr: 'green',
        };
        return (
            <Tag value={roleLabel?.toUpperCase()} severity={(colorMap[roleLabel] as any) || 'info'} className="text-xs font-bold px-2 py-1" />
        );
    };

    const userTemplate = (rowData: any) => (
        <div className="flex align-items-center gap-3">
            <Avatar
                image={rowData.profile_image ? `${STORAGE_BASE_URL}${rowData.profile_image}` : undefined}
                label={!rowData.profile_image ? rowData.name?.charAt(0).toUpperCase() : undefined}
                shape="circle"
                style={{ backgroundColor: '#0F172A', color: '#ffffff', width: '2.5rem', height: '2.5rem' }}
            />
            <div>
                <span className="font-bold text-900 block">{rowData.name}</span>
                <span className="text-500 text-xs">{rowData.email}</span>
            </div>
        </div>
    );

    const companyTemplate = (rowData: any) => (
        <span className="font-medium text-700">{rowData.company?.name || 'N/A'}</span>
    );

    return (
        <div className="p-4 mx-auto w-full" style={{ maxWidth: '1400px' }}>
            <Toast ref={toast} />

            <div className="mb-5">
                <h1 className="m-0 text-3xl font-bold text-900 tracking-tight">All Users Directory</h1>
                <p className="text-500 mt-1">Browse every user across all company tenants.</p>
            </div>

            <div className="flex flex-column md:flex-row gap-3 mb-4 align-items-start md:align-items-center">
                <span className="p-input-icon-left flex-1">
                    <i className="pi pi-search ml-2" />
                    <InputText
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by name or email..."
                        className="w-full pl-5 border-round-lg"
                    />
                </span>
                <Dropdown
                    value={selectedCompany}
                    onChange={(e) => { setSelectedCompany(e.value); setPage(1); }}
                    options={companies}
                    optionLabel="name"
                    placeholder="All Companies"
                    clearable
                    className="w-full md:w-15rem border-round-lg"
                />
                <Dropdown
                    value={selectedRole}
                    onChange={(e) => { setSelectedRole(e.value); setPage(1); }}
                    options={['admin', 'manager', 'hr', 'user']}
                    placeholder="All Roles"
                    clearable
                    className="w-full md:w-12rem border-round-lg"
                />
            </div>

            <div className="card shadow-1 border-1 border-round-2xl overflow-hidden bg-white" style={{ borderColor: '#e5e7eb' }}>
                <DataTable
                    value={users}
                    loading={loading}
                    paginator
                    rows={20}
                    totalRecords={total}
                    lazy
                    onPage={(e: any) => setPage((e.page || 0) + 1)}
                    emptyMessage="No users found."
                    className="p-datatable-sm"
                    rowHover
                >
                    <Column header="USER" body={userTemplate} sortable field="name" />
                    <Column field="email" header="EMAIL" className="text-600" />
                    <Column header="COMPANY" body={companyTemplate} />
                    <Column header="ROLE" body={roleTemplate} style={{ width: '120px' }} />
                    <Column field="created_at" header="JOINED" body={(r) => new Date(r.created_at).toLocaleDateString()} className="text-500" style={{ width: '130px' }} />
                </DataTable>
            </div>
        </div>
    );
};

export default AllUsersPage;
