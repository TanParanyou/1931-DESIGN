'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    businessContactSchema,
    BusinessContactFormData,
    defaultBusinessContactValues,
} from '../schemas/business-contact.schema';
import { businessService } from '@/services/business.service';

interface UseContactFormOptions {
    businessId: number;
    onSuccess?: () => void;
}

interface UseContactFormReturn {
    form: UseFormReturn<BusinessContactFormData>;
    loading: boolean;
    saving: boolean;
    handleSave: () => Promise<void>;
    fetchContact: () => Promise<void>;
}

export function useContactForm({
    businessId,
    onSuccess,
}: UseContactFormOptions): UseContactFormReturn {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const form = useForm<BusinessContactFormData>({
        resolver: zodResolver(businessContactSchema),
        defaultValues: defaultBusinessContactValues,
    });

    // โหลดข้อมูล contact
    const fetchContact = useCallback(async () => {
        setLoading(true);
        try {
            const data = await businessService.getBusinessById(businessId);
            if (data.contact) {
                form.reset({
                    phone: data.contact.phone || '',
                    email: data.contact.email || '',
                    line_id: data.contact.line_id || '',
                    website: data.contact.website || '',
                    facebook: data.contact.facebook || '',
                    instagram: data.contact.instagram || '',
                    address_th: data.contact.address_th || '',
                });
            }
        } catch (error) {
            console.error('Failed to load contact:', error);
        } finally {
            setLoading(false);
        }
    }, [businessId, form]);

    useEffect(() => {
        fetchContact();
    }, [fetchContact]);

    // บันทึกข้อมูล
    const handleSave = useCallback(async () => {
        const isValid = await form.trigger();
        if (!isValid) return;

        setSaving(true);
        try {
            const data = form.getValues();
            await businessService.updateContact(businessId, data);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save contact:', error);
            alert('Failed to save contact');
        } finally {
            setSaving(false);
        }
    }, [businessId, form, onSuccess]);

    return {
        form,
        loading,
        saving,
        handleSave,
        fetchContact,
    };
}
