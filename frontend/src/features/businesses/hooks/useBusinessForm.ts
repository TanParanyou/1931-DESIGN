'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    businessInfoSchema,
    BusinessInfoFormData,
    defaultBusinessInfoValues,
} from '../schemas/business-info.schema';
import { CropModalState } from '../types';
import { uploadCroppedImage } from '@/lib/utils';
import { businessService } from '@/services/business.service';

interface UseBusinessFormOptions {
    businessId?: number;
    onSuccess?: () => void;
}

interface UseBusinessFormReturn {
    form: UseFormReturn<BusinessInfoFormData>;
    loading: boolean;
    saving: boolean;
    cropModal: CropModalState;
    setCropModal: React.Dispatch<React.SetStateAction<CropModalState>>;
    handleImageUpload: (type: 'cover' | 'logo') => void;
    handleCropComplete: (croppedImage: string) => Promise<void>;
    handleSave: () => Promise<void>;
    fetchBusiness: () => Promise<void>;
}

export function useBusinessForm({
    businessId,
    onSuccess,
}: UseBusinessFormOptions = {}): UseBusinessFormReturn {
    const [loading, setLoading] = useState(!!businessId);
    const [saving, setSaving] = useState(false);
    const [cropModal, setCropModal] = useState<CropModalState>({
        isOpen: false,
        imageSrc: '',
        type: 'cover',
    });

    const form = useForm<BusinessInfoFormData>({
        resolver: zodResolver(businessInfoSchema),
        defaultValues: defaultBusinessInfoValues,
    });

    // โหลดข้อมูล business (สำหรับ edit mode)
    const fetchBusiness = useCallback(async () => {
        if (!businessId) return;

        setLoading(true);
        try {
            const data = await businessService.getBusinessById(businessId);
            form.reset({
                name_th: data.name_th || '',
                name_en: data.name_en || '',
                slug: data.slug || '',
                desc_th: data.desc_th || '',
                desc_en: data.desc_en || '',
                logo_url: data.logo_url || '',
                cover_url: data.cover_url || '',
            });
        } catch (error) {
            console.error('Failed to load business:', error);
        } finally {
            setLoading(false);
        }
    }, [businessId, form]);

    useEffect(() => {
        fetchBusiness();
    }, [fetchBusiness]);

    // เปิด file picker แล้วแสดง crop modal
    const handleImageUpload = useCallback((type: 'cover' | 'logo') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const objectUrl = URL.createObjectURL(file);
            setCropModal({
                isOpen: true,
                imageSrc: objectUrl,
                type,
            });
        };
        input.click();
    }, []);

    // หลังจาก crop เสร็จ - อัพโหลดภาพ
    const handleCropComplete = useCallback(
        async (croppedImage: string) => {
            const fileName = `${cropModal.type}_image.jpg`;
            const url = await uploadCroppedImage(croppedImage, fileName);

            if (url) {
                const fieldName = cropModal.type === 'logo' ? 'logo_url' : 'cover_url';
                form.setValue(fieldName, url, { shouldDirty: true });
            }
        },
        [cropModal.type, form]
    );

    // บันทึกข้อมูล
    const handleSave = useCallback(async () => {
        const isValid = await form.trigger();
        if (!isValid) return;

        setSaving(true);
        try {
            const data = form.getValues();

            if (businessId) {
                await businessService.updateBusiness(businessId, data);
            } else {
                await businessService.createBusiness(data);
            }

            onSuccess?.();
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Failed to save');
        } finally {
            setSaving(false);
        }
    }, [businessId, form, onSuccess]);

    return {
        form,
        loading,
        saving,
        cropModal,
        setCropModal,
        handleImageUpload,
        handleCropComplete,
        handleSave,
        fetchBusiness,
    };
}
