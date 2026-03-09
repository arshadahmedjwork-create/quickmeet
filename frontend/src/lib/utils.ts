import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateRoomId() {
    const parts = [];
    for (let i = 0; i < 3; i++) {
        parts.push(Math.random().toString(36).substring(2, 5).toUpperCase());
    }
    return parts.join('-');
}
