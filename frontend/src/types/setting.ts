export interface Setting {
    id: number;
    key: string;
    value: string;
    type: 'text' | 'textarea' | 'boolean' | 'number' | 'image';
    description: string;
    group: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface UpdateSettingInput {
    key: string;
    value: string;
    is_public?: boolean;
}
