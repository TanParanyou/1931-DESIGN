'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Newspaper,
    Briefcase,
    FolderKanban,
    LogOut,
    Menu,
    X,
    ChevronRight,
    User,
    FileText,
    Clock,
    Calendar,
    Shield,
    Settings,
} from 'lucide-react';
import api from '@/lib/api';

// Map icon string (from DB) to Lucide component
const IconMap: Record<string, any> = {
    LayoutDashboard,
    User,
    Briefcase,
    Clock,
    Calendar,
    FileText,
    Newspaper,
    FolderKanban,
    Shield,
    Settings,
};

interface MenuItem {
    id: number;
    title: string;
    path: string;
    icon: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { logout, user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [menuLoading, setMenuLoading] = useState(true);

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

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <div className="mb-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Menu
                </div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                    const Icon = IconMap[item.icon] || FileText; // Fallback icon
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                                isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 z-0"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <Icon size={20} className="relative z-10" />
                            <span className="relative z-10 font-medium">{item.title}</span>
                            {isActive && (
                                <ChevronRight size={16} className="ml-auto relative z-10" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-white/5 border border-white/5">
                    <div className="h-8 w-8 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold ring-2 ring-black">
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
