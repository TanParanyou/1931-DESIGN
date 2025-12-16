import { z } from 'zod';

// Schema สำหรับเวลาทำการแต่ละวัน
export const businessHourItemSchema = z.object({
    id: z.number().optional(),
    business_id: z.number().optional(),
    day_of_week: z.number().min(0).max(6),
    open_time: z.string().default('09:00'),
    close_time: z.string().default('18:00'),
    is_closed: z.boolean().default(false),
});

// Schema สำหรับเวลาทำการทั้งหมด
export const businessHoursSchema = z.object({
    hours: z.array(businessHourItemSchema),
});

export type BusinessHourItem = z.infer<typeof businessHourItemSchema>;
export type BusinessHoursFormData = z.infer<typeof businessHoursSchema>;

// วันในสัปดาห์
export const DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'] as const;

// สร้าง default hours สำหรับ 7 วัน
export const createDefaultHours = (): BusinessHourItem[] => {
    return DAYS.map((_, index) => ({
        day_of_week: index,
        open_time: '09:00',
        close_time: '18:00',
        is_closed: false,
    }));
};
