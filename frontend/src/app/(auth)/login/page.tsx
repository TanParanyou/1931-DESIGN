'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { username, password });
            if (response.data.success) {
                login(response.data.data.token, response.data.data.refresh_token, response.data.data.user, rememberMe);
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0a0a0a] relative">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/40 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-900/40 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md p-8"
            >
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500" />

                    <div className="mb-8 text-center">
                        <motion.h2
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400"
                        >
                            Welcome Back
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-sm mt-2"
                        >
                            Sign in to access your dashboard
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                id="username"
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                icon={User}
                                required
                            />
                            <Input
                                id="password"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={Lock}
                                required
                            />
                        </div>

                        {/* <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => setRememberMe(!rememberMe)}
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${rememberMe
                                    ? 'bg-linear-to-br from-blue-500 to-purple-600 border-transparent shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                    : 'bg-white/5 border-white/20 hover:border-white/40'
                                    }`}
                            >
                                {rememberMe && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="w-3 h-3 text-white"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                            <span
                                className="text-sm text-gray-400 cursor-pointer select-none hover:text-gray-300 transition-colors"
                                onClick={() => setRememberMe(!rememberMe)}
                            >
                                Feature จำรหัสผ่าน
                            </span>
                        </div> */}

                        <Button
                            type="submit"
                            disabled={loading}
                            fullWidth
                        // rightIcon={<ArrowRight size={18} />}
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline decoration-blue-400/30 underline-offset-4">
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
