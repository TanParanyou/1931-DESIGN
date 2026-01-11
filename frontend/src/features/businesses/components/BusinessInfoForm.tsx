'use client';

import Image from 'next/image';
import { UseFormReturn } from 'react-hook-form';
import { Upload, X, Store, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageCropModal } from '@/components/ui/ImageCropModal';
import { BusinessInfoFormData, CropModalState } from '../types';

interface BusinessInfoFormProps {
    form: UseFormReturn<BusinessInfoFormData>;
    saving: boolean;
    cropModal: CropModalState;
    onCloseCropModal: () => void;
    onImageUpload: (type: 'cover' | 'logo') => void;
    onCropComplete: (croppedImage: string) => Promise<void>;
    onSave: () => Promise<void>;
}

export function BusinessInfoForm({
    form,
    saving,
    cropModal,
    onCloseCropModal,
    onImageUpload,
    onCropComplete,
    onSave,
}: BusinessInfoFormProps) {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = form;

    const coverUrl = watch('cover_url');
    const logoUrl = watch('logo_url');

    return (
        <div className="space-y-6">
            {/* Cover Image */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">ภาพปก</label>
                <div
                    onClick={() => !coverUrl && onImageUpload('cover')}
                    className={`relative h-48 bg-white/5 border-2 border-dashed border-white/20 rounded-xl overflow-hidden transition-all group ${
                        coverUrl ? '' : 'cursor-pointer hover:border-indigo-500/50'
                    }`}
                >
                    {coverUrl ? (
                        <>
                            <Image src={coverUrl} alt="Cover" fill className="object-cover" />
                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onImageUpload('cover');
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
                                    setValue('cover_url', '');
                                }}
                                className="absolute top-2 right-2 p-1.5! bg-black/50 hover:bg-red-500! rounded-full z-10"
                            >
                                <X size={16} className="text-white" />
                            </Button>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 group-hover:text-indigo-400">
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
                        onClick={() => !logoUrl && onImageUpload('logo')}
                        className={`relative w-24 h-24 bg-white/5 border-2 border-dashed border-white/20 rounded-xl overflow-hidden transition-all group ${
                            logoUrl ? '' : 'cursor-pointer hover:border-indigo-500/50'
                        }`}
                    >
                        {logoUrl ? (
                            <>
                                <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                                {/* Overlay with actions */}
                                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onImageUpload('logo');
                                        }}
                                        className="p-1.5!"
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
                                        setValue('logo_url', '');
                                    }}
                                    className="absolute top-1 right-1 p-1! bg-black/50 hover:bg-red-500! rounded-full"
                                >
                                    <X size={12} />
                                </Button>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 group-hover:text-indigo-400">
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
                    {...register('name_th')}
                    error={errors.name_th?.message}
                    placeholder="เช่น ร้านกาแฟสุขใจ"
                />
                <Input
                    label="ชื่อร้าน (อังกฤษ)"
                    {...register('name_en')}
                    error={errors.name_en?.message}
                    placeholder="e.g. Happy Coffee Shop"
                />
            </div>

            {/* Slug */}
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300 ml-1">URL Slug</label>
                <div className="flex items-center">
                    <span className="px-4 py-3 bg-white/10 border border-white/10 border-r-0 rounded-l-lg text-gray-500 text-sm">
                        yourapp.com/p/
                    </span>
                    <Input
                        {...register('slug')}
                        className="rounded-l-none"
                        placeholder="my-shop"
                        onChange={(e) => {
                            const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                            setValue('slug', value);
                        }}
                    />
                </div>
                {errors.slug && <p className="text-sm text-red-400 ml-1">{errors.slug.message}</p>}
            </div>

            {/* Description */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">คำอธิบาย (ไทย)</label>
                    <textarea
                        {...register('desc_th')}
                        rows={4}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                        placeholder="อธิบายเกี่ยวกับธุรกิจของคุณ..."
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">คำอธิบาย (อังกฤษ)</label>
                    <textarea
                        {...register('desc_en')}
                        rows={4}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                        placeholder="Describe your business..."
                    />
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <Button onClick={onSave} isLoading={saving}>
                    <Save size={16} className="mr-2" />
                    บันทึก
                </Button>
            </div>

            {/* Crop Modal */}
            <ImageCropModal
                isOpen={cropModal.isOpen}
                onClose={onCloseCropModal}
                imageSrc={cropModal.imageSrc}
                cropType={cropModal.type}
                onCropComplete={onCropComplete}
            />
        </div>
    );
}
