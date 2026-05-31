'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animated?: boolean;
  href?: string;
}

function LogoContent({ icon, text, gap, animated, showText }: { icon: number; text: string; gap: string; animated: boolean; showText: boolean }) {
  return (
    <div className={`flex items-center ${gap} group`}>
      {/* Animated Logo Icon */}
      <div className="relative" style={{ width: icon, height: icon }}>
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#6B2D9E]/30 via-[#EC4899]/20 to-[#FF5722]/30 blur-lg"
          animate={animated ? {
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Main icon container */}
        <motion.div
          className="relative w-full h-full rounded-xl bg-gradient-to-br from-[#6B2D9E] via-[#8B3DAE] to-[#EC4899] p-[2px] overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {/* Inner background */}
          <div className="w-full h-full rounded-[10px] bg-gradient-to-br from-[#6B2D9E] to-[#8B3DAE] flex items-center justify-center relative overflow-hidden">
            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              animate={animated ? {
                x: ['-100%', '200%'],
              } : {}}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
            />
            
            {/* Q Letter with flow effect */}
            <svg
              viewBox="0 0 32 32"
              fill="none"
              className="w-[70%] h-[70%] relative z-10"
            >
              {/* Stylized Q with flow lines */}
              <motion.path
                d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12c2.761 0 5.304-.934 7.333-2.5"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={animated ? { pathLength: 1 } : { pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              {/* Flow tail extending outward */}
              <motion.path
                d="M20 20L28 28"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={animated ? { pathLength: 1 } : { pathLength: 1 }}
                transition={{ duration: 0.5, delay: 1, ease: "easeOut" }}
              />
              {/* Inner flow accent */}
              <motion.circle
                cx="16"
                cy="16"
                r="5"
                stroke="white"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4 2"
                initial={{ rotate: 0 }}
                animate={animated ? { rotate: 360 } : {}}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: '16px 16px' }}
              />
              {/* AI dot accent */}
              <motion.circle
                cx="16"
                cy="16"
                r="2"
                fill="white"
                initial={{ scale: 0 }}
                animate={animated ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
          </div>
        </motion.div>
        
        {/* Orbiting particle */}
        {animated && (
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full bg-[#FF5722]"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              top: '50%',
              left: '50%',
              marginTop: -icon / 2 - 4,
              marginLeft: -3,
              transformOrigin: `3px ${icon / 2 + 4}px`,
            }}
          />
        )}
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <div className={`${text} font-bold tracking-tight leading-none`}>
            <span className="text-gray-900 group-hover:text-[#6B2D9E] transition-colors">Quali</span>
            <span className="bg-gradient-to-r from-[#6B2D9E] to-[#EC4899] bg-clip-text text-transparent">flow</span>
            <span className="text-[#FF5722] font-black">AI</span>
          </div>
          <span className="text-[10px] font-medium text-gray-400 tracking-[0.2em] uppercase mt-0.5">
            Never Miss a Lead
          </span>
        </div>
      )}
    </div>
  );
}

export function Logo({ size = 'md', showText = true, animated = true, href = '/' }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg', gap: 'gap-2' },
    md: { icon: 40, text: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 48, text: 'text-2xl', gap: 'gap-3' },
  };

  const { icon, text, gap } = sizes[size];

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B2D9E] rounded-lg">
        <LogoContent icon={icon} text={text} gap={gap} animated={animated} showText={showText} />
      </Link>
    );
  }

  return <LogoContent icon={icon} text={text} gap={gap} animated={animated} showText={showText} />;
}

export function LogoIcon({ size = 32 }: { size?: number; animated?: boolean }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#6B2D9E] via-[#8B3DAE] to-[#EC4899] p-[2px]">
        <div className="w-full h-full rounded-[10px] bg-gradient-to-br from-[#6B2D9E] to-[#8B3DAE] flex items-center justify-center">
          <svg viewBox="0 0 32 32" fill="none" className="w-[70%] h-[70%]">
            <path
              d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12c2.761 0 5.304-.934 7.333-2.5"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M20 20L28 28"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="16" cy="16" r="5" stroke="white" strokeWidth="2" fill="none" strokeDasharray="4 2" />
            <circle cx="16" cy="16" r="2" fill="white" />
          </svg>
        </div>
      </div>
    </div>
  );
}
