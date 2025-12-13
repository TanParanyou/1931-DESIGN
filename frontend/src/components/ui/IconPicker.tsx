'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { icons, LucideIcon, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useClickOutside } from '@/hooks/useClickOutside';

// รายชื่อ icons ที่ใช้บ่อยสำหรับ menu
const COMMON_ICONS = [
    'Home',
    'LayoutDashboard',
    'Users',
    'Settings',
    'FolderOpen',
    'FileText',
    'Image',
    'Calendar',
    'Mail',
    'Bell',
    'Shield',
    'Lock',
    'Key',
    'UserCog',
    'Building',
    'Briefcase',
    'Package',
    'ShoppingCart',
    'CreditCard',
    'BarChart',
    'PieChart',
    'TrendingUp',
    'MessageSquare',
    'Send',
    'Globe',
    'Link',
    'Star',
    'Heart',
    'Bookmark',
    'Tag',
    'List',
    'Grid',
    'Menu',
    'Layers',
    'Box',
    'Database',
    'Server',
    'Cloud',
    'Upload',
    'Download',
    'Plus',
    'Minus',
    'Edit',
    'Trash2',
    'Eye',
    'EyeOff',
    'Check',
    'X',
    'AlertCircle',
    'Info',
    'HelpCircle',
    'Clock',
    'User',
    'UserPlus',
    'UserCheck',
    'Clipboard',
    'ClipboardList',

    // Arrows & Navigation
    'ArrowRight',
    'ArrowLeft',
    'ArrowUp',
    'ArrowDown',
    'ChevronRight',
    'ChevronLeft',
    'ChevronUp',
    'ChevronDown',
    'ExternalLink',
    'RefreshCw',
    'RefreshCcw',
    'RotateCw',
    'RotateCcw',
    'Repeat',
    'Shuffle',
    'Maximize',
    'Minimize',
    'Move',
    'Power',
    'LogOut',
    'LogIn',

    // Actions
    'Copy',
    'Scissors',
    'Save',
    'Printer',
    'Share',
    'Share2',
    'Filter',
    'SortAsc',
    'SortDesc',

    // Media & Devices
    'Phone',
    'Smartphone',
    'Tablet',
    'Monitor',
    'Laptop',
    'Speaker',
    'Headphones',
    'Camera',
    'Video',
    'Mic',
    'Volume2',
    'VolumeX',
    'Battery',
    'Wifi',
    'WifiOff',
    'Signal',

    // Maps
    'MapPin',
    'Map',
    'Navigation',
    'Compass',
];

interface IconPickerProps {
    value: string;
    onChange: (iconName: string) => void;
    label?: string;
    error?: string;
}

export function IconPicker({ value, onChange, label, error }: IconPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useClickOutside([triggerRef, dropdownRef], () => setIsOpen(false));

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 8,
                left: rect.left,
                width: Math.max(rect.width, 320),
            });
            // Focus search input when opened
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Filter icons based on search
    const filteredIcons = useMemo(() => {
        if (!search) return COMMON_ICONS;

        // Normalize search term: lower case and remove dashes/spaces
        const normalizedSearch = search.toLowerCase().replace(/[- ]/g, '');

        // When searching, look through ALL available icons in lucide-react
        const allIcons = Object.keys(icons);
        return allIcons
            .filter((name) => name.toLowerCase().replace(/[- ]/g, '').includes(normalizedSearch))
            .slice(0, 50); // Limit results for performance
    }, [search]);

    // Get current icon component
    const CurrentIcon = value ? (icons[value as keyof typeof icons] as LucideIcon) : null;

    const handleSelect = (iconName: string) => {
        onChange(iconName);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div className="space-y-1">
            {label && <label className="text-sm font-medium text-gray-300 ml-1">{label}</label>}
            <div
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 w-full bg-black/20 border ${
                    error ? 'border-red-500/50' : isOpen ? 'border-purple-500' : 'border-white/10'
                } rounded-lg py-3 px-4 cursor-pointer transition-all hover:bg-black/30`}
            >
                {CurrentIcon ? (
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <CurrentIcon size={20} className="text-purple-400" />
                        </div>
                        <span className="text-white">{value}</span>
                    </div>
                ) : (
                    <span className="text-gray-500">Select an icon...</span>
                )}
                <div className="ml-auto">
                    {value && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Dropdown Portal */}
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
                                    width: position.width,
                                    position: 'fixed',
                                    zIndex: 9999,
                                }}
                                className="bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
                            >
                                {/* Search Input */}
                                <div className="p-3 border-b border-white/10">
                                    <div className="relative">
                                        <Search
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                                        />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search icons..."
                                            className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                                        />
                                    </div>
                                </div>

                                {/* Icons Grid */}
                                <div className="p-3 max-h-60 overflow-y-auto">
                                    {filteredIcons.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-4 text-gray-500 gap-2">
                                            <span className="text-sm">No icons found</span>
                                            {search && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelect(search)}
                                                    className="text-xs bg-white/5 hover:bg-white/10 text-purple-400 px-3 py-1.5 rounded-full transition-colors border border-purple-500/20"
                                                >
                                                    {`Use "${search}" anyway`}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-6 gap-2">
                                            {filteredIcons.map((iconName) => {
                                                const Icon = icons[
                                                    iconName as keyof typeof icons
                                                ] as LucideIcon;
                                                if (!Icon) return null;
                                                return (
                                                    <button
                                                        key={iconName}
                                                        type="button"
                                                        onClick={() => handleSelect(iconName)}
                                                        title={iconName}
                                                        className={`p-3 rounded-lg transition-all flex items-center justify-center ${
                                                            value === iconName
                                                                ? 'bg-purple-600/30 text-purple-300 ring-1 ring-purple-500'
                                                                : 'hover:bg-white/10 text-gray-400 hover:text-white'
                                                        }`}
                                                    >
                                                        <Icon size={20} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Tip */}
                                <div className="px-3 py-2 border-t border-white/10 bg-white/5 flex justify-between items-center">
                                    <p className="text-xs text-gray-500">
                                        {filteredIcons.length} icons
                                    </p>
                                    <a
                                        href="https://lucide.dev/icons"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                                    >
                                        Browse all icons
                                        {icons.ExternalLink &&
                                            React.createElement(icons.ExternalLink as LucideIcon, {
                                                size: 10,
                                            })}
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}

            {error && <p className="text-sm text-red-400 ml-1">{error}</p>}
        </div>
    );
}
