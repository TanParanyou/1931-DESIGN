import api from '@/lib/api';

// ========== Types ==========

export interface Business {
    id: number;
    user_id: number;
    slug: string;
    name_th: string;
    name_en: string;
    desc_th: string;
    desc_en: string;
    logo_url: string;
    cover_url: string;
    cover_pos_x: number; // ตำแหน่ง X ของภาพปก (0-100%)
    cover_pos_y: number; // ตำแหน่ง Y ของภาพปก (0-100%)
    status: 'draft' | 'published';
    is_active: boolean;
    created_at: string;
    updated_at: string;
    contact?: BusinessContact;
    hours?: BusinessHour[];
    services?: Service[];
    gallery?: GalleryItem[];
    page_config?: PageConfig;
}

export interface BusinessContact {
    id: number;
    business_id: number;
    phone: string;
    email: string;
    line_id: string;
    facebook: string;
    instagram: string;
    website: string;
    map_lat: number;
    map_lng: number;
    address_th: string;
    address_en: string;
}

export interface BusinessHour {
    id: number;
    business_id: number;
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
}

export interface ServiceCategory {
    id: number;
    business_id: number;
    name_th: string;
    name_en: string;
    sort_order: number;
    is_active: boolean;
}

export interface Service {
    id: number;
    business_id: number;
    category_id?: number;
    name_th: string;
    name_en: string;
    desc_th: string;
    desc_en: string;
    price: number;
    price_text: string;
    duration_min: number;
    image_url: string;
    sort_order: number;
    is_active: boolean;
    category?: ServiceCategory;
}

export interface GalleryItem {
    id: number;
    business_id: number;
    image_url: string;
    caption: string;
    sort_order: number;
}

export interface PageConfig {
    id: number;
    business_id: number;
    theme_json: string;
    sections_json: string;
    seo_json: string;
}

export interface Theme {
    primary_color: string;
    secondary_color: string;
    font_family: string;
    layout_type: string;
}

export interface Section {
    type: string;
    enabled: boolean;
    order: number;
}

export interface SEO {
    title: string;
    description: string;
    og_image: string;
    keywords: string;
}

// ========== Business API ==========

