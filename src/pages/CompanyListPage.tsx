import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { CompanyService } from '../services/company.service';

const CompanyListPage: React.FC = () => {
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [companyDialog, setCompanyDialog] = useState(false);
    const [deleteCompanyDialog, setDeleteCompanyDialog] = useState(false);
    const [company, setCompany] = useState<any>({ name: '', domain: '', admin_email: '', admin_password: '' });
    const [submitted, setSubmitted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useRef<Toast>(null);
    const menu = useRef<Menu>(null);
    const navigate = useNavigate();
    const [selectedCompany, setSelectedCompany] = useState<any>(null);

    const stats = {
        total: companies.length,
        active: companies.filter((c: any) => c.status === 'Active' || !c.status).length,
        pending: companies.filter((c: any) => c.status === 'Pending').length,
        flagged: companies.filter((c: any) => c.status === 'Flagged').length
    };

    const actionMenuItems = [
        {
            label: 'View Details',
            icon: 'pi pi-eye',
            command: () => navigate(`/companies/${selectedCompany?.id}`)
        },
        {
            label: 'Edit Company',
            icon: 'pi pi-pencil',
            command: () => editCompany(selectedCompany)
        },
        {
            separator: true
        },
        {
            label: 'Delete Company',
            icon: 'pi pi-trash',
            className: 'text-red-500',
            command: () => confirmDeleteCompany(selectedCompany)
        }
    ];

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadCompanies(searchQuery);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const loadCompanies = async (search = '') => {
        setLoading(true);
        try {
            const params = search ? { search } : {};
            const data = await CompanyService.getAll(params);
            setCompanies(data.data || data || []);
        } catch (error) {
            console.error('Failed to load companies', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load companies' });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        navigate('/companies/create');
    };

    const editCompany = (comp: any) => {
        navigate(`/companies/${comp.id}/edit`);
    };

    const confirmDeleteCompany = (comp: any) => {
        setCompany(comp);
        setDeleteCompanyDialog(true);
    };

    const hideDialog = () => {
        setCompanyDialog(false);
        setSubmitted(false);
    };

    const hideDeleteDialog = () => {
        setDeleteCompanyDialog(false);
    };

    const saveCompany = async () => {
        setSubmitted(true);

        if (company.name.trim() && company.domain.trim()) {
            try {
                if (company.id) {
                    await CompanyService.update(company.id, company);
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Company Updated', life: 3000 });
                } else {
                    await CompanyService.create(company);
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Company Created', life: 3000 });
                }
                setCompanyDialog(false);
                loadCompanies();
            } catch (error: any) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to save company' });
            }
        }
    };

    const deleteCompany = async () => {
        try {
            await CompanyService.delete(company.id);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Company Deleted', life: 3000 });
            setDeleteCompanyDialog(false);
            loadCompanies();
        } catch (error: any) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to delete company' });
        }
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3">
            <div className="flex flex-column md:flex-row gap-3 align-items-center">
                <div className="flex gap-2">
                    <Button label="Filter" icon="pi pi-filter" outlined severity="secondary" className="border-round-md font-bold text-600" style={{ height: '34px', border: '1px solid #e2e8f0' }} />
                </div>
                <span className="p-input-icon-left ml-2">
                    <i className="pi pi-search ml-2" />
                    <InputText value={searchQuery} onChange={onGlobalFilterChange} placeholder="Search records..." className="p-inputtext-sm border-round-lg w-15rem pl-5" style={{ height: '34px', border: '1px solid #e2e8f0' }} />
                </span>
            </div>
            <div className="text-500 text-sm font-medium">
                Showing {Math.min(companies.length, 1)} - {companies.length} of {companies.length} companies
            </div>
        </div>
    );

    const companyDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveCompany} />
        </>
    );

    const deleteCompanyDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteCompany} />
        </>
    );

    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="flex justify-content-center">
                <Button 
                    icon="pi pi-ellipsis-h" 
                    rounded 
                    text 
                    severity="secondary" 
                    onClick={(e) => {
                        setSelectedCompany(rowData);
                        menu.current?.toggle(e);
                    }} 
                    className="w-2rem h-2rem"
                />
            </div>
        );
    };

    return (
        <div className="p-4 mx-auto w-full bg-white min-h-screen" >
            <Toast ref={toast} />
            <Menu model={actionMenuItems} popup ref={menu} id="action_menu" className="shadow-2 border-none" style={{ width: '180px' }} />
            
            {/* Breadcrumb */}
            <div className="text-600 text-sm mb-4 font-medium flex align-items-center gap-2">
                <span>Home</span>
                <i className="pi pi-angle-right text-xs"></i>
                <span>Administration</span>
                <i className="pi pi-angle-right text-xs"></i>
                <span className="text-900 font-bold">Companies</span>
            </div>

            {/* Title Section */}
            <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center mb-5 gap-4">
                <h1 className="m-0 text-4xl font-bold text-900 tracking-tight" style={{ color: '#0F172A' }}>Companies</h1>
                <Button label="New Company" icon="pi pi-plus" onClick={openNew} className="border-round-lg shadow-1 font-bold px-4 border-none" style={{ height: '40px', backgroundColor: '#1E293B', color: '#ffffff' }} />
            </div>

            <div className="grid mb-5">
                <div className="col-12 md:col-3">
                    <div className="surface-card p-4 shadow-1 border-round-xl h-full flex flex-column gap-3 relative transition-all hover:shadow-2" style={{ border: '1px solid #e2e8f0' }}>
                        <div className="flex justify-content-between align-items-start">
                            <span className="text-500 font-bold uppercase tracking-wider text-xs" style={{ color: '#64748B' }}>Total Companies</span>
                            <i className="pi pi-building text-xl" style={{ color: '#0F172A' }}></i>
                        </div>
                        <div className="flex align-items-baseline gap-3 mt-auto">
                            <span className="text-900 font-bold text-4xl" style={{ color: '#0F172A' }}>{stats.total.toLocaleString()}</span>
                            <span className="font-bold text-sm flex align-items-center" style={{ color: '#10B981' }}>
                                <i className="pi pi-arrow-up mr-1" style={{ fontSize: '0.7rem' }}></i> 12%
                            </span>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="surface-card p-4 shadow-1 border-round-xl h-full flex flex-column gap-3 relative transition-all hover:shadow-2" style={{ border: '1px solid #e2e8f0' }}>
                        <div className="flex justify-content-between align-items-start">
                            <span className="text-500 font-bold uppercase tracking-wider text-xs" style={{ color: '#64748B' }}>Active</span>
                            <i className="pi pi-check-circle text-xl" style={{ color: '#10B981' }}></i>
                        </div>
                        <div className="flex align-items-baseline gap-3 mt-auto">
                            <span className="text-900 font-bold text-4xl" style={{ color: '#0F172A' }}>{stats.active.toLocaleString()}</span>
                            <span className="font-bold text-sm flex align-items-center" style={{ color: '#10B981' }}>
                                <i className="pi pi-arrow-up mr-1" style={{ fontSize: '0.7rem' }}></i> 5%
                            </span>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="surface-card p-4 shadow-1 border-round-xl h-full flex flex-column gap-3 relative transition-all hover:shadow-2" style={{ border: '1px solid #e2e8f0' }}>
                        <div className="flex justify-content-between align-items-start">
                            <span className="text-500 font-bold uppercase tracking-wider text-xs" style={{ color: '#64748B' }}>Pending</span>
                            <i className="pi pi-ellipsis-h text-xl border-circle border-1 p-1" style={{ fontSize: '0.8rem', color: '#3B82F6', borderColor: '#3B82F6' }}></i>
                        </div>
                        <div className="flex align-items-baseline gap-3 mt-auto">
                            <span className="text-900 font-bold text-4xl" style={{ color: '#0F172A' }}>{stats.pending.toLocaleString()}</span>
                            <span className="font-bold text-sm flex align-items-center" style={{ color: '#3B82F6' }}>
                                <i className="pi pi-arrow-right mr-1" style={{ fontSize: '0.7rem' }}></i> 0%
                            </span>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="surface-card p-4 shadow-1 border-round-xl h-full flex flex-column gap-3 relative transition-all hover:shadow-2" style={{ border: '1px solid #e2e8f0' }}>
                        <div className="flex justify-content-between align-items-start">
                            <span className="text-500 font-bold uppercase tracking-wider text-xs" style={{ color: '#64748B' }}>Flagged</span>
                            <i className="pi pi-exclamation-circle text-xl text-red-500"></i>
                        </div>
                        <div className="flex align-items-baseline gap-3 mt-auto">
                            <span className="text-900 font-bold text-4xl" style={{ color: '#0F172A' }}>{stats.flagged.toLocaleString()}</span>
                            <span className="text-red-500 font-bold text-sm flex align-items-center">
                                <i className="pi pi-arrow-down mr-1" style={{ fontSize: '0.7rem' }}></i> 8%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-1 p-0 border-round-2xl overflow-hidden bg-white mb-5" style={{ border: '1px solid #e2e8f0' }}>
                <DataTable value={companies} header={header} loading={loading} 
                    paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                    className="p-datatable-sm" responsiveLayout="scroll"
                    emptyMessage="No companies found.">
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                    <Column field="name" header="COMPANY" sortable body={(rowData) => (
                        <div className="flex align-items-center gap-3 py-2">
                            <div className="flex flex-column">
                                <span 
                                    className="font-bold text-800 text-base cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => editCompany(rowData)}
                                >
                                    {rowData.name}
                                </span>
                                <span className="text-500 text-xs font-medium">Est. {new Date(rowData.created_at).getFullYear()}</span>
                            </div>
                        </div>
                    )} />
                    <Column field="website" header="WEBSITE" sortable body={(rowData) => (
                        <a href={rowData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {rowData.website || 'No website'}
                        </a>
                    )} />
                    <Column header="INDUSTRY" body={() => (
                        <span className="bg-gray-100 text-gray-700 text-xs font-black px-2 py-1 border-round tracking-tighter uppercase border-1 border-200">
                            MANUFACTURING
                        </span>
                    )} />
                    <Column field="status" header="STATUS" sortable body={(rowData) => {
                        const isActive = rowData.status === 'Active';
                        const isPending = rowData.status === 'Pending';
                        return (
                            <span className={`px-2 py-1 border-round text-xs font-bold border-1 ${
                                isActive ? 'bg-green-50 text-green-700 border-green-200' : 
                                isPending ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-red-50 text-red-700 border-red-200'
                            }`} style={{ 
                                backgroundColor: isActive ? '#ECFDF5' : isPending ? '#EFF6FF' : '#FEF2F2',
                                color: isActive ? '#10B981' : isPending ? '#3B82F6' : '#EF4444',
                                borderColor: isActive ? '#D1FAE5' : isPending ? '#DBEAFE' : '#FEE2E2'
                            }}>
                                {rowData.status?.toUpperCase() || 'ACTIVE'}
                            </span>
                        );
                    }} />
                    
                    <Column header="ACTIONS" body={actionBodyTemplate} style={{ width: '80px' }} />
                </DataTable>
            </div>

            {/* Footer Status Bar */}
            <div className="flex justify-content-between align-items-center px-2 mb-4">
                <div className="flex align-items-center gap-2">
                    <div className="w-8px h-8px bg-green-500 border-round-circle shadow-1"></div>
                    <span className="text-600 text-sm font-medium italic">System Status: All services operational</span>
                </div>
                <span className="text-500 text-xs">Last sync: 2 minutes ago</span>
            </div>

            <Dialog visible={companyDialog} style={{ width: '450px' }} header="Edit Company Settings" modal className="p-fluid" footer={companyDialogFooter} onHide={hideDialog}>
                <div className="field mb-3">
                    <label htmlFor="name" className="font-bold">Company Name</label>
                    <InputText id="name" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} required autoFocus className={submitted && !company.name ? 'p-invalid' : ''} />
                    {submitted && !company.name && <small className="p-error">Name is required.</small>}
                </div>
                <div className="field mb-3">
                    <label htmlFor="website" className="font-bold">Website</label>
                    <InputText id="website" value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} className={submitted && !company.website ? 'p-invalid' : ''} />
                </div>
            </Dialog>

            <Dialog visible={deleteCompanyDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCompanyDialogFooter} onHide={hideDeleteDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {company && (
                        <span>
                            Are you sure you want to delete <b>{company.name}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default CompanyListPage;