'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { DataTable, Column } from '@/components/ui/DataTable';
import { FormModal, useModal, useConfirm } from '@/components/ui/Modal';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { useDataTable } from '@/hooks/useDataTable';
import { Plus, Edit2, Trash2, Building } from 'lucide-react';
import { PageLoading } from '@/components/ui/Loading';

interface Department {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
}

export default function DepartmentsPage() {
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [saving, setSaving] = useState(false);
    const { isOpen, open, close } = useModal();
    const { confirm, ConfirmDialog } = useConfirm();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true,
    });

    // Data fetcher
    const fetchDepartments = useCallback(async () => {
        const res = await api.get('/hr/departments');
        return {
            data: res.data.data || [],
            total: res.data.data?.length || 0,
        };
    }, []);

    const {
        data: departments,
        isLoading,
        fetchData,
    } = useDataTable<Department>({
        fetcher: fetchDepartments,
        initialPagination: { limit: 100 },
    });

    const handleCreate = () => {
        setEditingDept(null);
        setFormData({ name: '', description: '', is_active: true });
        open();
    };

    const handleEdit = (dept: Department) => {
        setEditingDept(dept);
        setFormData({
            name: dept.name,
            description: dept.description,
            is_active: dept.is_active,
        });
        open();
    };

    const handleDelete = async (id: number) => {
        const confirmed = await confirm({
            title: 'ลบแผนก',
            message: 'คุณแน่ใจหรือไม่ที่จะลบแผนกนี้? การลบจะไม่สามารถย้อนกลับได้',
            variant: 'danger',
            confirmText: 'ลบ',
            cancelText: 'ยกเลิก',
        });

        if (!confirmed) return;

        try {
            await api.delete(`/hr/departments/${id}`);
            fetchData();
        } catch {
            alert('ไม่สามารถลบแผนกได้ (อาจมีตำแหน่งที่ใช้งานอยู่)');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('กรุณากรอกชื่อแผนก');
            return;
        }

        setSaving(true);
        try {
            if (editingDept) {
                await api.put(`/hr/departments/${editingDept.id}`, formData);
            } else {
                await api.post('/hr/departments', formData);
            }
            close();
            fetchData();
        } catch {
            alert('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setSaving(false);
        }
    };

    const columns: Column<Department>[] = [
        {
            header: 'แผนก',
            accessorKey: 'name',
            cell: (_: string, dept: Department) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                        <Building size={18} />
                    </div>
                    <div>
                        <div className="font-medium text-white">{dept.name}</div>
                        <div className="text-sm text-gray-500">{dept.description || '-'}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'สถานะ',
            accessorKey: 'is_active',
            cell: (active: boolean) => (
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        active
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-red-400'}`}
                    />
                    {active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
            ),
        },
        {
            header: '',
            className: 'text-right',
            cell: (_: unknown, dept: Department) => (
                <Dropdown align="right">
                    <DropdownItem icon={Edit2} onClick={() => handleEdit(dept)}>
                        แก้ไข
                    </DropdownItem>
                    <DropdownItem
                        icon={Trash2}
                        variant="danger"
                        onClick={() => handleDelete(dept.id)}
                    >
                        ลบ
                    </DropdownItem>
                </Dropdown>
            ),
        },
    ];

    if (isLoading && departments.length === 0) {
        return <PageLoading text="กำลังโหลดข้อมูลแผนก..." />;
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                        จัดการแผนก
                    </h1>
                    <p className="text-sm md:text-base text-gray-400">จัดการข้อมูลแผนกในองค์กร</p>
                </div>

                <Button onClick={handleCreate} icon={<Plus size={18} />}>
                    เพิ่มแผนก
                </Button>
            </div>

            <DataTable columns={columns} data={departments} isLoading={isLoading} hidePagination />

            {/* Form Modal */}
            <FormModal
                isOpen={isOpen}
                onClose={close}
                onSubmit={handleSubmit}
                title={editingDept ? 'แก้ไขแผนก' : 'เพิ่มแผนก'}
                isLoading={saving}
            >
                <div className="space-y-4">
                    <Input
                        id="name"
                        label="ชื่อแผนก *"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="เช่น Engineering, Marketing"
                        icon={Building}
                    />
                    <Input
                        id="description"
                        label="คำอธิบาย"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="คำอธิบายเพิ่มเติม..."
                    />
                    <Checkbox
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                        }
                        label="เปิดใช้งาน"
                    />
                </div>
            </FormModal>

            <ConfirmDialog />
        </div>
    );
}
