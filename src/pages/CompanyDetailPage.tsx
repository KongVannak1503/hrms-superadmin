import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Avatar } from 'primereact/avatar';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CompanyService } from '../services/company.service';

// Fix for Leaflet default icon issues in React/Vite
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const CompanyDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const toast = useRef<Toast>(null);

    const [company, setCompany] = useState<any>(null);
    const [admin, setAdmin] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const tabMap: { [key: string]: number } = {
        'overview': 0,
        'branches': 1,
        'map': 2,
        'employee': 3,
        'billing': 4
    };

    const reverseTabMap: { [key: number]: string } = Object.fromEntries(
        Object.entries(tabMap).map(([k, v]) => [v, k])
    );

    const initialTab = searchParams.get('tab') || 'overview';
    const [activeIndex, setActiveIndex] = useState(tabMap[initialTab] ?? 0);
    
    const [branchFilters, setBranchFilters] = useState<any>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [branchGlobalFilter, setBranchGlobalFilter] = useState('');

    const [employeeFilters, setEmployeeFilters] = useState<any>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [employeeGlobalFilter, setEmployeeGlobalFilter] = useState('');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tabMap[tab] !== undefined) {
            setActiveIndex(tabMap[tab]);
        }
    }, [searchParams]);

    useEffect(() => {
        loadCompanyDetails();
    }, [id]);

    const loadCompanyDetails = async () => {
        setLoading(true);
        try {
            if (!id) return;
            const data = await CompanyService.getById(id);
            setCompany(data.company);
            setAdmin(data.admin);
        } catch (error) {
            console.error('Failed to load company details', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load company details' });
        } finally {
            setLoading(false);
        }
    };

    const branchActionTemplate = (rowData: any) => {
        return (
            <Button icon="pi pi-eye" rounded outlined severity="info" size="small" onClick={() => navigate(`/companies/${company.id}/branches/${rowData.id}`)} tooltip="View Branch Details" style={{ width: '32px', height: '32px' }} />
        );
    };

    const onBranchFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...branchFilters };
        _filters['global'].value = value;
        setBranchFilters(_filters);
        setBranchGlobalFilter(value);
    };

    const onEmployeeFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...employeeFilters };
        _filters['global'].value = value;
        setEmployeeFilters(_filters);
        setEmployeeGlobalFilter(value);
    };

    const onTabChange = (e: any) => {
        setActiveIndex(e.index);
        setSearchParams({ tab: reverseTabMap[e.index] });
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center h-full">
                <ProgressSpinner />
            </div>
        );
    }

    if (!company) {
        return (
            <div className="p-4">
                <h2>Company not found</h2>
                <Button label="Back to Companies" icon="pi pi-arrow-left" onClick={() => navigate('/companies')} />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 mx-auto w-full min-h-screen" style={{ maxWidth: '1400px' }}>
            <Toast ref={toast} />
            
            {/* Breadcrumb Navigation */}
            <div className="flex align-items-center gap-2 mb-6 text-sm font-medium text-500">
                <span className="cursor-pointer hover:text-900 transition-colors" onClick={() => navigate('/companies')}>Companies</span>
                <i className="pi pi-chevron-right text-xs"></i>
                <span className="text-900 font-semibold">{company.name}</span>
            </div>

            {/* Premium Header Section */}
            <div className="flex flex-column lg:flex-row lg:justify-content-between lg:align-items-end mb-6 gap-4 border-bottom-1 border-100 pb-6">
                <div className="flex align-items-start gap-4">
                    <div className="relative">
                        <Avatar label={company.name.charAt(0).toUpperCase()} size="xlarge" shape="circle" className="text-white font-bold text-3xl shadow-3" style={{ width: '80px', height: '80px', backgroundColor: '#0F172A', border: '4px solid white' }} />
                        <div className="absolute bottom-0 right-0 w-24px h-24px bg-green-500 border-circle border-2 border-white shadow-2 flex align-items-center justify-content-center" title="Company Active">
                            <i className="pi pi-check text-white" style={{ fontSize: '10px' }}></i>
                        </div>
                    </div>
                    <div>
                        <div className="flex align-items-center gap-3 mb-2">
                            <h1 className="m-0 text-4xl font-bold text-900 tracking-tight" style={{ color: '#0F172A' }}>{company.name}</h1>
                            <span className="px-3 py-1 border-round-2xl text-xs font-black tracking-widest border-1 shadow-sm" style={{ 
                                backgroundColor: company.status === 'Active' ? '#F0FDF4' : '#FEF2F2',
                                color: company.status === 'Active' ? '#16A34A' : '#DC2626',
                                borderColor: company.status === 'Active' ? '#DCFCE7' : '#FEE2E2'
                            }}>
                                {company.status?.toUpperCase() || 'ACTIVE'}
                            </span>
                        </div>
                        <div className="flex flex-wrap align-items-center gap-4 text-600 font-medium">
                            <span className="flex align-items-center gap-2">
                                <i className="pi pi-globe text-400"></i>
                                <a href={company.website || '#'} target="_blank" rel="noopener noreferrer" className="text-600 hover:text-blue-600 no-underline transition-colors border-bottom-1 border-transparent hover:border-blue-600">
                                    {company.website ? new URL(company.website).hostname : 'Website pending'}
                                </a>
                            </span>
                            <span className="flex align-items-center gap-2 border-left-1 border-200 pl-4 hidden md:flex">
                                <i className="pi pi-calendar text-400"></i>
                                <span>Established {new Date(company.created_at).getFullYear()}</span>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button label="Edit Profile" icon="pi pi-pencil" className="border-round-xl font-bold border-none px-4 shadow-2" style={{ height: '40px', backgroundColor: '#1E293B', color: '#ffffff' }} onClick={() => navigate(`/companies/${company.id}/edit`)} />
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid mb-6">
                <div className="col-12 md:col-4">
                    <div className="premium-card p-4 flex justify-content-between align-items-center">
                        <div>
                            <span className="block text-500 font-bold mb-2 uppercase tracking-widest text-xs">Total Workforce</span>
                            <div className="flex align-items-baseline gap-2">
                                <div className="text-900 font-black text-4xl" style={{ color: '#0F172A' }}>{company.employees_count || 0}</div>
                                <span className="text-green-500 text-sm font-bold flex align-items-center gap-1">
                                    <i className="pi pi-arrow-up" style={{ fontSize: '10px' }}></i> 4%
                                </span>
                            </div>
                        </div>
                        <div className="w-4rem h-4rem flex align-items-center justify-content-center border-round-2xl shadow-sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                            <i className="pi pi-users text-2xl" style={{ color: '#0F172A' }}></i>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-4">
                    <div className="premium-card p-4 flex justify-content-between align-items-center">
                        <div>
                            <span className="block text-500 font-bold mb-2 uppercase tracking-widest text-xs">Operational Units</span>
                            <div className="text-900 font-black text-4xl" style={{ color: '#0F172A' }}>{company.branches_count || 0}</div>
                        </div>
                        <div className="w-4rem h-4rem flex align-items-center justify-content-center border-round-2xl shadow-sm" style={{ backgroundColor: '#ECFDF5', border: '1px solid #D1FAE5' }}>
                            <i className="pi pi-map-marker text-2xl" style={{ color: '#10B981' }}></i>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-4">
                    <div className="premium-card p-4 flex justify-content-between align-items-center">
                        <div>
                            <span className="block text-500 font-bold mb-2 uppercase tracking-widest text-xs">Platform Users</span>
                            <div className="text-900 font-black text-4xl" style={{ color: '#0F172A' }}>{company.users_count || 0}</div>
                        </div>
                        <div className="w-4rem h-4rem flex align-items-center justify-content-center border-round-2xl shadow-sm" style={{ backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE' }}>
                            <i className="pi pi-desktop text-2xl" style={{ color: '#3B82F6' }}></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Detail Area */}
            <div className="premium-card overflow-hidden bg-white p-2 mt-2">
                <TabView className="custom-tabview" activeIndex={activeIndex} onTabChange={onTabChange}>
                    <TabPanel header="Overview" leftIcon="pi pi-info-circle mr-2">
                        <div className="py-4">
                            <div className="grid">
                                {/* Left Column: Identity */}
                                <div className="col-12 lg:col-6 pr-0 lg:pr-6">
                                    <h3 className="text-900 font-bold mb-5 flex align-items-center gap-3 text-xl">
                                        <div className="w-32px h-32px bg-gray-900 border-round-lg flex align-items-center justify-content-center shadow-1">
                                            <i className="pi pi-briefcase text-white text-xs"></i>
                                        </div>
                                        Identity Profile
                                    </h3>
                                    
                                    <div className="flex flex-column gap-5">
                                        {company.logo_url && (
                                            <div className="flex flex-column gap-1">
                                                <span className="text-500 text-xs font-black uppercase tracking-widest">Brand Identity</span>
                                                <div className="mt-2 border-1 border-100 border-round-xl p-3 inline-block bg-gray-50/50 shadow-sm">
                                                    <img 
                                                        src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api', '')}/storage/${company.logo_url}`} 
                                                        alt="Company Logo" 
                                                        className="w-10rem h-4rem object-contain"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-column gap-1">
                                            <span className="text-500 text-xs font-black uppercase tracking-widest">Company Designation</span>
                                            <span className="text-900 font-bold text-2xl tracking-tighter">{company.name}</span>
                                        </div>

                                        <div className="grid">
                                            <div className="col-6 flex flex-column gap-1">
                                                <span className="text-500 text-xs font-black uppercase tracking-widest">Official URL</span>
                                                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold flex align-items-center gap-2 hover:underline">
                                                    {company.website?.replace(/^https?:\/\//, '') || 'N/A'}
                                                    <i className="pi pi-external-link text-xs"></i>
                                                </a>
                                            </div>
                                            <div className="col-6 flex flex-column gap-1">
                                                <span className="text-500 text-xs font-black uppercase tracking-widest">Status</span>
                                                <div className="flex align-items-center gap-2 mt-1">
                                                    <div className="w-8px h-8px bg-green-500 border-circle"></div>
                                                    <span className="text-900 font-bold">Active Operation</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-4 border-round-2xl border-1 border-50 shadow-sm mt-2 hover:border-indigo-200 transition-all">
                                            <span className="text-500 text-xs font-black uppercase tracking-widest mb-3 block">Global ID Structure</span>
                                            <div className="flex align-items-center justify-content-between">
                                                <div className="flex align-items-center gap-3">
                                                    <div className="w-3-5rem h-3-5rem bg-indigo-50 border-round-2xl flex align-items-center justify-content-center border-1 border-indigo-100">
                                                        <i className="pi pi-id-card text-indigo-600 text-xl"></i>
                                                    </div>
                                                    <div className="flex flex-column">
                                                        <span className="text-900 font-bold text-2xl tracking-tight leading-none mb-1">{company.employee_id_prefix}{String(company.employee_id_next_number).padStart(company.employee_id_length, '0')}</span>
                                                        <span className="text-500 text-xs font-semibold">Automatic Generation Active</span>
                                                    </div>
                                                </div>
                                                <Button icon="pi pi-pencil" text rounded severity="secondary" size="small" className="hover:bg-indigo-50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Admin */}
                                <div className="col-12 lg:col-6 mt-6 lg:mt-0 pl-0 lg:pl-6 border-left-none lg:border-left-1 border-100">
                                    <h3 className="text-900 font-bold mb-5 flex align-items-center gap-3 text-xl">
                                        <div className="w-32px h-32px bg-indigo-50 border-round-lg flex align-items-center justify-content-center shadow-1">
                                            <i className="pi pi-shield text-indigo-600 text-xs"></i>
                                        </div>
                                        Master Account
                                    </h3>
                                    
                                    {admin ? (
                                        <div className="flex flex-column gap-5">
                                            <div className="relative overflow-hidden p-5 border-round-3xl shadow-8" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
                                                {/* Decorative background circle */}
                                                <div className="absolute -top-4 -right-4 w-12rem h-12rem bg-white-alpha-10 border-circle blur-3xl"></div>
                                                
                                                <div className="relative flex align-items-center gap-4">
                                                    <Avatar label={admin.name.charAt(0).toUpperCase()} size="xlarge" shape="circle" className="bg-white-alpha-10 text-white font-bold border-1 border-white-alpha-20 shadow-4" style={{ width: '72px', height: '72px', fontSize: '2rem' }} />
                                                    <div className="overflow-hidden">
                                                        <span className="text-white font-bold block text-2xl mb-1 truncate tracking-tight">{admin.name}</span>
                                                        <span className="text-white-alpha-60 text-lg flex align-items-center gap-2 truncate font-medium">
                                                            <i className="pi pi-envelope text-sm"></i>
                                                            {admin.email}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="relative flex justify-content-between mt-5 pt-4 border-top-1 border-white-alpha-10">
                                                    <div className="flex flex-column gap-1">
                                                        <span className="text-white-alpha-40 text-xs font-black uppercase tracking-widest">Account ID</span>
                                                        <span className="text-white font-bold font-mono">USR-{String(admin.id).padStart(4, '0')}</span>
                                                    </div>
                                                    <div className="flex flex-column gap-1 text-right">
                                                        <span className="text-white-alpha-40 text-xs font-black uppercase tracking-widest">Security</span>
                                                        <span className="text-blue-400 font-bold flex align-items-center gap-2 justify-content-end">
                                                            <i className="pi pi-verified text-xs"></i>
                                                            Full Access
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 border-round-2xl border-1 border-100 flex align-items-center justify-content-between hover:surface-50 transition-all cursor-pointer group shadow-sm bg-white">
                                                <div className="flex align-items-center gap-4">
                                                    <div className="w-3-5rem h-3-5rem bg-red-50 border-round-2xl flex align-items-center justify-content-center border-1 border-red-100 group-hover:bg-red-500 group-hover:border-red-500 transition-all">
                                                        <i className="pi pi-key text-red-500 text-xl group-hover:text-white transition-all"></i>
                                                    </div>
                                                    <div className="flex flex-column">
                                                        <span className="text-900 font-bold text-lg">Reset Password</span>
                                                        <span className="text-500 text-sm font-medium">Force credential refresh for security</span>
                                                    </div>
                                                </div>
                                                <i className="pi pi-chevron-right text-400 group-hover:translate-x-2 transition-all"></i>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-orange-50 p-5 border-round-2xl border-1 border-orange-100 flex align-items-center gap-4 shadow-sm">
                                            <div className="w-4rem h-4rem bg-white border-circle flex align-items-center justify-content-center shadow-1">
                                                <i className="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
                                            </div>
                                            <div>
                                                <span className="text-orange-900 font-bold block text-lg">No Master Administrator</span>
                                                <span className="text-orange-700 font-medium">Please assign an administrator to manage this tenant.</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel header="Branches" leftIcon="pi pi-map-marker mr-2">
                        <div className="p-4">
                            <div className="flex justify-content-between align-items-center mb-5">
                                <div className="flex align-items-center gap-3">
                                    <div className="w-40px h-40px bg-indigo-50 border-round-lg flex align-items-center justify-content-center shadow-1">
                                        <i className="pi pi-map-marker text-indigo-600 text-sm"></i>
                                    </div>
                                    <div>
                                        <h3 className="m-0 text-xl font-bold text-900">Branch Network</h3>
                                        <p className="text-500 text-sm m-0">Audit and manage physical operational hubs</p>
                                    </div>
                                </div>
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search ml-2" />
                                    <InputText value={branchGlobalFilter} onChange={onBranchFilterChange} placeholder="Search hubs..." className="p-inputtext-sm border-round-xl w-18rem pl-5 shadow-sm border-100" />
                                </span>
                            </div>
                            <div className="border-round-2xl overflow-hidden bg-white shadow-1 border-1 border-100">
                                <DataTable 
                                    value={company.branches || []} 
                                    filters={branchFilters}
                                    globalFilterFields={['name', 'address', 'phone_number']}
                                    emptyMessage="No branches found for this company." 
                                    className="p-datatable-sm custom-table"
                                    rowHover
                                >
                                    <Column field="id" header="ID" style={{ width: '80px' }} className="font-medium text-600" />
                                    <Column field="name" header="BRANCH NAME" className="font-bold text-900" />
                                    <Column field="address" header="ADDRESS" className="text-600" />
                                    <Column field="phone_number" header="CONTACT PHONE" className="text-600" />
                                    <Column body={branchActionTemplate} style={{ width: '80px', textAlign: 'center' }} />
                                </DataTable>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel header="Map View" leftIcon="pi pi-map mr-2">
                        <div className="p-4">
                            <div className="flex justify-content-between align-items-center mb-5">
                                <div className="flex align-items-center gap-3">
                                    <div className="w-40px h-40px bg-teal-50 border-round-lg flex align-items-center justify-content-center shadow-1">
                                        <i className="pi pi-map text-teal-600 text-sm"></i>
                                    </div>
                                    <div>
                                        <h3 className="m-0 text-xl font-bold text-900">Branch Distribution</h3>
                                        <p className="text-500 text-sm m-0">Geographical overview of all operational hubs</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-round-2xl overflow-hidden shadow-2 border-1 border-100" style={{ height: '500px', zIndex: 1 }}>
                                <MapContainer 
                                    center={[11.5564, 104.9282]} // Default to Phnom Penh
                                    zoom={12} 
                                    scrollWheelZoom={true}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                    {company.branches?.map((branch: any) => (
                                        branch.latitude && branch.longitude && (
                                            <React.Fragment key={branch.id}>
                                                {/* Visual Zone (Circle) */}
                                                <Circle 
                                                    center={[parseFloat(branch.latitude), parseFloat(branch.longitude)]}
                                                    radius={branch.radius || 100} // Default 100m if not set
                                                    pathOptions={{ 
                                                        fillColor: '#10B981', 
                                                        fillOpacity: 0.15, 
                                                        color: '#10B981', 
                                                        weight: 2,
                                                        dashArray: '5, 10'
                                                    }}
                                                >
                                                    <Tooltip permanent direction="top" opacity={1} className="premium-tooltip">
                                                        <span className="font-bold text-xs uppercase tracking-tighter text-indigo-900">{branch.name}</span>
                                                    </Tooltip>
                                                </Circle>
                                                
                                                {/* Location Marker */}
                                                <Marker position={[parseFloat(branch.latitude), parseFloat(branch.longitude)]}>
                                                    <Popup className="premium-popup">
                                                    <div className="p-2">
                                                        <div className="font-bold text-900 text-base mb-1">{branch.name}</div>
                                                        <div className="text-500 text-xs mb-3 flex align-items-center gap-2">
                                                            <i className="pi pi-map-marker text-indigo-500"></i>
                                                            {branch.address}
                                                        </div>
                                                        <div className="flex justify-content-between border-top-1 border-100 pt-2 mt-2">
                                                            <div className="text-center">
                                                                <div className="text-900 font-bold">{branch.employees?.length || 0}</div>
                                                                <div className="text-500 text-2xs uppercase font-black">Staff</div>
                                                            </div>
                                                            <Button 
                                                                label="Details" 
                                                                icon="pi pi-arrow-right" 
                                                                iconPos="right"
                                                                className="p-button-text p-button-sm p-0 font-bold" 
                                                                onClick={() => navigate(`/companies/${company.id}/branches/${branch.id}`)}
                                                            />
                                                        </div>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        </React.Fragment>
                                        )
                                    ))}
                                </MapContainer>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel header="Employees" leftIcon="pi pi-users mr-2">
                        <div className="p-4">
                            <div className="flex justify-content-between align-items-center mb-5">
                                <div className="flex align-items-center gap-3">
                                    <div className="w-40px h-40px bg-blue-50 border-round-lg flex align-items-center justify-content-center shadow-1">
                                        <i className="pi pi-users text-blue-600 text-sm"></i>
                                    </div>
                                    <div>
                                        <h3 className="m-0 text-xl font-bold text-900">Workforce Directory</h3>
                                        <p className="text-500 text-sm m-0">Comprehensive list of all registered personnel</p>
                                    </div>
                                </div>
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search ml-2" />
                                    <InputText value={employeeGlobalFilter} onChange={onEmployeeFilterChange} placeholder="Filter workforce..." className="p-inputtext-sm border-round-xl w-18rem pl-5 shadow-sm border-100" />
                                </span>
                            </div>
                            <div className="border-round-2xl overflow-hidden bg-white shadow-1 border-1 border-100">
                                <DataTable 
                                    value={company.employees || []} 
                                    filters={employeeFilters}
                                    globalFilterFields={['employee_id', 'name_en', 'department', 'position', 'location']}
                                    paginator 
                                    rows={10} 
                                    rowsPerPageOptions={[10, 25, 50]}
                                    emptyMessage="No employees found for this company." 
                                    className="p-datatable-sm custom-table"
                                    rowHover
                                >
                                    <Column field="employee_id" header="ID" className="font-medium text-600" />
                                    <Column field="name_en" header="NAME" className="font-bold text-900" />
                                    <Column field="gender" header="GENDER" className="text-600" body={(r) => <span>{r.gender === 'M' ? 'Male' : r.gender === 'F' ? 'Female' : r.gender}</span>} />
                                    <Column field="department" header="DEPARTMENT" className="text-600" body={(r) => r.department || 'N/A'} />
                                    <Column field="position" header="POSITION" className="text-600" />
                                    <Column field="location" header="LOCATION" className="text-600" />
                                </DataTable>
                            </div>
                        </div>
                    </TabPanel>
                    
                    <TabPanel header="Subscription & Billing" leftIcon="pi pi-credit-card mr-2">
                        <div className="p-8 text-center bg-white m-0 border-round-3xl relative overflow-hidden">
                            {/* Background pattern or subtle glow */}
                            <div className="absolute top-0 left-0 w-full h-1px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                            
                            <div className="w-6rem h-6rem bg-gray-50 border-round-3xl flex align-items-center justify-content-center mx-auto mb-5 border-1 border-100 shadow-sm">
                                <i className="pi pi-lock text-4xl text-900 opacity-20"></i>
                            </div>
                            <h3 className="text-900 font-bold mb-3 text-3xl tracking-tight">Enterprise Billing</h3>
                            <p className="text-600 m-0 max-w-28rem mx-auto line-height-4 text-lg font-medium opacity-80">Advanced subscription lifecycle management, usage analytics, and automated invoicing are currently in development for our V2 rollout.</p>
                            <div className="flex justify-content-center gap-3 mt-6">
                                <Button label="View Early Roadmap" icon="pi pi-map" className="border-round-xl font-bold text-700 border-300 px-4" outlined />
                                <Button label="Get Early Access" icon="pi pi-star-fill" className="border-round-xl font-bold border-none px-4 shadow-4" style={{ backgroundColor: '#0F172A', color: '#ffffff' }} />
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
                /* Custom Table Styling */
                .custom-table .p-datatable-thead > tr > th {
                    background: #f8fafc;
                    color: #475569;
                    font-size: 0.85rem;
                    font-weight: 800;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 1.25rem 1rem;
                }
                .custom-table .p-datatable-tbody > tr > td {
                    padding: 1.5rem 1rem;
                    border-bottom: 1px solid #f1f5f9;
                }
            `}</style>
        </div>
    );
};

export default CompanyDetailPage;