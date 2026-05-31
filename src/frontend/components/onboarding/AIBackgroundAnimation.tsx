'use client';

/**
 * AI-Themed Background Animation for Onboarding
 * Creates an immersive, professional yet engaging visual experience
 * depicting an AI-powered platform with floating icons, particles, and gradient effects
 */

import { 
  Brain, MessageSquare, Sparkles, Zap, Bot, 
  Phone, Mail, BarChart3, Network, Workflow
} from 'lucide-react';

// Floating icon configuration - positioned around the edges
const floatingIcons = [
  { Icon: Brain, position: 'top-[15%] left-[8%]', delay: '0s', size: 'size-8' },
  { Icon: MessageSquare, position: 'top-[25%] right-[10%]', delay: '1s', size: 'size-6' },
  { Icon: Sparkles, position: 'bottom-[30%] left-[5%]', delay: '2s', size: 'size-7' },
  { Icon: Bot, position: 'top-[60%] right-[8%]', delay: '0.5s', size: 'size-8' },
  { Icon: Phone, position: 'bottom-[20%] right-[15%]', delay: '1.5s', size: 'size-6' },
  { Icon: Mail, position: 'top-[45%] left-[3%]', delay: '2.5s', size: 'size-5' },
  { Icon: BarChart3, position: 'bottom-[45%] right-[5%]', delay: '0.8s', size: 'size-6' },
  { Icon: Network, position: 'top-[8%] right-[25%]', delay: '1.8s', size: 'size-5' },
  { Icon: Workflow, position: 'bottom-[15%] left-[12%]', delay: '2.2s', size: 'size-6' },
  { Icon: Zap, position: 'top-[75%] left-[8%]', delay: '0.3s', size: 'size-5' },
];

// Particle configuration for subtle floating dots
const particles = [
  { position: 'top-[20%] left-[20%]', delay: '0s' },
  { position: 'top-[40%] left-[35%]', delay: '0.5s' },
  { position: 'top-[15%] right-[30%]', delay: '1s' },
  { position: 'top-[55%] right-[20%]', delay: '1.5s' },
  { position: 'bottom-[35%] left-[25%]', delay: '2s' },
  { position: 'bottom-[25%] right-[35%]', delay: '2.5s' },
  { position: 'top-[70%] left-[40%]', delay: '0.8s' },
  { position: 'top-[30%] right-[45%]', delay: '1.3s' },
  { position: 'bottom-[50%] left-[45%]', delay: '1.8s' },
  { position: 'bottom-[40%] right-[25%]', delay: '2.3s' },
  { position: 'top-[85%] left-[30%]', delay: '0.6s' },
  { position: 'top-[10%] left-[50%]', delay: '1.6s' },
];

interface AIBackgroundAnimationProps {
  variant?: 'dark' | 'light';
}

export function AIBackgroundAnimation({ variant = 'dark' }: AIBackgroundAnimationProps) {
  const isLight = variant === 'light';

  return (
    <>
      {/* Base gradient background - only for dark variant */}
      {!isLight && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      )}

      {/* Animated mesh gradient overlay */}
      <div className={`absolute inset-0 ${isLight ? 'opacity-40' : 'opacity-30'}`}>
        <div 
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background: isLight
              ? 'radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at 20% 30%, rgba(79, 57, 246, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(255, 105, 0, 0.2) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Large animated gradient orbs - Using brand colors */}
      <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] ${isLight ? 'bg-primary/10' : 'bg-primary/20'} rounded-full blur-[120px] animate-float-slow`} />
      <div className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] ${isLight ? 'bg-brand-orange/10' : 'bg-brand-orange/15'} rounded-full blur-[100px] animate-float-slow`} style={{ animationDelay: '2s' }} />
      <div className={`absolute top-1/2 left-0 w-[300px] h-[300px] ${isLight ? 'bg-muted/20' : 'bg-muted/20'} rounded-full blur-[80px] animate-float-slow`} style={{ animationDelay: '4s' }} />
      <div className={`absolute top-1/3 right-0 w-[350px] h-[350px] ${isLight ? 'bg-primary/5' : 'bg-primary/10'} rounded-full blur-[90px] animate-float-slow`} style={{ animationDelay: '3s' }} />

      {/* Neural network connection lines - SVG with viewBox for proper scaling */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(79, 57, 246, 0.5)" />
            <stop offset="100%" stopColor="rgba(255, 105, 0, 0.4)" />
          </linearGradient>
        </defs>
        {/* Animated connection paths - using numeric coordinates in 0-100 viewBox */}
        <path
          d="M 10 20 Q 30 40, 50 30 T 90 50"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="0.5"
          className="animate-draw-line"
          strokeDasharray="200"
          strokeDashoffset="200"
        />
        <path
          d="M 5 60 Q 25 50, 45 70 T 85 40"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="0.5"
          className="animate-draw-line"
          strokeDasharray="200"
          strokeDashoffset="200"
          style={{ animationDelay: '1s' }}
        />
        <path
          d="M 15 80 Q 35 60, 55 85 T 95 70"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="0.3"
          className="animate-draw-line"
          strokeDasharray="200"
          strokeDashoffset="200"
          style={{ animationDelay: '2s' }}
        />
      </svg>

      {/* Floating AI icons */}
      {floatingIcons.map(({ Icon, position, delay, size }, index) => (
        <div
          key={index}
          className={`absolute ${position} animate-float-icon opacity-0`}
          style={{ animationDelay: delay }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
            <Icon className={`${size} text-primary/60 relative`} />
          </div>
        </div>
      ))}

      {/* Floating particles */}
      {particles.map(({ position, delay }, index) => (
        <div
          key={`particle-${index}`}
          className={`absolute ${position} animate-particle`}
          style={{ animationDelay: delay }}
        >
          <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
        </div>
      ))}

      {/* Sparkle accents */}
      <div className="absolute top-[12%] left-[45%] animate-sparkle" style={{ animationDelay: '0s' }}>
        <Sparkles className="size-4 text-brand-orange/40" />
      </div>
      <div className="absolute top-[65%] right-[30%] animate-sparkle" style={{ animationDelay: '1.5s' }}>
        <Sparkles className="size-3 text-primary/40" />
      </div>
      <div className="absolute bottom-[25%] left-[35%] animate-sparkle" style={{ animationDelay: '3s' }}>
        <Sparkles className="size-5 text-primary/40" />
      </div>

      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </>
  );
}

