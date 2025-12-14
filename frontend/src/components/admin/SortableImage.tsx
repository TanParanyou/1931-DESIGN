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
            {...attributes}
            {...listeners}
            className="relative group w-32 h-24 rounded-lg overflow-hidden bg-white/5 border border-white/10 touch-manipulation cursor-grab active:cursor-grabbing"
        >
            <Image src={image.url} alt="" fill className="object-cover pointer-events-none" />
            {/* Mobile: แสดงปุ่มลบตลอด, Desktop: แสดงเมื่อ hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                {/* Drag indicator - มุมบนซ้าย */}
                <div className="absolute top-1 left-1 p-1 bg-black/40 rounded text-white/70">
                    <GripVertical size={14} />
                </div>
                {/* Delete button - มุมบนขวา */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(image.id);
                    }}
                    className="absolute top-1 right-1 p-1.5 bg-red-500/90 rounded-lg hover:bg-red-500 active:scale-95 transition-all"
                >
                    <X size={14} className="text-white" />
                </button>
            </div>
        </div>
    );
}

export default SortableImage;
