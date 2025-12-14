'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, KeyRound, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PinInput } from '@/components/ui/PinInput';
import { Loading } from '@/components/ui/Loading';

type LoginMode = 'password' | 'pin';

const SAVED_USERNAME_KEY = 'saved_login_username';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loginMode, setLoginMode] = useState<LoginMode>('password');
    const [savedUsername, setSavedUsername] = useState<string | null>(null);
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    // โหลด saved username เมื่อ mount และตั้งค่า loginMode เป็น 'pin' ถ้ามี saved username
    useEffect(() => {
        const saved = localStorage.getItem(SAVED_USERNAME_KEY);
        if (saved) {
            setSavedUsername(saved);
            setUsername(saved);
            setLoginMode('pin'); // default เป็น PIN mode เมื่อมี saved username
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = loginMode === 'pin' ? '/auth/login-pin' : '/auth/login';
            const payload = loginMode === 'pin' ? { username, pin } : { username, password };

            const response = await api.post(endpoint, payload);
            if (response.data.success) {
                // บันทึก username เมื่อ login สำเร็จ
                localStorage.setItem(SAVED_USERNAME_KEY, username);
                setSavedUsername(username);

                login(
                    response.data.data.token,
                    response.data.data.refresh_token,
                    response.data.data.user,
                    rememberMe
                );
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: { message?: string } } } };
            setError(error.response?.data?.error?.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (mode: LoginMode) => {
        setLoginMode(mode);
        setError('');
        setPassword('');
        setPin('');
    };

    const clearSavedUsername = () => {
        localStorage.removeItem(SAVED_USERNAME_KEY);
        setSavedUsername(null);
        setUsername('');
        setLoginMode('password');
    };

    // แสดง PIN tab เฉพาะเมื่อมี saved username (เคย login บน device นี้แล้ว)
    const showPinOption = !!savedUsername;

    const canSubmit = loginMode === 'pin' ? username && pin.length === 6 : username && password;

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
                            {savedUsername ? `Welcome Back` : 'Sign In'}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-sm mt-2"
                        >
                            {loginMode === 'password'
                                ? savedUsername
                                    ? `Sign in as ${savedUsername}`
                                    : 'Sign in to access your dashboard'
                                : `Enter your PIN, ${savedUsername}`}
                        </motion.p>
                    </div>

                    {/* Login Mode Toggle - เฉพาะเมื่อมี saved username */}
                    {showPinOption && (
                        <div className="flex mb-6 bg-white/5 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => switchMode('password')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                                    loginMode === 'password'
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <Lock className="w-4 h-4 inline-block mr-2" />
                                Password
                            </button>
                            <button
                                type="button"
                                onClick={() => switchMode('pin')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                                    loginMode === 'pin'
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <KeyRound className="w-4 h-4 inline-block mr-2" />
                                PIN
                            </button>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {/* Username Field - แสดงแบบ readonly ถ้าเป็น PIN mode และมี saved username */}
                            {loginMode === 'pin' && savedUsername ? (
                                <div className="relative">
                                    <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                                        <User className="w-5 h-5 text-gray-400" />
                                        <span className="text-white flex-1">{savedUsername}</span>
                                        <button
                                            type="button"
                                            onClick={clearSavedUsername}
                                            className="text-gray-400 hover:text-white transition-colors"
                                            title="Use different account"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    icon={User}
                                    required
                                />
                            )}

                            <AnimatePresence mode="wait">
                                {loginMode === 'password' ? (
                                    <motion.div
                                        key="password"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            icon={Lock}
                                            required
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="pin"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="pt-2"
                                    >
                                        <label className="block text-sm text-gray-400 mb-3 text-center">
                                            Enter your 6-digit PIN
                                        </label>
                                        <PinInput
                                            value={pin}
                                            onChange={setPin}
                                            disabled={loading}
                                            error={!!error}
                                            autoFocus
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Forgot Password Link */}
                        {loginMode === 'password' && (
                            <div className="text-right">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        )}

                        <Button type="submit" disabled={loading || !canSubmit} fullWidth>
                            {loading ? <Loading variant="spinner" size="sm" /> : 'Sign In'}
                        </Button>
                    </form>

                    {/* Switch account link */}
                    {savedUsername && loginMode === 'password' && (
                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={clearSavedUsername}
                                className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                            >
                                Not {savedUsername}? Use different account
                            </button>
                        </div>
                    )}

                    {loginMode === 'pin' && (
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                PIN login must be enabled in your profile settings
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
