'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Save, Phone, MapPin, MessageCircle, Info, Key } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const { user, login } = useAuth(); // Re-use login to update local user state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        line_id: '',
        info: '',
    });

    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                address: user.address || '',
                line_id: user.line_id || '',
                info: user.info || '',
            });
        }
        setInitialLoading(false);
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.put('/auth/profile', formData);
            if (response.data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully' });
                // Update local context
                // We need token to re-login to update context, or just direct update if exposed
                // Since login() takes tokens, we grab them from storage or just pretend with current ones?
                // Actually, best way is to fetch profile again or just manually construct user object.
                // AuthContext's login updates everything.
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
                if (token && refreshToken) {
                    login(token, refreshToken, response.data.data.user, !!localStorage.getItem('token'));
                }
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Update failed' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passwordData.new_password.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
            return;
        }

        setPasswordLoading(true);
        try {
            const response = await api.put('/auth/change-password', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password
            });
            if (response.data.success) {
                setMessage({ type: 'success', text: 'Password changed successfully' });
                setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Change password failed' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'An error occurred' });
        } finally {
            setPasswordLoading(false);
        }
    };

    if (initialLoading) return <div className="p-8 text-white">Loading profile...</div>;

    return (
        <div className="p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                        My Profile
                    </h1>
                    <p className="text-gray-400 mt-2">Manage your account information</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 ml-1">First Name</label>
                                <Input
                                    id="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    icon={User}
                                    placeholder="First Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 ml-1">Last Name</label>
                                <Input
                                    id="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    icon={User}
                                    placeholder="Last Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 ml-1">Phone Number</label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    icon={Phone}
                                    placeholder="Phone Number"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 ml-1">Line ID</label>
                                <Input
                                    id="line_id"
                                    value={formData.line_id}
                                    onChange={handleChange}
                                    icon={MessageCircle}
                                    placeholder="Line ID"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 ml-1">Address</label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={handleChange}
                                icon={MapPin}
                                placeholder="Full Address"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 ml-1">Additional Information</label>
                            <Input
                                id="info"
                                value={formData.info}
                                onChange={handleChange}
                                icon={Info}
                                placeholder="Any additional information"
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button
                                type="submit"
                                isLoading={loading}
                                icon={<Save size={18} />}
                                className="w-full md:w-auto"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Key className="text-purple-400" size={24} />
                        Change Password
                    </h2>

                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 ml-1">Current Password</label>
                            <Input
                                type="password"
                                value={passwordData.old_password}
                                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                icon={Key}
                                placeholder="Current Password"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 ml-1">New Password</label>
                                <Input
                                    type="password"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    icon={Key}
                                    placeholder="New Password (min 6 chars)"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 ml-1">Confirm New Password</label>
                                <Input
                                    type="password"
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                    icon={Key}
                                    placeholder="Confirm New Password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button
                                type="submit"
                                isLoading={passwordLoading}
                                icon={<Save size={18} />}
                                variant="outline"
                                className="w-full md:w-auto"
                            >
                                Update Password
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
