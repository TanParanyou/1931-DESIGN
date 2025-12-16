'use client';

import { FieldArrayWithId } from 'react-hook-form';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DAYS } from '../hooks/useHoursForm';

// Define inline type to avoid import issues
interface HourField {
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
}

interface BusinessHoursFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields: FieldArrayWithId<any, 'hours', 'id'>[];
    saving: boolean;
    onSave: () => Promise<void>;
    onUpdateHour: (index: number, field: string, value: unknown) => void;
}

export function BusinessHoursForm({
    fields,
    saving,
    onSave,
    onUpdateHour,
}: BusinessHoursFormProps) {
    return (
        <div className="space-y-6 max-w-2xl">
            <div className="space-y-3">
                {fields.map((field, index) => {
                    const hour = field as unknown as HourField;
                    return (
                        <div
                            key={field.id}
                            className="flex items-center gap-4 p-4 bg-white/5 rounded-xl"
                        >
                            <div className="w-24 font-medium text-white">
                                {DAYS[hour.day_of_week]}
                            </div>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={hour.is_closed}
                                    onChange={(e) =>
                                        onUpdateHour(index, 'is_closed', e.target.checked)
                                    }
                                    className="w-4 h-4 rounded"
                                />
                                <span className="text-sm text-gray-400">ปิด</span>
                            </label>

                            {!hour.is_closed && (
                                <>
                                    <input
                                        type="time"
                                        value={hour.open_time}
                                        onChange={(e) =>
                                            onUpdateHour(index, 'open_time', e.target.value)
                                        }
                                        className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg text-white text-sm"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                        type="time"
                                        value={hour.close_time}
                                        onChange={(e) =>
                                            onUpdateHour(index, 'close_time', e.target.value)
                                        }
                                        className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg text-white text-sm"
                                    />
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={onSave} isLoading={saving}>
                    <Save size={16} className="mr-2" />
                    บันทึก
                </Button>
            </div>
        </div>
    );
}
