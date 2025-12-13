'use client';

import Image from 'next/image';
import { GripVertical, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface ImageItem {
    id: string;
    url: string;
    key: string;
    thumbnailUrl?: string;
    isExisting?: boolean;
}

interface SortableImageProps {
    image: ImageItem;
    onRemove: (id: string) => void;
}

export function SortableImage({ image, onRemove }: SortableImageProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: image.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group w-32 h-24 rounded-lg overflow-hidden bg-white/5 border border-white/10"
        >
            <Image src={image.url} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                    {...attributes}
                    {...listeners}
                    type="button"
                    className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 cursor-grab active:cursor-grabbing"
                >
                    <GripVertical size={16} className="text-white" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(image.id)}
                    className="p-1.5 bg-red-500/80 rounded-lg hover:bg-red-500"
                >
                    <X size={16} className="text-white" />
                </button>
            </div>
        </div>
    );
}

export default SortableImage;
