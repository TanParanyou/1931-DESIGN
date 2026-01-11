'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BusinessInfoForm, useBusinessForm } from '@/features/businesses';

export default function CreateBusinessPage() {
    const router = useRouter();

    const businessForm = useBusinessForm({
        onSuccess: () => {
            alert('สร้างร้านค้าเรียบร้อย');
            router.push('/admin/businesses');
        },
    });

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
                    <p className="text-gray-400 text-sm">กรอกข้อมูลพื้นฐานของร้าน</p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <BusinessInfoForm
                    form={businessForm.form}
                    saving={businessForm.saving}
                    cropModal={businessForm.cropModal}
                    onCloseCropModal={() =>
                        businessForm.setCropModal((prev) => ({ ...prev, isOpen: false }))
                    }
                    onImageUpload={businessForm.handleImageUpload}
                    onCropComplete={businessForm.handleCropComplete}
                    onSave={businessForm.handleSave}
                />
            </div>
        </div>
    );
}
