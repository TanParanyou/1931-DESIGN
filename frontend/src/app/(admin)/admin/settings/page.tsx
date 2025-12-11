'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    RefreshCw,
    Globe,
    Search,
    Phone,
    Hash,
    ToggleLeft,
    ToggleRight,
    Settings as SettingsIcon,
    Briefcase,
    BarChart3,
} from 'lucide-react';
import { settingService } from '@/services/setting.service';
import { Setting, UpdateSettingInput } from '@/types/setting';

export default function SettingsPage() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeGroup, setActiveGroup] = useState<string>('all');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await settingService.getAllSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates: UpdateSettingInput[] = settings.map((s) => ({
                key: s.key,
                value: s.value,
                is_public: s.is_public,
            }));
            await settingService.updateSettings(updates);
            // Optionally show success toast
        } catch (error) {
            console.error('Failed to save settings', error);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
    };

    const handleToggle = (key: string) => {
        setSettings((prev) =>
            prev.map((s) => {
                if (s.key === key) {
                    return { ...s, value: s.value === 'true' ? 'false' : 'true' };
                }
                return s;
            })
        );
    };

    const groups = ['all', ...Array.from(new Set(settings.map((s) => s.group)))];

    const filteredSettings =
        activeGroup === 'all' ? settings : settings.filter((s) => s.group === activeGroup);

    // Sort settings by ID or Key order to keep UI stable
    filteredSettings.sort((a, b) => a.id - b.id);

    if (loading) {
        return <div className="text-white">Loading settings...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <SettingsIcon className="text-blue-500" />
                        System Settings
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Manage website configuration, SEO, and contact details.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-white/10">
                {groups.map((group) => (
                    <button
                        key={group}
                        onClick={() => setActiveGroup(group)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                            activeGroup === group
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {group}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSettings.map((setting) => (
                    <motion.div
                        key={setting.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl bg-[#111] border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white capitalize flex items-center gap-2">
                                    {getIconForGroup(setting.group)}
                                    {setting.key.replace(/_/g, ' ')}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                            </div>
                            <div className="px-2 py-1 rounded text-xs font-mono bg-white/5 text-gray-400 border border-white/5">
                                {setting.key}
                            </div>
                        </div>

                        <div className="mt-4">
                            {renderInput(setting, handleChange, handleToggle)}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function getIconForGroup(group: string) {
    switch (group) {
        case 'seo':
            return <Search size={16} className="text-purple-400" />;
        case 'contact':
            return <Phone size={16} className="text-green-400" />;
        case 'social':
            return <Globe size={16} className="text-blue-400" />;
        case 'business':
            return <Briefcase size={16} className="text-orange-400" />;
        case 'analytics':
            return <BarChart3 size={16} className="text-yellow-400" />;
        default:
            return <Hash size={16} className="text-gray-400" />;
    }
}

function renderInput(
    setting: Setting,
    handleChange: (k: string, v: string) => void,
    handleToggle: (k: string) => void
) {
    if (setting.type === 'boolean' || setting.value === 'true' || setting.value === 'false') {
        const isTrue = setting.value === 'true';
        return (
            <button
                onClick={() => handleToggle(setting.key)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all w-full ${
                    isTrue
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
            >
                {isTrue ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                <span className="font-medium">{isTrue ? 'Enabled' : 'Disabled'}</span>
            </button>
        );
    }

    if (setting.type === 'textarea') {
        return (
            <textarea
                value={setting.value}
                onChange={(e) => handleChange(setting.key, e.target.value)}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
        );
    }

    return (
        <input
            type="text"
            value={setting.value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
    );
}
