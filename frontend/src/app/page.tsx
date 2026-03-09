'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Video, ArrowRight, Share2, Zap, Shield, Globe } from 'lucide-react';
import { generateRoomId } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startMeeting = () => {
    setLoading(true);
    const roomId = generateRoomId();
    router.push(`/m/${roomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 md:py-24 bg-[#2D2D2D] min-h-screen">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl text-center space-y-10 relative z-10"
      >

        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white" style={{ fontFamily: 'SF Pro Display, sans-serif' }}>
          Meetings for <br />
          <span className="bg-gradient-to-r from-[#7A00E1] via-[#8A10F1] to-[#7A00E1] bg-clip-text text-transparent">
            Quick collaboration.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
          No login. No friction. Just high-definition video calls, screen sharing, and real-time reactions in a cleaner interface.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
          <button
            onClick={startMeeting}
            disabled={loading}
            className="primary-button group flex items-center gap-4 text-xl px-12 py-5 rounded-2xl shadow-[0_0_30px_rgba(122,0,225,0.3)] hover:shadow-[0_0_50px_rgba(122,0,225,0.5)]"
          >
            <Video size={24} className="group-hover:scale-110 transition-transform" />
            {loading ? 'Generating...' : 'Start Instant Meeting'}
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-6xl w-full">
        <FeatureCard
          icon={<Zap className="text-[#7A00E1]" />}
          title="Quick Start"
          description="One click. Zero friction. Share your Quick link and start collaborating instantly."
        />
        <FeatureCard
          icon={<Shield className="text-violet-400" />}
          title="Platinum Security"
          description="End-to-end encrypted tunnels and anonymous session tokens for total privacy."
        />
        <FeatureCard
          icon={<Globe className="text-blue-400" />}
          title="Browser Based"
          description="No app downloads required. Works perfectly on Chrome, Safari, and Mobile."
        />
      </div>

      {/* 3D Google Veo Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{
            scale: [1.1, 1.2, 1.1],
            rotate: [0, 1, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <Image
            src="/veo-bg.png"
            alt="Veo Background"
            fill
            className="object-cover opacity-60"
            priority
          />
        </motion.div>

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2D2D2D]/80 via-transparent to-[#2D2D2D]" />
        <div className="absolute inset-0 bg-[#2D2D2D]/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card p-8 space-y-4 hover:border-white/20 transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
