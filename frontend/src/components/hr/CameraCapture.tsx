import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

interface CameraCaptureProps {
    onCapture: (imageSrc: string) => void;
    onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        setError('');
        try {
            // Try with preferred settings first
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false,
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err: any) {
            console.warn('Initial camera access failed, retrying with basic constraints...', err);
            try {
                // Fallback to basic constraints
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (fallbackErr: any) {
                console.error('Error accessing camera:', fallbackErr);
                let errorMessage = 'Could not access camera.';
                if (fallbackErr.name === 'NotAllowedError' || fallbackErr.name === 'PermissionDeniedError') {
                    errorMessage = 'Camera access denied. Please allow camera permissions in your browser.';
                } else if (fallbackErr.name === 'NotFoundError' || fallbackErr.name === 'DevicesNotFoundError') {
                    errorMessage = 'No camera device found.';
                } else if (fallbackErr.name === 'NotReadableError' || fallbackErr.name === 'TrackStartError') {
                    errorMessage = 'Camera is already in use by another application.';
                } else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                    errorMessage = 'Camera access requires HTTPS or localhost.';
                }
                setError(errorMessage);
            }
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                // Set canvas dimensions to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Draw video frame to canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert to base64
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setImage(dataUrl);
            }
        }
    };

    const retakePhoto = () => {
        setImage(null);
    };

    const confirmPhoto = () => {
        if (image) {
            onCapture(image);
            stopCamera();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <h3 className="text-white font-medium flex items-center gap-2">
                        <Camera size={20} className="text-emerald-400" />
                        Take Photo
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover transform -scale-x-100 ${image ? 'hidden' : 'block'}`}
                        />
                        {image && (
                            <img
                                src={image}
                                alt="Captured"
                                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                            />
                        )}
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Error Overlay */}
                        {error && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900/90 p-6 text-center">
                                <p className="text-red-400 mb-4">{error}</p>
                                <Button
                                    onClick={() => startCamera()}
                                    variant="outline"
                                    className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                                    icon={<RefreshCw size={16} />}
                                >
                                    Try Again
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4 pt-2">
                        {!image ? (
                            <Button
                                onClick={capturePhoto}
                                icon={<Camera size={20} />}
                                className="bg-white text-black hover:bg-gray-200"
                            >
                                Capture
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={retakePhoto}
                                    variant="outline"
                                    icon={<RefreshCw size={18} />}
                                    className="border-white/20 text-white hover:bg-white/5"
                                >
                                    Retake
                                </Button>
                                <Button
                                    onClick={confirmPhoto}
                                    icon={<Check size={20} />}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                >
                                    Use Photo
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
