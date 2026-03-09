import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface NavbarProps {
    className?: string;
}

export const Navbar: FC<NavbarProps> = ({ className }) => {
    return (
        <nav className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-[#2D2D2D]/80 backdrop-blur-xl z-50 px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="QIQ Logo" width={32} height={32} />
                <span className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'SF Pro Display, -apple-system, sans-serif' }}>
                    Quick Meet
                </span>
            </Link>

            <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest hidden sm:inline">Secure • Fast • QIQ</span>
                <div className="h-2 w-2 rounded-full bg-[#7A00E1] shadow-[0_0_10px_#7A00E1] animate-pulse" />
            </div>
        </nav>
    );
};
