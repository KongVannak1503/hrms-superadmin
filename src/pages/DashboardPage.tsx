import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { DashboardService } from '../services/dashboard.service';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const res = await DashboardService.getStats();
            setData(res);
        } catch (error) {
            console.error('Failed to load dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center h-full">
                <ProgressSpinner />
            </div>
        );
    }

    const stats = data?.stats || {};
    const recentCompanies = data?.recent_companies || [];

    const statCards = [
        { label: 'Total Companies', value: stats.total_companies, icon: 'pi pi-building', color: 'blue', trend: '+12%' },
        { label: 'Active Employees', value: stats.total_employees, icon: 'pi pi-users', color: 'teal', trend: '+5%' },
        { label: 'Global Branches', value: stats.total_branches, icon: 'pi pi-map-marker', color: 'purple', trend: '+2%' },
        { label: 'System Users', value: stats.total_users, icon: 'pi pi-desktop', color: 'orange', trend: '+8%' },
    ];

    return (
        <div className="p-4 md:p-6 mx-auto w-full" style={{ maxWidth: '1400px' }}>
            <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center mb-6 gap-4">
                <div>
                    <h1 className="m-0 text-4xl font-bold text-900 tracking-tight" style={{ color: '#0F172A' }}>Dashboard</h1>
                    <p className="text-500 font-medium mt-1">System-wide overview and performance metrics.</p>
                </div>
                <div className="flex gap-3">
                    <Button label="Generate Report" icon="pi pi-file-export" outlined className="border-round-xl font-bold text-700 border-300 bg-white" />
                    <Button label="New Company" icon="pi pi-plus" className="border-round-xl font-bold border-none px-4 shadow-2" style={{ backgroundColor: '#1E293B', color: '#ffffff' }} onClick={() => navigate('/companies/create')} />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid mb-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="col-12 md:col-6 lg:col-3">
                        <div className="premium-card p-4 flex flex-column gap-3 relative">
                            <div className="flex justify-content-between align-items-start">
                                <span className="text-500 font-bold uppercase tracking-widest text-xs">{stat.label}</span>
                                <div className={`w-2-5rem h-2-5rem border-round-xl flex align-items-center justify-content-center shadow-sm border-1`} 
                                     style={{ backgroundColor: `var(--surface-card)`, borderColor: '#E2E8F0' }}>
                                    <i className={`${stat.icon} text-lg`} style={{ color: '#0F172A' }}></i>
                                </div>
                            </div>
                            <div className="flex align-items-baseline gap-3 mt-2">
                                <span className="text-900 font-black text-4xl" style={{ color: '#0F172A' }}>{stat.value || 0}</span>
                                <span className="text-green-500 font-bold text-sm flex align-items-center gap-1">
                                    <i className="pi pi-arrow-up" style={{ fontSize: '0.7rem' }}></i> {stat.trend}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid">
                {/* Recent Registrations */}
                <div className="col-12 lg:col-8">
                    <div className="premium-card overflow-hidden bg-white h-full border-1 border-100">
                        <div className="p-4 border-bottom-1 border-100 flex justify-content-between align-items-center">
                            <h3 className="m-0 text-xl font-bold text-900">Recent Company Registrations</h3>
                            <Button label="View All" icon="pi pi-arrow-right" iconPos="right" text size="small" onClick={() => navigate('/companies')} />
                        </div>
                        <DataTable value={recentCompanies} className="p-datatable-sm custom-table" rowHover emptyMessage="No recent registrations.">
                            <Column field="name" header="COMPANY" body={(r) => <span className="font-bold text-900">{r.name}</span>} />
                            <Column field="website" header="WEBSITE" body={(r) => <span className="text-600 font-medium truncate inline-block w-10rem">{r.website || 'N/A'}</span>} />
                            <Column field="created_at" header="JOINED DATE" body={(r) => <span className="text-500">{new Date(r.created_at).toLocaleDateString()}</span>} />
                            <Column header="STATUS" body={() => (
                                <span className="px-2 py-1 border-round text-xs font-bold bg-green-50 text-green-700 border-1 border-green-200">ACTIVE</span>
                            )} />
                        </DataTable>
                    </div>
                </div>

                {/* System Activity / Alerts */}
                <div className="col-12 lg:col-4">
                    <div className="premium-card p-4 bg-white h-full border-1 border-100">
                        <h3 className="m-0 text-xl font-bold text-900 mb-4">System Notifications</h3>
                        <div className="flex flex-column gap-4">
                            <div className="flex gap-3 align-items-start p-3 border-round-xl hover:bg-gray-50 transition-colors cursor-pointer border-1 border-transparent hover:border-100">
                                <div className="w-2-5rem h-2-5rem bg-blue-50 border-round-xl flex align-items-center justify-content-center flex-shrink-0 border-1 border-blue-100">
                                    <i className="pi pi-info-circle text-blue-500"></i>
                                </div>
                                <div className="flex flex-column">
                                    <span className="text-900 font-bold text-sm">System Update v2.1</span>
                                    <span className="text-500 text-xs mt-1">Multi-tenant isolation layer has been upgraded.</span>
                                    <span className="text-400 text-2xs mt-2 font-bold uppercase tracking-tighter">2 HOURS AGO</span>
                                </div>
                            </div>

                            <div className="flex gap-3 align-items-start p-3 border-round-xl hover:bg-gray-50 transition-colors cursor-pointer border-1 border-transparent hover:border-100">
                                <div className="w-2-5rem h-2-5rem bg-green-50 border-round-xl flex align-items-center justify-content-center flex-shrink-0 border-1 border-green-100">
                                    <i className="pi pi-check-circle text-green-500"></i>
                                </div>
                                <div className="flex flex-column">
                                    <span className="text-900 font-bold text-sm">Database Backup</span>
                                    <span className="text-500 text-xs mt-1">Automated backup for all tenants completed successfully.</span>
                                    <span className="text-400 text-2xs mt-2 font-bold uppercase tracking-tighter">5 HOURS AGO</span>
                                </div>
                            </div>

                            <div className="flex gap-3 align-items-start p-3 border-round-xl hover:bg-gray-50 transition-colors cursor-pointer border-1 border-transparent hover:border-100">
                                <div className="w-2-5rem h-2-5rem bg-orange-50 border-round-xl flex align-items-center justify-content-center flex-shrink-0 border-1 border-orange-100">
                                    <i className="pi pi-exclamation-triangle text-orange-500"></i>
                                </div>
                                <div className="flex flex-column">
                                    <span className="text-900 font-bold text-sm">Trial Expiration</span>
                                    <span className="text-500 text-xs mt-1">3 tenant workspaces are approaching trial expiration.</span>
                                    <span className="text-400 text-2xs mt-2 font-bold uppercase tracking-tighter">1 DAY AGO</span>
                                </div>
                            </div>
                        </div>
                        <Button label="Clear All Notifications" text className="w-full mt-4 text-xs font-bold text-500" />
                    </div>
                </div>
            </div>
            
            <style>{`
                .w-2-5rem { width: 2.5rem; }
                .h-2-5rem { height: 2.5rem; }
                .w-32px { width: 32px; }
                .h-32px { height: 32px; }
            `}</style>
        </div>
    );
};

export default DashboardPage;
