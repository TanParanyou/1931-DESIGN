'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Save, X } from 'lucide-react';
import { Loading } from '@/components/ui/Loading';
import { projectService } from '@/services/project.service';
import { Category, CreateCategoryInput } from '@/types/project';
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
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCategoryRow({
    category,
    onEdit,
    onDelete,
}: {
    category: Category;
    onEdit: (cat: Category) => void;
    onDelete: (id: number) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: category.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style} className="border-b border-white/5 hover:bg-white/5">
            <td className="px-4 py-3">
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 text-gray-400 hover:text-white cursor-grab active:cursor-grabbing"
                >
                    <GripVertical size={18} />
                </button>
            </td>
            <td className="px-4 py-3 text-white">{category.name}</td>
            <td className="px-4 py-3 text-gray-400">{category.slug}</td>
            <td className="px-4 py-3">
                <span
                    className={`px-2 py-0.5 rounded text-xs ${category.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}
                >
                    {category.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => onEdit(category)}
                        className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(category.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default function CategoriesPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CreateCategoryInput>({
        name: '',
        slug: '',
        is_active: true,
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const loadCategories = useCallback(async () => {
        try {
            const cats = await projectService.getAllCategories();
            setCategories(cats);
        } catch (err) {
            console.error('Failed to load categories:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = categories.findIndex((c) => c.id === active.id);
            const newIndex = categories.findIndex((c) => c.id === over.id);
            const newOrder = arrayMove(categories, oldIndex, newIndex);
            setCategories(newOrder);

            // Save new order to backend
            try {
                await projectService.updateCategoryOrder(
                    newOrder.map((cat, idx) => ({ id: cat.id, sort_order: idx + 1 }))
                );
            } catch (err) {
                console.error('Failed to save order:', err);
                loadCategories(); // Reload original order
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        setSaving(true);
        try {
            if (editingCategory) {
                await projectService.updateCategory(editingCategory.id, formData);
            } else {
                await projectService.createCategory(formData);
            }
            setShowForm(false);
            setEditingCategory(null);
            setFormData({ name: '', slug: '', is_active: true });
            loadCategories();
        } catch (err: any) {
            alert('Failed to save: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (cat: Category) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, slug: cat.slug, is_active: cat.is_active });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await projectService.deleteCategory(id);
            loadCategories();
        } catch (err: any) {
            alert('Failed to delete: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCategory(null);
        setFormData({ name: '', slug: '', is_active: true });
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <Loading variant="orbit" size="lg" text="กำลังโหลด..." />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        Category Management
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Manage project categories. Drag to reorder.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={18} />
                    <span>Add Category</span>
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-white">
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button
                                onClick={handleCancel}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                                    placeholder="Category name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Slug (optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) =>
                                        setFormData({ ...formData, slug: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50"
                                    placeholder="auto-generated if empty"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="cat_active"
                                    checked={formData.is_active}
                                    onChange={(e) =>
                                        setFormData({ ...formData, is_active: e.target.checked })
                                    }
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500"
                                />
                                <label htmlFor="cat_active" className="text-sm text-gray-300">
                                    Active
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 border border-white/10 rounded-xl text-gray-300 hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl disabled:opacity-50"
                                >
                                    {saving ? (
                                        <Loading variant="dots" size="sm" />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    <span>Save</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Categories Table */}
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase w-12"></th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                    Slug
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <SortableContext
                                items={categories.map((c) => c.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {categories.map((cat) => (
                                    <SortableCategoryRow
                                        key={cat.id}
                                        category={cat}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </SortableContext>
                        </tbody>
                    </table>
                </DndContext>

                {categories.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        No categories yet. Click &quot;Add Category&quot; to create one.
                    </div>
                )}
            </div>
        </div>
    );
}
