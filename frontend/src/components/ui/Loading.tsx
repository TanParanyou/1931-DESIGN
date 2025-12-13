'use client';

import React from 'react';
import { motion } from 'framer-motion';

// === Types ===
type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'bars' | 'gradient' | 'orbit';
type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingProps {
    variant?: LoadingVariant;
    size?: LoadingSize;
    text?: string;
    className?: string;
    fullScreen?: boolean;
}

// === Size configurations ===
const sizeConfig = {
    sm: { spinner: 24, dot: 6, bar: 16, orbit: 32 },
    md: { spinner: 40, dot: 10, bar: 24, orbit: 48 },
    lg: { spinner: 56, dot: 14, bar: 32, orbit: 64 },
    xl: { spinner: 80, dot: 18, bar: 48, orbit: 96 },
};

const textSizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
};

// === Spinner Variant ===
const SpinnerLoading: React.FC<{ size: LoadingSize }> = ({ size }) => {
    const dimension = sizeConfig[size].spinner;

    return (
        <div className="relative" style={{ width: dimension, height: dimension }}>
            {/* Outer glow ring */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background:
                        'conic-gradient(from 0deg, transparent, #0AF231, #ec4899, transparent)',
                    filter: 'blur(4px)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            {/* Main spinner */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background:
                        'conic-gradient(from 0deg, transparent 0%, #0AF231 25%, #ec4899 50%, #0AF231 75%, transparent 100%)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            {/* Inner circle */}
            <div
                className="absolute rounded-full bg-black/90 backdrop-blur-sm"
                style={{
                    inset: dimension * 0.15,
                }}
            />
        </div>
    );
};

// === Dots Variant ===
const DotsLoading: React.FC<{ size: LoadingSize }> = ({ size }) => {
    const dotSize = sizeConfig[size].dot;
    const colors = ['#0AF231', '#22d3ee', '#ec4899'];

    return (
        <div className="flex items-center gap-2">
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    className="rounded-full shadow-lg"
                    style={{
                        width: dotSize,
                        height: dotSize,
                        backgroundColor: colors[index],
                        boxShadow: `0 0 20px ${colors[index]}50`,
                    }}
                    animate={{
                        y: [-8, 8, -8],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: index * 0.15,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
};

// === Pulse Variant ===
const PulseLoading: React.FC<{ size: LoadingSize }> = ({ size }) => {
    const dimension = sizeConfig[size].spinner;

    return (
        <div className="relative" style={{ width: dimension, height: dimension }}>
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    className="absolute inset-0 rounded-full border-2"
                    style={{
                        borderColor: index === 0 ? '#0AF231' : index === 1 ? '#22d3ee' : '#ec4899',
                    }}
                    animate={{
                        scale: [1, 2],
                        opacity: [0.8, 0],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: index * 0.4,
                        ease: 'easeOut',
                    }}
                />
            ))}
            {/* Center dot */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: dimension * 0.3,
                    height: dimension * 0.3,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'linear-gradient(135deg, #0AF231, #ec4899)',
                    boxShadow: '0 0 30px #0AF23150',
                }}
                animate={{
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
        </div>
    );
};

// === Bars Variant ===
const BarsLoading: React.FC<{ size: LoadingSize }> = ({ size }) => {
    const barHeight = sizeConfig[size].bar;
    const barWidth = barHeight * 0.25;

    return (
        <div className="flex items-end gap-1" style={{ height: barHeight }}>
            {[0, 1, 2, 3, 4].map((index) => (
                <motion.div
                    key={index}
                    className="rounded-full"
                    style={{
                        width: barWidth,
                        background: `linear-gradient(to top, #0AF231, #22d3ee, #ec4899)`,
                        boxShadow: '0 0 10px #0AF23130',
                    }}
                    animate={{
                        height: [barHeight * 0.3, barHeight, barHeight * 0.3],
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: index * 0.1,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
};

// === Gradient Variant ===
const GradientLoading: React.FC<{ size: LoadingSize }> = ({ size }) => {
    const dimension = sizeConfig[size].spinner;

    return (
        <div className="relative" style={{ width: dimension, height: dimension }}>
            <motion.div
                className="absolute inset-0 rounded-full p-[3px]"
                style={{
                    background: 'linear-gradient(135deg, #0AF231, #22d3ee, #ec4899, #0AF231)',
                    backgroundSize: '400% 400%',
                }}
                animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    rotate: 360,
                }}
                transition={{
                    backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
                    rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                }}
            >
                <div className="w-full h-full rounded-full bg-black/90 backdrop-blur-sm" />
            </motion.div>
        </div>
    );
};

// === Orbit Variant ===
const OrbitLoading: React.FC<{ size: LoadingSize }> = ({ size }) => {
    const dimension = sizeConfig[size].orbit;

    return (
        <div className="relative" style={{ width: dimension, height: dimension }}>
            {/* Center */}
            <div
                className="absolute rounded-full"
                style={{
                    width: dimension * 0.2,
                    height: dimension * 0.2,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'linear-gradient(135deg, #0AF231, #ec4899)',
                    boxShadow: '0 0 20px #0AF23150',
                }}
            />

            {/* Orbiting elements */}
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    className="absolute"
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 2 + index * 0.5,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                >
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: dimension * (0.15 - index * 0.03),
                            height: dimension * (0.15 - index * 0.03),
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor:
                                index === 0 ? '#0AF231' : index === 1 ? '#22d3ee' : '#ec4899',
                            boxShadow: `0 0 15px ${index === 0 ? '#0AF231' : index === 1 ? '#22d3ee' : '#ec4899'}80`,
                        }}
                    />
                </motion.div>
            ))}

            {/* Orbit rings */}
            <div className="absolute inset-0 rounded-full border border-white/10" />
        </div>
    );
};

// === Main Loading Component ===
const Loading: React.FC<LoadingProps> = ({
    variant = 'spinner',
    size = 'md',
    text,
    className = '',
    fullScreen = false,
}) => {
    const renderLoader = () => {
        switch (variant) {
            case 'dots':
                return <DotsLoading size={size} />;
            case 'pulse':
                return <PulseLoading size={size} />;
            case 'bars':
                return <BarsLoading size={size} />;
            case 'gradient':
                return <GradientLoading size={size} />;
            case 'orbit':
                return <OrbitLoading size={size} />;
            case 'spinner':
            default:
                return <SpinnerLoading size={size} />;
        }
    };

    const content = (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            {renderLoader()}
            {text && (
                <motion.p
                    className={`text-white/70 font-medium ${textSizeClass[size]}`}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {text}
                </motion.p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-2xl p-8"
                >
                    {content}
                </motion.div>
            </div>
        );
    }

    return content;
};

// === Page Loading Component ===
const PageLoading: React.FC<{ text?: string }> = ({ text = 'กำลังโหลด...' }) => (
    <div className="flex items-center justify-center min-h-[400px]">
        <Loading variant="orbit" size="lg" text={text} />
    </div>
);

// === Skeleton Loading ===
interface SkeletonProps {
    className?: string;
    rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', rounded = 'md' }) => {
    const roundedClass = {
        sm: 'rounded',
        md: 'rounded-lg',
        lg: 'rounded-xl',
        full: 'rounded-full',
    };

    return (
        <motion.div
            className={`bg-white/5 ${roundedClass[rounded]} ${className}`}
            animate={{
                background: [
                    'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
                    'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)',
                ],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        />
    );
};

// === Table Skeleton ===
interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 4 }) => (
    <div className="glass rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex gap-4 p-4 border-b border-white/10 bg-white/5">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
            ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 p-4 border-b border-white/5">
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <Skeleton key={colIndex} className="h-4 flex-1" />
                ))}
            </div>
        ))}
    </div>
);

// === Card Skeleton ===
const CardSkeleton: React.FC = () => (
    <div className="glass rounded-xl p-6 space-y-4">
        <Skeleton className="h-40 w-full" rounded="lg" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20" rounded="full" />
            <Skeleton className="h-8 w-20" rounded="full" />
        </div>
    </div>
);

export { Loading, PageLoading, Skeleton, TableSkeleton, CardSkeleton };
export type { LoadingProps, LoadingVariant, LoadingSize };
