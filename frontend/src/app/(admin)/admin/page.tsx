'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    FolderKanban,
    Users,
    UserCheck,
    CalendarCheck,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    TrendingUp,
    Briefcase,
    CalendarOff,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/ui/Loading';

interface DashboardStats {
    total_projects: number;
    active_projects: number;
    total_categories: number;
    total_users: number;
    active_users: number;
    total_employees: number;
    today_attendance: number;
    pending_leaves: number;
}

interface RecentActivity {
    id: number;
    action: string;
    description: string;
    user_id: number;
    username: string;
    created_at: string;
}

interface RecentUser {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
    last_login: string;
}

// Stat Card Component
const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'blue',
    link,
}: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    trend?: 'up' | 'down';
    trendValue?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan';
    link?: string;
}) => {
    const colorClasses = {
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
        green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
        purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
        orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
        pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/30 text-pink-400',
        cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
    };

    const iconBgClasses = {
        blue: 'bg-blue-500/20 text-blue-400',
        green: 'bg-green-500/20 text-green-400',
        purple: 'bg-purple-500/20 text-purple-400',
        orange: 'bg-orange-500/20 text-orange-400',
        pink: 'bg-pink-500/20 text-pink-400',
        cyan: 'bg-cyan-500/20 text-cyan-400',
    };

    const Content = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm group ${link ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
        >
            {/* Background decoration */}
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 blur-2xl" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
                        <Icon size={24} />
                    </div>
                    {trend && (
                        <div
                            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                                trend === 'up'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                            }`}
                        >
                            {trend === 'up' ? (
                                <ArrowUpRight size={12} />
                            ) : (
                                <ArrowDownRight size={12} />
                            )}
                            {trendValue}
                        </div>
                    )}
                </div>

                <p className="text-sm text-gray-400 mb-1">{title}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>

            {link && (
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={20} className="text-gray-400" />
                </div>
            )}
        </motion.div>
    );

    if (link) {
        return <Link href={link}>{Content}</Link>;
    }
    return Content;
};

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [recentLogins, setRecentLogins] = useState<RecentUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, activitiesRes, loginsRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/activities?limit=8'),
                    api.get('/dashboard/recent-logins?limit=5'),
                ]);

                setStats(statsRes.data.data);
                setActivities(activitiesRes.data.data?.activities || []);
                setRecentLogins(loginsRes.data.data?.users || []);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Format date to Thai locale
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('th-TH', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Format relative time
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'เมื่อสักครู่';
        if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
        if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
        if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
        return formatDate(dateString);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loading variant="orbit" size="lg" text="กำลังโหลดข้อมูล..." />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-light tracking-wide"
                    >
                        ยินดีต้อนรับ,{' '}
                        <span className="font-semibold text-blue-400">
                            {user?.first_name || user?.username}
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 mt-1"
                    >
                        ภาพรวมระบบและกิจกรรมล่าสุด
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
                >
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-300">
                        {new Date().toLocaleDateString('th-TH', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </span>
                </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="โปรเจคทั้งหมด"
                    value={stats?.total_projects || 0}
                    icon={FolderKanban}
                    color="blue"
                    link="/admin/projects"
                />
                <StatCard
                    title="โปรเจคที่เปิดใช้งาน"
                    value={stats?.active_projects || 0}
                    icon={TrendingUp}
                    color="green"
                    trend="up"
                    trendValue={`${stats?.total_projects ? Math.round((stats.active_projects / stats.total_projects) * 100) : 0}%`}
                />
                <StatCard
                    title="ผู้ใช้งานทั้งหมด"
                    value={stats?.total_users || 0}
                    icon={Users}
                    color="purple"
                    link="/admin/users"
                />
                <StatCard
                    title="ผู้ใช้งานที่ Active"
                    value={stats?.active_users || 0}
                    icon={UserCheck}
                    color="cyan"
                />
            </div>

            {/* Second Row Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="พนักงานทั้งหมด"
                    value={stats?.total_employees || 0}
                    icon={Briefcase}
                    color="orange"
                    link="/admin/employees"
                />
                <StatCard
                    title="เข้างานวันนี้"
                    value={stats?.today_attendance || 0}
                    icon={CalendarCheck}
                    color="green"
                />
                <StatCard
                    title="ใบลารอดำเนินการ"
                    value={stats?.pending_leaves || 0}
                    icon={CalendarOff}
                    color="pink"
                    link="/admin/leaves"
                />
                <StatCard
                    title="หมวดหมู่"
                    value={stats?.total_categories || 0}
                    icon={FolderKanban}
                    color="purple"
                    link="/admin/categories"
                />
            </div>

            {/* Activity and Recent Logins */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Activity size={18} className="text-blue-400" />
                            </div>
                            <h2 className="text-lg font-semibold">กิจกรรมล่าสุด</h2>
                        </div>
                        <Link
                            href="/admin/audit-logs"
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            ดูทั้งหมด →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {activities.length > 0 ? (
                            activities.map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {activity.username?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white">
                                            <span className="font-medium text-blue-400">
                                                {activity.username}
                                            </span>{' '}
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatRelativeTime(activity.created_at)}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Activity size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">ไม่มีกิจกรรมล่าสุด</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Recent Logins */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <Users size={18} className="text-green-400" />
                            </div>
                            <h2 className="text-lg font-semibold">ผู้ใช้ล็อกอินล่าสุด</h2>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {recentLogins.length > 0 ? (
                            recentLogins.map((login, index) => (
                                <motion.div
                                    key={login.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
                                            {login.first_name && login.last_name
                                                ? `${login.first_name.charAt(0)}${login.last_name.charAt(0)}`
                                                : login.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full"></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {login.first_name && login.last_name
                                                ? `${login.first_name} ${login.last_name}`
                                                : login.username}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {login.role || 'User'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">
                                            {login.last_login
                                                ? formatRelativeTime(login.last_login)
                                                : '-'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Users size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">ไม่มีข้อมูลการล็อกอิน</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
