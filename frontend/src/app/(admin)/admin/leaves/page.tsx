'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, Check, X, Calendar, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface LeaveRequest {
    id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    status: string;
    created_at: string;
    employee?: {
        user?: {
            first_name: string;
            last_name: string;
        }
    }
}

interface LeaveQuota {
    sick_leave_used: number;
    sick_leave_limit: number;
    personal_leave_used: number;
    personal_leave_limit: number;
    vacation_leave_used: number;
    vacation_leave_limit: number;
}

export default function LeavesPage() {
    const [activeTab, setActiveTab] = useState<'my-leaves' | 'approvals'>('my-leaves');
    const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
    const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
    const [quota, setQuota] = useState<LeaveQuota | null>(null);
    const [showRequestModal, setShowRequestModal] = useState(false);

    // Form State
    const [requestForm, setRequestForm] = useState({
        leave_type: 'Sick Leave',
        start_date: '',
        end_date: '',
        reason: '',
        attachment: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMyLeaves();
        fetchQuota();
        // Check if admin (simple check, ideally use auth hook)
        fetchPending();
    }, []);

    const fetchMyLeaves = async () => {
        try {
            const res = await api.get('/hr/leaves/my');
            setMyLeaves(res.data);
        } catch (err) { }
    };

    const fetchQuota = async () => {
        try {
            const res = await api.get('/hr/leaves/quota');
            setQuota(res.data);
        } catch (err) { }
    }

    const fetchPending = async () => {
        try {
            const res = await api.get('/hr/leaves/pending');
            setPendingLeaves(res.data);
        } catch (err) { }
    }

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/hr/leaves', requestForm);
            setShowRequestModal(false);
            fetchMyLeaves();
            setRequestForm({ leave_type: 'Sick Leave', start_date: '', end_date: '', reason: '', attachment: '' });
        } catch (err) {
            alert('Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApproval = async (id: number, status: 'Approved' | 'Rejected') => {
        if (!confirm(`Are you sure you want to ${status} this request?`)) return;
        try {
            await api.put(`/hr/leaves/${id}/approval`, { status, comment: '' });
            fetchPending();
        } catch (err) {
            alert('Operation failed');
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                        Leave Management
                    </h1>
                    <p className="text-gray-400 text-sm">Track your leaves and approvals.</p>
                </div>

                <Button icon={<Plus size={18} />} onClick={() => setShowRequestModal(true)}>
                    Request Leave
                </Button>
            </div>

            {/* Quota Cards */}
            {quota && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <QuotaCard
                        title="Sick Leave"
                        used={quota.sick_leave_used}
                        limit={quota.sick_leave_limit}
                        color="bg-red-500"
                    />
                    <QuotaCard
                        title="Personal Leave"
                        used={quota.personal_leave_used}
                        limit={quota.personal_leave_limit}
                        color="bg-blue-500"
                    />
                    <QuotaCard
                        title="Vacation Leave"
                        used={quota.vacation_leave_used}
                        limit={quota.vacation_leave_limit}
                        color="bg-emerald-500"
                    />
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-white/10 flex gap-6">
                <button
                    onClick={() => setActiveTab('my-leaves')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'my-leaves' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    My Leaves
                    {activeTab === 'my-leaves' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
                </button>
                <button
                    onClick={() => setActiveTab('approvals')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'approvals' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    Approvals
                    {pendingLeaves.length > 0 && <span className="ml-2 bg-indigo-500 text-white text-[10px] px-1.5 rounded-full">{pendingLeaves.length}</span>}
                    {activeTab === 'approvals' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
                </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'my-leaves' ? (
                    <motion.div
                        key="my-leaves"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                    >
                        <Table data={myLeaves} type="my" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="approvals"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                    >
                        <Table data={pendingLeaves} type="approval" onApprove={handleApproval} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
                    >
                        <h2 className="text-xl font-bold text-white mb-4">Request Leave</h2>
                        <form onSubmit={handleRequestSubmit} className="space-y-4">
                            <Select
                                label="Leave Type"
                                value={requestForm.leave_type}
                                onChange={(e) => setRequestForm({ ...requestForm, leave_type: e.target.value })}
                                options={[
                                    { value: 'Sick Leave', label: 'Sick Leave' },
                                    { value: 'Personal Leave', label: 'Personal Leave' },
                                    { value: 'Vacation Leave', label: 'Vacation Leave' },
                                    { value: 'Other', label: 'Other' },
                                ]}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={requestForm.start_date}
                                        onChange={(e) => setRequestForm({ ...requestForm, start_date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={requestForm.end_date}
                                        onChange={(e) => setRequestForm({ ...requestForm, end_date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <Input
                                placeholder="Reason for leave..."
                                value={requestForm.reason}
                                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                                label="Reason"
                            />

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setShowRequestModal(false)}>Cancel</Button>
                                <Button type="submit" isLoading={submitting}>Submit Request</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function QuotaCard({ title, used, limit, color }: any) {
    const percentage = Math.min((used / limit) * 100, 100);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-gray-400 font-medium">{title}</h3>
                <span className="text-white font-bold text-lg">{used}/{limit}</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

function Table({ data, type, onApprove }: any) {
    if (data.length === 0) return <div className="p-8 text-center text-gray-500">No records found.</div>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 font-medium">
                    <tr>
                        {type === 'approval' && <th className="px-6 py-4">Employee</th>}
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Dates</th>
                        <th className="px-6 py-4">Days</th>
                        <th className="px-6 py-4">Status</th>
                        {type === 'approval' && <th className="px-6 py-4 text-right">Actions</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.map((item: any) => (
                        <tr key={item.id} className="text-white hover:bg-white/5 transition-colors">
                            {type === 'approval' && (
                                <td className="px-6 py-4 font-medium">
                                    {item.employee?.user?.first_name} {item.employee?.user?.last_name}
                                </td>
                            )}
                            <td className="px-6 py-4">{item.leave_type}</td>
                            <td className="px-6 py-4 text-gray-400">
                                {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">{item.total_days}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                        item.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {item.status}
                                </span>
                            </td>
                            {type === 'approval' && (
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => onApprove(item.id, 'Approved')}
                                        className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                        title="Approve"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => onApprove(item.id, 'Rejected')}
                                        className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                        title="Reject"
                                    >
                                        <X size={16} />
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
