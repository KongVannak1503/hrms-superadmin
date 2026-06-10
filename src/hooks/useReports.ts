import { useState, useCallback } from 'react';
import type {
    AttendanceSummaryReport,
    AbsenteeismReport,
    OvertimeCostReport,
    EmployeeCountReport,
    LeaveUtilizationReport,
    ReportParams,
} from '../types';
import { ReportService } from '../services/report.service';

export function useReports() {
    const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummaryReport | null>(null);
    const [absenteeism, setAbsenteeism] = useState<AbsenteeismReport | null>(null);
    const [overtimeCost, setOvertimeCost] = useState<OvertimeCostReport | null>(null);
    const [employeeCounts, setEmployeeCounts] = useState<EmployeeCountReport[]>([]);
    const [leaveUtilization, setLeaveUtilization] = useState<LeaveUtilizationReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadAllReports = useCallback(
        async (params: ReportParams = {}) => {
            setLoading(true);
            setError(null);
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
                setEmployeeCounts(Array.isArray(counts) ? counts : counts?.data ?? []);
                setLeaveUtilization(leaves);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        attendanceSummary,
        absenteeism,
        overtimeCost,
        employeeCounts,
        leaveUtilization,
        loading,
        error,
        loadAllReports,
    };
}