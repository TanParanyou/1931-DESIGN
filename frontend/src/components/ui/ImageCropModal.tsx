'use client';

import React, { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Modal } from './Modal';
import { Button } from './Button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// ประเภท aspect ratio ที่รองรับ
type CropType = 'cover' | 'logo';

interface ImageCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    cropType?: CropType;
    onCropComplete: (croppedImage: string) => void;
    title?: string;
}

// Aspect ratio ตาม type
const aspectRatios: Record<CropType, number> = {
    cover: 16 / 9, // ภาพปก wide
    logo: 1, // โลโก้ square
};

// สร้าง canvas และ crop ภาพ
const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // กำหนดขนาด canvas ตามขนาด crop
            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;

            // วาดภาพลง canvas
            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            );

            // แปลงเป็น base64
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };

        image.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        image.src = imageSrc;
    });
};

const ImageCropModal: React.FC<ImageCropModalProps> = ({
    isOpen,
    onClose,
    imageSrc,
    cropType = 'cover',
    onCropComplete,
    title,
}) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const aspectRatio = aspectRatios[cropType];
    const modalTitle = title || (cropType === 'cover' ? 'ปรับแต่งภาพปก' : 'ปรับแต่งโลโก้');

    // เมื่อ crop เปลี่ยน
    const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Reset ค่ากลับไปเริ่มต้น
    const handleReset = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    // บันทึกภาพที่ crop แล้ว
    const handleSave = async () => {
        if (!croppedAreaPixels) return;

        setIsProcessing(true);
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedImage);
            onClose();
        } catch (error) {
            console.error('Error cropping image:', error);
            alert('ไม่สามารถครอปภาพได้');
        } finally {
            setIsProcessing(false);
        }
    };

    // ปิด modal และ reset ค่า
    const handleClose = () => {
        handleReset();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={modalTitle}
            description="ลากเพื่อจัดตำแหน่ง และใช้ slider เพื่อซูม"
            size="xl"
            closeOnOverlayClick={!isProcessing}
            closeOnEscape={!isProcessing}
        >
            {/* Cropper Area */}
            <div className="relative w-full h-[400px] bg-black/50 rounded-xl overflow-hidden">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                    cropShape={cropType === 'logo' ? 'round' : 'rect'}
                    showGrid
                    style={{
                        containerStyle: {
                            borderRadius: '12px',
                        },
                    }}
                />
            </div>

            {/* Zoom Controls */}
            <div className="mt-6 space-y-4">
                <div className="flex items-center gap-4">
                    <ZoomOut size={20} className="text-gray-400" />
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <ZoomIn size={20} className="text-gray-400" />
                    <span className="text-sm text-gray-400 w-12 text-right">
                        {zoom.toFixed(1)}x
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleReset}
                    leftIcon={<RotateCcw size={16} />}
                >
                    รีเซ็ต
                </Button>

                <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={handleClose}>
                        ยกเลิก
                    </Button>
                    <Button type="button" onClick={handleSave} isLoading={isProcessing}>
                        บันทึก
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export { ImageCropModal };
export type { ImageCropModalProps, CropType };
