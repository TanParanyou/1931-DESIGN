'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { rbacService } from '@/services/rbac';
import { Menu } from '@/types/rbac';
import MenuEditor from '@/components/admin/MenuEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Shield, ChevronDown, FolderOpen } from 'lucide-react';
import { icons } from 'lucide-react';
import { Loading } from '@/components/ui/Loading';

const IconWrapper = ({ name }: { name: string }) => {
    const validName = name as keyof typeof icons;
    const Icon = icons[validName] || Shield;
    return <Icon size={20} />;
};

// Component สำหรับแสดง Menu Item
function MenuItemRow({
    menu,
    isChild = false,
    onEdit,
    onDelete,
    onAddChild,
}: {
    menu: Menu;
    isChild?: boolean;
    onEdit: (menu: Menu) => void;
    onDelete: (id: number) => void;
    onAddChild?: (parentId: number) => void;
}) {
    const isGroup = menu.path === '#';

    return (
        <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg transition-colors ${
                isChild
                    ? 'bg-white/3 hover:bg-white/5 ml-4 sm:ml-6 border-l-2 border-purple-500/30'
                    : 'bg-white/5 hover:bg-white/10'
            }`}
        >
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-white/30 text-sm w-6 text-center shrink-0">{menu.order}</span>
                <span className={`shrink-0 ${isGroup ? 'text-yellow-400' : 'text-purple-400'}`}>
                    <IconWrapper name={menu.icon || 'Menu'} />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium truncate">{menu.title}</span>
                        {isGroup && (
                            <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/10 text-yellow-400 shrink-0">
                                Group
                            </span>
                        )}
                    </div>
                    {!isGroup && (
                        <span className="text-white/40 text-xs sm:text-sm font-mono truncate block">
                            {menu.path}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-9 sm:ml-0">
                {menu.permission_slug && (
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-400 truncate max-w-[120px]">
                        {menu.permission_slug}
                    </span>
                )}
                {isGroup && onAddChild && (
                    <button
                        onClick={() => onAddChild(menu.id)}
                        className="p-2 hover:bg-green-500/10 rounded-lg text-white/50 hover:text-green-400 transition-colors"
                        title="Add sub-menu"
                    >
                        <Plus size={16} />
                    </button>
                )}
                <button
                    onClick={() => onEdit(menu)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                >
                    <Edit2 size={16} />
                </button>
                <button
                    onClick={() => onDelete(menu.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-white/50 hover:text-red-400 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

// Component สำหรับแสดง Menu Group พร้อม Children
function MenuGroup({
    group,
    childMenus,
    onEdit,
    onDelete,
    onAddChild,
}: {
    group: Menu;
    childMenus: Menu[];
    onEdit: (menu: Menu) => void;
    onDelete: (id: number) => void;
    onAddChild: (parentId: number) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="rounded-xl border border-white/10 overflow-hidden">
            {/* Group Header */}
            <div
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-transparent cursor-pointer hover:from-purple-500/20"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: isExpanded ? 0 : -90 }}
                        className="text-purple-400"
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                    <span className="text-yellow-400">
                        <FolderOpen size={20} />
                    </span>
                    <div>
                        <span className="text-white font-medium">{group.title}</span>
                        <span className="text-white/40 text-sm ml-2">
                            ({childMenus.length} items)
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onAddChild(group.id)}
                        className="p-2 hover:bg-green-500/10 rounded-lg text-white/50 hover:text-green-400 transition-colors"
                        title="Add sub-menu"
                    >
                        <Plus size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(group)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(group.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-white/50 hover:text-red-400 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Children */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/20"
                    >
                        <div className="p-3 space-y-2">
                            {childMenus.length === 0 ? (
                                <div className="text-center py-4 text-white/30 text-sm">
                                    No items in this group
                                </div>
                            ) : (
                                childMenus.map((child) => (
                                    <MenuItemRow
                                        key={child.id}
                                        menu={child}
                                        isChild
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function MenusPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | undefined>(undefined);
    const [defaultParentId, setDefaultParentId] = useState<number | undefined>(undefined);

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

    // จัดกลุ่มเมนู: แยก groups (path === '#'), standalone (ไม่มี parent), และ children
    const { groups, standaloneMenus, childrenByParent } = useMemo(() => {
        const groups: Menu[] = [];
        const standaloneMenus: Menu[] = [];
        const childrenByParent: Record<number, Menu[]> = {};

        menus.forEach((menu) => {
            if (menu.parent_id) {
                // เป็น child menu
                if (!childrenByParent[menu.parent_id]) {
                    childrenByParent[menu.parent_id] = [];
                }
                childrenByParent[menu.parent_id].push(menu);
            } else if (menu.path === '#') {
                // เป็น group
                groups.push(menu);
            } else {
                // เป็น standalone menu (top-level ที่ไม่ใช่ group)
                standaloneMenus.push(menu);
            }
        });

        // Sort children by order
        Object.values(childrenByParent).forEach((children) => {
            children.sort((a, b) => a.order - b.order);
        });

        return { groups, standaloneMenus, childrenByParent };
    }, [menus]);

    const handleCreate = () => {
        setEditingMenu(undefined);
        setDefaultParentId(undefined);
        setIsEditorOpen(true);
    };

    const handleAddChild = (parentId: number) => {
        setEditingMenu(undefined);
        setDefaultParentId(parentId);
        setIsEditorOpen(true);
    };

    const handleEdit = (menu: Menu) => {
        setEditingMenu(menu);
        setDefaultParentId(undefined);
        setIsEditorOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this menu item?')) return;
        try {
            await rbacService.deleteMenu(id);
            fetchMenus();
        } catch {
            alert('Failed to delete menu');
        }
    };

    const handleSave = async () => {
        setIsEditorOpen(false);
        setDefaultParentId(undefined);
        fetchMenus();
    };

    if (loading) {
        return (
            <div className="p-6 md:p-10 flex items-center justify-center min-h-[400px]">
                <Loading variant="orbit" size="lg" text="กำลังโหลด..." />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-light text-white mb-2">Menu Management</h1>
                    <p className="text-white/50">Configure sidebar navigation & grouping</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleCreate} icon={<Plus size={18} />}>
                        Create Item
                    </Button>
                </div>
            </div>

            {/* Groups */}
            {groups.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-medium text-yellow-400 flex items-center gap-2">
                        <FolderOpen size={20} />
                        Menu Groups
                    </h2>
                    <div className="space-y-4">
                        {groups.map((group) => (
                            <MenuGroup
                                key={group.id}
                                group={group}
                                childMenus={childrenByParent[group.id] || []}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onAddChild={handleAddChild}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Standalone Menus */}
            {standaloneMenus.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-medium text-purple-400 flex items-center gap-2">
                        <Shield size={20} />
                        Standalone Menus
                    </h2>
                    <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-2">
                        {standaloneMenus.map((menu) => (
                            <MenuItemRow
                                key={menu.id}
                                menu={menu}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Empty State */}
            {menus.length === 0 && (
                <div className="text-center py-12 text-white/40">
                    <Shield size={48} className="mx-auto mb-4 opacity-50" />
                    <p>
                        No menus yet. Click <span className="text-purple-400">Create Item</span> to
                        add your first menu.
                    </p>
                </div>
            )}

            {/* Modal สำหรับ Editor - ใช้ Modal component */}
            <Modal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                title={editingMenu ? 'Edit Menu Item' : 'Create Menu Item'}
                size="lg"
            >
                <MenuEditor
                    menu={
                        editingMenu
                            ? {
                                  ...editingMenu,
                                  parent_id: editingMenu.parent_id,
                              }
                            : defaultParentId
                              ? ({ parent_id: defaultParentId } as Menu)
                              : undefined
                    }
                    menus={menus}
                    onSave={handleSave}
                    onCancel={() => setIsEditorOpen(false)}
                />
            </Modal>
        </div>
    );
}
