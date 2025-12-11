'use client';

import React, { useEffect, useState } from 'react';
import { rbacService } from '@/services/rbac';
import { Menu } from '@/types/rbac';
import MenuEditor from '@/components/admin/MenuEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Plus, Edit2, Trash2, List, X, Shield } from 'lucide-react';
import dynamic from 'next/dynamic';
import { LucideIcon, icons } from 'lucide-react';

const IconWrapper = ({ name }: { name: string }) => {
    // Dynamic icon rendering
    const validName = name as keyof typeof icons;
    const Icon = icons[validName] || Shield; // Default to Shield if invalid
    return <Icon size={20} />;
};

export default function MenusPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | undefined>(undefined);

    const fetchMenus = async () => {
        try {
            setLoading(true);
            const data = await rbacService.getAllMenus();
            setMenus(data.menus);
        } catch (error) {
            console.error('Failed to fetch menus', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    const handleCreate = () => {
        setEditingMenu(undefined);
        setIsEditorOpen(true);
    };

    const handleEdit = (menu: Menu) => {
        setEditingMenu(menu);
        setIsEditorOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this menu item?')) return;
        try {
            await rbacService.deleteMenu(id);
            fetchMenus();
        } catch (error) {
            alert('Failed to delete menu');
        }
    };

    const handleSave = async () => {
        setIsEditorOpen(false);
        fetchMenus();
    };

    return (
        <div className="p-6 md:p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-light text-white mb-2">Menu Management</h1>
                    <p className="text-white/50">Configure sidebar navigation</p>
                </div>
                <Button onClick={handleCreate} icon={<Plus size={18} />}>
                    Create Item
                </Button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/20 text-white/50 text-xs font-medium uppercase">
                        <tr>
                            <th className="p-4">Order</th>
                            <th className="p-4">Icon</th>
                            <th className="p-4">Title</th>
                            <th className="p-4">Path</th>
                            <th className="p-4">Permission</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {menus.map((menu) => (
                            <tr key={menu.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-white/50">{menu.order}</td>
                                <td className="p-4 text-purple-400">
                                    <IconWrapper name={menu.icon} />
                                </td>
                                <td className="p-4 text-white font-medium">{menu.title}</td>
                                <td className="p-4 text-white/50 font-mono text-sm">{menu.path}</td>
                                <td className="p-4">
                                    {menu.permission_slug ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400">
                                            {menu.permission_slug}
                                        </span>
                                    ) : (
                                        <span className="text-white/30 text-xs">-</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(menu)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(menu.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-white/70 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {menus.length === 0 && !loading && (
                    <div className="p-8 text-center text-white/30">No menu items found</div>
                )}
            </div>

            {/* Modal Overlay for Editor */}
            <AnimatePresence>
                {isEditorOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditorOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
                        >
                            <div
                                className="bg-[#111] w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl pointer-events-auto p-6 md:p-8"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-light text-white">
                                        {editingMenu ? 'Edit Menu Item' : 'Create Menu Item'}
                                    </h2>
                                    <button
                                        onClick={() => setIsEditorOpen(false)}
                                        className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <MenuEditor
                                    menu={editingMenu}
                                    onSave={handleSave}
                                    onCancel={() => setIsEditorOpen(false)}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
