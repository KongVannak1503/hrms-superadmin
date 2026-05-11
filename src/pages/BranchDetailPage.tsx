import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import { CompanyService } from '../services/company.service';

const BranchDetailPage: React.FC = () => {
    const { companyId, branchId } = useParams<{ companyId: string, branchId: string }>();
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);

    const [branch, setBranch] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [transfers, setTransfers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [employeeFilters, setEmployeeFilters] = useState<any>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [employeeGlobalFilter, setEmployeeGlobalFilter] = useState('');

    const [transferFilters, setTransferFilters] = useState<any>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [transferGlobalFilter, setTransferGlobalFilter] = useState('');

    useEffect(() => {
        loadBranchDetails();
    }, [companyId, branchId]);

    const loadBranchDetails = async () => {
        setLoading(true);
        try {
            if (!companyId || !branchId) return;
            const data = await CompanyService.getBranchDetails(companyId, branchId);
            setBranch(data.branch);
            setCompany(data.company);
            setTransfers(data.transfers || []);
        } catch (error) {
            console.error('Failed to load branch details', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load branch details' });
        } finally {
            setLoading(false);
        }
    };

    const onEmployeeFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...employeeFilters };
        _filters['global'].value = value;
        setEmployeeFilters(_filters);
        setEmployeeGlobalFilter(value);
    };

    const onTransferFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...transferFilters };
        _filters['global'].value = value;
        setTransferFilters(_filters);
        setTransferGlobalFilter(value);
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center h-full">
                <ProgressSpinner />
            </div>
        );
    }

    if (!branch || !company) {
        return (
            <div className="p-4">
                <h2>Branch not found</h2>
                <Button label="Back to Company" icon="pi pi-arrow-left" onClick={() => navigate(`/companies/${companyId}`)} />
            </div>
        );
    }

    const transferTypeTemplate = (rowData: any) => {
        const isIncoming = rowData.to_branch_id === branch.id;
        return (
            <span className={`px-2 py-1 border-round text-xs font-bold ${isIncoming ? 'bg-green-100 text-green-700 border-1 border-green-200' : 'bg-orange-100 text-orange-700 border-1 border-orange-200'}`}>
                {isIncoming ? 'Incoming' : 'Outgoing'}
            </span>
        );
    };

    const relatedBranchTemplate = (rowData: any) => {
        const isIncoming = rowData.to_branch_id === branch.id;
        const relatedBranch = isIncoming ? rowData.from_branch : rowData.to_branch;
        
        if (!relatedBranch) return <span className="text-500 italic">Unknown</span>;
        
        return (
            <div className="flex align-items-center gap-2">
                <i className={`pi ${isIncoming ? 'pi-arrow-down-right text-green-500' : 'pi-arrow-up-right text-orange-500'}`}></i>
                <span className="font-semibold text-700">{relatedBranch.name}</span>
            </div>
        );
    };

    return (
        <div className="p-4 mx-auto w-full bg-white min-h-screen" style={{ maxWidth: '1400px' }}>
            <Toast ref={toast} />
            
            {/* Breadcrumb */}
            <div className="text-600 text-sm mb-4 font-medium flex align-items-center gap-2">
                <span className="cursor-pointer hover:text-900 transition-colors" onClick={() => navigate(`/companies/${company.id}`)}>Branches</span>
                <i className="pi pi-angle-right text-xs"></i>
                <span className="text-900 font-bold">{branch.name}</span>
            </div>

            {/* Header Section */}
            <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center mb-5 gap-4">
                <div className="flex align-items-center gap-4">
                    {/* Square Logo Box */}
                    <div className="w-6rem h-6rem bg-white border-round flex align-items-center justify-content-center border-1 border-200 shadow-1 overflow-hidden">
                        {branch.logo ? (
                            <img src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api', '')}/storage/${branch.logo}`} alt="Branch Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                            <i className="pi pi-building text-300" style={{ fontSize: '2.5rem' }}></i>
                        )}
                    </div>
                    <div>
                        <h1 className="m-0 text-4xl font-bold text-900 tracking-tight mb-2" style={{ color: '#0F172A' }}>{branch.name}</h1>
                        <span className="text-lg text-700">{branch.employees?.length || 0} Employees currently assigned</span>
                    </div>
                </div>
                <div>
                    <Button label="Edit Settings" icon="pi pi-cog" className="border-round-md font-bold border-none" style={{ height: '34px', backgroundColor: '#1E293B', color: '#ffffff' }} />
                </div>
            </div>

            {/* Main Detail Area */}
            <div className="w-full">
                <TabView className="custom-tabview">
                    <TabPanel header="Employees" leftIcon="pi pi-users mr-2">
                        <div className="py-4">
                            <div className="flex justify-content-end mb-4">
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search ml-2" />
                                    <InputText value={employeeGlobalFilter} onChange={onEmployeeFilterChange} placeholder="Search employees..." className="p-inputtext-sm border-round-lg w-15rem shadow-1 pl-5" />
                                </span>
                            </div>
                            <div className="border-round-lg overflow-hidden bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                <DataTable 
                                    value={branch.employees || []} 
                                    filters={employeeFilters}
                                    globalFilterFields={['employee_id', 'name_en', 'department', 'position']}
                                    paginator={false} 
                                    emptyMessage="No employees currently assigned to this branch." 
                                    className="p-datatable-sm custom-table"
                                    rowHover
                                >
                                    <Column field="employee_id" header="ID" className="font-medium text-600" style={{ width: '15%' }} />
                                    <Column field="name_en" header="NAME" className="font-bold text-900" style={{ width: '25%' }} />
                                    <Column field="department" header="DEPARTMENT" className="text-600" style={{ width: '25%' }} body={(r) => r.department || 'N/A'} />
                                    <Column field="position" header="POSITION" className="text-600" style={{ width: '25%' }} body={(r) => r.position || 'N/A'} />
                                    <Column 
                                        body={() => (
                                            <Button label="Move Branch" icon="pi pi-external-link" outlined size="small" className="border-round-md text-600 border-300 font-bold" style={{ height: '32px' }} />
                                        )} 
                                        style={{ width: '10%' }} 
                                    />
                                </DataTable>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel header="Transfer History" leftIcon="pi pi-history mr-2">
                        <div className="py-4">
                            <div className="flex justify-content-end mb-4">
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search ml-2" />
                                    <InputText value={transferGlobalFilter} onChange={onTransferFilterChange} placeholder="Search transfers..." className="p-inputtext-sm border-round-lg w-15rem shadow-1 pl-5" />
                                </span>
                            </div>
                            <div className="border-round-lg overflow-hidden bg-white" style={{ border: '1px solid #e2e8f0' }}>
                                <DataTable 
                                    value={transfers} 
                                    filters={transferFilters}
                                    globalFilterFields={['employee.name_en', 'reason', 'from_branch.name', 'to_branch.name']}
                                    paginator 
                                    rows={10} 
                                    emptyMessage="No transfer history found for this branch." 
                                    className="p-datatable-sm custom-table"
                                    rowHover
                                >
                                    <Column field="transfer_date" header="DATE" body={(r) => new Date(r.transfer_date).toLocaleDateString()} className="text-600 font-medium" style={{ width: '15%' }} />
                                    <Column header="TYPE" body={transferTypeTemplate} style={{ width: '15%' }} />
                                    <Column field="employee.name_en" header="EMPLOYEE" className="font-bold text-900" style={{ width: '25%' }} />
                                    <Column header="RELATED BRANCH" body={relatedBranchTemplate} style={{ width: '25%' }} />
                                    <Column field="reason" header="REASON" body={(r) => <span className="text-600">{r.reason}</span>} style={{ width: '20%' }} />
                                </DataTable>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel header="Overview" leftIcon="pi pi-info-circle mr-2">
                        <div className="py-4 grid">
                            <div className="col-12 md:col-6 lg:col-4">
                                <div className="bg-gray-50 p-4 border-round-xl border-1 border-200 h-full">
                                    <div className="flex align-items-center gap-2 mb-2">
                                        <i className="pi pi-map text-500"></i>
                                        <span className="text-500 text-xs font-bold uppercase tracking-wider block">Full Address</span>
                                    </div>
                                    <span className="text-800 font-medium line-height-3 text-lg">{branch.address || 'Not specified'}</span>
                                </div>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <div className="bg-gray-50 p-4 border-round-xl border-1 border-200 h-full">
                                    <div className="flex align-items-center gap-2 mb-2">
                                        <i className="pi pi-phone text-500"></i>
                                        <span className="text-500 text-xs font-bold uppercase tracking-wider block">Contact Phone</span>
                                    </div>
                                    <span className="text-800 font-medium text-lg">{branch.phone_number || 'Not specified'}</span>
                                </div>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <div className="bg-gray-50 p-4 border-round-xl border-1 border-200 h-full">
                                    <div className="flex align-items-center gap-2 mb-2">
                                        <i className="pi pi-compass text-500"></i>
                                        <span className="text-500 text-xs font-bold uppercase tracking-wider block">Geofence Radius</span>
                                    </div>
                                    <span className="text-800 font-medium text-lg">{branch.radius ? `${branch.radius} meters` : 'Not specified'}</span>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="bg-gray-50 p-4 border-round-xl border-1 border-200 h-full">
                                    <div className="flex align-items-center gap-2 mb-2">
                                        <i className="pi pi-map-marker text-500"></i>
                                        <span className="text-500 text-xs font-bold uppercase tracking-wider block">Coordinates</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <div>
                                            <span className="text-400 text-xs block mb-1">LATITUDE</span>
                                            <span className="text-800 font-medium font-mono text-lg">{branch.latitude || 'N/A'}</span>
                                        </div>
                                        <div className="w-1px bg-300"></div>
                                        <div>
                                            <span className="text-400 text-xs block mb-1">LONGITUDE</span>
                                            <span className="text-800 font-medium font-mono text-lg">{branch.longitude || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
            
            <style>{`
                .custom-tabview .p-tabview-nav {
                    background: transparent;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 0;
                }
                .custom-tabview .p-tabview-nav li .p-tabview-nav-link {
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid transparent;
                    color: #64748b;
                    font-weight: 700;
                    font-size: 1.1rem;
                    padding: 1rem 1.5rem;
                    transition: all 0.2s;
                    box-shadow: none !important;
                }
                .custom-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
                    background: transparent;
                    border-color: #3b82f6;
                    color: #3b82f6;
                }
                .custom-tabview .p-tabview-nav li:not(.p-highlight):not(.p-disabled):hover .p-tabview-nav-link {
                    background: transparent;
                    color: #1e293b;
                    border-color: #cbd5e1;
                }
                .custom-tabview .p-tabview-panels {
                    padding: 0;
                    background: transparent;
                }
                /* Custom Table Styling to match the design */
                .custom-table .p-datatable-thead > tr > th {
                    background: #f8fafc;
                    color: #475569;
                    font-size: 0.85rem;
                    font-weight: 800;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 1rem;
                }
                .custom-table .p-datatable-tbody > tr > td {
                    padding: 1.25rem 1rem;
                    border-bottom: 1px solid #f1f5f9;
                }
            `}</style>
        </div>
    );
};

export default BranchDetailPage;
