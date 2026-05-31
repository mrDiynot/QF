'use client';

import { motion } from 'framer-motion';
import {
  Phone,
  QrCode,
  FileText,
  Mail,
  Instagram,
  Facebook,
  MessageSquare,
  CheckCheck,
  Star,
} from 'lucide-react';

// ── Floating badge data ─────────────────────────────────────────────────────
const BADGES = [
  {
    label: 'Lead Captured',
    sub: 'Instagram',
    icon: '📸',
    iconBg: 'bg-gradient-to-br from-pink-500 to-rose-500',
    position: 'top-[14%] -left-[8%]',
    delay: 0.8,
  },
  {
    label: 'AI Qualified',
    sub: 'Hot Lead',
    icon: '⭐',
    iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
    position: 'bottom-[28%] -left-[10%]',
    delay: 1.2,
  },
  {
    label: 'Instant Reply',
    sub: 'Sent',
    icon: '💬',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    position: 'top-[30%] -right-[10%]',
    delay: 1.0,
  },
  {
    label: 'Appointment',
    sub: 'Booked',
    icon: '📅',
    iconBg: 'bg-gradient-to-br from-pink-400 to-rose-500',
    position: 'bottom-[14%] -right-[8%]',
    delay: 1.4,
  },
];

// ── Channel icon row ────────────────────────────────────────────────────────
const CHANNELS = [
  { Icon: Phone, bg: 'bg-blue-600', label: 'Phone' },
  { Icon: QrCode, bg: 'bg-blue-500', label: 'QR Code' },
  { Icon: FileText, bg: 'bg-orange-500', label: 'Forms' },
  { Icon: Mail, bg: 'bg-purple-500', label: 'Email' },
  { Icon: Instagram, bg: 'bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400', label: 'Instagram' },
  { Icon: Facebook, bg: 'bg-blue-700', label: 'Facebook' },
  { Icon: MessageSquare, bg: 'bg-green-600', label: 'WhatsApp' },
  { Icon: MessageSquare, bg: 'bg-emerald-500', label: 'Chat' },
];

// ── Component ───────────────────────────────────────────────────────────────
export function HeroConversationAnimation() {
  return (
    <div className="relative w-full max-w-[540px] mx-auto select-none" aria-hidden="true">
      {/* ── Glow streaks ─────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 -inset-x-16 -inset-y-8 pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        {/* Top-right glow streak */}
        <div
          className="absolute top-[10%] right-[-10%] w-[420px] h-[180px] rounded-full blur-[60px] opacity-30"
          style={{
            background: 'linear-gradient(135deg, #FF5722, #FF8C42, transparent)',
          }}
        />
        {/* Bottom-left glow streak */}
        <div
          className="absolute bottom-[15%] left-[-15%] w-[350px] h-[160px] rounded-full blur-[50px] opacity-25"
          style={{
            background: 'linear-gradient(225deg, #8B5CF6, #EC4899, transparent)',
          }}
        />
        {/* Animated ring */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/[0.06]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.05, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* ── Chat window ──────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 rounded-2xl border border-white/15 bg-[#1a1030]/90 backdrop-blur-xl shadow-2xl shadow-purple-900/40 overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60 font-medium">
            Real-Time
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          </div>
        </div>

        {/* Chat body */}
        <div className="px-5 py-5 space-y-5">
          {/* Contact header */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shrink-0">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Sarah M.</div>
              <div className="text-white/40 text-xs">Instagram DM</div>
            </div>
          </motion.div>

          {/* Incoming message */}
          <motion.div
            className="flex items-start gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              SM
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
              <p className="text-white/90 text-sm">Hey, are you still offering lawn care services?</p>
            </div>
          </motion.div>

          {/* AI reply */}
          <motion.div
            className="flex justify-end"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            <div className="bg-gradient-to-br from-purple-600/80 to-purple-800/80 border border-purple-400/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] shadow-lg shadow-purple-900/30">
              <p className="text-white text-sm leading-relaxed">
                Absolutely! 🌿
                <br />
                We&apos;re offering 20% off this week.
                <br />
                Would you like a free quote?
              </p>
              <div className="flex justify-end mt-1">
                <CheckCheck className="w-4 h-4 text-blue-400" />
              </div>
            </div>
          </motion.div>

          {/* Timestamp */}
          <motion.div
            className="flex items-center gap-1.5 justify-center text-white/30 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.4 }}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Just now
          </motion.div>
        </div>

        {/* Channel icons bar */}
        <motion.div
          className="flex items-center justify-center gap-3 px-5 py-4 border-t border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          {CHANNELS.map(({ Icon, bg, label }) => (
            <div
              key={label}
              className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shadow-lg`}
              title={label}
            >
              <Icon className="w-4.5 h-4.5 text-white" />
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Floating badges ──────────────────────────────────────── */}
      {BADGES.map((badge) => (
        <motion.div
          key={badge.label}
          className={`absolute z-20 ${badge.position}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: badge.delay, duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.08] backdrop-blur-xl border border-white/15 shadow-xl shadow-black/20"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 3 + badge.delay * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className={`w-8 h-8 rounded-lg ${badge.iconBg} flex items-center justify-center text-base`}>
              {badge.icon}
            </div>
            <div>
              <div className="text-white text-xs font-semibold whitespace-nowrap">{badge.label}</div>
              <div className="text-white/50 text-[10px] font-medium">{badge.sub}</div>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

export default HeroConversationAnimation;
