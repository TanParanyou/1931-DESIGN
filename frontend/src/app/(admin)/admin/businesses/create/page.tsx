'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Store, Upload, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageCropModal, CropType } from '@/components/ui/ImageCropModal';
import { businessService } from '@/services/business.service';

export default function CreateBusinessPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name_th: '',
        name_en: '',
        desc_th: '',
        desc_en: '',
        slug: '',
        logo_url: '',
        cover_url: '',
    });

    // สำหรับ Crop Modal
    const [cropModal, setCropModal] = useState<{
        isOpen: boolean;
        imageSrc: string;
        type: CropType;
    }>({
        isOpen: false,
        imageSrc: '',
        type: 'cover',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name_th && !form.name_en) {
            alert('กรุณากรอกชื่อร้าน');
            return;
        }

        setLoading(true);
        try {
            const business = await businessService.createBusiness(form);
            router.push(`/admin/businesses/${business.id}`);
        } catch (err) {
            console.error(err);
            alert('Failed to create business');
        } finally {
            setLoading(false);
        }
    };

    // อัพโหลดรูปแล้วเปิด crop modal
    const handleImageUpload = async (type: CropType) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            // สร้าง URL สำหรับ preview ใน crop modal
            const objectUrl = URL.createObjectURL(file);
            setCropModal({
                isOpen: true,
                imageSrc: objectUrl,
                type,
            });
        };
        input.click();
    };

    // หลังจาก crop เสร็จ - อัพโหลดภาพที่ crop แล้ว
    const handleCropComplete = async (croppedImage: string) => {
        try {
            // แปลง base64 เป็น Blob (หลีกเลี่ยง CSP error จาก fetch data URL)
            const base64Data = croppedImage.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            const file = new File([blob], `${cropModal.type}_image.jpg`, {
                type: 'image/jpeg',
            });

            // อัพโหลดไปยัง server
            const { uploadImage } = await import('@/lib/api');
            const url = await uploadImage(file);

            if (url) {
                setForm((prev) => ({
                    ...prev,
                    [cropModal.type === 'logo' ? 'logo_url' : 'cover_url']: url,
                }));
            }
        } catch (err) {
            console.error(err);
            alert('Failed to upload image');
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/businesses"
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                    <ArrowLeft size={20} className="text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">สร้างร้านใหม่</h1>
                    <p className="text-sm text-gray-400">กรอกข้อมูลพื้นฐานของร้าน</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Cover Image */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">ภาพปก</label>
                    <div
                        onClick={() => !form.cover_url && handleImageUpload('cover')}
                        className={`relative h-48 bg-white/5 border-2 border-dashed border-white/20 rounded-xl overflow-hidden transition-all group ${
                            form.cover_url ? '' : 'cursor-pointer hover:border-indigo-500/50'
                        }`}
                    >
                        {form.cover_url ? (
                            <>
                                <Image
                                    src={form.cover_url}
                                    alt="Cover"
                                    fill
                                    className="object-cover"
                                />
                                {/* Overlay with actions */}
                                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleImageUpload('cover');
                                        }}
                                        leftIcon={<Upload size={16} />}
                                    >
                                        เปลี่ยนภาพ
                                    </Button>
                                </div>
                                {/* ปุ่มลบ */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setForm((prev) => ({ ...prev, cover_url: '' }));
                                    }}
                                    className="absolute top-2 right-2 !p-1.5 bg-black/50 hover:!bg-red-500 rounded-full z-10"
                                >
                                    <X size={16} className="text-white" />
                                </Button>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 group-hover:text-indigo-400 transition-all">
                                <Upload size={32} className="mb-2" />
                                <span>อัพโหลดภาพปก</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Logo */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">โลโก้</label>
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => !form.logo_url && handleImageUpload('logo')}
                            className={`relative w-24 h-24 bg-white/5 border-2 border-dashed border-white/20 rounded-xl overflow-hidden transition-all group ${
                                form.logo_url ? '' : 'cursor-pointer hover:border-indigo-500/50'
                            }`}
                        >
                            {form.logo_url ? (
                                <>
                                    <Image
                                        src={form.logo_url}
                                        alt="Logo"
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Overlay with actions */}
                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleImageUpload('logo');
                                            }}
                                            className="!p-1.5"
                                        >
                                            <Upload size={14} />
                                        </Button>
                                    </div>
                                    {/* ปุ่มลบ */}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setForm((prev) => ({ ...prev, logo_url: '' }));
                                        }}
                                        className="absolute top-1 right-1 !p-1 bg-black/50 hover:!bg-red-500 rounded-full"
                                    >
                                        <X size={12} />
                                    </Button>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500 group-hover:text-indigo-400 transition-all">
                                    <Store size={24} />
                                </div>
                            )}
                        </div>
                        <span className="text-sm text-gray-500">แนะนำขนาด 256x256 px</span>
                    </div>
                </div>

                {/* Name */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Input
                        label="ชื่อร้าน (ไทย)"
                        value={form.name_th}
                        onChange={(e) => setForm((prev) => ({ ...prev, name_th: e.target.value }))}
                        placeholder="เช่น ร้านกาแฟสุขใจ"
                    />
                    <Input
                        label="ชื่อร้าน (อังกฤษ)"
                        value={form.name_en}
                        onChange={(e) => setForm((prev) => ({ ...prev, name_en: e.target.value }))}
                        placeholder="e.g. Happy Coffee Shop"
                    />
                </div>

                {/* Slug */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300 ml-1">
                        URL Slug (ไม่บังคับ)
                    </label>
                    <div className="flex items-center">
                        <span className="px-4 py-3 bg-white/10 border border-white/10 border-r-0 rounded-l-lg text-gray-500 text-sm">
                            yourapp.com/p/
                        </span>
                        <Input
                            value={form.slug}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                                }))
                            }
                            className="rounded-l-none"
                            placeholder="my-shop (ถ้าไม่ใส่จะ auto generate)"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">คำอธิบาย (ไทย)</label>
                        <textarea
                            value={form.desc_th}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, desc_th: e.target.value }))
                            }
                            rows={4}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                            placeholder="อธิบายเกี่ยวกับธุรกิจของคุณ..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            คำอธิบาย (อังกฤษ)
                        </label>
                        <textarea
                            value={form.desc_en}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, desc_en: e.target.value }))
                            }
                            rows={4}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                            placeholder="Describe your business..."
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/10">
                    <Button variant="ghost" onClick={() => router.push('/admin/businesses')}>
                        ยกเลิก
                    </Button>
                    <Button type="submit" isLoading={loading}>
                        สร้างร้าน
                    </Button>
                </div>
            </form>

            {/* Image Crop Modal */}
            <ImageCropModal
                isOpen={cropModal.isOpen}
                onClose={() => setCropModal((prev) => ({ ...prev, isOpen: false }))}
                imageSrc={cropModal.imageSrc}
                cropType={cropModal.type}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
}
