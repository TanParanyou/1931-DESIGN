'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Trash2, GripVertical, Upload, X } from 'lucide-react';
import { PageLoading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/components/ui/Modal';
import { businessService, Business, GalleryItem } from '@/services/business.service';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function GalleryPage({ params }: PageProps) {
    const { id } = use(params);
    const businessId = parseInt(id);

    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState<Business | null>(null);
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [uploading, setUploading] = useState(false);
    const { confirm, ConfirmDialog } = useConfirm();

    useEffect(() => {
        fetchData();
    }, [businessId]);

    const fetchData = async () => {
        try {
            const [biz, gal] = await Promise.all([
                businessService.getBusinessById(businessId),
                businessService.getGallery(businessId),
            ]);
            setBusiness(biz);
            setGallery(gal || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = async (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (!files?.length) return;

            setUploading(true);
            try {
                const { uploadImage } = await import('@/lib/api');
                for (const file of Array.from(files)) {
                    const url = await uploadImage(file);
                    if (url) {
                        await businessService.addGalleryImage(businessId, {
                            image_url: url,
                            sort_order: gallery.length,
                        });
                    }
                }
                fetchData();
            } catch (err) {
                console.error(err);
                alert('Failed to upload images');
            } finally {
                setUploading(false);
            }
        };
        input.click();
    };

    const handleDelete = async (itemId: number) => {
        const confirmed = await confirm({
            title: 'ลบรูปภาพ',
            message: 'คุณต้องการลบรูปภาพนี้หรือไม่?',
            confirmText: 'ลบ',
            cancelText: 'ยกเลิก',
            variant: 'danger',
        });
        if (!confirmed) return;
        try {
            await businessService.deleteGalleryImage(businessId, itemId);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete image');
        }
    };

    const handleUpdateCaption = async (item: GalleryItem, caption: string) => {
        try {
            await businessService.updateGalleryImage(businessId, item.id, { caption });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <PageLoading text="กำลังโหลดแกลเลอรี..." />;
    if (!business) return null;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/businesses/${businessId}`}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                        <ArrowLeft size={20} className="text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">จัดการแกลเลอรี</h1>
                        <p className="text-sm text-gray-400">
                            {business.name_th || business.name_en}
                        </p>
                    </div>
                </div>
                <Button onClick={handleUpload} isLoading={uploading}>
                    <Upload size={16} className="mr-2" />
                    อัพโหลดรูป
                </Button>
            </div>

            {/* Gallery Grid */}
            {gallery.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/20">
                    <Upload size={48} className="text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">ยังไม่มีรูปภาพ</h3>
                    <p className="text-gray-500 mb-4">อัพโหลดรูปภาพผลงานของคุณ</p>
                    <Button onClick={handleUpload} isLoading={uploading}>
                        <Plus size={18} className="mr-2" />
                        เพิ่มรูปภาพ
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {gallery.map((item) => (
                        <div
                            key={item.id}
                            className="group relative bg-white/5 rounded-xl overflow-hidden border border-white/10"
                        >
                            <div className="relative aspect-square">
                                <Image
                                    src={item.image_url}
                                    alt={item.caption || 'Gallery image'}
                                    fill
                                    className="object-cover"
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg">
                                        <GripVertical size={18} className="text-white" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg"
                                    >
                                        <Trash2 size={18} className="text-red-400" />
                                    </button>
                                </div>
                            </div>
                            {/* Caption */}
                            <div className="p-2">
                                <input
                                    type="text"
                                    value={item.caption || ''}
                                    onChange={(e) => handleUpdateCaption(item, e.target.value)}
                                    placeholder="เพิ่มคำอธิบาย..."
                                    className="w-full px-2 py-1 bg-transparent border-none text-white text-sm placeholder-gray-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    ))}

                    {/* Add More Button */}
                    <button
                        onClick={handleUpload}
                        className="aspect-square flex flex-col items-center justify-center gap-2 bg-white/5 border-2 border-dashed border-white/20 rounded-xl hover:border-indigo-500/50 hover:bg-white/10 transition-all"
                    >
                        <Plus size={32} className="text-gray-500" />
                        <span className="text-sm text-gray-500">เพิ่มรูป</span>
                    </button>
                </div>
            )}

            <ConfirmDialog />
        </div>
    );
}
