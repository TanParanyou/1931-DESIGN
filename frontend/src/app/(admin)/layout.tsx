'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu, X, ChevronRight, ChevronDown, User, FileText, Shield } from 'lucide-react';
import { icons } from 'lucide-react';
import api from '@/lib/api';

interface MenuItem {
    id: number;
    title: string;
    path: string;
    icon: string;
    parent_id: number | null;
    order: number;
}

// Dynamic icon component
const DynamicIcon = ({
    name,
    size = 20,
    className = '',
}: {
    name: string;
    size?: number;
    className?: string;
}) => {
    const Icon = icons[name as keyof typeof icons] || FileText;
    return <Icon size={size} className={className} />;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { logout, user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [menuLoading, setMenuLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [isLoading, user, router]);

    // Fetch Menus
    useEffect(() => {
        if (user) {
            const fetchMenus = async () => {
                try {
                    const res = await api.get('/auth/menus');
                    setMenuItems(res.data.data?.menus || []);
                } catch (err) {
                    console.error('Failed to fetch menus', err);
                } finally {
                    setMenuLoading(false);
                }
            };
            fetchMenus();
        }
    }, [user]);

    // จัดกลุ่ม menus: แยก groups, standalone, และ children
    const { topLevelMenus, childrenByParent } = useMemo(() => {
        const topLevelMenus: (MenuItem & { isGroup: boolean })[] = [];
        const childrenByParent: Record<number, MenuItem[]> = {};

        menuItems.forEach((menu) => {
            if (menu.parent_id) {
                // เป็น child menu
                if (!childrenByParent[menu.parent_id]) {
                    childrenByParent[menu.parent_id] = [];
                }
                childrenByParent[menu.parent_id].push(menu);
            } else {
                // เป็น top-level menu (อาจเป็น group หรือ standalone)
                topLevelMenus.push({ ...menu, isGroup: menu.path === '#' });
            }
        });

        // Sort by order
        topLevelMenus.sort((a, b) => a.order - b.order);
        Object.values(childrenByParent).forEach((children) => {
            children.sort((a, b) => a.order - b.order);
        });

        return { topLevelMenus, childrenByParent };
    }, [menuItems]);

    // Auto-expand group ถ้า current path อยู่ใน group นั้น
    useEffect(() => {
        if (pathname) {
            topLevelMenus.forEach((menu) => {
                if (menu.isGroup) {
                    const children = childrenByParent[menu.id] || [];
                    const hasActiveChild = children.some(
                        (child) => pathname === child.path || pathname.startsWith(`${child.path}/`)
                    );
                    if (hasActiveChild) {
                        setExpandedGroups((prev) => new Set([...prev, menu.id]));
                    }
                }
            });
        }
    }, [pathname, topLevelMenus, childrenByParent]);

    const toggleGroup = (groupId: number) => {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }
            return next;
        });
    };

    if (isLoading || (menuLoading && user)) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    // Render single menu item
    const renderMenuItem = (item: MenuItem, isChild = false) => {
        // สำหรับ Dashboard (/admin) ให้ match exact path เท่านั้น
        const isExactMatch = item.path === '/admin' || item.path === '/admin/';
        const isActive = pathname
            ? isExactMatch
                ? pathname === '/admin' || pathname === '/admin/'
                : pathname === item.path || pathname.startsWith(`${item.path}/`)
            : false;

        return (
            <Link
                key={item.id}
                href={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden ${
                    isChild ? 'ml-4 pl-6 border-l-2 border-white/10' : ''
                } ${
                    isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
                <DynamicIcon name={item.icon} size={18} className="relative z-10" />
                <span className="relative z-10 font-medium text-sm">{item.title}</span>
                {isActive && <ChevronRight size={14} className="ml-auto relative z-10" />}
            </Link>
        );
    };

    // Render group with children
    const renderGroup = (group: MenuItem) => {
        const children = childrenByParent[group.id] || [];
        const isExpanded = expandedGroups.has(group.id);
        const hasActiveChild = children.some(
            (child) => pathname === child.path || pathname?.startsWith(`${child.path}/`)
        );

        return (
            <div key={group.id} className="space-y-1">
                {/* Group Header */}
                <button
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                        hasActiveChild
                            ? 'bg-white/10 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <DynamicIcon name={group.icon} size={18} />
                    <span className="font-medium text-sm flex-1 text-left">{group.title}</span>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown size={16} />
                    </motion.div>
                </button>

                {/* Children */}
                <AnimatePresence>
                    {isExpanded && children.length > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-1 overflow-hidden"
                        >
                            {children.map((child) => renderMenuItem(child, true))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/10">
                <Link href="/" className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        1931
                    </div>
                    <span className="text-xl font-bold tracking-wider text-white">ADMIN</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="mb-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Menu
                </div>

                {/* Render all top-level menus (groups + standalone) sorted by order */}
                {topLevelMenus.map((menu) =>
                    menu.isGroup ? renderGroup(menu) : renderMenuItem(menu)
                )}
            </nav>

            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-white/5 border border-white/5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold ring-2 ring-black">
                        <User size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.username || 'Admin User'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                            {user?.role || 'Administrator'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#0a0a0a] text-white">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50 bg-[#0a0a0a]/95 border-r border-white/10 backdrop-blur-xl">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        1931
                    </div>
                    <span className="font-bold">ADMIN</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-gray-400 hover:text-white active:scale-95 transition-transform"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 w-72 bg-[#111] border-r border-white/10 md:hidden"
                        >
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 md:ml-72 w-full max-w-[100vw] p-4 md:p-8 pt-20 md:pt-8 min-h-screen transition-all overflow-x-hidden">
                <div className="max-w-6xl mx-auto">{children}</div>
            </main>
        </div>
    );
}
