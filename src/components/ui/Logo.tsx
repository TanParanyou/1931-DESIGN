import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, light = false }) => {
    return (
        <div className={cn("flex flex-col items-start leading-none select-none", className)}>
            <span className={cn("font-bold tracking-tighter text-2xl", light ? "text-white" : "text-black dark:text-white")}>
                1938
            </span>
            <span className={cn("text-[10px] tracking-[0.2em] font-medium mt-1", light ? "text-white/80" : "text-black/80 dark:text-white/80")}>
                CO., LTD.
            </span>
        </div>
    );
};
