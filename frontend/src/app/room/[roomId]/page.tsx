'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    LiveKitRoom,
    VideoConference,
    ControlBar,
    ParticipantTile,
    RoomAudioRenderer,
    useLocalParticipant,
    useParticipants,
    useTracks,
    GridLayout,
    FocusLayout,
    CarouselLayout,
} from '@livekit/components-react';
import { RoomProvider, useRoom } from '@/context/RoomContext';
import { Track } from 'livekit-client';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Smile, Hand, MessageSquare, Share2, Copy, Users, Info, ShieldCheck, MoreVertical, Settings, Monitor, Mic as MicIcon, Video as VideoIcon, Pin, PinOff } from 'lucide-react';
import { ChatPanel } from '@/components/room/ChatPanel';
import { cn } from '@/lib/utils';
import { TrackReferenceOrPlaceholder } from '@livekit/components-core';

export default function RoomPage() {
    const { roomId } = useParams();
    const [token, setToken] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [micEnabled, setMicEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);

    useEffect(() => {
        const storedName = localStorage.getItem('meet_user_name') || `User-${Math.floor(Math.random() * 1000)}`;
        const micPref = localStorage.getItem('meet_mic_pref') !== 'false';
        const videoPref = localStorage.getItem('meet_video_pref') !== 'false';

        setUserName(storedName);
        setMicEnabled(micPref);
        setVideoEnabled(videoPref);

        async function getToken() {
            try {
                const resp = await fetch(`${process.env.NEXT_PUBLIC_SIGNALING_SERVER || 'http://localhost:4000'}/api/token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ room: roomId, username: storedName }),
                });
                const data = await resp.json();
                setToken(data.token);
            } catch (e) {
                console.error(e);
            }
        }
        getToken();
    }, [roomId]);

    if (!token) return (
        <div className="h-screen flex items-center justify-center bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 font-medium">Connecting to secure media server...</p>
            </div>
        </div>
    );

    return (
        <RoomProvider userName={userName}>
            <div className="h-screen bg-[#2D2D2D] text-white overflow-hidden flex flex-col">
                <LiveKitRoom
                    video={videoEnabled}
                    audio={micEnabled}
                    token={token}
                    serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://qiq-meet-0bahqf48.livekit.cloud'}
                    data-lk-theme="default"
                    connect={true}
                    className="flex-1 flex flex-col"
                >
                    <RoomHeader title={`Meeting: ${roomId}`} />

                    <div className="flex-1 min-h-0 relative flex">
                        <div className="flex-1 min-h-0 relative">
                            <AdaptiveGrid />
                            <ReactionOverlay />
                        </div>

                        <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
                    </div>

                    <MeetingControls
                        onToggleChat={() => setIsChatOpen(!isChatOpen)}
                        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
                    />
                    <RoomAudioRenderer />

                    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
                </LiveKitRoom>
            </div>
        </RoomProvider>
    );
}

function SettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg glass-card p-8 space-y-8 relative shadow-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <Settings className="text-blue-500" />
                        Settings
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <LogOut size={20} className="rotate-45" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Audio Settings
                        </label>
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MicIcon size={20} className="text-blue-400" />
                                <div>
                                    <p className="font-medium">Microphone</p>
                                    <p className="text-xs text-slate-500">System Default</p>
                                </div>
                            </div>
                            <div className="h-2 w-24 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-1/3 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Video Settings
                        </label>
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <VideoIcon size={20} className="text-blue-400" />
                                <div>
                                    <p className="font-medium">Camera</p>
                                    <p className="text-xs text-slate-500">Integrated Webcam</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold border border-blue-500/10">Active</div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full primary-button !py-4"
                >
                    Done
                </button>
            </motion.div>
        </div>
    );
}

function RoomHeader({ title }: { title: string }) {
    const router = useRouter();
    const [isCopied, setIsCopied] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-16 flex items-center justify-between px-6 bg-[#1A1A1A]/80 backdrop-blur-xl border-b border-white/5 z-50">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <Image src="/logo.png" alt="Quick Meet Logo" width={28} height={28} className="rounded-lg shadow-lg" />
                    <h2 className="font-bold text-white text-xl tracking-tight hidden sm:block" style={{ fontFamily: 'SF Pro Display, sans-serif' }}>Quick Meet</h2>
                </div>
                <div className="h-4 w-px bg-white/10 hidden sm:block" />
                <div className="flex items-center gap-3 relative">
                    <h2 className="font-medium text-slate-300 text-sm">{title}</h2>
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className="p-1.5 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <Info size={16} />
                    </button>

                    <AnimatePresence>
                        {showInfo && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute top-full mt-2 left-0 w-80 glass-card p-6 z-50 overflow-hidden"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-blue-400">
                                        <ShieldCheck size={20} />
                                        <span className="text-sm font-semibold uppercase tracking-wider">End-to-End Encrypted</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Joining info</p>
                                        <p className="text-sm text-slate-200 break-all">{window.location.href}</p>
                                    </div>
                                    <button
                                        onClick={copyLink}
                                        className="w-full primary-button !py-2.5 flex items-center justify-center gap-2 text-sm"
                                    >
                                        {isCopied ? <ShieldCheck size={18} /> : <Copy size={18} />}
                                        {isCopied ? 'Link Copied!' : 'Copy joining info'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center px-3 py-1.5 bg-slate-800 rounded-lg border border-white/5 text-slate-300 text-xs font-medium mr-4">
                    <Users size={14} className="mr-2 text-blue-400" />
                    <span>Active</span>
                </div>
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all font-semibold text-sm"
                >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">End Meeting</span>
                </button>
            </div>
        </div>
    );
}

function AdaptiveGrid() {
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false },
    );

    const [pinnedTrack, setPinnedTrack] = useState<TrackReferenceOrPlaceholder | null>(null);

    const togglePin = (track: TrackReferenceOrPlaceholder) => {
        if (pinnedTrack?.participant.sid === track.participant.sid && pinnedTrack?.source === track.source) {
            setPinnedTrack(null);
        } else {
            setPinnedTrack(track);
        }
    };

    if (pinnedTrack && tracks.length > 1) {
        const otherTracks = tracks.filter(t => t.participant.sid !== pinnedTrack.participant.sid || t.source !== pinnedTrack.source);
        return (
            <div className="flex flex-col md:flex-row h-full w-full gap-4 p-4">
                <div className="flex-[3] relative rounded-2xl overflow-hidden glass-card shadow-2xl transition-all duration-500">
                    <FocusLayout trackRef={pinnedTrack}>
                        <ParticipantTile />
                        <button
                            onClick={() => setPinnedTrack(null)}
                            className="absolute top-6 right-6 p-4 bg-red-500 text-white rounded-full shadow-2xl z-20 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 font-bold"
                            title="Unpin User"
                        >
                            <PinOff size={20} />
                            <span>Unpin</span>
                        </button>
                    </FocusLayout>
                </div>
                {otherTracks.length > 0 && (
                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-full pr-2 custom-scrollbar">
                        {otherTracks.map(track => (
                            <div key={`${track.participant.sid}-${track.source}`} className="aspect-video relative rounded-2xl overflow-hidden glass-card min-h-[160px] group border border-white/5 hover:border-blue-500/50 transition-colors">
                                <ParticipantTile trackRef={track} />
                                <button
                                    onClick={() => togglePin(track)}
                                    className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-blue-600 text-white rounded-xl backdrop-blur-md z-20 transition-all opacity-0 group-hover:opacity-100 shadow-xl border border-white/10"
                                    title="Pin User"
                                >
                                    <Pin size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <GridLayout tracks={tracks} className="grid-layout">
            {/* GridLayout will automatically clone children and pass trackRef */}
            <div className="relative group h-full w-full">
                <ParticipantTile />
                <PinButton onPin={togglePin} />
            </div>
        </GridLayout>
    );
}

function PinButton({ trackRef, onPin }: { trackRef?: TrackReferenceOrPlaceholder, onPin: (track: TrackReferenceOrPlaceholder) => void }) {
    if (!trackRef) return null;
    return (
        <button
            onClick={() => onPin(trackRef)}
            className="absolute top-4 right-4 p-3 bg-slate-950/60 hover:bg-blue-600 text-white rounded-xl backdrop-blur-xl z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl border border-white/10 flex items-center gap-2 text-sm font-bold active:scale-95"
        >
            <Pin size={16} />
            <span>Pin Participant</span>
        </button>
    );
}

function ReactionOverlay() {
    const { reactions } = useRoom();
    return (
        <div className="absolute inset-0 pointer-events-none z-50">
            <AnimatePresence>
                {reactions.map((r) => (
                    <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 0, x: 0 }}
                        animate={{ opacity: 1, y: -200, x: (Math.random() - 0.5) * 100 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-20 left-1/2 text-5xl"
                    >
                        {r.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

function MeetingControls({ onToggleChat, onToggleSettings }: { onToggleChat: () => void, onToggleSettings: () => void }) {
    const { addReaction, toggleRaiseHand, raisedHands, socket } = useRoom();
    const isHandRaised = socket ? raisedHands.includes(socket.id!) : false;
    const [isCopied, setIsCopied] = useState(false);

    const shareMeeting = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-24 bg-[#1A1A1A]/95 backdrop-blur-2xl px-8 flex items-center justify-between relative z-40 border-t border-white/5">
            {/* Left side: Clock or Meeting Name */}
            <div className="flex-1 hidden md:flex items-center gap-4">
                <div className="text-slate-200 font-medium">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="h-4 w-px bg-white/10" />
                <button
                    onClick={shareMeeting}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                >
                    <Share2 size={16} />
                    {isCopied ? 'Link Copied' : 'Share link'}
                </button>
            </div>

            {/* Center: Main Controls */}
            <div className="flex items-center gap-3">
                <div className="glass-card !bg-white/5 !rounded-full p-1.5 flex items-center gap-1 border-white/5">
                    <ControlBar variation="minimal" className="!bg-transparent !border-none" />
                </div>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <button
                    onClick={toggleRaiseHand}
                    className={cn(
                        "control-icon-btn",
                        isHandRaised ? "bg-yellow-500 text-slate-900" : "bg-white/5 hover:bg-white/10"
                    )}
                    title="Raise Hand"
                >
                    <Hand size={22} />
                </button>

                <div className="relative group">
                    <button className="control-icon-btn bg-white/5 hover:bg-white/10">
                        <Smile size={22} />
                    </button>

                    <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-3 p-4 glass-card shadow-2xl scale-110">
                        {['👍', '👏', '❤️', '😂', '🔥', '🎉'].map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => addReaction(emoji)}
                                className="text-3xl hover:scale-130 transition-transform active:scale-95"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right side: Extras */}
            <div className="flex-1 flex justify-end items-center gap-4">
                <button
                    onClick={onToggleChat}
                    className="control-icon-btn bg-white/5 hover:bg-white/10 relative"
                >
                    <MessageSquare size={22} />
                    {/* Badge placeholder */}
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-slate-950 animate-pulse" />
                </button>

                <button className="control-icon-btn bg-white/5 hover:bg-white/10">
                    <Users size={22} />
                </button>

                <button
                    onClick={onToggleSettings}
                    className="control-icon-btn bg-white/5 hover:bg-white/10"
                >
                    <Settings size={22} />
                </button>
            </div>
        </div>
    );
}
