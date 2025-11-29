'use server'

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
}

export async function sendContactEmail(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

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
            inputs: { name, email, subject, message }
        };
    }

    // TODO: Integrate with an email service (e.g., Resend, Nodemailer, SendGrid)
    // Example with Resend:
    // await resend.emails.send({ ... })

    console.log('Sending email:', { name, email, subject, message });

    return {
        success: true,
        message: 'Message sent successfully!',
        inputs: { name: '', email: '', subject: '', message: '' } // Clear inputs on success
    };
}
