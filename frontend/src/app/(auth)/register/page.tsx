'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        line_id: '',
        info: '',
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/register', formData);
            if (response.data.success) {
                const loginResponse = await api.post('/auth/login', {
                    username: formData.username,
                    password: formData.password
                });

                if (loginResponse.data.success) {
                    login(loginResponse.data.data.token, loginResponse.data.data.refresh_token, loginResponse.data.data.user);
                }
            } else {
                setError(response.data.message || 'Registration failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0a0a0a] relative py-12">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/40 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-900/40 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-lg p-4"
            >
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />

                    <div className="mb-8 text-center">
                        <motion.h2
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
                        >
                            Create Account
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-sm mt-2"
                        >
                            Join us and start your journey
                        </motion.p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <Input
                                id="username"
                                type="text"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                icon={User}
                                required
                            />

                            <Input
                                id="email"
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                icon={Mail}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    id="first_name"
                                    type="text"
                                    placeholder="First Name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                                <Input
                                    id="last_name"
                                    type="text"
                                    placeholder="Last Name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                <Input
                                    id="line_id"
                                    type="text"
                                    placeholder="Line ID"
                                    value={formData.line_id}
                                    onChange={handleChange}
                                />
                            </div>

                            <Input
                                id="address"
                                type="text"
                                placeholder="Address"
                                value={formData.address}
                                onChange={handleChange}
                            />

                            <Input
                                id="info"
                                type="text"
                                placeholder="Additional Info"
                                value={formData.info}
                                onChange={handleChange}
                            />

                            <Input
                                id="password"
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                icon={Lock}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            isLoading={loading}
                            fullWidth
                            rightIcon={<ArrowRight size={18} />}
                        >
                            {loading ? 'Creating Account...' : 'Register'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors hover:underline decoration-purple-400/30 underline-offset-4">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
