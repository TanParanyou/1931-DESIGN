import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock, Globe, MessageCircle, ExternalLink } from 'lucide-react';

// Types
interface Business {
    id: number;
    slug: string;
    name_th: string;
    name_en: string;
    desc_th: string;
    desc_en: string;
    logo_url: string;
    cover_url: string;
    status: string;
    is_active: boolean;
    contact?: {
        phone: string;
        email: string;
        line_id: string;
        facebook: string;
        instagram: string;
        website: string;
        address_th: string;
        address_en: string;
        map_lat: number;
        map_lng: number;
    };
    hours?: {
        day_of_week: number;
        open_time: string;
        close_time: string;
        is_closed: boolean;
    }[];
    services?: {
        id: number;
        name_th: string;
        name_en: string;
        desc_th: string;
        price: number;
        price_text: string;
        image_url: string;
        is_active: boolean;
    }[];
    gallery?: {
        id: number;
        image_url: string;
        caption: string;
    }[];
    page_config?: {
        theme_json: string;
        sections_json: string;
    };
}

// วันในสัปดาห์
const DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

// Fetch business data
async function getBusiness(slug: string): Promise<Business | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
        const res = await fetch(`${baseUrl}/businesses/${slug}`, {
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

// Generate metadata
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const business = await getBusiness(slug);

    if (!business) {
        return { title: 'Not Found' };
    }

    return {
        title: business.name_th || business.name_en,
        description: business.desc_th || business.desc_en,
        openGraph: {
            title: business.name_th || business.name_en,
            description: business.desc_th || business.desc_en,
            images: business.cover_url ? [business.cover_url] : [],
        },
    };
}

export default async function BusinessProfilePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const business = await getBusiness(slug);

    if (!business) {
        notFound();
    }

    // Parse theme
    let theme = { primary_color: '#3B82F6', secondary_color: '#1E40AF' };
    try {
        if (business.page_config?.theme_json) {
            theme = JSON.parse(business.page_config.theme_json);
        }
    } catch {
        // ใช้ default theme
    }

    // Parse sections
    let sections = [
        { type: 'hero', enabled: true, order: 1 },
        { type: 'about', enabled: true, order: 2 },
        { type: 'services', enabled: true, order: 3 },
        { type: 'gallery', enabled: true, order: 4 },
        { type: 'contact', enabled: true, order: 5 },
    ];
    try {
        if (business.page_config?.sections_json) {
            sections = JSON.parse(business.page_config.sections_json);
        }
    } catch {
        // ใช้ default sections
    }

    const enabledSections = sections.filter((s) => s.enabled).sort((a, b) => a.order - b.order);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
            {/* Dynamic CSS Variables */}
            <style>{`
                :root {
                    --primary-color: ${theme.primary_color};
                    --secondary-color: ${theme.secondary_color};
                }
            `}</style>

            {enabledSections.map((section) => {
                switch (section.type) {
                    case 'hero':
                        return <HeroSection key="hero" business={business} />;
                    case 'about':
                        return <AboutSection key="about" business={business} />;
                    case 'services':
                        return <ServicesSection key="services" business={business} />;
                    case 'gallery':
                        return <GallerySection key="gallery" business={business} />;
                    case 'contact':
                        return <ContactSection key="contact" business={business} />;
                    default:
                        return null;
                }
            })}

            {/* Footer */}
            <footer className="py-8 text-center text-gray-500 text-sm border-t border-white/5">
                <p>
                    © {new Date().getFullYear()} {business.name_th || business.name_en}
                </p>
            </footer>

            {/* Floating Contact Buttons */}
            <FloatingButtons business={business} />
        </div>
    );
}

// ========== Section Components ==========

