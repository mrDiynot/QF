'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const VIDEO_SRC = '/audio/Video 2026-04-13 at 14.05.19.mp4';

export function VideoCtaSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVolumeChange = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.muted) {
      video.currentTime = 0;
    }
  }, []);

  return (
    <section id="demo" className="relative py-24 px-6 overflow-hidden" style={{ background: '#111827' }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-[0.06]"
          style={{ background: '#7C3AED', filter: 'blur(120px)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-5 border"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#A78BFA' }}
          >
            <Play className="w-4 h-4" style={{ color: '#FF5722' }} />
            See It in Action
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Watch Qualiflow AI{' '}
            <span style={{ color: '#FF5722' }}>Work Its Magic</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            From lead capture to booking in under 2 minutes
          </p>
        </motion.div>

        {/* Video placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative aspect-video rounded-2xl overflow-hidden border mb-10"
          style={{ background: '#1C2333', borderColor: 'rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
        >
          {/* Video element */}
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            className="absolute inset-0 w-full h-full object-cover"
            controls
            playsInline
            preload="auto"
            loop
            muted
            autoPlay
            onVolumeChange={handleVolumeChange}
          />


        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #FF5722, #FF6B35)',
              boxShadow: '0 8px 24px rgba(255,87,34,0.4)',
            }}
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default VideoCtaSection;
