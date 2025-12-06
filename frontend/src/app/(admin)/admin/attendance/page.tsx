'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import AttendanceCheckIn from '@/components/hr/AttendanceCheckIn';
import { Calendar, MapPin, Clock } from 'lucide-react';

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

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/hr/attendance/history');
                setHistory(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchHistory();
    }, []);

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

                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-gray-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Check In</th>
                                    <th className="px-6 py-4">Check Out</th>
                                    <th className="px-6 py-4">Hours</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {history.length > 0 ? (
                                    history.map((record) => (
                                        <tr key={record.id} className="text-white hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium">
                                                {new Date(record.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">
                                                {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">
                                                {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-emerald-400">
                                                {record.work_hours ? record.work_hours.toFixed(2) : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'Present' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        record.status === 'Late' ? 'bg-orange-500/20 text-orange-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No attendance history found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