export const businessService = {
    // ดึงรายการร้านของ user
    getMyBusinesses: async (): Promise<Business[]> => {
        const response = await api.get('/admin/businesses');
        return response.data;
    },

    // ดึงข้อมูลร้านตาม ID
    getBusinessById: async (id: number): Promise<Business> => {
        const response = await api.get(`/admin/businesses/${id}`);
        return response.data;
    },

    // ดึงข้อมูลร้าน public ตาม slug
    getBusinessBySlug: async (slug: string): Promise<Business> => {
        const response = await api.get(`/businesses/${slug}`);
        return response.data;
    },

    // สร้างร้านใหม่
    createBusiness: async (data: Partial<Business>): Promise<Business> => {
        const response = await api.post('/admin/businesses', data);
        return response.data;
    },

    // อัพเดทข้อมูลร้าน
    updateBusiness: async (id: number, data: Partial<Business>): Promise<Business> => {
        const response = await api.put(`/admin/businesses/${id}`, data);
        return response.data;
    },

    // เปลี่ยนสถานะ draft/published
    updateStatus: async (id: number, status: 'draft' | 'published'): Promise<Business> => {
        const response = await api.put(`/admin/businesses/${id}/status`, { status });
        return response.data;
    },

    // ลบร้าน
    deleteBusiness: async (id: number): Promise<void> => {
        await api.delete(`/admin/businesses/${id}`);
    },

    // ========== Contact ==========
    updateContact: async (
        businessId: number,
        data: Partial<BusinessContact>
    ): Promise<BusinessContact> => {
        const response = await api.put(`/admin/businesses/${businessId}/contact`, data);
        return response.data;
    },

    // ========== Hours ==========
    updateHours: async (businessId: number, data: BusinessHour[]): Promise<BusinessHour[]> => {
        const response = await api.put(`/admin/businesses/${businessId}/hours`, data);
        return response.data;
    },

    // ========== Service Categories ==========
    getServiceCategories: async (businessId: number): Promise<ServiceCategory[]> => {
        const response = await api.get(`/admin/businesses/${businessId}/service-categories`);
        return response.data;
    },

    createServiceCategory: async (
        businessId: number,
        data: Partial<ServiceCategory>
    ): Promise<ServiceCategory> => {
        const response = await api.post(`/admin/businesses/${businessId}/service-categories`, data);
        return response.data;
    },

    updateServiceCategory: async (
        businessId: number,
        id: number,
        data: Partial<ServiceCategory>
    ): Promise<ServiceCategory> => {
        const response = await api.put(
            `/admin/businesses/${businessId}/service-categories/${id}`,
            data
        );
        return response.data;
    },

    deleteServiceCategory: async (businessId: number, id: number): Promise<void> => {
        await api.delete(`/admin/businesses/${businessId}/service-categories/${id}`);
    },

    // ========== Services ==========
    getServices: async (businessId: number): Promise<Service[]> => {
        const response = await api.get(`/admin/businesses/${businessId}/services`);
        return response.data;
    },

    createService: async (businessId: number, data: Partial<Service>): Promise<Service> => {
        const response = await api.post(`/admin/businesses/${businessId}/services`, data);
        return response.data;
    },

    updateService: async (
        businessId: number,
        id: number,
        data: Partial<Service>
    ): Promise<Service> => {
        const response = await api.put(`/admin/businesses/${businessId}/services/${id}`, data);
        return response.data;
    },

    deleteService: async (businessId: number, id: number): Promise<void> => {
        await api.delete(`/admin/businesses/${businessId}/services/${id}`);
    },

    // ========== Gallery ==========
    getGallery: async (businessId: number): Promise<GalleryItem[]> => {
        const response = await api.get(`/admin/businesses/${businessId}/gallery`);
        return response.data;
    },

    addGalleryImage: async (
        businessId: number,
        data: Partial<GalleryItem>
    ): Promise<GalleryItem> => {
        const response = await api.post(`/admin/businesses/${businessId}/gallery`, data);
        return response.data;
    },

    updateGalleryImage: async (
        businessId: number,
        id: number,
        data: Partial<GalleryItem>
    ): Promise<GalleryItem> => {
        const response = await api.put(`/admin/businesses/${businessId}/gallery/${id}`, data);
        return response.data;
    },

    deleteGalleryImage: async (businessId: number, id: number): Promise<void> => {
        await api.delete(`/admin/businesses/${businessId}/gallery/${id}`);
    },

    updateGalleryOrder: async (
        businessId: number,
        data: { id: number; sort_order: number }[]
    ): Promise<void> => {
        await api.put(`/admin/businesses/${businessId}/gallery/order`, data);
    },

    // ========== Page Config ==========
    getPageConfig: async (businessId: number): Promise<PageConfig> => {
        const response = await api.get(`/admin/businesses/${businessId}/page-config`);
        return response.data;
    },

    updatePageConfig: async (
        businessId: number,
        data: Partial<PageConfig>
    ): Promise<PageConfig> => {
        const response = await api.put(`/admin/businesses/${businessId}/page-config`, data);
        return response.data;
    },

    updateTheme: async (businessId: number, themeJSON: string): Promise<PageConfig> => {
        const response = await api.put(`/admin/businesses/${businessId}/page-config/theme`, {
            theme_json: themeJSON,
        });
        return response.data;
    },

    updateSections: async (businessId: number, sectionsJSON: string): Promise<PageConfig> => {
        const response = await api.put(`/admin/businesses/${businessId}/page-config/sections`, {
            sections_json: sectionsJSON,
        });
        return response.data;
    },

    updateSEO: async (businessId: number, seoJSON: string): Promise<PageConfig> => {
        const response = await api.put(`/admin/businesses/${businessId}/page-config/seo`, {
            seo_json: seoJSON,
        });
        return response.data;
    },
};

export default businessService;
