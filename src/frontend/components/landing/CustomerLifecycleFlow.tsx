'use client';

import { motion } from 'framer-motion';
import {
  Users, Bot, Target, Award, Calendar, Mail,
  Send, CheckCircle, MessageCircle, Star, BarChart3,
} from 'lucide-react';

// Each step: base gradient for the glass fill, and the glow color on hover
const STEPS = [
  { label: 'Lead Captured',    icon: Users,         color: '#FF5722', glow: 'rgba(255,87,34,0.55)' },
  { label: 'AI Responds',      icon: Bot,           color: '#7C3AED', glow: 'rgba(124,58,237,0.55)' },
  { label: 'AI Qualifies',     icon: Target,        color: '#FF6B35', glow: 'rgba(255,107,53,0.55)' },
  { label: 'AI Scores',        icon: Award,         color: '#6B2D9E', glow: 'rgba(107,45,158,0.55)' },
  { label: 'AI Books',         icon: Calendar,      color: '#FF5722', glow: 'rgba(255,87,34,0.55)' },
  { label: 'Creates Proposal', icon: Mail,          color: '#9333EA', glow: 'rgba(147,51,234,0.55)' },
  { label: 'Assigns Reviewer', icon: Users,         color: '#FF5722', glow: 'rgba(255,87,34,0.55)' },
  { label: 'Sends Proposal',   icon: Send,          color: '#7C3AED', glow: 'rgba(124,58,237,0.55)' },
  { label: 'Tracks Acceptance',icon: CheckCircle,   color: '#FF6B35', glow: 'rgba(255,107,53,0.55)' },
  { label: 'AI Follows Up',    icon: MessageCircle, color: '#6B2D9E', glow: 'rgba(107,45,158,0.55)' },
  { label: 'Collects Reviews', icon: Star,          color: '#FF5722', glow: 'rgba(255,87,34,0.55)' },
  { label: 'CRM Updated',      icon: BarChart3,     color: '#FF8C42', glow: 'rgba(255,140,66,0.50)' },
] as const;

export function CustomerLifecycleFlow() {
  return (
    <section className="relative py-20 px-6 overflow-hidden bg-gradient-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#4a2875]">
      {/* Ambient radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, rgba(255,87,34,0.12) 0%, rgba(139,92,246,0.06) 55%, transparent 80%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(ellipse, rgba(107,45,158,0.18) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Section header */}
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-center text-2xl sm:text-3xl font-bold text-white mb-2"
          >
            Complete Customer Lifecycle Automation
          </motion.h2>
          <p className="text-center text-white/60 mb-14 text-base">
            AI handles everything from first touch to loyal customer
          </p>

          {/* Steps grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-x-3 gap-y-10">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + index * 0.055, duration: 0.45 }}
                  whileHover={{ scale: 1.14, y: -7 }}
                  className="flex flex-col items-center gap-3 group cursor-pointer"
                >
                  {/* Glassy icon bubble */}
                  <div className="relative flex items-center justify-center" style={{ width: 60, height: 60 }}>
                    {/* Outer glow pulse */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: step.glow, filter: 'blur(12px)', transform: 'scale(1.15)' }}
                    />

                    {/* Glass card */}
                    <div
                      className="relative w-full h-full rounded-2xl flex items-center justify-center overflow-hidden"
                      style={{
                        background: step.color,
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        boxShadow: `0 4px 16px ${step.glow.replace('0.55', '0.35')}, inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.2)`,
                        border: '1px solid rgba(255,255,255,0.18)',
                      }}
                    >
                      {/* Gloss highlight — top-left sheen */}
                      <div
                        className="absolute top-0 left-0 w-full h-1/2 rounded-t-2xl"
                        style={{
                          background:
                            'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 100%)',
                        }}
                      />
                      {/* Subtle inner sparkle dot */}
                      <div
                        className="absolute top-2 right-2.5 w-1 h-1 rounded-full bg-white/50"
                      />

                      <Icon
                        className="relative z-10 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                        style={{ width: 26, height: 26 }}
                        strokeWidth={1.8}
                      />
                    </div>
                  </div>

                  {/* Step number + label */}
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white/70"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {index + 1}
                    </span>
                    <span className="text-[11px] text-white/70 text-center font-medium leading-tight group-hover:text-white transition-colors duration-200">
                      {step.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Animated connector line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.95, duration: 1.1, ease: 'easeOut' }}
            className="mt-12 mx-auto h-px max-w-4xl origin-left"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,87,34,0.5) 30%, rgba(139,92,246,0.5) 70%, transparent 100%)',
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}

export default CustomerLifecycleFlow;
