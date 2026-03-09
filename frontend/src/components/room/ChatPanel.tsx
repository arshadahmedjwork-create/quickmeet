'use client';

import { useState, useEffect, useRef } from 'react';
import { useRoom } from '@/context/RoomContext';
import { Send, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    sender: string;
    senderName: string;
    content: string;
    timestamp: number;
}

export function ChatPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { socket, roomId, userName } = useRoom();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (data: any) => {
            if (data.type === 'chat') {
                setMessages(prev => [...prev, {
                    id: Math.random().toString(36).substring(7),
                    sender: data.sender,
                    senderName: data.payload.senderName,
                    content: data.payload.content,
                    timestamp: Date.now()
                }]);
            }
        };

        socket.on('signal', handleMessage);
        return () => {
            socket.off('signal', handleMessage);
        };
    }, [socket]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = () => {
        if (!inputValue.trim() || !socket) return;

        const payload = {
            content: inputValue,
            senderName: userName
        };

        socket.emit('signal', { roomId, type: 'chat', payload });

        // Add locally
        setMessages(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            sender: 'me',
            senderName: userName,
            content: inputValue,
            timestamp: Date.now()
        }]);

        setInputValue('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 320 }}
                    animate={{ x: 0 }}
                    exit={{ x: 320 }}
                    className="fixed right-4 top-20 bottom-24 w-80 glass-card flex flex-col z-40 overflow-hidden shadow-2xl"
                >
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <h3 className="font-bold">Chat</h3>
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg">
                            <X size={18} />
                        </button>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                                <p>No messages yet.</p>
                                <p>Say hi to the group!</p>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn(
                                "flex flex-col gap-1",
                                msg.sender === 'me' ? "items-end" : "items-start"
                            )}>
                                <span className="text-[10px] text-slate-500 px-1">{msg.senderName}</span>
                                <div className={cn(
                                    "px-3 py-2 rounded-2xl text-sm max-w-[85%]",
                                    msg.sender === 'me' ? "bg-blue-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-200 rounded-tl-none"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-white/10 bg-white/5">
                        <div className="flex items-center gap-2 bg-slate-900 rounded-xl px-3 py-2 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                            />
                            <button
                                onClick={sendMessage}
                                className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                disabled={!inputValue.trim()}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
