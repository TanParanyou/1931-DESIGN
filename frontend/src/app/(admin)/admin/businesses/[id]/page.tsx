'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Store,
    Phone,
    Clock,
    List,
    Settings,
    Globe,
    Palette,
    Layout,
    Image as ImageIcon,
} from 'lucide-react';
import { PageLoading } from '@/components/ui/Loading';
import {
    BusinessInfoForm,
    BusinessContactForm,
    BusinessHoursForm,
    useBusinessForm,
    useContactForm,
    useHoursForm,
    BusinessTabType,
} from '@/features/businesses';
import { useState, useEffect } from 'react';
import { businessService, Business } from '@/services/business.service';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditBusinessPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const businessId = parseInt(id);

    const [activeTab, setActiveTab] = useState<BusinessTabType>('info');
    const [business, setBusiness] = useState<Business | null>(null);
    const [pageLoading, setPageLoading] = useState(true);

    // Fetch business สำหรับ header info
    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const data = await businessService.getBusinessById(businessId);
                setBusiness(data);
            } catch (error) {
                console.error('Failed to load business:', error);
                router.push('/admin/businesses');
            } finally {
                setPageLoading(false);
            }
        };
        fetchBusiness();
    }, [businessId, router]);

    // Form hooks
    const businessForm = useBusinessForm({
        businessId,
        onSuccess: () => alert('บันทึกข้อมูลเรียบร้อย'),
    });

    const contactForm = useContactForm({
        businessId,
        onSuccess: () => alert('บันทึกข้อมูลติดต่อเรียบร้อย'),
    });

    const hoursForm = useHoursForm({
        businessId,
        onSuccess: () => alert('บันทึกเวลาทำการเรียบร้อย'),
    });

    if (pageLoading) return <PageLoading text="กำลังโหลดข้อมูลร้าน..." />;
    if (!business) return null;

    const tabs = [
        { id: 'info' as BusinessTabType, label: 'ข้อมูลร้าน', icon: Store },
        { id: 'contact' as BusinessTabType, label: 'ติดต่อ', icon: Phone },
        { id: 'hours' as BusinessTabType, label: 'เวลาทำการ', icon: Clock },
        { id: 'services' as BusinessTabType, label: 'บริการ', icon: List },
        { id: 'gallery' as BusinessTabType, label: 'แกลเลอรี', icon: ImageIcon },
        { id: 'page-config' as BusinessTabType, label: 'ตั้งค่าหน้า', icon: Palette },
    ];

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="bg-white/5 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin/businesses"
                                className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            >
                                <ArrowLeft size={20} className="text-gray-400" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    {business.name_th || business.name_en}
                                </h1>
                                <p className="text-sm text-gray-400">/{business.slug}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {business.status === 'published' && (
                                <Link
                                    href={`/p/${business.slug}`}
                                    target="_blank"
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-all text-sm"
                                >
                                    <Globe size={16} />
                                    <span>ดูหน้าร้าน</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-4 overflow-x-auto pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm ${
                                    activeTab === tab.id
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <tab.icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* Info Tab */}
                {activeTab === 'info' && (
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
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                    <BusinessContactForm
                        form={contactForm.form}
                        saving={contactForm.saving}
                        onSave={contactForm.handleSave}
                    />
                )}

                {/* Hours Tab */}
                {activeTab === 'hours' && (
                    <BusinessHoursForm
                        fields={hoursForm.fields}
                        saving={hoursForm.saving}
                        onSave={hoursForm.handleSave}
                        onUpdateHour={hoursForm.updateHour}
                    />
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                    <div className="text-center py-16">
                        <List size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">จัดการบริการ</h3>
                        <p className="text-gray-500 mb-4">เพิ่ม แก้ไข หรือลบบริการของร้าน</p>
                        <Link
                            href={`/admin/businesses/${businessId}/services`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all"
                        >
                            <Settings size={18} />
                            <span>จัดการบริการ</span>
                        </Link>
                    </div>
                )}

                {/* Gallery Tab */}
                {activeTab === 'gallery' && (
                    <div className="text-center py-16">
                        <ImageIcon size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">จัดการแกลเลอรี</h3>
                        <p className="text-gray-500 mb-4">อัพโหลดและจัดลำดับรูปภาพผลงาน</p>
                        <Link
                            href={`/admin/businesses/${businessId}/gallery`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all"
                        >
                            <Settings size={18} />
                            <span>จัดการแกลเลอรี</span>
                        </Link>
                    </div>
                )}

                {/* Page Config Tab */}
                {activeTab === 'page-config' && (
                    <div className="text-center py-16">
                        <Layout size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">
                            ตั้งค่าหน้าเว็บ
                        </h3>
                        <p className="text-gray-500 mb-4">ปรับแต่ง theme, sections และ SEO</p>
                        <Link
                            href={`/admin/businesses/${businessId}/page-builder`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all"
                        >
                            <Palette size={18} />
                            <span>Page Builder</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
