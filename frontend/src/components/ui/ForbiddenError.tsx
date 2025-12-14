'use client';

import React from 'react';
import { ShieldX, LogOut, Home, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ForbiddenErrorProps {
    title?: string;
    message?: string;
    onLogout?: () => void;
    onGoHome?: () => void;
    onRetry?: () => void;
    className?: string;
}

export default function ForbiddenError({
    title = 'ไม่มีสิทธิ์เข้าถึง',
    message = 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์การเข้าถึง',
    onLogout,
    onGoHome,
    onRetry,
    className = '',
}: ForbiddenErrorProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
        >
            {/* Icon with animation */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="relative"
            >
                <div className="h-24 w-24 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mb-6 border border-orange-500/30">
                    <ShieldX size={48} className="text-orange-500" />
                </div>
                {/* Pulse ring effect */}
                <div className="absolute inset-0 h-24 w-24 bg-orange-500/10 rounded-full animate-ping" />
            </motion.div>

            {/* Title */}
            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white mb-3"
            >
                {title}
            </motion.h2>

            {/* Message */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400 max-w-md mb-8 leading-relaxed"
            >
                {message}
            </motion.p>

            {/* Error code badge */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-mono mb-8"
            >
                Error 403 - Forbidden
            </motion.div>

            {/* Action buttons */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-3 justify-center"
            >
                {onRetry && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onRetry}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <RefreshCw size={18} />
                        <span>ลองใหม่</span>
                    </motion.button>
                )}

                {onGoHome && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onGoHome}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/10"
                    >
                        <Home size={18} />
                        <span>กลับหน้าหลัก</span>
                    </motion.button>
                )}

                {onLogout && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onLogout}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-medium transition-colors border border-red-500/20"
                    >
                        <LogOut size={18} />
                        <span>ออกจากระบบ</span>
                    </motion.button>
                )}
            </motion.div>
        </motion.div>
    );
}
