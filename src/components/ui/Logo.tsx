import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoProps {
    className?: string;
    light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, light = false }) => {
    return (
        <div className={cn('flex flex-col items-start leading-none select-none', className)}>
            <span
                className={cn(
                    'font-bold tracking-tighter text-2xl',
                    light ? 'text-white' : 'text-black dark:text-white'
                )}
            >
                1931
            </span>
            <span
                className={cn(
                    'text-[10px] tracking-[0.2em] font-medium mt-1',
                    light ? 'text-white/80' : 'text-black/80 dark:text-white/80'
                )}
            >
                CO., LTD.
            </span>
            {/* <Image src="/logo.png" alt="Logo" width={48} height={48} className={cn("w-15 h-11", light ? "text-white" : "text-black dark:text-white")} /> */}
        </div>
    );
};
