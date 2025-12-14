'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn } from '@/lib/utils';
import { ChevronDown, MoreVertical } from 'lucide-react';

interface DropdownProps {
    trigger?: React.ReactNode;
    children: React.ReactNode;
    align?: 'left' | 'right';
    className?: string;
}

import { createPortal } from 'react-dom';

interface DropdownProps {
    trigger?: React.ReactNode;
    children: React.ReactNode;
    align?: 'left' | 'right';
    className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside both trigger and dropdown
    useClickOutside([triggerRef, dropdownRef], () => setIsOpen(false));

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const updatePosition = () => {
                const rect = triggerRef.current!.getBoundingClientRect();
                const dropdownWidth = 192; // w-48 = 12rem = 192px
                const padding = 8; // ระยะห่างจากขอบจอ
                const viewportWidth = window.innerWidth;

                let left: number;

                if (align === 'right') {
                    // ต้องการให้ขอบขวาของ dropdown ตรงกับขอบขวาของ trigger
                    const desiredLeft = rect.right - dropdownWidth;

                    // ถ้าหลุดขอบซ้าย ให้จัดให้ชิดขอบซ้าย + padding
                    if (desiredLeft < padding) {
                        left = padding;
                    } else if (rect.right > viewportWidth - padding) {
                        // ถ้า trigger อยู่ใกล้ขอบขวามาก ให้จัดที่ขอบขวา - dropdown width
                        left = viewportWidth - dropdownWidth - padding;
                    } else {
                        left = desiredLeft;
                    }
                } else {
                    // align left: ขอบซ้ายของ dropdown ตรงกับขอบซ้ายของ trigger
                    const desiredLeft = rect.left;

                    // ถ้าหลุดขอบขวา ให้จัดให้ชิดขอบขวา - dropdown width - padding
                    if (desiredLeft + dropdownWidth > viewportWidth - padding) {
                        left = viewportWidth - dropdownWidth - padding;
                    } else if (desiredLeft < padding) {
                        left = padding;
                    } else {
                        left = desiredLeft;
                    }
                }

                setPosition({
                    top: rect.bottom + 8, // 8px Offset
                    left,
                });
            };

            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);

            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isOpen, align]);

    return (
        <>
            <div
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className={cn('relative inline-block text-left cursor-pointer', className)}
            >
                {trigger || (
                    <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <MoreVertical size={16} />
                    </button>
                )}
            </div>

            {typeof document !== 'undefined' &&
                createPortal(
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                ref={dropdownRef}
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.1 }}
                                style={{
                                    top: position.top,
                                    left: position.left,
                                }}
                                className={cn(
                                    'fixed z-[9999] w-48 rounded-xl border border-white/10 bg-[#1A1A1A]/95 backdrop-blur-xl shadow-xl overflow-hidden ring-1 ring-black/5 focus:outline-none'
                                    // Remove utility classes for positioning since we use inline styles
                                )}
                            >
                                <div className="py-1">{children}</div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
        </>
    );
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    icon?: React.ElementType;
    variant?: 'default' | 'danger';
}

export function DropdownItem({
    children,
    className,
    icon: Icon,
    variant = 'default',
    ...props
}: DropdownItemProps) {
    return (
        <button
            {...props}
            className={cn(
                'flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors',
                variant === 'default'
                    ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                    : 'text-red-400 hover:bg-red-500/10 hover:text-red-300',
                className
            )}
        >
            {Icon && <Icon size={16} />}
            {children}
        </button>
    );
}
