'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Store, Edit2, Trash2, Eye, Globe, FileEdit, MoreVertical } from 'lucide-react';
import { PageLoading } from '@/components/ui/Loading';
import { useConfirm } from '@/components/ui/Modal';
import { businessService, Business } from '@/services/business.service';

export default function BusinessesPage() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { confirm, ConfirmDialog } = useConfirm();

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        try {
            const data = await businessService.getMyBusinesses();
            setBusinesses(data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load businesses');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await confirm({
            title: 'ยืนยันการลบ',
            message: 'คุณต้องการลบร้านนี้หรือไม่? ข้อมูลทั้งหมดจะถูกลบ',
            confirmText: 'ลบ',
            cancelText: 'ยกเลิก',
            variant: 'danger',
        });
        if (!confirmed) return;

        try {
            await businessService.deleteBusiness(id);
            fetchBusinesses();
        } catch (err) {
            console.error(err);
            alert('Failed to delete business');
        }
    };

    const handleToggleStatus = async (business: Business) => {
        const newStatus = business.status === 'published' ? 'draft' : 'published';
        try {
            await businessService.updateStatus(business.id, newStatus);
            fetchBusinesses();
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    if (loading) return <PageLoading text="กำลังโหลดข้อมูลธุรกิจ..." />;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                        Business Profiles
                    </h1>
                    <p className="text-sm md:text-base text-gray-400">
                        จัดการเว็บโปรไฟล์ธุรกิจของคุณ
                    </p>
                </div>

                <Link
                    href="/admin/businesses/create"
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-sm font-medium"
                >
                    <Plus size={18} />
                    <span>สร้างร้านใหม่</span>
                </Link>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    {error}
                </div>
            )}

            {/* Business Grid */}
            {businesses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Store size={64} className="text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">ยังไม่มีร้าน</h3>
                    <p className="text-gray-500 mb-6">สร้างร้านแรกของคุณเพื่อเริ่มต้น</p>
                    <Link
                        href="/admin/businesses/create"
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all"
                    >
                        <Plus size={20} />
                        <span>สร้างร้านใหม่</span>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {businesses.map((business) => (
                        <div
                            key={business.id}
                            className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all"
                        >
                            {/* Cover Image */}
                            <div className="relative h-40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                                {business.cover_url ? (
                                    <Image
                                        src={business.cover_url}
                                        alt={business.name_th || business.name_en}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Store size={48} className="text-white/20" />
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-3 left-3">
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                            business.status === 'published'
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        }`}
                                    >
                                        {business.status === 'published'
                                            ? 'เผยแพร่แล้ว'
                                            : 'แบบร่าง'}
                                    </span>
                                </div>

                                {/* Logo */}
                                {business.logo_url && (
                                    <div className="absolute -bottom-8 left-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden border-4 border-[#0a0a0a] bg-white/10">
                                            <Image
                                                src={business.logo_url}
                                                alt="Logo"
                                                width={64}
                                                height={64}
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className={`p-4 ${business.logo_url ? 'pt-10' : 'pt-4'}`}>
                                <h3 className="text-lg font-semibold text-white mb-1">
                                    {business.name_th || business.name_en}
                                </h3>
                                <p className="text-sm text-gray-500 mb-3">/{business.slug}</p>
                                {business.desc_th && (
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                                        {business.desc_th}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                                    <Link
                                        href={`/admin/businesses/${business.id}`}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all text-sm"
                                    >
                                        <Edit2 size={14} />
                                        <span>แก้ไข</span>
                                    </Link>

                                    {business.status === 'published' && (
                                        <Link
                                            href={`/p/${business.slug}`}
                                            target="_blank"
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg transition-all text-sm"
                                        >
                                            <Eye size={14} />
                                            <span>ดู</span>
                                        </Link>
                                    )}

                                    <div className="relative group/menu">
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                                            <MoreVertical size={16} className="text-gray-400" />
                                        </button>
                                        <div className="absolute right-0 bottom-full mb-2 w-40 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                                            <button
                                                onClick={() => handleToggleStatus(business)}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-all"
                                            >
                                                {business.status === 'published' ? (
                                                    <>
                                                        <FileEdit size={14} />
                                                        <span>ยกเลิกเผยแพร่</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Globe size={14} />
                                                        <span>เผยแพร่</span>
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(business.id)}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                                            >
                                                <Trash2 size={14} />
                                                <span>ลบ</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog />
        </div>
    );
}
