import React, { useEffect, useState } from 'react';
import { Menu, Permission } from '@/types/rbac';
import { rbacService } from '@/services/rbac';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { IconPicker } from '@/components/ui/IconPicker';
import { icons } from 'lucide-react';

interface MenuEditorProps {
    menu?: Menu;
    menus?: Menu[]; // รับ list ของ menus สำหรับเลือก parent
    onSave: () => void;
    onCancel: () => void;
}

export default function MenuEditor({ menu, menus = [], onSave, onCancel }: MenuEditorProps) {
    const [title, setTitle] = useState(menu?.title || '');
    const [path, setPath] = useState(menu?.path || '');
    const [icon, setIcon] = useState(menu?.icon || '');
    const [permissionSlug, setPermissionSlug] = useState(menu?.permission_slug || '');
    const [parentId, setParentId] = useState<number | undefined>(menu?.parent_id);
    const [order, setOrder] = useState(menu?.order || 0);
    const [isGroup, setIsGroup] = useState(menu?.path === '#' || false);
    const [loading, setLoading] = useState(false);

    // For Permission Selection (Optional)
    const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);

    // กรองเอาเฉพาะ top-level menus (ที่เป็น group หรือไม่มี parent) สำหรับเลือกเป็น parent
    const availableParents = menus.filter(
        (m) => !m.parent_id && m.id !== menu?.id // ไม่รวมตัวเอง
    );

    // สร้าง options สำหรับ Select components
    const parentOptions = [
        { value: '', label: 'None (Top Level)' },
        ...availableParents.map((p) => {
            const Icon = p.icon ? (icons[p.icon as keyof typeof icons] as any) : null;
            return {
                value: p.id,
                label: (
                    <div className="flex items-center gap-2">
                        {Icon && <Icon size={16} />}
                        <span>{p.title}</span>
                    </div>
                ),
            };
        }),
    ];

    const permissionOptions = [
        { value: '', label: 'None (Public/All Authenticated)' },
        ...availablePermissions.map((p) => ({
            value: p.slug,
            label: `${p.slug} (${p.description})`,
        })),
    ];

    useEffect(() => {
        loadPermissions();
    }, []);

    const loadPermissions = async () => {
        try {
            const data = await rbacService.getPermissions();
            setAvailablePermissions(data.permissions);
        } catch (error) {
            console.error('Failed to load permissions', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const menuData = {
                title,
                path: isGroup ? '#' : path, // Group ใช้ # แทน path
                icon,
                permission_slug: permissionSlug,
                parent_id: parentId,
                order: Number(order),
            };

            if (menu) {
                await rbacService.updateMenu(menu.id, menuData);
            } else {
                await rbacService.createMenu(menuData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save menu', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {/* Is Group Checkbox */}
                <Checkbox
                    id="isGroup"
                    checked={isGroup}
                    onChange={(e) => setIsGroup(e.target.checked)}
                    label="เป็น Menu Group (ใช้สำหรับจัดกลุ่มเมนูย่อย)"
                />

                {/* Parent Menu Dropdown */}
                {!isGroup && availableParents.length > 0 && (
                    <Select
                        label="Parent Menu (Groups)"
                        value={parentId ?? ''}
                        onChange={(e) =>
                            setParentId(e.target.value ? Number(e.target.value) : undefined)
                        }
                        options={parentOptions}
                        placeholder="None (Top Level)"
                    />
                )}

                <Input
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Dashboard"
                    required
                />

                {/* Path - ซ่อนถ้าเป็น Group */}
                {!isGroup && (
                    <Input
                        label="Path"
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        placeholder="e.g. /admin/dashboard"
                        required
                    />
                )}

                <IconPicker label="Icon" value={icon} onChange={setIcon} />

                <Select
                    label="Required Permission"
                    value={permissionSlug}
                    onChange={(e) => setPermissionSlug(e.target.value)}
                    options={permissionOptions}
                    placeholder="None (Public/All Authenticated)"
                />

                <Input
                    label="Order"
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    placeholder="0"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="outline" type="button" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={loading}>
                    {menu ? 'Save Changes' : 'Create Menu'}
                </Button>
            </div>
        </form>
    );
}
