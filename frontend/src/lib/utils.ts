import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Extract error message from API errors (supports Axios errors and standard errors)
 */
export function getErrorMessage(error: unknown): string {
    // Check for Axios-like error with response.data.message
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError?.response?.data?.message) {
        return axiosError.response.data.message;
    }

    // Check for standard Error object
    if (error instanceof Error) {
        return error.message;
    }

    // Fallback for unknown error types
    return 'An unexpected error occurred';
}

/**
 * แปลง base64 string เป็น Blob (หลีกเลี่ยง CSP error จาก fetch data URL)
 */
export function base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Blob {
    const base64Data = base64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

/**
 * แปลง base64 เป็น File แล้วอัพโหลดไป server
 */
export async function uploadCroppedImage(
    base64Image: string,
    fileName: string = 'image.jpg'
): Promise<string | null> {
    try {
        const blob = base64ToBlob(base64Image);
        const file = new File([blob], fileName, { type: 'image/jpeg' });

        const { uploadImage } = await import('@/lib/api');
        return await uploadImage(file);
    } catch (error) {
        console.error('Failed to upload cropped image:', error);
        return null;
    }
}
