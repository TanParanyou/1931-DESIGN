'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loading, PageLoading } from '@/components/ui/Loading';
import { PasswordStrength, usePasswordStrength } from '@/components/ui/PasswordStrength';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const passwordStrength = usePasswordStrength(newPassword);

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setVerifying(false);
                return;
            }

            try {
                const response = await api.get(`/auth/verify-reset-token/${token}`);
                if (response.data.success && response.data.data?.valid) {
                    setTokenValid(true);
                }
            } catch {
                setTokenValid(false);
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate password match
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password strength
        if (!passwordStrength.isValid) {
            setError('Password does not meet requirements');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/reset-password', {
                token,
                new_password: newPassword,
            });

            if (response.data.success) {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError(response.data.message || 'Failed to reset password');
            }
        } catch (err: unknown) {
            const error = err as {
                response?: { data?: { error?: { message?: string; messages?: string[] } } };
            };
            const messages = error.response?.data?.error?.messages;
            if (messages && Array.isArray(messages)) {
                setError(messages.join('\n'));
            } else {
                setError(error.response?.data?.error?.message || 'Failed to reset password');
            }
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return <PageLoading text="Verifying reset link..." />;
    }

    if (!token || !tokenValid) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0a0a0a] relative">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-900/40 rounded-full blur-[120px] mix-blend-screen" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-md p-8"
                >
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                            <XCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Invalid or Expired Link
                        </h2>
                        <p className="text-gray-400 text-sm mb-6">
                            This password reset link is invalid or has expired. Please request a new
                            one.
                        </p>
                        <Link href="/forgot-password">
                            <Button fullWidth>Request New Link</Button>
                        </Link>
                        <Link
                            href="/login"
                            className="block mt-4 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 inline-block mr-1" />
                            Back to Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0a0a0a] relative">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-green-900/40 rounded-full blur-[120px] mix-blend-screen" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-md p-8"
                >
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Password Reset Successful!
                        </h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Your password has been changed. Redirecting to login...
                        </p>
                        <Loading variant="dots" size="sm" />
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0a0a0a] relative">
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
                            Reset Password
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-sm mt-2"
                        >
                            Enter your new password below
                        </motion.p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm whitespace-pre-line"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                id="new-password"
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                icon={Lock}
                                required
                            />

                            {newPassword && <PasswordStrength password={newPassword} />}

                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                icon={Lock}
                                required
                            />

                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-red-400 text-xs">Passwords do not match</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={
                                loading ||
                                !passwordStrength.isValid ||
                                newPassword !== confirmPassword
                            }
                            fullWidth
                        >
                            {loading ? <Loading variant="spinner" size="sm" /> : 'Reset Password'}
                        </Button>

                        <Link
                            href="/login"
                            className="block text-center text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 inline-block mr-1" />
                            Back to Login
                        </Link>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<PageLoading text="Loading..." />}>
            <ResetPasswordContent />
        </Suspense>
    );
}
