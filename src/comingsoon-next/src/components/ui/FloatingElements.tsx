'use client';

import { motion } from 'framer-motion';

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating orbs */}
      <motion.div
        className="absolute w-4 h-4 rounded-full bg-white/20"
        style={{ top: '20%', left: '10%' }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute w-3 h-3 rounded-full bg-[#FF5722]/30"
        style={{ top: '40%', left: '5%' }}
        animate={{
          y: [0, 15, 0],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />
      <motion.div
        className="absolute w-2 h-2 rounded-full bg-white/30"
        style={{ top: '60%', left: '15%' }}
        animate={{
          y: [0, -10, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
      <motion.div
        className="absolute w-5 h-5 rounded-full bg-[#EC4899]/20"
        style={{ top: '30%', right: '8%' }}
        animate={{
          y: [0, 20, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3,
        }}
      />
      <motion.div
        className="absolute w-3 h-3 rounded-full bg-white/25"
        style={{ top: '70%', right: '12%' }}
        animate={{
          y: [0, -15, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.8,
        }}
      />
      
      {/* Floating lines/shapes */}
      <motion.div
        className="absolute w-20 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{ top: '25%', left: '20%', rotate: '45deg' }}
        animate={{
          opacity: [0, 0.5, 0],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute w-16 h-[1px] bg-gradient-to-r from-transparent via-[#FF5722]/30 to-transparent"
        style={{ top: '55%', right: '20%', rotate: '-30deg' }}
        animate={{
          opacity: [0, 0.4, 0],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
    </div>
  );
}

export function GlowingOrb({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
