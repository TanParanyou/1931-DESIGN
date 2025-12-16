'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft,
    Save,
    Store,
    Upload,
    X,
    Phone,
    Mail,
    MapPin,
    Clock,
    Globe,
    Facebook,
    Instagram,
    MessageCircle,
    Palette,
    Layout,
    Image as ImageIcon,
    List,
    Settings,
} from 'lucide-react';
import { PageLoading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { ImageCropModal, CropType } from '@/components/ui/ImageCropModal';
import {
    businessService,
    Business,
    BusinessContact,
    BusinessHour,
} from '@/services/business.service';

// วันในสัปดาห์
const DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

// Tab types
type TabType = 'info' | 'contact' | 'hours' | 'services' | 'gallery' | 'page-config';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditBusinessPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const businessId = parseInt(id);

    const [activeTab, setActiveTab] = useState<TabType>('info');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [business, setBusiness] = useState<Business | null>(null);

    const [infoForm, setInfoForm] = useState({
        name_th: '',
        name_en: '',
        desc_th: '',
        desc_en: '',
        slug: '',
        logo_url: '',
        cover_url: '',
    });

    const [contactForm, setContactForm] = useState<Partial<BusinessContact>>({});
    const [hoursForm, setHoursForm] = useState<BusinessHour[]>([]);

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

    useEffect(() => {
        fetchBusiness();
    }, [businessId]);

    const fetchBusiness = async () => {
        try {
            const data = await businessService.getBusinessById(businessId);
            setBusiness(data);

            // Set form data
            setInfoForm({
                name_th: data.name_th || '',
                name_en: data.name_en || '',
                desc_th: data.desc_th || '',
                desc_en: data.desc_en || '',
                slug: data.slug || '',
                logo_url: data.logo_url || '',
                cover_url: data.cover_url || '',
            });

            setContactForm(data.contact || {});
            setHoursForm(data.hours || []);
        } catch (err) {
            console.error(err);
            alert('Failed to load business');
            router.push('/admin/businesses');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveInfo = async () => {
        setSaving(true);
        try {
            await businessService.updateBusiness(businessId, infoForm);
            alert('บันทึกข้อมูลเรียบร้อย');
            fetchBusiness();
        } catch (err) {
            console.error(err);
            alert('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveContact = async () => {
        setSaving(true);
        try {
            await businessService.updateContact(businessId, contactForm);
            alert('บันทึกข้อมูลติดต่อเรียบร้อย');
            fetchBusiness();
        } catch (err) {
            console.error(err);
            alert('Failed to save contact');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveHours = async () => {
        setSaving(true);
        try {
            await businessService.updateHours(businessId, hoursForm);
            alert('บันทึกเวลาทำการเรียบร้อย');
            fetchBusiness();
        } catch (err) {
            console.error(err);
            alert('Failed to save hours');
        } finally {
            setSaving(false);
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
                setInfoForm((prev) => ({
                    ...prev,
                    [cropModal.type === 'logo' ? 'logo_url' : 'cover_url']: url,
                }));
            }
        } catch (err) {
            console.error(err);
            alert('Failed to upload image');
        }
    };

    if (loading) return <PageLoading text="กำลังโหลดข้อมูลร้าน..." />;
    if (!business) return null;

    const tabs = [
        { id: 'info' as TabType, label: 'ข้อมูลร้าน', icon: Store },
        { id: 'contact' as TabType, label: 'ติดต่อ', icon: Phone },
        { id: 'hours' as TabType, label: 'เวลาทำการ', icon: Clock },
        { id: 'services' as TabType, label: 'บริการ', icon: List },
        { id: 'gallery' as TabType, label: 'แกลเลอรี', icon: ImageIcon },
        { id: 'page-config' as TabType, label: 'ตั้งค่าหน้า', icon: Palette },
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
                    <div className="space-y-6">
                        {/* Cover Image */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">ภาพปก</label>
                            <div
                                onClick={() => !infoForm.cover_url && handleImageUpload('cover')}
                                className={`relative h-48 bg-white/5 border-2 border-dashed border-white/20 rounded-xl overflow-hidden transition-all group ${
                                    infoForm.cover_url
                                        ? ''
                                        : 'cursor-pointer hover:border-indigo-500/50'
                                }`}
                            >
                                {infoForm.cover_url ? (
                                    <>
                                        <Image
                                            src={infoForm.cover_url}
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
                                                setInfoForm((prev) => ({ ...prev, cover_url: '' }));
                                            }}
                                            className="absolute top-2 right-2 !p-1.5 bg-black/50 hover:!bg-red-500 rounded-full z-10"
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
                                    onClick={() => !infoForm.logo_url && handleImageUpload('logo')}
                                    className={`relative w-24 h-24 bg-white/5 border-2 border-dashed border-white/20 rounded-xl overflow-hidden transition-all group ${
                                        infoForm.logo_url
                                            ? ''
                                            : 'cursor-pointer hover:border-indigo-500/50'
                                    }`}
                                >
                                    {infoForm.logo_url ? (
                                        <>
                                            <Image
                                                src={infoForm.logo_url}
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
                                                    setInfoForm((prev) => ({
                                                        ...prev,
                                                        logo_url: '',
                                                    }));
                                                }}
                                                className="absolute top-1 right-1 !p-1 bg-black/50 hover:!bg-red-500 rounded-full"
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

                        {/* Name & Description */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">
                                    ชื่อร้าน (ไทย)
                                </label>
                                <input
                                    type="text"
                                    value={infoForm.name_th}
                                    onChange={(e) =>
                                        setInfoForm((prev) => ({
                                            ...prev,
                                            name_th: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">
                                    ชื่อร้าน (อังกฤษ)
                                </label>
                                <input
                                    type="text"
                                    value={infoForm.name_en}
                                    onChange={(e) =>
                                        setInfoForm((prev) => ({
                                            ...prev,
                                            name_en: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">URL Slug</label>
                            <input
                                type="text"
                                value={infoForm.slug}
                                onChange={(e) =>
                                    setInfoForm((prev) => ({
                                        ...prev,
                                        slug: e.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z0-9-]/g, '-'),
                                    }))
                                }
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">
                                    คำอธิบาย (ไทย)
                                </label>
                                <textarea
                                    value={infoForm.desc_th}
                                    onChange={(e) =>
                                        setInfoForm((prev) => ({
                                            ...prev,
                                            desc_th: e.target.value,
                                        }))
                                    }
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">
                                    คำอธิบาย (อังกฤษ)
                                </label>
                                <textarea
                                    value={infoForm.desc_en}
                                    onChange={(e) =>
                                        setInfoForm((prev) => ({
                                            ...prev,
                                            desc_en: e.target.value,
                                        }))
                                    }
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSaveInfo} isLoading={saving}>
                                <Save size={16} className="mr-2" />
                                บันทึก
                            </Button>
                        </div>
                    </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                    <div className="space-y-6 max-w-2xl">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Phone size={14} /> เบอร์โทรศัพท์
                                </label>
                                <input
                                    type="text"
                                    value={contactForm.phone || ''}
                                    onChange={(e) =>
                                        setContactForm((prev) => ({
                                            ...prev,
                                            phone: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                                    placeholder="08x-xxx-xxxx"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Mail size={14} /> อีเมล
                                </label>
                                <input
                                    type="email"
                                    value={contactForm.email || ''}
                                    onChange={(e) =>
                                        setContactForm((prev) => ({
                                            ...prev,
                                            email: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <MessageCircle size={14} /> Line ID
                                </label>
                                <input
                                    type="text"
                                    value={contactForm.line_id || ''}
                                    onChange={(e) =>
                                        setContactForm((prev) => ({
                                            ...prev,
                                            line_id: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Globe size={14} /> เว็บไซต์
                                </label>
                                <input
                                    type="url"
                                    value={contactForm.website || ''}
                                    onChange={(e) =>
                                        setContactForm((prev) => ({
                                            ...prev,
                                            website: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Facebook size={14} /> Facebook
                                </label>
                                <input
                                    type="url"
                                    value={contactForm.facebook || ''}
                                    onChange={(e) =>
                                        setContactForm((prev) => ({
                                            ...prev,
                                            facebook: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Instagram size={14} /> Instagram
                                </label>
                                <input
                                    type="url"
                                    value={contactForm.instagram || ''}
                                    onChange={(e) =>
                                        setContactForm((prev) => ({
                                            ...prev,
                                            instagram: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <MapPin size={14} /> ที่อยู่ (ไทย)
                            </label>
                            <textarea
                                value={contactForm.address_th || ''}
                                onChange={(e) =>
                                    setContactForm((prev) => ({
                                        ...prev,
                                        address_th: e.target.value,
                                    }))
                                }
                                rows={3}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSaveContact} isLoading={saving}>
                                <Save size={16} className="mr-2" />
                                บันทึก
                            </Button>
                        </div>
                    </div>
                )}

                {/* Hours Tab */}
                {activeTab === 'hours' && (
                    <div className="space-y-6 max-w-2xl">
                        <div className="space-y-3">
                            {DAYS.map((day, index) => {
                                const hour = hoursForm.find((h) => h.day_of_week === index) || {
                                    day_of_week: index,
                                    open_time: '09:00',
                                    close_time: '18:00',
                                    is_closed: false,
                                };

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl"
                                    >
                                        <div className="w-24 font-medium text-white">{day}</div>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={hour.is_closed}
                                                onChange={(e) => {
                                                    const newHours = [...hoursForm];
                                                    const idx = newHours.findIndex(
                                                        (h) => h.day_of_week === index
                                                    );
                                                    if (idx >= 0) {
                                                        newHours[idx] = {
                                                            ...newHours[idx],
                                                            is_closed: e.target.checked,
                                                        };
                                                    } else {
                                                        newHours.push({
                                                            ...hour,
                                                            is_closed: e.target.checked,
                                                        } as BusinessHour);
                                                    }
                                                    setHoursForm(newHours);
                                                }}
                                                className="w-4 h-4 rounded"
                                            />
                                            <span className="text-sm text-gray-400">ปิด</span>
                                        </label>
                                        {!hour.is_closed && (
                                            <>
                                                <input
                                                    type="time"
                                                    value={hour.open_time}
                                                    onChange={(e) => {
                                                        const newHours = [...hoursForm];
                                                        const idx = newHours.findIndex(
                                                            (h) => h.day_of_week === index
                                                        );
                                                        if (idx >= 0) {
                                                            newHours[idx] = {
                                                                ...newHours[idx],
                                                                open_time: e.target.value,
                                                            };
                                                        } else {
                                                            newHours.push({
                                                                ...hour,
                                                                open_time: e.target.value,
                                                            } as BusinessHour);
                                                        }
                                                        setHoursForm(newHours);
                                                    }}
                                                    className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg text-white text-sm"
                                                />
                                                <span className="text-gray-500">-</span>
                                                <input
                                                    type="time"
                                                    value={hour.close_time}
                                                    onChange={(e) => {
                                                        const newHours = [...hoursForm];
                                                        const idx = newHours.findIndex(
                                                            (h) => h.day_of_week === index
                                                        );
                                                        if (idx >= 0) {
                                                            newHours[idx] = {
                                                                ...newHours[idx],
                                                                close_time: e.target.value,
                                                            };
                                                        } else {
                                                            newHours.push({
                                                                ...hour,
                                                                close_time: e.target.value,
                                                            } as BusinessHour);
                                                        }
                                                        setHoursForm(newHours);
                                                    }}
                                                    className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg text-white text-sm"
                                                />
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSaveHours} isLoading={saving}>
                                <Save size={16} className="mr-2" />
                                บันทึก
                            </Button>
                        </div>
                    </div>
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
