// Re-export schemas
export * from '../schemas/business-info.schema';
export * from '../schemas/business-contact.schema';

// Tab types
export type BusinessTabType = 'info' | 'contact' | 'hours' | 'services' | 'gallery' | 'page-config';

// Crop Modal types
export interface CropModalState {
    isOpen: boolean;
    imageSrc: string;
    type: 'cover' | 'logo';
}
