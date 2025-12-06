'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { User, Save, Phone, MapPin, MessageCircle, Info, Shield, Key, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface UserFormData {
    username?: string;
    email?: string;
    password?: string;
    first_name: string;
    last_name: string;
    role: string;
    active: boolean;
    phone: string;
    address: string;
    line_id: string;
    info: string;
}

interface UserFormProps {
    initialData?: UserFormData;
    isEdit?: boolean;
    userId?: string | number;
}

export default function UserForm({ initialData, isEdit = false, userId }: UserFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Reset Password Modal State (Only for Edit mode)
    const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    const [formData, setFormData] = useState<UserFormData>(initialData || {
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'user',
        active: true,
        phone: '',
        address: '',
        line_id: '',
        info: '',
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        // Handle checkbox
        if (e.target.type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [e.target.id]: checked }));
            return;
        }

        // Handle other inputs
        // For standard inputs, we use id or name. 
        // The Input component might pass event with id or name.
        const { id, name, value } = e.target;
        const key = id || name;

        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            let response;
            if (isEdit && userId) {
                response = await api.put(`/users/${userId}`, formData);
            } else {
                response = await api.post('/users', formData);
            }

            if (response.data.success) {
                setMessage({ type: 'success', text: isEdit ? 'User updated successfully' : 'User created successfully' });
                if (!isEdit) {
                    setTimeout(() => router.push('/admin/users'), 1500);
                } else {
                    // Optional: redirect back to list after short delay for edit as well
                    setTimeout(() => router.push('/admin/users'), 1500);
                }
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Operation failed' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setResetLoading(true);
        try {
            const response = await api.put(`/users/${userId}/reset-password`, {
                new_password: newPassword
            });
            if (response.data.success) {
                setMessage({ type: 'success', text: 'Password reset successfully' });
                setResetPasswordOpen(false);
                setNewPassword('');
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Reset failed' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'An error occurred' });
        } finally {
            setResetLoading(false);
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
                {/* Account Info Section */}
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-indigo-400" />
                    Account Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!isEdit && (
                        <>
                            <Input
                                id="username"
                                label="Username *"
                                value={formData.username}
                                onChange={handleChange}
                                icon={User}
                                placeholder="johndoe"
                                required
                            />
                            <Input
                                id="email"
                                type="email"
                                label="Email *"
                                value={formData.email}
                                onChange={handleChange}
                                icon={Mail}
                                placeholder="john@example.com"
                                required
                            />
                            <Input
                                id="password"
                                type="password"
                                label="Password *"
                                value={formData.password}
                                onChange={handleChange}
                                icon={Lock}
                                placeholder="Min. 6 characters"
                                required
                                minLength={6}
                            />
                        </>
                    )}

                    <Select
                        id="role"
                        label="Role"
                        value={formData.role}
                        onChange={handleChange}
                        icon={Shield}
                        options={[
                            { value: 'User', label: 'User' },
                            { value: 'Super Admin', label: 'Super Admin' }
                        ]}
                    />

                    <div className="flex items-end pb-3">
                        <Checkbox
                            id="active"
                            label="Active Account"
                            checked={formData.active}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="h-px bg-white/10 my-6" />

                {/* Personal Info Section */}
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Info size={20} className="text-emerald-400" />
                    Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        id="first_name"
                        label="First Name"
                        value={formData.first_name}
                        onChange={handleChange}
                        icon={User}
                        placeholder="First Name"
                    />
                    <Input
                        id="last_name"
                        label="Last Name"
                        value={formData.last_name}
                        onChange={handleChange}
                        icon={User}
                        placeholder="Last Name"
                    />
                    <Input
                        id="phone"
                        label="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        icon={Phone}
                        placeholder="Phone Number"
                    />
                    <Input
                        id="line_id"
                        label="Line ID"
                        value={formData.line_id}
                        onChange={handleChange}
                        icon={MessageCircle}
                        placeholder="Line ID"
                    />
                </div>

                <Input
                    id="address"
                    label="Address"
                    value={formData.address}
                    onChange={handleChange}
                    icon={MapPin}
                    placeholder="Full Address"
                />

                <Input
                    id="info"
                    label="Additional Information"
                    value={formData.info}
                    onChange={handleChange}
                    icon={Info}
                    placeholder="Any additional information"
                />

                <div className="h-px bg-white/10 my-6" />


                <div className="pt-4 flex justify-between items-center">
                    {isEdit ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setResetPasswordOpen(true)}
                            icon={<Key size={18} />}
                            className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        >
                            Reset Password
                        </Button>
                    ) : (
                        <div /> /* Spacer */
                    )}

                    <div className="flex gap-4">
                        <Link href="/admin/users">
                            <Button type="button" variant="ghost">Cancel</Button>
                        </Link>
                        <Button
                            type="submit"
                            isLoading={loading}
                            icon={<Save size={18} />}
                        >
                            {isEdit ? 'Save Changes' : 'Create User'}
                        </Button>
                    </div>
                </div>
            </form>

            {/* Reset Password Modal */}
            {resetPasswordOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#111] border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Enter a new password for this user. This action cannot be undone.
                        </p>

                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <Input
                                id="new_password"
                                label="New Password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                icon={Key}
                                placeholder="Min. 6 characters"
                                required
                            />

                            <div className="flex justify-end gap-3 mt-6">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setResetPasswordOpen(false);
                                        setNewPassword('');
                                    }}
                                    disabled={resetLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={resetLoading}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Reset Password
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
