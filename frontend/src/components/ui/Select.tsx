import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useClickOutside } from '@/hooks/useClickOutside';

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLDivElement>, 'onChange'> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
    options: SelectOption[];
    containerClassName?: string;
    placeholder?: string;
    onChange?: (e: any) => void;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
    ({ className, label, error, icon: Icon, options, containerClassName, value, onChange, id, name, ...props }, ref) => {
        const [isOpen, setIsOpen] = useState(false);
        const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
        const triggerRef = useRef<HTMLDivElement>(null);
        const dropdownRef = useRef<HTMLDivElement>(null);

        // Close when clicking outside and when scrolling
        useClickOutside([triggerRef, dropdownRef], () => setIsOpen(false));

        useEffect(() => {
            const handleScroll = () => {
                if (isOpen) setIsOpen(false);
            };
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleScroll);
            return () => {
                window.removeEventListener('scroll', handleScroll, true);
                window.removeEventListener('resize', handleScroll);
            };
        }, [isOpen]);

        useEffect(() => {
            if (isOpen && triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setPosition({
                    top: rect.bottom + 8,
                    left: rect.left,
                    width: rect.width
                });
            }
        }, [isOpen]);

        const handleSelect = (optionValue: string | number) => {
            if (onChange) {
                // Create a synthetic event object compatible with standard onChange handlers
                const syntheticEvent = {
                    target: {
                        name: name || '',
                        id: id || '',
                        value: optionValue
                    }
                };
                onChange(syntheticEvent);
            }
            setIsOpen(false);
        };

        const selectedOption = options.find(opt => opt.value === value);

        return (
            <div className={`space-y-1 ${containerClassName || ''}`} ref={ref}>
                {label && (
                    <label
                        htmlFor={id}
                        className="text-sm font-medium text-gray-300 ml-1"
                    >
                        {label}
                    </label>
                )}
                <div
                    ref={triggerRef}
                    className="relative group"
                    onClick={() => !props.disabled && setIsOpen(!isOpen)}
                >
                    {Icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors z-10">
                            <Icon size={18} />
                        </div>
                    )}

                    <div
                        className={`w-full bg-black/20 border ${error ? 'border-red-500/50' : (isOpen ? 'border-purple-500' : 'border-white/10')} rounded-lg py-3 ${Icon ? 'pl-10' : 'pl-4'
                            } pr-10 text-white cursor-pointer transition-all hover:bg-black/30 flex items-center min-h-[46px] ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''
                            } ${className || ''}`}
                        id={id}
                    >
                        <span className={selectedOption ? 'text-white' : 'text-gray-500'}>
                            {selectedOption ? selectedOption.label : props.placeholder || 'Select an option'}
                        </span>
                    </div>

                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                        <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={18} />
                        </motion.div>
                    </div>
                </div>

                {/* Dropdown Portal */}
                {typeof document !== 'undefined' && createPortal(
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
                                    width: position.width,
                                    position: 'fixed',
                                    zIndex: 9999
                                }}
                                className="bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto backdrop-blur-xl"
                            >
                                <div className="p-1 space-y-0.5">
                                    {options.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(option.value);
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors ${value === option.value
                                                ? 'bg-purple-600/20 text-purple-300'
                                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <span>{option.label}</span>
                                            {value === option.value && (
                                                <Check size={16} className="text-purple-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}

                {error && (
                    <p className="text-sm text-red-400 ml-1">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export { Select };
