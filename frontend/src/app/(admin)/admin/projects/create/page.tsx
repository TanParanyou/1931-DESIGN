'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Upload, X, GripVertical, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { projectService } from '@/services/project.service';
import { Category, CreateProjectInput, UploadResult } from '@/types/project';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageItem {
    id: string;
    url: string;
    key: string;
    thumbnailUrl?: string;
}

function SortableImage({ image, onRemove }: { image: ImageItem; onRemove: (id: string) => void }) {
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
                    className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 cursor-grab active:cursor-grabbing"
                >
                    <GripVertical size={16} className="text-white" />
                </button>
                <button
                    onClick={() => onRemove(image.id)}
                    className="p-1.5 bg-red-500/80 rounded-lg hover:bg-red-500"
                >
                    <X size={16} className="text-white" />
                </button>
            </div>
        </div>
    );
}

export default function CreateProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [images, setImages] = useState<ImageItem[]>([]);
    const [formData, setFormData] = useState<CreateProjectInput>({
        title: '',
        location: '',
        location_map_link: '',
        owner: '',
        category: '',
        images: [],
        description: '',
        status: 'In Progress',
        is_active: true,
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        projectService.getCategories().then(setCategories).catch(console.error);
    }, []);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setImages((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const result: UploadResult = await projectService.uploadImage(file);
                setImages((prev) => [
                    ...prev,
                    {
                        id: result.key,
                        url: result.url,
                        key: result.key,
                        thumbnailUrl: result.thumbnail_url,
                    },
                ]);
            }
        } catch (err: any) {
            alert('Failed to upload image: ' + (err.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async (id: string) => {
        const image = images.find((i) => i.id === id);
        if (image) {
            try {
                await projectService.deleteImage(image.key);
            } catch (err) {
                console.error('Failed to delete image from server:', err);
            }
        }
        setImages((prev) => prev.filter((i) => i.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.category) {
            alert('Please fill in required fields');
            return;
        }

        setLoading(true);
        try {
            const projectData: CreateProjectInput = {
                ...formData,
                images: images.map((img) => img.url),
            };
            await projectService.createProject(projectData);
            router.push('/admin/projects');
        } catch (err: any) {
            alert('Failed to create project: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/admin/projects"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Projects</span>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Create New Project</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Title <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                                placeholder="Project title"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Category <span className="text-red-400">*</span>
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({ ...formData, category: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                                required
                            >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) =>
                                    setFormData({ ...formData, location: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                                placeholder="Project location"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Owner
                            </label>
                            <input
                                type="text"
                                value={formData.owner}
                                onChange={(e) =>
                                    setFormData({ ...formData, owner: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                                placeholder="Project owner"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                            >
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Map Link
                            </label>
                            <input
                                type="url"
                                value={formData.location_map_link}
                                onChange={(e) =>
                                    setFormData({ ...formData, location_map_link: e.target.value })
                                }
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                                placeholder="Google Maps link"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={4}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                            placeholder="Project description"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) =>
                                setFormData({ ...formData, is_active: e.target.checked })
                            }
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-300">
                            Active (visible on public site)
                        </label>
                    </div>
                </div>

                {/* Images */}
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
                        <SortableContext
                            items={images.map((i) => i.id)}
                            strategy={horizontalListSortingStrategy}
                        >
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

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Link
                        href="/admin/projects"
                        className="px-6 py-2.5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        <span>Create Project</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
