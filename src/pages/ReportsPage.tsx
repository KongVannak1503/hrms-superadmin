import React, { useState, useEffect, useRef } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ReportService } from '../services/report.service';
import { CompanyService } from '../services/company.service';

const ReportsPage: React.FC = () => {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState<any[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
    const [absenteeism, setAbsenteeism] = useState<any>(null);
    const [overtimeCost, setOvertimeCost] = useState<any>(null);
    const [employeeCounts, setEmployeeCounts] = useState<any[]>([]);
    const [leaveUtilization, setLeaveUtilization] = useState<any>(null);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        setLoading(true);
        try {
            const companiesData = await CompanyService.getAll({ per_page: 200 });
            setCompanies(Array.isArray(companiesData) ? companiesData : companiesData?.data ?? []);
            await loadAllReports();
        } catch (error) {
            console.error('Failed to initialize reports', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAllReports = async (companyId?: string) => {
        const params: any = {};
        if (companyId) params.company_id = companyId;
        try {
            const [attendance, absenteeismData, overtime, counts, leaves] = await Promise.all([
                ReportService.attendanceSummary(params),
                ReportService.absenteeism(params),
                ReportService.overtimeCost(params),
                ReportService.employeeCounts(),
                ReportService.leaveUtilization(params),
            ]);
            setAttendanceSummary(attendance);
            setAbsenteeism(absenteeismData);
            setOvertimeCost(overtime);
            setEmployeeCounts(Array.isArray(counts) ? counts : []);
            setLeaveUtilization(leaves);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load reports' });
        }
    };

    const onCompanyChange = (e: any) => {
        setSelectedCompany(e.value);
        loadAllReports(e.value?.id);
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center h-full">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 mx-auto w-full" style={{ maxWidth: '1400px' }}>
            <Toast ref={toast} />
            <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center mb-6 gap-4">
                <div>
                    <h1 className="m-0 text-4xl font-bold text-900 tracking-tight" style={{ color: '#0F172A' }}>Global Reports</h1>
                    <p className="text-500 font-medium mt-1">Cross-tenant analytics and business intelligence.</p>
                </div>
                <div className="flex gap-3 align-items-center">
                    <Dropdown
                        value={selectedCompany}
                        onChange={onCompanyChange}
                        options={[{ label: 'All Companies', value: null }, ...companies.map((c: any) => ({ label: c.name, value: c }))]}
                        optionLabel="label"
                        placeholder="Filter by company"
                        className="border-round-xl w-16rem shadow-sm"
                        showClear
                    />
                    <Button label="Refresh" icon="pi pi-refresh" outlined className="border-round-xl font-bold text-700 border-300 bg-white" onClick={() => loadAllReports(selectedCompany?.id)} />
                </div>
            </div>

            {/* Attendance Summary */}
            <div className="grid mb-6">
                <div className="col-12">
                    <h3 className="text-900 font-bold text-xl mb-4 flex align-items-center gap-2">
                        <i className="pi pi-calendar-clock text-blue-500"></i>
                        Attendance Summary
                    </h3>
                </div>
                <div className="col-12 md:col-3">
                    <div className="p-4 border-round-2xl border-1 border-100 bg-white shadow-sm">
                        <span className="block text-500 font-bold mb-2 uppercase tracking-widest text-xs">Total Records</span>
                        <span className="text-900 font-black text-3xl">{attendanceSummary?.total_records ?? 0}</span>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="p-4 border-round-2xl border-1 border-100 bg-white shadow-sm">
                        <span className="block text-500 font-bold mb-2 uppercase tracking-widest text-xs">Present</span>
                        <span className="text-green-600 font-black text-3xl">{attendanceSummary?.present ?? 0}</span>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="p-4 border-round-2xl border-1 border-100 bg-white shadow-sm">
                        <span className="block text-500 font-bold mb-2 uppercase tracking-widest text-xs">Absent</span>
                        <span className="text-red-600 font-black text-3xl">{attendanceSummary?.absent ?? 0}</span>
                    </div>
                </div>
                <div className="col-12 md:col-3">
                    <div className="p-4 border-round-2xl border-1 border-100 bg-white shadow-sm">
                        <span className="block text-500 font-bold mb-2 uppercase tracking-widest text-xs">Late / Avg Minutes</span>
                        <span className="text-orange-600 font-black text-3xl">{attendanceSummary?.late ?? 0}</span>
                        <span className="text-500 text-sm ml-2">/ {Number(attendanceSummary?.avg_late_minutes ?? 0).toFixed(1)}m</span>
                    </div>
                </div>
            </div>

            {/* Absenteeism & Leave Utilization */}
            <div className="grid mb-6">
                <div className="col-12 md:col-6">
                    <h3 className="text-900 font-bold text-xl mb-4 flex align-items-center gap-2">
                        <i className="pi pi-send text-orange-500"></i>
                        Absenteeism Breakdown
                    </h3>
                    <div className="grid">
                        <div className="col-6">
                            <div className="p-4 border-round-2xl border-1 border-100 bg-white shadow-sm">
                                <span className="block text-500 font-bold mb-2 uppercase tracking-widest text-xs">Total Leaves</span>
                                <span className="text-900 font-black text-3xl">{absenteeism?.total_leaves ?? 0}</span>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="p-4 border-round-2xl border-1 border-100 bg-white shadow-sm">
                                <span className="block text-500 font-bold mb-2 uppercase tracking-widest text-xs">Sick Leave</span>
                                <span className="text-purple-600 font-black text-3xl">{absenteeism?.sick_leave ?? 0}</span>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="p-4 border-round-2xl border-1 border-100 bg-white shadow-sm">
                                <span className="block text-500 font-bold mb-2 uppercase tracking-widest text-xs">Annual Leave</span>
                                <span className="text-blue-600 font-black text-3xl">{absenteeism?.annual_leave ?? 0}</span>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="p-4 border-round-2xl border-1 border-100 bg-white shadow-sm">
                                <span className="block text-500 font-bold mb-2 uppercase tracking-widest text-xs">Unpaid Leave</span>
                                <span className="text-pink-600 font-black text-3xl">{absenteeism?.unpaid_leave ?? 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <h3 className="text-900 font-bold text-xl mb-4 flex align-items-center gap-2">
                        <i className="pi pi-chart-bar text-indigo-500"></i>
                        Leave Utilization
                    </h3>
                    <div className="p-4 border-round-2xl border-1 border-100 bg-white shadow-sm">
                        <div className="flex justify-content-between align-items-center mb-4 pb-3 border-bottom-1 border-100">
                            <span className="text-500 font-bold uppercase tracking-widest text-xs">Total Approved</span>
                            <span className="text-900 font-black text-2xl">{leaveUtilization?.total_approved ?? 0}</span>
                        </div>
                        {leaveUtilization?.by_type?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-content-between align-items-center py-2">
                                <span className="text-700 font-medium">{item.leave_type}</span>
                                <span className="text-900 font-bold">{item.count}</span>
                            </div>
                        ))}
                        {(!leaveUtilization?.by_type || leaveUtilization.by_type.length === 0) && (
                            <div className="text-500 text-sm text-center py-3">No data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Overtime & Employee Counts */}
            <div className="grid">
                <div className="col-12 md:col-6">
                    <h3 className="text-900 font-bold text-xl mb-4 flex align-items-center gap-2">
                        <i className="pi pi-clock text-teal-500"></i>
                        Overtime Cost
                    </h3>
                    <div className="grid">
                        <div className="col-6">
                            <div className="p-4 border-round-2xl border-1 border-100 bg-white shadow-sm">
                                <span className="block text-500 font-bold mb-2 uppercase tracking-widest text-xs">Total Hours</span>
                                <span className="text-teal-600 font-black text-3xl">{Number(overtimeCost?.total_hours ?? 0).toFixed(1)}</span>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="p-4 border-round-2xl border-1 border-100 bg-white shadow-sm">
                                <span className="block text-500 font-bold mb-2 uppercase tracking-widest text-xs">Total Entries</span>
                                <span className="text-900 font-black text-3xl">{overtimeCost?.total_records ?? 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 md:col-6">
                    <h3 className="text-900 font-bold text-xl mb-4 flex align-items-center gap-2">
                        <i className="pi pi-users text-green-600"></i>
                        Employee Count by Company
                    </h3>
                    <div className="p-4 border-round-2xl border-1 border-100 bg-white shadow-sm">
                        {employeeCounts.length > 0 ? employeeCounts.map((item: any, idx: number) => (
                            <div key={idx} className="mb-3 pb-3" style={{ borderBottom: idx < employeeCounts.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                                <div className="flex justify-content-between align-items-center mb-2">
                                    <span className="text-900 font-bold">{item.company}</span>
                                    <span className="text-900 font-black text-xl">{item.total}</span>
                                </div>
                                {item.branches?.map((b: any, bIdx: number) => (
                                    <div key={bIdx} className="flex justify-content-between align-items-center ml-4 text-sm">
                                        <span className="text-500">{b.name}</span>
                                        <span className="text-700 font-medium">{b.count}</span>
                                    </div>
                                ))}
                            </div>
                        )) : (
                            <div className="text-500 text-sm text-center py-3">No data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
