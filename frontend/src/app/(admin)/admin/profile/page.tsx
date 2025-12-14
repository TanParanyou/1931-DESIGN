'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PinInput } from '@/components/ui/PinInput';
import { PasswordStrength, usePasswordStrength } from '@/components/ui/PasswordStrength';
import {
    User,
    Save,
    Phone,
    MapPin,
    MessageCircle,
    Info,
    Key,
    KeyRound,
    Shield,
    ShieldOff,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ApiError {
    response?: {
        data?: {
            message?: string;
            error?: {
                message?: string;
                messages?: string[];
            };
        };
    };
}

export default function ProfilePage() {
    const { user, login } = useAuth();
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
        confirm_password: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // PIN State
    const [pinEnabled, setPinEnabled] = useState(false);
    const [showPinSetup, setShowPinSetup] = useState(false);
    const [pinData, setPinData] = useState({
        pin: '',
        password: '',
    });
    const [pinLoading, setPinLoading] = useState(false);

    const passwordStrength = usePasswordStrength(passwordData.new_password);

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
        fetchPinStatus();
        setInitialLoading(false);
    }, [user]);

    const fetchPinStatus = async () => {
        try {
            const response = await api.get('/auth/pin-status');
            if (response.data.success) {
                setPinEnabled(response.data.data.pin_enabled);
            }
        } catch {
            // Ignore error
        }
    };

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
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const refreshToken =
                    localStorage.getItem('refresh_token') ||
                    sessionStorage.getItem('refresh_token');
                if (token && refreshToken) {
                    login(
                        token,
                        refreshToken,
                        response.data.data.user,
                        !!localStorage.getItem('token')
                    );
                }
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Update failed' });
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'An error occurred',
            });
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

        if (!passwordStrength.isValid) {
            setMessage({ type: 'error', text: 'Password does not meet strength requirements' });
            return;
        }

        setPasswordLoading(true);
        try {
            const response = await api.put('/auth/change-password', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password,
            });
            if (response.data.success) {
                setMessage({ type: 'success', text: 'Password changed successfully' });
                setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
            } else {
                setMessage({
                    type: 'error',
                    text: response.data.message || 'Change password failed',
                });
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            const messages = error.response?.data?.error?.messages;
            if (messages && Array.isArray(messages)) {
                setMessage({ type: 'error', text: messages.join('\n') });
            } else {
                setMessage({
                    type: 'error',
                    text: error.response?.data?.error?.message || 'An error occurred',
                });
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleSetPin = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (pinData.pin.length !== 6) {
            setMessage({ type: 'error', text: 'PIN must be 6 digits' });
            return;
        }

        setPinLoading(true);
        try {
            const response = await api.put('/auth/pin', {
                pin: pinData.pin,
                password: pinData.password,
            });
            if (response.data.success) {
                setMessage({ type: 'success', text: 'PIN set successfully' });
                setPinEnabled(true);
                setShowPinSetup(false);
                setPinData({ pin: '', password: '' });
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Failed to set PIN' });
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            setMessage({
                type: 'error',
                text: error.response?.data?.error?.message || 'An error occurred',
            });
        } finally {
            setPinLoading(false);
        }
    };

    const handleDisablePin = async () => {
        setPinLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await api.delete('/auth/pin');
            if (response.data.success) {
                setMessage({ type: 'success', text: 'PIN disabled successfully' });
                setPinEnabled(false);
            } else {
                setMessage({
                    type: 'error',
                    text: response.data.message || 'Failed to disable PIN',
                });
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            setMessage({
                type: 'error',
                text: error.response?.data?.error?.message || 'An error occurred',
            });
        } finally {
            setPinLoading(false);
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
                        <div
                            className={`mb-6 p-4 rounded-lg text-sm whitespace-pre-line ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                        >
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
                            <label className="text-sm text-gray-400 ml-1">
                                Additional Information
                            </label>
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

                {/* Change Password Section */}
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
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        old_password: e.target.value,
                                    })
                                }
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
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            new_password: e.target.value,
                                        })
                                    }
                                    icon={Key}
                                    placeholder="New Password"
                                    required
                                />
                                {passwordData.new_password && (
                                    <PasswordStrength password={passwordData.new_password} />
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 ml-1">
                                    Confirm New Password
                                </label>
                                <Input
                                    type="password"
                                    value={passwordData.confirm_password}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            confirm_password: e.target.value,
                                        })
                                    }
                                    icon={Key}
                                    placeholder="Confirm New Password"
                                    required
                                />
                                {passwordData.confirm_password &&
                                    passwordData.new_password !== passwordData.confirm_password && (
                                        <p className="text-red-400 text-xs mt-1">
                                            Passwords do not match
                                        </p>
                                    )}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button
                                type="submit"
                                isLoading={passwordLoading}
                                icon={<Save size={18} />}
                                variant="outline"
                                className="w-full md:w-auto"
                                disabled={
                                    !passwordStrength.isValid ||
                                    passwordData.new_password !== passwordData.confirm_password
                                }
                            >
                                Update Password
                            </Button>
                        </div>
                    </form>
                </div>

                {/* PIN Settings Section */}
                <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <KeyRound className="text-blue-400" size={24} />
                        PIN Login
                    </h2>

                    <div className="space-y-6">
                        {/* PIN Status */}
                        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 gap-4">
                            <div className="flex items-center gap-3">
                                {pinEnabled ? (
                                    <Shield className="text-green-400" size={24} />
                                ) : (
                                    <ShieldOff className="text-gray-500" size={24} />
                                )}
                                <div>
                                    <p className="text-white font-medium">
                                        PIN Login is {pinEnabled ? 'Enabled' : 'Disabled'}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        {pinEnabled
                                            ? 'You can use your 6-digit PIN to login quickly'
                                            : 'Set up a 6-digit PIN for quick and secure login'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-2">
                                {pinEnabled ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowPinSetup(true)}
                                        >
                                            Change PIN
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={handleDisablePin}
                                            isLoading={pinLoading}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Disable
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="primary" onClick={() => setShowPinSetup(true)}>
                                        Set Up PIN
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* PIN Setup Form */}
                        {showPinSetup && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-6 bg-white/5 rounded-lg border border-white/10"
                            >
                                <form onSubmit={handleSetPin} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400 block text-center">
                                            Enter your 6-digit PIN
                                        </label>
                                        <PinInput
                                            value={pinData.pin}
                                            onChange={(pin) => setPinData({ ...pinData, pin })}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400 ml-1">
                                            Confirm with your password
                                        </label>
                                        <Input
                                            type="password"
                                            value={pinData.password}
                                            onChange={(e) =>
                                                setPinData({ ...pinData, password: e.target.value })
                                            }
                                            icon={Key}
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-3 justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => {
                                                setShowPinSetup(false);
                                                setPinData({ pin: '', password: '' });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            isLoading={pinLoading}
                                            disabled={pinData.pin.length !== 6 || !pinData.password}
                                        >
                                            Save PIN
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        <p className="text-gray-500 text-xs">
                            * PIN is a quick way to login. Your password is still required for
                            security-sensitive actions.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
