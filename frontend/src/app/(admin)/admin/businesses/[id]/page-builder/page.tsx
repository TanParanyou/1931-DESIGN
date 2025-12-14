'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Palette, Layout, Search, Eye, GripVertical } from 'lucide-react';
import { PageLoading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { businessService, Business, Theme, Section, SEO } from '@/services/business.service';

interface PageProps {
    params: Promise<{ id: string }>;
}

// Preset themes
const THEME_PRESETS = [
    { name: 'Modern Blue', primary: '#3B82F6', secondary: '#1E40AF' },
    { name: 'Emerald', primary: '#10B981', secondary: '#047857' },
    { name: 'Purple', primary: '#8B5CF6', secondary: '#6D28D9' },
    { name: 'Rose', primary: '#F43F5E', secondary: '#BE123C' },
    { name: 'Orange', primary: '#F97316', secondary: '#C2410C' },
    { name: 'Dark', primary: '#374151', secondary: '#1F2937' },
];

// Section types
const SECTION_TYPES = [
    { type: 'hero', label: 'Hero / หน้าปก' },
    { type: 'about', label: 'About / เกี่ยวกับ' },
    { type: 'services', label: 'Services / บริการ' },
    { type: 'gallery', label: 'Gallery / แกลเลอรี' },
    { type: 'contact', label: 'Contact / ติดต่อ' },
];

type TabType = 'theme' | 'sections' | 'seo';

export default function PageBuilderPage({ params }: PageProps) {
    const { id } = use(params);
    const businessId = parseInt(id);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('theme');
    const [business, setBusiness] = useState<Business | null>(null);

    // Form states
    const [theme, setTheme] = useState<Theme>({
        primary_color: '#3B82F6',
        secondary_color: '#1E40AF',
        font_family: 'Inter',
        layout_type: 'modern',
    });
    const [sections, setSections] = useState<Section[]>([]);
    const [seo, setSeo] = useState<SEO>({
        title: '',
        description: '',
        og_image: '',
        keywords: '',
    });

    useEffect(() => {
        fetchData();
    }, [businessId]);

    const fetchData = async () => {
        try {
            const biz = await businessService.getBusinessById(businessId);
            setBusiness(biz);

            if (biz.page_config) {
                try {
                    if (biz.page_config.theme_json) {
                        setTheme(JSON.parse(biz.page_config.theme_json));
                    }
                    if (biz.page_config.sections_json) {
                        setSections(JSON.parse(biz.page_config.sections_json));
                    }
                    if (biz.page_config.seo_json) {
                        setSeo(JSON.parse(biz.page_config.seo_json));
                    }
                } catch {
                    // ใช้ default values
                }
            }

            // Init default sections if empty
            if (sections.length === 0) {
                setSections([
                    { type: 'hero', enabled: true, order: 1 },
                    { type: 'about', enabled: true, order: 2 },
                    { type: 'services', enabled: true, order: 3 },
                    { type: 'gallery', enabled: true, order: 4 },
                    { type: 'contact', enabled: true, order: 5 },
                ]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTheme = async () => {
        setSaving(true);
        try {
            await businessService.updateTheme(businessId, JSON.stringify(theme));
            alert('บันทึก Theme เรียบร้อย');
        } catch (err) {
            console.error(err);
            alert('Failed to save theme');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSections = async () => {
        setSaving(true);
        try {
            await businessService.updateSections(businessId, JSON.stringify(sections));
            alert('บันทึก Sections เรียบร้อย');
        } catch (err) {
            console.error(err);
            alert('Failed to save sections');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSEO = async () => {
        setSaving(true);
        try {
            await businessService.updateSEO(businessId, JSON.stringify(seo));
            alert('บันทึก SEO เรียบร้อย');
        } catch (err) {
            console.error(err);
            alert('Failed to save SEO');
        } finally {
            setSaving(false);
        }
    };

    const toggleSection = (type: string) => {
        setSections((prev) =>
            prev.map((s) => (s.type === type ? { ...s, enabled: !s.enabled } : s))
        );
    };

    if (loading) return <PageLoading text="กำลังโหลด Page Builder..." />;
    if (!business) return null;

    const tabs = [
        { id: 'theme' as TabType, label: 'Theme', icon: Palette },
        { id: 'sections' as TabType, label: 'Sections', icon: Layout },
        { id: 'seo' as TabType, label: 'SEO', icon: Search },
    ];

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="bg-white/5 border-b border-white/10">
                <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/admin/businesses/${businessId}`}
                                className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            >
                                <ArrowLeft size={20} className="text-gray-400" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">Page Builder</h1>
                                <p className="text-sm text-gray-400">
                                    {business.name_th || business.name_en}
                                </p>
                            </div>
                        </div>
                        {business.status === 'published' && (
                            <Link
                                href={`/p/${business.slug}`}
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-all text-sm"
                            >
                                <Eye size={16} />
                                <span>Preview</span>
                            </Link>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm ${
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
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
                {/* Theme Tab */}
                {activeTab === 'theme' && (
                    <div className="space-y-8">
                        {/* Preset Themes */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Theme Presets</h3>
                            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                                {THEME_PRESETS.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() =>
                                            setTheme({
                                                ...theme,
                                                primary_color: preset.primary,
                                                secondary_color: preset.secondary,
                                            })
                                        }
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            theme.primary_color === preset.primary
                                                ? 'border-white/50'
                                                : 'border-white/10 hover:border-white/30'
                                        }`}
                                    >
                                        <div className="flex gap-2 mb-2">
                                            <div
                                                className="w-6 h-6 rounded-full"
                                                style={{ backgroundColor: preset.primary }}
                                            />
                                            <div
                                                className="w-6 h-6 rounded-full"
                                                style={{ backgroundColor: preset.secondary }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-400">{preset.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Colors */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">
                                    Primary Color
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        value={theme.primary_color}
                                        onChange={(e) =>
                                            setTheme({ ...theme, primary_color: e.target.value })
                                        }
                                        className="w-12 h-12 rounded-lg cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={theme.primary_color}
                                        onChange={(e) =>
                                            setTheme({ ...theme, primary_color: e.target.value })
                                        }
                                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">
                                    Secondary Color
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        value={theme.secondary_color}
                                        onChange={(e) =>
                                            setTheme({ ...theme, secondary_color: e.target.value })
                                        }
                                        className="w-12 h-12 rounded-lg cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={theme.secondary_color}
                                        onChange={(e) =>
                                            setTheme({ ...theme, secondary_color: e.target.value })
                                        }
                                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div
                            className="p-6 rounded-xl"
                            style={{
                                background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})`,
                            }}
                        >
                            <h4 className="text-2xl font-bold text-white mb-2">Preview</h4>
                            <p className="text-white/80">นี่คือตัวอย่างสีที่คุณเลือก</p>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleSaveTheme} isLoading={saving}>
                                <Save size={16} className="mr-2" />
                                บันทึก Theme
                            </Button>
                        </div>
                    </div>
                )}

                {/* Sections Tab */}
                {activeTab === 'sections' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white">
                            Section Order & Visibility
                        </h3>
                        <p className="text-gray-400">เปิด/ปิด และลากเพื่อเปลี่ยนลำดับ sections</p>

                        <div className="space-y-3">
                            {sections
                                .sort((a, b) => a.order - b.order)
                                .map((section) => {
                                    const sectionInfo = SECTION_TYPES.find(
                                        (s) => s.type === section.type
                                    );
                                    return (
                                        <div
                                            key={section.type}
                                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                                section.enabled
                                                    ? 'bg-white/5 border-white/20'
                                                    : 'bg-white/2 border-white/5 opacity-50'
                                            }`}
                                        >
                                            <GripVertical
                                                size={20}
                                                className="text-gray-600 cursor-grab"
                                            />
                                            <div className="flex-1">
                                                <span className="text-white font-medium">
                                                    {sectionInfo?.label || section.type}
                                                </span>
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={section.enabled}
                                                    onChange={() => toggleSection(section.type)}
                                                    className="w-5 h-5 rounded"
                                                />
                                                <span className="text-sm text-gray-400">
                                                    {section.enabled ? 'เปิด' : 'ปิด'}
                                                </span>
                                            </label>
                                        </div>
                                    );
                                })}
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleSaveSections} isLoading={saving}>
                                <Save size={16} className="mr-2" />
                                บันทึก Sections
                            </Button>
                        </div>
                    </div>
                )}

                {/* SEO Tab */}
                {activeTab === 'seo' && (
                    <div className="space-y-6 max-w-2xl">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Title</label>
                            <input
                                type="text"
                                value={seo.title}
                                onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                                placeholder={business.name_th || business.name_en}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Description</label>
                            <textarea
                                value={seo.description}
                                onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                                placeholder={business.desc_th || business.desc_en}
                                rows={3}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">
                                Keywords (comma separated)
                            </label>
                            <input
                                type="text"
                                value={seo.keywords}
                                onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                                placeholder="ร้านกาแฟ, คาเฟ่, กรุงเทพ"
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">
                                OG Image URL
                            </label>
                            <input
                                type="url"
                                value={seo.og_image}
                                onChange={(e) => setSeo({ ...seo, og_image: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                            />
                        </div>

                        {/* SEO Preview */}
                        <div className="p-4 bg-white rounded-xl">
                            <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                                {seo.title || business.name_th || business.name_en}
                            </div>
                            <div className="text-green-700 text-sm">
                                yoursite.com/p/{business.slug}
                            </div>
                            <div className="text-gray-600 text-sm line-clamp-2">
                                {seo.description ||
                                    business.desc_th ||
                                    business.desc_en ||
                                    'ไม่มีคำอธิบาย'}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleSaveSEO} isLoading={saving}>
                                <Save size={16} className="mr-2" />
                                บันทึก SEO
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