function HeroSection({ business }: { business: Business }) {
    return (
        <section className="relative">
            {/* Cover Image */}
            <div className="relative h-64 md:h-80 lg:h-96">
                {business.cover_url ? (
                    <Image
                        src={business.cover_url}
                        alt={business.name_th || business.name_en}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative max-w-5xl mx-auto px-4 -mt-24 md:-mt-32">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                    {/* Logo */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-gray-900 bg-gray-800 shadow-2xl">
                        {business.logo_url ? (
                            <Image
                                src={business.logo_url}
                                alt="Logo"
                                width={160}
                                height={160}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/20">
                                {(business.name_th || business.name_en || 'B')[0]}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="text-center md:text-left pb-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            {business.name_th || business.name_en}
                        </h1>
                        {business.name_en && business.name_th && (
                            <p className="text-lg text-gray-400">{business.name_en}</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

function AboutSection({ business }: { business: Business }) {
    if (!business.desc_th && !business.desc_en) return null;

    return (
        <section className="py-16 max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-white mb-6">เกี่ยวกับเรา</h2>
            <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-line text-lg">
                    {business.desc_th || business.desc_en}
                </p>
            </div>
        </section>
    );
}

function ServicesSection({ business }: { business: Business }) {
    const services = business.services?.filter((s) => s.is_active) || [];
    if (services.length === 0) return null;

    return (
        <section className="py-16 bg-white/5">
            <div className="max-w-5xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-white mb-8">บริการของเรา</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
                        >
                            {service.image_url && (
                                <div className="relative h-48">
                                    <Image
                                        src={service.image_url}
                                        alt={service.name_th}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {service.name_th || service.name_en}
                                </h3>
                                {service.desc_th && (
                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                        {service.desc_th}
                                    </p>
                                )}
                                <div
                                    className="text-lg font-bold"
                                    style={{ color: 'var(--primary-color)' }}
                                >
                                    {service.price_text ||
                                        (service.price > 0
                                            ? `฿${service.price.toLocaleString()}`
                                            : 'สอบถามราคา')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function GallerySection({ business }: { business: Business }) {
    const gallery = business.gallery || [];
    if (gallery.length === 0) return null;

    return (
        <section className="py-16 max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-white mb-8">แกลเลอรี</h2>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {gallery.map((item) => (
                    <div
                        key={item.id}
                        className="relative aspect-square rounded-xl overflow-hidden group"
                    >
                        <Image
                            src={item.image_url}
                            alt={item.caption || 'Gallery image'}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {item.caption && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                <p className="text-white text-sm">{item.caption}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

function ContactSection({ business }: { business: Business }) {
    const contact = business.contact;
    const hours = business.hours?.sort((a, b) => a.day_of_week - b.day_of_week) || [];

    return (
        <section className="py-16 bg-white/5">
            <div className="max-w-5xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-white mb-8">ติดต่อเรา</h2>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Contact Info */}
                    <div className="space-y-4">
                        {contact?.phone && (
                            <a
                                href={`tel:${contact.phone}`}
                                className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                            >
                                <Phone className="text-green-400" size={24} />
                                <span className="text-white">{contact.phone}</span>
                            </a>
                        )}

                        {contact?.email && (
                            <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                            >
                                <Mail className="text-blue-400" size={24} />
                                <span className="text-white">{contact.email}</span>
                            </a>
                        )}

                        {contact?.line_id && (
                            <a
                                href={`https://line.me/ti/p/${contact.line_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                            >
                                <MessageCircle className="text-green-500" size={24} />
                                <span className="text-white">Line: {contact.line_id}</span>
                            </a>
                        )}

                        {contact?.address_th && (
                            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                                <MapPin className="text-red-400 mt-1" size={24} />
                                <span className="text-gray-300">{contact.address_th}</span>
                            </div>
                        )}
                    </div>

                    {/* Business Hours */}
                    {hours.length > 0 && (
                        <div className="p-6 bg-white/5 rounded-xl">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Clock size={20} />
                                เวลาทำการ
                            </h3>
                            <div className="space-y-2">
                                {hours.map((hour) => (
                                    <div
                                        key={hour.day_of_week}
                                        className="flex justify-between text-sm"
                                    >
                                        <span className="text-gray-400">
                                            {DAYS[hour.day_of_week]}
                                        </span>
                                        <span
                                            className={
                                                hour.is_closed ? 'text-red-400' : 'text-white'
                                            }
                                        >
                                            {hour.is_closed
                                                ? 'ปิด'
                                                : `${hour.open_time} - ${hour.close_time}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Social Links */}
                {(contact?.facebook || contact?.instagram || contact?.website) && (
                    <div className="flex gap-4 mt-8">
                        {contact.facebook && (
                            <a
                                href={contact.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all"
                            >
                                <ExternalLink size={16} />
                                Facebook
                            </a>
                        )}
                        {contact.instagram && (
                            <a
                                href={contact.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-pink-600/20 text-pink-400 rounded-lg hover:bg-pink-600/30 transition-all"
                            >
                                <ExternalLink size={16} />
                                Instagram
                            </a>
                        )}
                        {contact.website && (
                            <a
                                href={contact.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600/20 text-gray-400 rounded-lg hover:bg-gray-600/30 transition-all"
                            >
                                <Globe size={16} />
                                Website
                            </a>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

function FloatingButtons({ business }: { business: Business }) {
    const contact = business.contact;
    if (!contact?.phone && !contact?.line_id) return null;

    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
            {contact.line_id && (
                <a
                    href={`https://line.me/ti/p/${contact.line_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg shadow-green-500/30 transition-all hover:scale-110"
                >
                    <MessageCircle size={24} />
                </a>
            )}
            {contact.phone && (
                <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center justify-center w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-110"
                >
                    <Phone size={24} />
                </a>
            )}
        </div>
    );
}
