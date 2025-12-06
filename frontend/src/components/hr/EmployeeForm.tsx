'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { User, Save, Briefcase, Building, Calendar, DollarSign, FileText, Activity } from 'lucide-react';
import Link from 'next/link';

interface EmployeeFormData {
    user_id: number;
    position: string;
    department: string;
    start_date: string;
    status: string;
    salary: number;
    documents: string;
}

interface EmployeeFormProps {
    initialData?: EmployeeFormData;
    isEdit?: boolean;
    employeeId?: string | number;
}

export default function EmployeeForm({ initialData, isEdit = false, employeeId }: EmployeeFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState<EmployeeFormData>(initialData || {
        user_id: 0,
        position: '',
        department: '',
        start_date: '',
        status: 'Probation',
        salary: 0,
        documents: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: id === 'user_id' || id === 'salary' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            let response;
            if (isEdit && employeeId) {
                response = await api.put(`/hr/employees/${employeeId}`, formData);
            } else {
                response = await api.post('/hr/employees', formData);
            }

            if (response.status === 201 || response.status === 200) {
                setMessage({ type: 'success', text: isEdit ? 'Employee updated successfully' : 'Employee created successfully' });
                setTimeout(() => router.push('/admin/employees'), 1500);
            } else {
                setMessage({ type: 'error', text: 'Operation failed' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
            {message.text && (
                <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Briefcase size={20} className="text-indigo-400" />
                    Employee Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!isEdit && (
                        <Input
                            id="user_id"
                            type="number"
                            label="User ID *"
                            value={formData.user_id}
                            onChange={handleChange}
                            icon={User}
                            placeholder="Enter User ID"
                            required
                        />
                    )}

                    <Input
                        id="position"
                        label="Position *"
                        value={formData.position}
                        onChange={handleChange}
                        icon={Briefcase}
                        placeholder="Software Engineer"
                        required
                    />

                    <Input
                        id="department"
                        label="Department *"
                        value={formData.department}
                        onChange={handleChange}
                        icon={Building}
                        placeholder="Engineering"
                        required
                    />

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Calendar size={16} /> Start Date *
                        </label>
                        <input
                            type="date"
                            id="start_date"
                            value={formData.start_date ? formData.start_date.split('T')[0] : ''}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors w-full"
                            required
                        />
                    </div>

                    <Select
                        id="status"
                        label="Status"
                        value={formData.status}
                        onChange={handleChange}
                        icon={Activity}
                        options={[
                            { value: 'Probation', label: 'Probation' },
                            { value: 'Active', label: 'Active' },
                            { value: 'Resigned', label: 'Resigned' }
                        ]}
                    />

                    <Input
                        id="salary"
                        type="number"
                        label="Salary"
                        value={formData.salary}
                        onChange={handleChange}
                        icon={DollarSign}
                        placeholder="0.00"
                    />
                </div>

                <Input
                    id="documents"
                    label="Documents (Links)"
                    value={formData.documents}
                    onChange={handleChange}
                    icon={FileText}
                    placeholder="URL to Cloud Storage (Google Drive, etc.)"
                />

                <div className="h-px bg-white/10 my-6" />

                <div className="flex justify-end gap-4">
                    <Link href="/admin/employees">
                        <Button type="button" variant="ghost">Cancel</Button>
                    </Link>
                    <Button
                        type="submit"
                        isLoading={loading}
                        icon={<Save size={18} />}
                    >
                        {isEdit ? 'Save Changes' : 'Create Employee'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
