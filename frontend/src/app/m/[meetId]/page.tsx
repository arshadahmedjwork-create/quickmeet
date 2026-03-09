'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Mic, MicOff, Video as VideoIcon, VideoOff, Settings, User, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function PreJoin() {
    const { meetId } = useParams() as { meetId: string };
    const router = useRouter();
    const [name, setName] = useState('');
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isPermissionsError, setIsPermissionsError] = useState(false);

    useEffect(() => {
        const storedName = localStorage.getItem('meet_user_name');
        if (storedName) setName(storedName);

        async function startPreview() {
            try {
                // If stream exists, stop it first to refresh or handle toggles
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }

                if (videoOn || micOn) {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: videoOn,
                        audio: micOn
                    });
                    streamRef.current = stream;
                    if (videoRef.current && videoOn) {
                        videoRef.current.srcObject = stream;
                    }
                }
            } catch (err) {
                console.error("Error accessing media devices:", err);
                setIsPermissionsError(true);
            }
        }
        startPreview();
        return () => {
            streamRef.current?.getTracks().forEach(track => track.stop());
        };
    }, [videoOn, micOn]);

    const joinMeeting = () => {
        if (!name.trim()) return;
        localStorage.setItem('meet_user_name', name);
        localStorage.setItem('meet_mic_pref', String(micOn));
        localStorage.setItem('meet_video_pref', String(videoOn));
        // Redirect to the actual room
        router.push(`/room/${meetId}`);
    };

    return (
        <div className="min-h-screen bg-[#2D2D2D] text-slate-200 flex flex-col items-center justify-center p-6 sm:p-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
                {/* Preview Card */}
                <div className="space-y-6">
                    <div className="relative aspect-video glass-card overflow-hidden group shadow-2xl ring-1 ring-white/10">
                        <AnimatePresence mode="wait">
                            {videoOn && !isPermissionsError ? (
                                <motion.video
                                    key="video"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover scale-x-[-1]"
                                />
                            ) : (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-full flex flex-col items-center justify-center bg-slate-900 gap-4"
                                >
                                    <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border border-white/5 shadow-inner">
                                        <User size={48} className="text-slate-500" />
                                    </div>
                                    <p className="text-slate-400 font-medium">
                                        {isPermissionsError ? "Permissions blocked" : "Camera is off"}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Controls Overlay */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                            <button
                                onClick={() => setMicOn(!micOn)}
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90",
                                    micOn ? "bg-slate-800/80 backdrop-blur-md text-white hover:bg-slate-700" : "bg-red-500 text-white hover:bg-red-600"
                                )}
                                title={micOn ? "Mute Microphone" : "Unmute Microphone"}
                            >
                                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>
                            <button
                                onClick={() => setVideoOn(!videoOn)}
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90",
                                    videoOn ? "bg-slate-800/80 backdrop-blur-md text-white hover:bg-slate-700" : "bg-red-500 text-white hover:bg-red-600"
                                )}
                                title={videoOn ? "Turn off Camera" : "Turn on Camera"}
                            >
                                {videoOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
                            </button>
                            <button className="w-12 h-12 rounded-full bg-slate-800/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-700 shadow-lg active:scale-90">
                                <Settings size={20} />
                            </button>
                        </div>

                        {/* Visualizer indicator if mic is on */}
                        {micOn && (
                            <div className="absolute top-4 right-4 flex gap-1 h-4 items-end">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s`, height: `${localStorage.getItem('mic_vol') || 40}%` }} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 justify-center">
                        <ShieldCheck size={16} className="text-blue-500" />
                        <span className="text-xs font-medium uppercase tracking-wider">Your connection is private</span>
                    </div>
                </div>

                {/* Joining Panel */}
                <div className="flex flex-col gap-8 max-w-sm lg:max-w-none">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-white">Join Meeting</h1>
                        <p className="text-slate-400">Enter your name and adjust your devices before joining.</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-lg text-blue-400 text-xs font-mono font-bold mt-2 border border-blue-500/10 uppercase tracking-tighter">
                            ID: {meetId}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                Display Name
                                <Info size={14} className="opacity-50" />
                            </label>
                            <input
                                type="text"
                                placeholder="E.g. Elon Musk"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl px-6 py-4 text-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#7A00E1] focus:border-transparent transition-all shadow-inner"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={joinMeeting}
                                disabled={!name.trim()}
                                className="primary-button w-full !py-5 text-xl font-bold flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Enter Meeting Room
                                <ArrowRight size={24} />
                            </button>
                            <p className="text-center text-xs text-slate-500 px-4 leading-relaxed">
                                By joining, you're granting Quick Meet permission to broadcast your media to other participants in this room.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
