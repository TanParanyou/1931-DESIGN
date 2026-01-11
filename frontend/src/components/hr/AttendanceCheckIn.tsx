'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { MapPin, Clock, LogIn, LogOut, Coffee, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCapture from './CameraCapture';

export default function AttendanceCheckIn() {
    const [status, setStatus] = useState<'loading' | 'checked-in' | 'checked-out' | 'unknown'>('loading');
    const [todayRecord, setTodayRecord] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [location, setLocation] = useState('');

    // Photo Feature
    const [showCamera, setShowCamera] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [requirePhoto, setRequirePhoto] = useState(true); // Default to true, configurable
    const [pendingAction, setPendingAction] = useState<'in' | 'out' | null>(null);

    useEffect(() => {
        // Clock timer
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/hr/attendance/today');
            if (res.data.status === 'Checked In') {
                setStatus('checked-in');
                setTodayRecord(res.data.data);
            } else if (res.data.status === 'Checked Out') {
                setStatus('checked-out');
                setTodayRecord(res.data.data);
            } else {
                setStatus('unknown');
            }
        } catch (err) {
            console.error('Failed to fetch attendance status', err);
            setStatus('unknown');
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const getLocation = () => {

        return new Promise<string>((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('Geolocation is not supported by your browser');
            } else {
                navigator.permissions.query({ name: 'geolocation' as any }).then((result) => {
                    if (result.state === 'denied') {
                        reject('Location access denied. Please enable in browser settings.');
                    } else {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                resolve(`${position.coords.latitude},${position.coords.longitude}`);
                            },
                            (error) => {
                                switch (error.code) {
                                    case error.PERMISSION_DENIED:
                                        reject('User denied the request for Geolocation.');
                                        break;
                                    case error.POSITION_UNAVAILABLE:
                                        reject('Location information is unavailable.');
                                        break;
                                    case error.TIMEOUT:
                                        reject('The request to get user location timed out.');
                                        break;
                                    default:
                                        reject('An unknown error occurred.');
                                        break;
                                }
                            }
                        );
                    }
                });
            }
        });
    };

    const processCheckIn = async (photoData: string | null) => {
        setLoading(true);
        setError('');
        try {
            const loc = await getLocation();
            setLocation(loc);
            await api.post('/hr/attendance/check-in', {
                location: loc,
                photo: photoData
            });
            setCapturedPhoto(null);
            await fetchStatus();
        } catch (err: any) {
            setError(err.response?.data?.error || err.toString() || 'Check-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (requirePhoto && !capturedPhoto) {
            setPendingAction('in');
            setShowCamera(true);
            return;
        }
        await processCheckIn(capturedPhoto);
    };

    const processCheckOut = async (photoData: string | null) => {
        setLoading(true);
        setError('');
        try {
            const loc = await getLocation();
            await api.post('/hr/attendance/check-out', {
                location: loc,
                photo: photoData
            });
            setCapturedPhoto(null);
            await fetchStatus();
        } catch (err: any) {
            setError(err.response?.data?.error || err.toString() || 'Check-out failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (requirePhoto && !capturedPhoto) {
            setPendingAction('out');
            setShowCamera(true);
            return;
        }
        await processCheckOut(capturedPhoto);
    };

    const handlePhotoCapture = (image: string) => {
        setCapturedPhoto(image);
        setShowCamera(false);

        // Auto proceed if we know what the action was
        if (pendingAction === 'in') {
            processCheckIn(image);
        } else if (pendingAction === 'out') {
            processCheckOut(image);
        }
        setPendingAction(null);
    };

    // Time formatting
    const timeStr = currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = currentTime.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-6 max-w-md w-full mx-auto">
            <div className="space-y-2 relative w-full">
                {/* Config Toggle */}
                <div className="absolute right-0 top-0">
                    <button
                        onClick={() => setRequirePhoto(!requirePhoto)}
                        className={`p-2 rounded-full transition-colors ${requirePhoto ? 'text-emerald-400 bg-emerald-400/10' : 'text-gray-600 hover:text-gray-400'}`}
                        title={requirePhoto ? "Photo Required" : "Photo Optional"}
                    >
                        <Camera size={16} />
                        {/* Dot indicator */}
                        <span className={`absolute top-2 right-2 flex h-2 w-2`}>
                            <span className={`${requirePhoto ? 'animate-ping' : 'hidden'} absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${requirePhoto ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                        </span>
                    </button>
                </div>

                <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{dateStr}</h2>
                <div className="text-5xl md:text-6xl font-bold text-white tracking-tight font-mono">
                    {timeStr}
                </div>
            </div>

            {error && <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded w-full">{error}</div>}

            <div className="w-full pt-4">
                {status === 'loading' ? (
                    <div className="text-gray-400">Loading status...</div>
                ) : status === 'checked-in' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                    >
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <div className="text-emerald-400 font-medium flex items-center justify-center gap-2">
                                <Clock size={18} /> Checked In at {new Date(todayRecord.check_in_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-gray-400 text-xs mt-1">Location: {todayRecord.location_in}</div>
                        </div>

                        <Button
                            onClick={handleCheckOut}
                            isLoading={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white h-14 text-lg shadow-lg shadow-orange-500/20"
                            icon={<LogOut size={24} />}
                        >
                            Check Out
                        </Button>
                    </motion.div>
                ) : status === 'checked-out' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                    >
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Check In</span>
                                <span className="text-white font-medium">{new Date(todayRecord.check_in_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Check Out</span>
                                <span className="text-white font-medium">{new Date(todayRecord.check_out_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="border-t border-white/10 pt-2 flex justify-between">
                                <span className="text-gray-400">Total Hours</span>
                                <span className="text-emerald-400 font-bold">{todayRecord.work_hours?.toFixed(2)} hrs</span>
                            </div>
                        </div>
                        <div className="text-gray-400 flex items-center justify-center gap-2 py-4">
                            <Coffee size={20} /> Have a good rest!
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Button
                            onClick={handleCheckIn}
                            isLoading={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-14 text-lg shadow-lg shadow-emerald-500/20"
                            icon={<LogIn size={24} />}
                        >
                            Check In
                        </Button>
                        <p className="text-gray-500 text-xs mt-3 flex items-center justify-center gap-1">
                            <MapPin size={12} /> Location access required
                        </p>
                    </motion.div>
                )}
            </div>


            {/* Camera Modal */}
            <AnimatePresence>
                {showCamera && (
                    <CameraCapture
                        onCapture={handlePhotoCapture}
                        onClose={() => {
                            setShowCamera(false);
                            setPendingAction(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div >
    );
}
