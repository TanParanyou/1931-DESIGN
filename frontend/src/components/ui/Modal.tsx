'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Loading } from './Loading';

// === Types ===
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ModalVariant = 'default' | 'danger' | 'success' | 'warning' | 'info';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    size?: ModalSize;
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    footer?: React.ReactNode;
    className?: string;
}

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ModalVariant;
    isLoading?: boolean;
}

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    variant?: ModalVariant;
    buttonText?: string;
}

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void | Promise<void>;
    title: string;
    description?: string;
    children: React.ReactNode;
    submitText?: string;
    cancelText?: string;
    isLoading?: boolean;
    size?: ModalSize;
    submitDisabled?: boolean;
}

// === Size configurations ===
const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-[90vw] max-h-[90vh]',
};

// === Variant configurations ===
const variantConfig: Record<
    ModalVariant,
    { icon: React.ElementType; iconColor: string; buttonClass: string }
> = {
    default: {
        icon: Info,
        iconColor: 'text-blue-400',
        buttonClass: 'bg-indigo-500 hover:bg-indigo-600',
    },
    danger: {
        icon: AlertTriangle,
        iconColor: 'text-red-400',
        buttonClass: 'bg-red-500 hover:bg-red-600',
    },
    success: {
        icon: CheckCircle,
        iconColor: 'text-green-400',
        buttonClass: 'bg-green-500 hover:bg-green-600',
    },
    warning: {
        icon: AlertCircle,
        iconColor: 'text-amber-400',
        buttonClass: 'bg-amber-500 hover:bg-amber-600',
    },
    info: {
        icon: Info,
        iconColor: 'text-cyan-400',
        buttonClass: 'bg-cyan-500 hover:bg-cyan-600',
    },
};

// === Base Modal Component ===
const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    footer,
    className = '',
}) => {
    // Handle escape key
    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape' && closeOnEscape) {
                onClose();
            }
        },
        [closeOnEscape, onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleEscape]);

    // Don't render on server side (SSR compatibility)
    if (typeof document === 'undefined') return null;

    // Use createPortal to render modal to document.body for full-screen overlay
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeOnOverlayClick ? onClose : undefined}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className={`
                                w-full ${sizeClasses[size]}
                                bg-[#111] rounded-3xl border border-white/10
                                shadow-2xl pointer-events-auto overflow-hidden
                                ${className}
                            `}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            {(title || showCloseButton) && (
                                <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/10">
                                    <div>
                                        {title && (
                                            <h2 className="text-2xl font-light text-white">
                                                {title}
                                            </h2>
                                        )}
                                        {description && (
                                            <p className="mt-1 text-sm text-white/50">
                                                {description}
                                            </p>
                                        )}
                                    </div>
                                    {showCloseButton && (
                                        <button
                                            onClick={onClose}
                                            className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Body */}
                            {children && (
                                <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto">
                                    {children}
                                </div>
                            )}

                            {/* Footer */}
                            {footer && (
                                <div className="flex items-center justify-end gap-3 p-6 md:p-8 border-t border-white/10 bg-black/20">
                                    {footer}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

// === Confirm Modal Component ===
const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'ยืนยันการดำเนินการ',
    message,
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
    variant = 'default',
    isLoading = false,
}) => {
    const config = variantConfig[variant];
    const Icon = config.icon;

    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
            showCloseButton={false}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="text-center">
                {/* Icon */}
                <div
                    className={`mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 ${config.iconColor}`}
                >
                    <Icon size={32} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

                {/* Message */}
                <p className="text-gray-400 mb-6">{message}</p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${config.buttonClass}`}
                    >
                        {isLoading ? <Loading variant="dots" size="sm" /> : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// === Alert Modal Component ===
const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    variant = 'info',
    buttonText = 'ตกลง',
}) => {
    const config = variantConfig[variant];
    const Icon = config.icon;

    const defaultTitles: Record<ModalVariant, string> = {
        default: 'แจ้งเตือน',
        danger: 'เกิดข้อผิดพลาด',
        success: 'สำเร็จ',
        warning: 'คำเตือน',
        info: 'ข้อมูล',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
            <div className="text-center">
                {/* Icon */}
                <div
                    className={`mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 ${config.iconColor}`}
                >
                    <Icon size={32} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2">
                    {title || defaultTitles[variant]}
                </h3>

                {/* Message */}
                <p className="text-gray-400 mb-6">{message}</p>

                {/* Button */}
                <button
                    onClick={onClose}
                    className={`w-full px-4 py-2.5 rounded-xl text-white transition-colors ${config.buttonClass}`}
                >
                    {buttonText}
                </button>
            </div>
        </Modal>
    );
};

// === Form Modal Component ===
const FormModal: React.FC<FormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    description,
    children,
    submitText = 'บันทึก',
    cancelText = 'ยกเลิก',
    isLoading = false,
    size = 'md',
    submitDisabled = false,
}) => {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(e);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            size={size}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <form onSubmit={handleSubmit}>
                {/* Form Content */}
                <div className="space-y-4">{children}</div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2.5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || submitDisabled}
                        className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loading variant="dots" size="sm" />
                                <span>กำลังบันทึก...</span>
                            </>
                        ) : (
                            submitText
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// === useModal Hook ===
interface UseModalReturn {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

const useModal = (initialState = false): UseModalReturn => {
    const [isOpen, setIsOpen] = React.useState(initialState);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    return { isOpen, open, close, toggle };
};

// === useConfirm Hook ===
interface UseConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ModalVariant;
}

interface UseConfirmReturn {
    confirm: (options: UseConfirmOptions) => Promise<boolean>;
    ConfirmDialog: React.FC;
}

const useConfirm = (): UseConfirmReturn => {
    const [state, setState] = React.useState<{
        isOpen: boolean;
        options: UseConfirmOptions | null;
        resolve: ((value: boolean) => void) | null;
    }>({
        isOpen: false,
        options: null,
        resolve: null,
    });

    const confirm = useCallback((options: UseConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                options,
                resolve,
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        state.resolve?.(true);
        setState({ isOpen: false, options: null, resolve: null });
    }, [state]);

    const handleClose = useCallback(() => {
        state.resolve?.(false);
        setState({ isOpen: false, options: null, resolve: null });
    }, [state]);

    const ConfirmDialog: React.FC = useCallback(() => {
        if (!state.options) return null;
        return (
            <ConfirmModal
                isOpen={state.isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={state.options.title}
                message={state.options.message}
                confirmText={state.options.confirmText}
                cancelText={state.options.cancelText}
                variant={state.options.variant}
            />
        );
    }, [state, handleClose, handleConfirm]);

    return { confirm, ConfirmDialog };
};

export { Modal, ConfirmModal, AlertModal, FormModal, useModal, useConfirm };

export type {
    ModalProps,
    ConfirmModalProps,
    AlertModalProps,
    FormModalProps,
    ModalSize,
    ModalVariant,
};
