'use client';

import React, { useRef, useEffect, useState, KeyboardEvent, ClipboardEvent } from 'react';

interface PinInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    error?: boolean;
    autoFocus?: boolean;
    maskDelay?: number; // เวลาที่แสดงตัวเลขก่อนซ่อน (ms)
}

export function PinInput({
    length = 6,
    value,
    onChange,
    disabled = false,
    error = false,
    autoFocus = false,
    maskDelay = 500, // แสดงตัวเลข 500ms แล้วเปลี่ยนเป็น •
}: PinInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [visibleIndex, setVisibleIndex] = useState<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, length);
    }, [length]);

    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [autoFocus]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const valueArray = value.split('').slice(0, length);
    while (valueArray.length < length) {
        valueArray.push('');
    }

    const handleChange = (index: number, char: string) => {
        // ยอมรับเฉพาะตัวเลข
        if (!/^\d*$/.test(char)) return;

        const newValue = [...valueArray];
        newValue[index] = char.slice(-1); // เอาเฉพาะตัวสุดท้าย
        onChange(newValue.join(''));

        if (char) {
            // แสดงตัวเลขชั่วคราว
            setVisibleIndex(index);

            // Clear timeout เดิม
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // ซ่อนหลังจาก delay
            timeoutRef.current = setTimeout(() => {
                setVisibleIndex(null);
            }, maskDelay);

            // ถ้ากรอกแล้วให้ไปช่องถัดไป
            if (index < length - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const newValue = [...valueArray];

            if (valueArray[index]) {
                // ถ้าช่องนี้มีค่า ให้ลบค่า
                newValue[index] = '';
                onChange(newValue.join(''));
            } else if (index > 0) {
                // ถ้าช่องนี้ว่าง ให้ย้อนกลับไปช่องก่อนหน้าและลบ
                newValue[index - 1] = '';
                onChange(newValue.join(''));
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            e.preventDefault();
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            e.preventDefault();
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        onChange(pastedData);

        // Focus ไปช่องสุดท้ายที่กรอก หรือช่องถัดไป
        const nextIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[nextIndex]?.focus();

        // แสดงตัวเลขตัวสุดท้ายชั่วคราว
        if (pastedData.length > 0) {
            setVisibleIndex(pastedData.length - 1);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                setVisibleIndex(null);
            }, maskDelay);
        }
    };

    // แสดงตัวเลขจริง หรือ • ตาม state
    const getDisplayValue = (digit: string, index: number) => {
        if (!digit) return '';
        if (visibleIndex === index) return digit; // แสดงตัวเลขถ้าเป็น index ที่เพิ่งกรอก
        return '•'; // ซ่อนเป็น •
    };

    return (
        <div className="flex justify-center gap-2 sm:gap-3">
            {valueArray.map((digit, index) => (
                <div key={index} className="relative">
                    {/* Hidden input สำหรับรับ input */}
                    <input
                        ref={(el) => {
                            inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        disabled={disabled}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        className={`
                            w-10 h-12 sm:w-12 sm:h-14
                            text-center text-xl sm:text-2xl font-bold
                            rounded-lg
                            bg-white/5 border
                            text-transparent caret-white
                            transition-all duration-200
                            outline-none
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
                            ${
                                error
                                    ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                    : focusedIndex === index
                                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                                      : 'border-white/20 hover:border-white/40'
                            }
                            ${digit ? 'bg-white/10' : ''}
                        `}
                        aria-label={`PIN digit ${index + 1}`}
                    />
                    {/* Display overlay */}
                    <div className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-bold text-white pointer-events-none">
                        {getDisplayValue(digit, index)}
                    </div>
                </div>
            ))}
        </div>
    );
}
