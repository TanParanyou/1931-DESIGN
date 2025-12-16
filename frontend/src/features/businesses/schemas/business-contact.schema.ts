import { z } from 'zod';

// Schema สำหรับข้อมูลติดต่อ
export const businessContactSchema = z.object({
    phone: z.string().optional().default(''),
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
    line_id: z.string().optional().default(''),
    website: z.string().url('รูปแบบ URL ไม่ถูกต้อง').optional().or(z.literal('')),
    facebook: z.string().url('รูปแบบ URL ไม่ถูกต้อง').optional().or(z.literal('')),
    instagram: z.string().url('รูปแบบ URL ไม่ถูกต้อง').optional().or(z.literal('')),
    address_th: z.string().optional().default(''),
});

export type BusinessContactFormData = z.infer<typeof businessContactSchema>;

// Default values
export const defaultBusinessContactValues: BusinessContactFormData = {
    phone: '',
    email: '',
    line_id: '',
    website: '',
    facebook: '',
    instagram: '',
    address_th: '',
};
