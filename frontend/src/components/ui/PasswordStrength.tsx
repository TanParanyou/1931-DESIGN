'use client';

import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
    password: string;
    showRequirements?: boolean;
    className?: string;
}

interface Requirement {
    label: string;
    test: (password: string) => boolean;
}

const requirements: Requirement[] = [
    { label: 'อย่างน้อย 8 ตัวอักษร', test: (p) => p.length >= 8 },
    { label: 'มีตัวพิมพ์เล็ก (a-z)', test: (p) => /[a-z]/.test(p) },
    { label: 'มีตัวพิมพ์ใหญ่ (A-Z)', test: (p) => /[A-Z]/.test(p) },
    { label: 'มีตัวเลข (0-9)', test: (p) => /\d/.test(p) },
    {
        label: 'มีอักขระพิเศษ (!@#$%...)',
        test: (p) => /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(p),
    },
];

export function PasswordStrength({
    password,
    showRequirements = true,
    className = '',
}: PasswordStrengthProps) {
    const analysis = useMemo(() => {
        const passed = requirements.filter((r) => r.test(password)).length;
        const total = requirements.length;
        const percentage = (passed / total) * 100;

        let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
        let label = 'อ่อนมาก';
        let color = 'bg-red-500';

        if (passed >= 5) {
            strength = 'strong';
            label = 'แข็งแกร่ง';
            color = 'bg-green-500';
        } else if (passed >= 4) {
            strength = 'good';
            label = 'ดี';
            color = 'bg-blue-500';
        } else if (passed >= 2) {
            strength = 'fair';
            label = 'พอใช้';
            color = 'bg-yellow-500';
        }

        return {
            passed,
            total,
            percentage,
            strength,
            label,
            color,
            isValid: passed === total,
        };
    }, [password]);

    if (!password) {
        return null;
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Strength Bar */}
            <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">ความปลอดภัย</span>
                    <span
                        className={`font-medium ${
                            analysis.strength === 'strong'
                                ? 'text-green-400'
                                : analysis.strength === 'good'
                                  ? 'text-blue-400'
                                  : analysis.strength === 'fair'
                                    ? 'text-yellow-400'
                                    : 'text-red-400'
                        }`}
                    >
                        {analysis.label}
                    </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${analysis.color}`}
                        style={{ width: `${analysis.percentage}%` }}
                    />
                </div>
            </div>

            {/* Requirements List */}
            {showRequirements && (
                <div className="space-y-1">
                    {requirements.map((req, index) => {
                        const isPassed = req.test(password);
                        return (
                            <div
                                key={index}
                                className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                                    isPassed ? 'text-green-400' : 'text-gray-500'
                                }`}
                            >
                                {isPassed ? (
                                    <Check className="w-3 h-3" />
                                ) : (
                                    <X className="w-3 h-3" />
                                )}
                                <span>{req.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// Hook สำหรับตรวจสอบ password strength
export function usePasswordStrength(password: string) {
    return useMemo(() => {
        const passed = requirements.filter((r) => r.test(password)).length;
        return {
            isValid: passed === requirements.length,
            score: passed,
            maxScore: requirements.length,
            messages: requirements.filter((r) => !r.test(password)).map((r) => r.label),
        };
    }, [password]);
}
