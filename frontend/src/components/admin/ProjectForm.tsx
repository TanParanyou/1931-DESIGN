'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Save,
    MapPin,
    User,
    FolderKanban,
    FileText,
    Activity,
    ExternalLink,
} from 'lucide-react';
import { projectService } from '@/services/project.service';
import { getErrorMessage } from '@/lib/utils';
import { Category, CreateProjectInput, UpdateProjectInput } from '@/types/project';
import { ImageUploadGrid } from './ImageUploadGrid';
import { ImageItem } from './SortableImage';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';

interface ProjectFormData {
    title: string;
    location: string;
    location_map_link: string;
    owner: string;
    category: string;
    description: string;
    status: string;
    is_active: boolean;
}

interface ProjectFormProps {
    initialData?: ProjectFormData;
    isEdit?: boolean;
    projectId?: number;
}

const defaultFormData: ProjectFormData = {
    title: '',
    location: '',
    location_map_link: '',
    owner: '',
    category: '',
    description: '',
    status: 'In Progress',
    is_active: true,
};

const statusOptions = [
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'On Hold', label: 'On Hold' },
];

export default function ProjectForm({ initialData, isEdit = false, projectId }: ProjectFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [images, setImages] = useState<ImageItem[]>([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState<ProjectFormData>(initialData || defaultFormData);

    useEffect(() => {
        const loadData = async () => {
            try {
                const cats = await projectService.getAllCategories();
                setCategories(cats);

                if (isEdit && projectId) {
                    const project = await projectService.getProject(projectId);
                    setFormData({
                        title: project.title || '',
                        location: project.location || '',
                        location_map_link: project.location_map_link || '',
                        owner: project.owner || '',
                        category: project.category || '',
                        description: project.description || '',
                        status: project.status || 'In Progress',
                        is_active: project.is_active ?? true,
                    });
                    if (project.images?.length) {
                        setImages(
                            project.images.map((url: string, idx: number) => ({
                                id: `existing-${idx}`,
                                url,
                                key: url,
                                isExisting: true,
                            }))
                        );
                    }
                }
            } catch (err) {
                console.error('Failed to load data:', err);
                setMessage({ type: 'error', text: 'Failed to load data' });
                if (isEdit) {
                    setTimeout(() => router.push('/admin/projects'), 1500);
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [isEdit, projectId, router]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { id, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.category) {
            setMessage({
                type: 'error',
                text: 'Please fill in required fields (Title and Category)',
            });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const projectData = {
                ...formData,
                images: images.map((img) => img.url),
            };

            if (isEdit && projectId) {
                await projectService.updateProject(projectId, projectData as UpdateProjectInput);
                setMessage({ type: 'success', text: 'Project updated successfully' });
            } else {
                await projectService.createProject(projectData as CreateProjectInput);
                setMessage({ type: 'success', text: 'Project created successfully' });
            }
            setTimeout(() => router.push('/admin/projects'), 1000);
        } catch (err) {
            setMessage({
                type: 'error',
                text: `Failed to ${isEdit ? 'update' : 'create'} project: ${getErrorMessage(err)}`,
            });
        } finally {
            setSaving(false);
        }
    };

    const categoryOptions = categories.map((cat) => ({
        value: cat.name,
        label: cat.name,
    }));

    if (loading) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin/projects"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Projects</span>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {isEdit ? 'Edit Project' : 'Create New Project'}
                </h1>
            </div>

            {/* Form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                {message.text && (
                    <div
                        className={`mb-6 p-4 rounded-lg text-sm ${
                            message.type === 'success'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <FolderKanban size={20} className="text-indigo-400" />
                        Project Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            id="title"
                            label="Title *"
                            value={formData.title}
                            onChange={handleChange}
                            icon={FileText}
                            placeholder="Project title"
                            required
                        />

                        <Select
                            id="category"
                            label="Category *"
                            value={formData.category}
                            onChange={handleChange}
                            icon={FolderKanban}
                            options={categoryOptions}
                            placeholder="Select category"
                        />

                        <Input
                            id="location"
                            label="Location"
                            value={formData.location}
                            onChange={handleChange}
                            icon={MapPin}
                            placeholder="Project location"
                        />

                        <Input
                            id="owner"
                            label="Owner"
                            value={formData.owner}
                            onChange={handleChange}
                            icon={User}
                            placeholder="Project owner"
                        />

                        <Select
                            id="status"
                            label="Status"
                            value={formData.status}
                            onChange={handleChange}
                            icon={Activity}
                            options={statusOptions}
                        />

                        <Input
                            id="location_map_link"
                            label="Map Link"
                            value={formData.location_map_link}
                            onChange={handleChange}
                            icon={ExternalLink}
                            placeholder="Google Maps link"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300 ml-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-black/20 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                            placeholder="Project description"
                        />
                    </div>

                    <Checkbox
                        id="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        label="Active (visible on public site)"
                    />

                    <div className="h-px bg-white/10 my-6" />

                    {/* Images Section */}
                    <ImageUploadGrid images={images} onImagesChange={setImages} />

                    <div className="h-px bg-white/10 my-6" />

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Link href="/admin/projects">
                            <Button type="button" variant="ghost">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" isLoading={saving} icon={<Save size={18} />}>
                            {isEdit ? 'Save Changes' : 'Create Project'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
