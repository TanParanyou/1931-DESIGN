import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface NetworkErrorProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
    children?: React.ReactNode;
}

export default function NetworkError({
    title = 'Connection Error',
    message = 'Unable to connect to the server. Please check your internet connection or try again later.',
    onRetry,
    className = '',
    children,
}: NetworkErrorProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center p-8 text-center bg-red-500/5 rounded-xl border border-red-500/20 ${className}`}
        >
            <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
                <WifiOff size={32} />
            </div>
            <h3 className="text-xl font-bold text-red-500 mb-2">{title}</h3>
            <p className="text-gray-400 max-w-md mb-6">{message}</p>
            {onRetry && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRetry}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-500/20"
                >
                    <RefreshCw size={18} />
                    <span>Try Again</span>
                </motion.button>
            )}
            {children && <div className="mt-4">{children}</div>}
        </div>
    );
}
