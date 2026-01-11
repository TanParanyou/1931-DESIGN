'use client';

import { UseFormReturn } from 'react-hook-form';
import { Phone, Mail, MessageCircle, Globe, Facebook, Instagram, MapPin, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BusinessContactFormData } from '../types';

interface BusinessContactFormProps {
    form: UseFormReturn<BusinessContactFormData>;
    saving: boolean;
    onSave: () => Promise<void>;
}

export function BusinessContactForm({ form, saving, onSave }: BusinessContactFormProps) {
    const {
        register,
        formState: { errors },
    } = form;

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="grid gap-6 md:grid-cols-2">
                <Input
                    label="เบอร์โทรศัพท์"
                    icon={Phone}
                    {...register('phone')}
                    error={errors.phone?.message}
                    placeholder="08x-xxx-xxxx"
                />
                <Input
                    label="อีเมล"
                    icon={Mail}
                    {...register('email')}
                    error={errors.email?.message}
                    placeholder="contact@example.com"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Input
                    label="Line ID"
                    icon={MessageCircle}
                    {...register('line_id')}
                    error={errors.line_id?.message}
                    placeholder="@lineid"
                />
                <Input
                    label="เว็บไซต์"
                    icon={Globe}
                    {...register('website')}
                    error={errors.website?.message}
                    placeholder="https://example.com"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Input
                    label="Facebook"
                    icon={Facebook}
                    {...register('facebook')}
                    error={errors.facebook?.message}
                    placeholder="https://facebook.com/page"
                />
                <Input
                    label="Instagram"
                    icon={Instagram}
                    {...register('instagram')}
                    error={errors.instagram?.message}
                    placeholder="https://instagram.com/page"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <MapPin size={14} /> ที่อยู่ (ไทย)
                </label>
                <textarea
                    {...register('address_th')}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                    placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                />
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={onSave} isLoading={saving}>
                    <Save size={16} className="mr-2" />
                    บันทึก
                </Button>
            </div>
        </div>
    );
}
