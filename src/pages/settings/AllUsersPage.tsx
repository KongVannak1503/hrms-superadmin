import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { UserService } from '../../services/user.service';

const STORAGE_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '') + '/storage/';

const AllUsersPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const toast = useRef<Toast>(null);

    useEffect(() => {
        loadUsers();
    }, [search]);

    async function loadUsers() {
        setLoading(true);
        try {
            const data = await UserService.getAll();
            const list = Array.isArray(data) ? data : data?.data ?? [];
            if (search) {
                setUsers(list.filter((u: any) =>
                    u.name?.toLowerCase().includes(search.toLowerCase()) ||
                    u.email?.toLowerCase().includes(search.toLowerCase())
                ));
            } else {
                setUsers(list);
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    }

    const roleTemplate = () => (
        <Tag value="SUPERADMIN" severity="info" className="text-xs font-bold px-2 py-1" />
    );

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


    return (
        <div className="p-4 mx-auto w-full" style={{ maxWidth: '1400px' }}>
            <Toast ref={toast} />

            <div className="mb-5">
                <h1 className="m-0 text-3xl font-bold text-900 tracking-tight">SuperAdmin Users</h1>
                <p className="text-500 mt-1">All super administrator accounts across the platform.</p>
            </div>

            <div className="flex flex-column md:flex-row gap-3 mb-4 align-items-start md:align-items-center">
                <span className="p-input-icon-left flex-1">
                    <i className="pi pi-search ml-2" />
                    <InputText
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-5 border-round-lg"
                    />
                </span>
            </div>

            <div className="card shadow-1 border-1 border-round-2xl overflow-hidden bg-white" style={{ borderColor: '#e5e7eb' }}>
                <DataTable
                    value={users}
                    loading={loading}
                    emptyMessage="No superadmin users found."
                    className="p-datatable-sm"
                    rowHover
                >
                    <Column header="USER" body={userTemplate} sortable field="name" />
                    <Column field="email" header="EMAIL" className="text-600" />
                    <Column header="ROLE" body={roleTemplate} style={{ width: '120px' }} />
                    <Column field="created_at" header="JOINED" body={(r) => new Date(r.created_at).toLocaleDateString()} className="text-500" style={{ width: '130px' }} />
                </DataTable>
            </div>
        </div>
    );
};

export default AllUsersPage;
