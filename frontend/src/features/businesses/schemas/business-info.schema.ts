import { z } from 'zod';

// Schema สำหรับข้อมูลร้าน
export const businessInfoSchema = z.object({
    name_th: z.string().min(1, 'กรุณากรอกชื่อร้าน (ไทย)'),
    name_en: z.string().optional().default(''),
    slug: z
        .string()
        .min(1, 'กรุณากรอก URL Slug')
        .regex(/^[a-z0-9-]+$/, 'Slug ต้องเป็นตัวพิมพ์เล็ก ตัวเลข หรือ - เท่านั้น'),
    desc_th: z.string().optional().default(''),
    desc_en: z.string().optional().default(''),
    logo_url: z.string().optional().default(''),
    cover_url: z.string().optional().default(''),
});

export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;

// Default values
export const defaultBusinessInfoValues: BusinessInfoFormData = {
    name_th: '',
    name_en: '',
    slug: '',
    desc_th: '',
    desc_en: '',
    logo_url: '',
    cover_url: '',
};
