'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Edit2, Trash2, GripVertical, Folder, Package } from 'lucide-react';
import { PageLoading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/components/ui/Modal';
import { businessService, Business, ServiceCategory, Service } from '@/services/business.service';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ServicesPage({ params }: PageProps) {
    const { id } = use(params);
    const businessId = parseInt(id);

    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState<Business | null>(null);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [editingCategory, setEditingCategory] = useState<Partial<ServiceCategory> | null>(null);
    const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
    const [saving, setSaving] = useState(false);
    const { confirm, ConfirmDialog } = useConfirm();

    useEffect(() => {
        fetchData();
    }, [businessId]);

    const fetchData = async () => {
        try {
            const [biz, cats, servs] = await Promise.all([
                businessService.getBusinessById(businessId),
                businessService.getServiceCategories(businessId),
                businessService.getServices(businessId),
            ]);
            setBusiness(biz);
            setCategories(cats || []);
            setServices(servs || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ========== Category Handlers ==========
    const handleSaveCategory = async () => {
        if (!editingCategory?.name_th && !editingCategory?.name_en) return;
        setSaving(true);
        try {
            if (editingCategory.id) {
                await businessService.updateServiceCategory(
                    businessId,
                    editingCategory.id,
                    editingCategory
                );
            } else {
                await businessService.createServiceCategory(businessId, editingCategory);
            }
            setEditingCategory(null);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCategory = async (catId: number) => {
        const confirmed = await confirm({
            title: 'ลบหมวดหมู่',
            message: 'คุณต้องการลบหมวดหมู่นี้หรือไม่?',
            confirmText: 'ลบ',
            cancelText: 'ยกเลิก',
            variant: 'danger',
        });
        if (!confirmed) return;
        try {
            await businessService.deleteServiceCategory(businessId, catId);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete category');
        }
    };

    // ========== Service Handlers ==========
    const handleSaveService = async () => {
        if (!editingService?.name_th && !editingService?.name_en) return;
        setSaving(true);
        try {
            if (editingService.id) {
                await businessService.updateService(businessId, editingService.id, editingService);
            } else {
                await businessService.createService(businessId, editingService);
            }
            setEditingService(null);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to save service');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteService = async (serviceId: number) => {
        const confirmed = await confirm({
            title: 'ลบบริการ',
            message: 'คุณต้องการลบบริการนี้หรือไม่?',
            confirmText: 'ลบ',
            cancelText: 'ยกเลิก',
            variant: 'danger',
        });
        if (!confirmed) return;
        try {
            await businessService.deleteService(businessId, serviceId);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete service');
        }
    };

    if (loading) return <PageLoading text="กำลังโหลดข้อมูล..." />;
    if (!business) return null;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href={`/admin/businesses/${businessId}`}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                    <ArrowLeft size={20} className="text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">จัดการบริการ</h1>
                    <p className="text-sm text-gray-400">{business.name_th || business.name_en}</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Categories */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Folder size={20} />
                            หมวดหมู่
                        </h2>
                        <button
                            onClick={() =>
                                setEditingCategory({
                                    name_th: '',
                                    name_en: '',
                                    sort_order: categories.length,
                                })
                            }
                            className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Category Form */}
                    {editingCategory !== null && (
                        <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="grid gap-3 mb-4">
                                <input
                                    type="text"
                                    placeholder="ชื่อหมวดหมู่ (ไทย)"
                                    value={editingCategory.name_th || ''}
                                    onChange={(e) =>
                                        setEditingCategory({
                                            ...editingCategory,
                                            name_th: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="ชื่อหมวดหมู่ (อังกฤษ)"
                                    value={editingCategory.name_en || ''}
                                    onChange={(e) =>
                                        setEditingCategory({
                                            ...editingCategory,
                                            name_en: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSaveCategory}
                                    isLoading={saving}
                                    className="text-sm py-2"
                                >
                                    บันทึก
                                </Button>
                                <button
                                    onClick={() => setEditingCategory(null)}
                                    className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Category List */}
                    <div className="space-y-2">
                        {categories.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">ยังไม่มีหมวดหมู่</p>
                        ) : (
                            categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                                >
                                    <GripVertical size={16} className="text-gray-600 cursor-grab" />
                                    <span className="flex-1 text-white">
                                        {cat.name_th || cat.name_en}
                                    </span>
                                    <button
                                        onClick={() => setEditingCategory(cat)}
                                        className="p-1.5 hover:bg-white/10 rounded"
                                    >
                                        <Edit2 size={14} className="text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(cat.id)}
                                        className="p-1.5 hover:bg-red-500/20 rounded"
                                    >
                                        <Trash2 size={14} className="text-red-400" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Services */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Package size={20} />
                            บริการ
                        </h2>
                        <button
                            onClick={() =>
                                setEditingService({
                                    name_th: '',
                                    name_en: '',
                                    price: 0,
                                    is_active: true,
                                })
                            }
                            className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Service Form */}
                    {editingService !== null && (
                        <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="grid gap-3 mb-4">
                                <input
                                    type="text"
                                    placeholder="ชื่อบริการ (ไทย)"
                                    value={editingService.name_th || ''}
                                    onChange={(e) =>
                                        setEditingService({
                                            ...editingService,
                                            name_th: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="ชื่อบริการ (อังกฤษ)"
                                    value={editingService.name_en || ''}
                                    onChange={(e) =>
                                        setEditingService({
                                            ...editingService,
                                            name_en: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        placeholder="ราคา (บาท)"
                                        value={editingService.price || ''}
                                        onChange={(e) =>
                                            setEditingService({
                                                ...editingService,
                                                price: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="ข้อความราคา (เช่น 'เริ่มต้น 500')"
                                        value={editingService.price_text || ''}
                                        onChange={(e) =>
                                            setEditingService({
                                                ...editingService,
                                                price_text: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                    />
                                </div>
                                <textarea
                                    placeholder="รายละเอียด"
                                    value={editingService.desc_th || ''}
                                    onChange={(e) =>
                                        setEditingService({
                                            ...editingService,
                                            desc_th: e.target.value,
                                        })
                                    }
                                    rows={2}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none"
                                />
                                <select
                                    value={editingService.category_id || ''}
                                    onChange={(e) =>
                                        setEditingService({
                                            ...editingService,
                                            category_id: parseInt(e.target.value) || undefined,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                >
                                    <option value="">-- ไม่มีหมวดหมู่ --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name_th || cat.name_en}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSaveService}
                                    isLoading={saving}
                                    className="text-sm py-2"
                                >
                                    บันทึก
                                </Button>
                                <button
                                    onClick={() => setEditingService(null)}
                                    className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Service List */}
                    <div className="space-y-2">
                        {services.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">ยังไม่มีบริการ</p>
                        ) : (
                            services.map((service) => (
                                <div
                                    key={service.id}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                                >
                                    <GripVertical size={16} className="text-gray-600 cursor-grab" />
                                    {service.image_url && (
                                        <div className="w-10 h-10 rounded overflow-hidden bg-white/10">
                                            <Image
                                                src={service.image_url}
                                                alt=""
                                                width={40}
                                                height={40}
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="text-white">
                                            {service.name_th || service.name_en}
                                        </div>
                                        <div className="text-sm text-emerald-400">
                                            {service.price_text ||
                                                (service.price > 0
                                                    ? `฿${service.price.toLocaleString()}`
                                                    : '')}
                                        </div>
                                    </div>
                                    <span
                                        className={`px-2 py-0.5 rounded text-xs ${service.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}
                                    >
                                        {service.is_active ? 'เปิด' : 'ปิด'}
                                    </span>
                                    <button
                                        onClick={() => setEditingService(service)}
                                        className="p-1.5 hover:bg-white/10 rounded"
                                    >
                                        <Edit2 size={14} className="text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteService(service.id)}
                                        className="p-1.5 hover:bg-red-500/20 rounded"
                                    >
                                        <Trash2 size={14} className="text-red-400" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog />
        </div>
    );
}
