'use server';

import { ContactService } from '@/services/contact.service';

export type ContactFormState = {
    success: boolean;
    message: string;
    errors?: {
        name?: string[];
        email?: string[];
        subject?: string[];
        message?: string[];
    };
    inputs?: {
        name: string;
        email: string;
        subject: string;
        message: string;
    };
};

export async function sendContactEmail(
    prevState: ContactFormState,
    formData: FormData
): Promise<ContactFormState> {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    // Basic validation
    const errors: ContactFormState['errors'] = {};
    if (!name || name.trim() === '') errors.name = ['Name is required'];
    if (!email || email.trim() === '') errors.email = ['Email is required'];
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = ['Invalid email address'];
    if (!subject || subject.trim() === '') errors.subject = ['Subject is required'];
    if (!message || message.trim() === '') errors.message = ['Message is required'];

    if (Object.keys(errors).length > 0) {
        return {
            success: false,
            message: 'Validation failed',
            errors,
            inputs: { name, email, subject, message },
        };
    }

    try {
        await ContactService.submit({ name, email, subject, message });
        return {
            success: true,
            message: 'Message sent successfully!',
            inputs: { name: '', email: '', subject: '', message: '' },
        };
    } catch (error) {
        console.error('Failed to submit contact:', error);
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to send message. Please try again.';
        return {
            success: false,
            message: errorMessage,
            inputs: { name, email, subject, message },
        };
    }
}
