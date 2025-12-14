'use client';

import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableImage, ImageItem } from './SortableImage';
import { projectService } from '@/services/project.service';
import { UploadResult } from '@/types/project';

interface ImageUploadGridProps {
    images: ImageItem[];
    onImagesChange: (images: ImageItem[]) => void;
}

export function ImageUploadGrid({ images, onImagesChange }: ImageUploadGridProps) {
    const [uploading, setUploading] = useState(false);

    // PointerSensor สำหรับ desktop, TouchSensor สำหรับ mobile พร้อม delay เพื่อแยกจาก scroll
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = images.findIndex((i) => i.id === active.id);
            const newIndex = images.findIndex((i) => i.id === over.id);
            onImagesChange(arrayMove(images, oldIndex, newIndex));
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;

        setUploading(true);
        try {
            const uploadedImages: ImageItem[] = [];
            for (const file of Array.from(files)) {
                const result: UploadResult = await projectService.uploadImage(file);
                uploadedImages.push({
                    id: result.key,
                    url: result.url,
                    key: result.key,
                    thumbnailUrl: result.thumbnail_url,
                    isExisting: false,
                });
            }
            onImagesChange([...images, ...uploadedImages]);
        } catch (err) {
            const errMessage = err instanceof Error ? err.message : 'Unknown error';
            alert('Failed to upload image: ' + errMessage);
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleRemoveImage = async (id: string) => {
        const image = images.find((i) => i.id === id);
        // Only delete from R2 if it's a newly uploaded image (not existing)
        if (image && !image.isExisting) {
            try {
                await projectService.deleteImage(image.key);
            } catch (err) {
                console.error('Failed to delete from R2:', err);
            }
        }
        onImagesChange(images.filter((i) => i.id !== id));
    };

    return (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Project Images</h2>
            <p className="text-sm text-gray-400 mb-4">
                Drag and drop to reorder images. First image will be the cover.
            </p>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
                    <div className="flex flex-wrap gap-3 mb-4">
                        {images.map((image) => (
                            <SortableImage
                                key={image.id}
                                image={image}
                                onRemove={handleRemoveImage}
                            />
                        ))}

                        {/* Upload Button */}
                        <label className="w-32 h-24 rounded-lg border-2 border-dashed border-white/20 hover:border-indigo-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                            {uploading ? (
                                <Loader2 size={24} className="text-gray-400 animate-spin" />
                            ) : (
                                <>
                                    <Upload size={24} className="text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-400">Upload</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                        </label>
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}

export default ImageUploadGrid;
