'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import AttendanceCheckIn from '@/components/hr/AttendanceCheckIn';
import { Calendar } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';

interface AttendanceRecord {
    id: number;
    date: string;
    check_in_time: string;
    check_out_time: string;
    work_hours: number;
    status: string;
}

export default function AttendancePage() {
    const [history, setHistory] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const res = await api.get('/hr/attendance/history');
                // Handle different response formats
                let data = res.data;

                // Case: Wrapped in data object { data: [...] }
                if (data && !Array.isArray(data) && Array.isArray(data.data)) {
                    data = data.data;
                }

                // Case: Single object wrapped { data: {...} } - Handling the user's specific JSON case
                if (
                    data &&
                    !Array.isArray(data) &&
                    data.data &&
                    typeof data.data === 'object' &&
                    !Array.isArray(data.data)
                ) {
                    data = [data.data];
                }

                if (Array.isArray(data)) {
                    setHistory(data);
                } else {
                    console.error('Attendance history format error:', res.data);
                    setHistory([]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const columns: Column<AttendanceRecord>[] = [
        {
            header: 'Date',
            accessorKey: 'date',
            cell: (value: string) => (
                <span className="font-medium">
                    {new Date(value).toLocaleDateString('th-TH', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                    })}
                </span>
            ),
        },
        {
            header: 'Check In',
            accessorKey: 'check_in_time',
            cell: (value: string | null) => (
                <span className="text-gray-300">
                    {value
                        ? new Date(value).toLocaleTimeString('th-TH', {
                              hour: '2-digit',
                              minute: '2-digit',
                          })
                        : '-'}
                </span>
            ),
        },
        {
            header: 'Check Out',
            accessorKey: 'check_out_time',
            cell: (value: string | null) => (
                <span className="text-gray-300">
                    {value
                        ? new Date(value).toLocaleTimeString('th-TH', {
                              hour: '2-digit',
                              minute: '2-digit',
                          })
                        : '-'}
                </span>
            ),
        },
        {
            header: 'Hours',
            accessorKey: 'work_hours',
            cell: (value: number | null) => (
                <span className="font-mono text-emerald-400">{value ? value.toFixed(2) : '-'}</span>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (value: string) => (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        value === 'Present'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : value === 'Late'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-gray-500/20 text-gray-400'
                    }`}
                >
                    {value}
                </span>
            ),
        },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="max-w-md mx-auto w-full">
                <AttendanceCheckIn />
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Calendar size={20} className="text-indigo-400" />
                    Recent History
                </h3>

                <DataTable columns={columns} data={history} isLoading={loading} hidePagination />
            </div>
        </div>
    );
}
