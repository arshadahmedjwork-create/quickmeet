'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'next/navigation';

interface RoomState {
    socket: Socket | null;
    roomId: string;
    userName: string;
    reactions: Array<{ id: string; emoji: string; userId: string }>;
    raisedHands: string[];
    addReaction: (emoji: string) => void;
    toggleRaiseHand: () => void;
}

const RoomContext = createContext<RoomState | undefined>(undefined);

export function RoomProvider({ children, userName }: { children: ReactNode; userName: string }) {
    const { roomId } = useParams() as { roomId: string };
    const [socket, setSocket] = useState<Socket | null>(null);
    const [reactions, setReactions] = useState<Array<{ id: string; emoji: string; userId: string }>>([]);
    const [raisedHands, setRaisedHands] = useState<string[]>([]);

    useEffect(() => {
        const s = io(process.env.NEXT_PUBLIC_SIGNALING_SERVER || 'http://localhost:4000');
        setSocket(s);

        s.emit('join-room', roomId);

        s.on('signal', (data) => {
            if (data.type === 'reaction') {
                const id = Math.random().toString(36).substring(7);
                setReactions(prev => [...prev, { id, emoji: data.payload.emoji, userId: data.sender }]);
                setTimeout(() => {
                    setReactions(prev => prev.filter(r => r.id !== id));
                }, 2000);
            } else if (data.type === 'raise-hand') {
                setRaisedHands(prev =>
                    data.payload.raised
                        ? [...new Set([...prev, data.sender])]
                        : prev.filter(id => id !== data.sender)
                );
            }
        });

        return () => {
            s.disconnect();
        };
    }, [roomId]);

    const addReaction = (emoji: string) => {
        if (!socket) return;
        socket.emit('signal', { roomId, type: 'reaction', payload: { emoji } });

        // Also show locally
        const id = Math.random().toString(36).substring(7);
        setReactions(prev => [...prev, { id, emoji, userId: 'me' }]);
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== id));
        }, 2000);
    };

    const toggleRaiseHand = () => {
        if (!socket) return;
        const isRaised = !raisedHands.includes(socket.id!);
        socket.emit('signal', { roomId, type: 'raise-hand', payload: { raised: isRaised } });

        setRaisedHands(prev =>
            isRaised ? [...new Set([...prev, socket.id!])] : prev.filter(id => id !== socket.id!)
        );
    };

    return (
        <RoomContext.Provider value={{ socket, roomId, userName, reactions, raisedHands, addReaction, toggleRaiseHand }}>
            {children}
        </RoomContext.Provider>
    );
}

export const useRoom = () => {
    const context = useContext(RoomContext);
    if (!context) throw new Error('useRoom must be used within RoomProvider');
    return context;
};
