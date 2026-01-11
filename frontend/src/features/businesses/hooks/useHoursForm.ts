'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, UseFormReturn, useFieldArray, FieldArrayWithId } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { businessService, BusinessHour } from '@/services/business.service';

// Schema สำหรับเวลาทำการ
const businessHourItemSchema = z.object({
    id: z.number().optional(),
    business_id: z.number().optional(),
    day_of_week: z.number().min(0).max(6),
    open_time: z.string(),
    close_time: z.string(),
    is_closed: z.boolean(),
});

const businessHoursFormSchema = z.object({
    hours: z.array(businessHourItemSchema),
});

type BusinessHoursFormData = z.infer<typeof businessHoursFormSchema>;

// วันในสัปดาห์
export const DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'] as const;

// สร้าง default hours
const createDefaultHours = () =>
    DAYS.map((_, index) => ({
        day_of_week: index,
        open_time: '09:00',
        close_time: '18:00',
        is_closed: false,
    }));

interface UseHoursFormOptions {
    businessId: number;
    onSuccess?: () => void;
}

interface UseHoursFormReturn {
    form: UseFormReturn<BusinessHoursFormData>;
    fields: FieldArrayWithId<BusinessHoursFormData, 'hours', 'id'>[];
    loading: boolean;
    saving: boolean;
    handleSave: () => Promise<void>;
    fetchHours: () => Promise<void>;
    updateHour: (index: number, field: string, value: unknown) => void;
}

export function useHoursForm({ businessId, onSuccess }: UseHoursFormOptions): UseHoursFormReturn {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const form = useForm<BusinessHoursFormData>({
        resolver: zodResolver(businessHoursFormSchema),
        defaultValues: {
            hours: createDefaultHours(),
        },
    });

    const { fields, update } = useFieldArray({
        control: form.control,
        name: 'hours',
    });

    // โหลดข้อมูล hours
    const fetchHours = useCallback(async () => {
        setLoading(true);
        try {
            const data = await businessService.getBusinessById(businessId);
            if (data.hours && data.hours.length > 0) {
                const mergedHours = createDefaultHours().map((defaultHour) => {
                    const existingHour = data.hours?.find(
                        (h) => h.day_of_week === defaultHour.day_of_week
                    );
                    return existingHour
                        ? {
                              day_of_week: existingHour.day_of_week,
                              open_time: existingHour.open_time,
                              close_time: existingHour.close_time,
                              is_closed: existingHour.is_closed,
                          }
                        : defaultHour;
                });
                form.reset({ hours: mergedHours });
            }
        } catch (error) {
            console.error('Failed to load hours:', error);
        } finally {
            setLoading(false);
        }
    }, [businessId, form]);

    useEffect(() => {
        fetchHours();
    }, [fetchHours]);

    // อัพเดท field
    const updateHour = useCallback(
        (index: number, field: string, value: unknown) => {
            const currentHour = form.getValues(`hours.${index}`);
            update(index, { ...currentHour, [field]: value });
        },
        [form, update]
    );

    // บันทึก
    const handleSave = useCallback(async () => {
        const isValid = await form.trigger();
        if (!isValid) return;

        setSaving(true);
        try {
            const data = form.getValues();
            // Cast to BusinessHour[] for API
            await businessService.updateHours(businessId, data.hours as unknown as BusinessHour[]);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save hours:', error);
            alert('Failed to save hours');
        } finally {
            setSaving(false);
        }
    }, [businessId, form, onSuccess]);

    return {
        form,
        fields,
        loading,
        saving,
        handleSave,
        fetchHours,
        updateHour,
    };
}
