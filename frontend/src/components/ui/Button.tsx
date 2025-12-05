'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends HTMLMotionProps<'button'> {
    isLoading?: boolean;
    variant?: 'primary' | 'outline' | 'ghost';
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        children,
        className = '',
        isLoading = false,
        variant = 'primary',
        fullWidth = false,
        leftIcon,
        rightIcon,
        disabled,
        ...props
    }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20 border border-transparent",
            outline: "bg-transparent border border-white/20 text-white hover:bg-white/5",
            ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-white/5"
        };

        const sizes = "py-3 px-6 text-base"; // Keeping it simple for now, can add size prop later if needed

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
                whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
                className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                    </>
                ) : (
                    <>
                        {leftIcon && <span className="mr-2">{leftIcon}</span>}
                        {children}
                        {rightIcon && <span className="ml-2 group-hover:translate-x-1 transition-transform">{rightIcon}</span>}
                    </>
                )}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
