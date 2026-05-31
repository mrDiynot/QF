'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Mail, MessageSquare, Phone,
  Zap, ArrowRight, CheckCircle2,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

// Only Email, SMS, WhatsApp
const CHANNELS = [
  { label: 'Email',    icon: Mail,          color: '#FF5722', pct: 45, note: 'Best time: 10–11 AM'  },
  { label: 'SMS',      icon: MessageSquare, color: '#7C3AED', pct: 78, note: '78% response rate', best: true },
  { label: 'WhatsApp', icon: Phone,         color: '#25D366', pct: 62, note: '' },
] as const;

const CHAT_MESSAGES = [
  { from: 'ai'   as const, text: 'Hi! I saw your inquiry about our service.', time: '10:32 AM' },
  { from: 'lead' as const, text: 'Yes, I need more details',                   time: '10:35 AM' },
  { from: 'ai'   as const, text: 'Happy to help! When would be a good time to discuss?', time: '10:36 AM' },
];

const BG_IMAGE_URL =
  'https://images.unsplash.com/photo-1743865320670-8f4722dd3542?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGxhcHRvcHxlbnwxfHx8fDE3Njg2NzA1ODR8MA&ixlib=rb-4.1.0&q=80&w=1080';

// ─── Animated Channel Bar (white panel) ───────────────────────────────────────
function ChannelBar({
  label, icon: Icon, color, pct, note, best = false, delay,
}: {
  label: string; icon: React.ElementType; color: string; pct: number;
  note?: string; best?: boolean; delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} className="flex items-center gap-2.5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: color }}
      >
        <Icon className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-gray-700">{label}</span>
            {best && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold text-white" style={{ background: '#7C3AED' }}>
                Best
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold tabular-nums" style={{ color }}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-200">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={inView ? { width: `${pct}%` } : { width: 0 }}
            transition={{ delay, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        {note && <p className="text-[10px] text-gray-400 mt-0.5">{note}</p>}
      </div>
    </div>
  );
}

// ─── Phone Mockup ─────────────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div
      className="relative mx-auto shrink-0"
      style={{
        width: 280,
        borderRadius: 42,
        background: '#18181B',
        padding: '10px 8px',
        boxShadow:
          '0 0 0 1.5px #3F3F46, 0 0 0 3px #27272A, 0 28px 72px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Side buttons */}
      <div className="absolute -left-[3px] top-[80px] w-[3px] h-7 rounded-l-full" style={{ background: '#3F3F46' }} />
      <div className="absolute -left-[3px] top-[118px] w-[3px] h-9 rounded-l-full" style={{ background: '#3F3F46' }} />
      <div className="absolute -left-[3px] top-[140px] w-[3px] h-9 rounded-l-full" style={{ background: '#3F3F46' }} />
      <div className="absolute -right-[3px] top-[108px] w-[3px] h-12 rounded-r-full" style={{ background: '#3F3F46' }} />

      {/* Screen */}
      <div
        className="overflow-hidden flex flex-col"
        style={{ borderRadius: 34, background: '#ffffff', minHeight: 520 }}
      >
        {/* Status bar */}
        <div
          className="flex items-center justify-between px-5 pt-2.5 pb-1 shrink-0"
          style={{ background: '#2D1060' }}
        >
          <span className="text-[10px] font-semibold text-white/80">9:41</span>
          <div className="w-16 h-4 rounded-full" style={{ background: '#000' }} />
          <div className="flex items-center gap-1">
            {/* Signal bars */}
            <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
              <rect x="0" y="3" width="2" height="6" rx="0.4" fill="white" fillOpacity="0.5" />
              <rect x="3" y="2" width="2" height="7" rx="0.4" fill="white" fillOpacity="0.7" />
              <rect x="6" y="1" width="2" height="8" rx="0.4" fill="white" fillOpacity="0.9" />
              <rect x="9" y="0" width="2" height="9" rx="0.4" fill="white" />
            </svg>
            {/* Battery */}
            <svg width="20" height="9" viewBox="0 0 20 9" fill="none">
              <rect x="0" y="0.5" width="17" height="8" rx="1.8" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
              <rect x="17.5" y="2.5" width="2" height="4" rx="1" fill="white" fillOpacity="0.4" />
              <rect x="1" y="1.5" width="13" height="6" rx="1.2" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
        </div>

        {/* App header */}
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-white/10 shrink-0"
          style={{ background: '#2D1060' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ background: '#7C3AED' }}
          >
            SC
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-white font-semibold text-[11px]">Sarah Chen</p>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            </div>
            <p className="text-[9px] text-white/50 truncate">QualiFlowAI™</p>
          </div>
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-white shrink-0"
            style={{ background: '#7C3AED' }}
          >
            <MessageSquare className="w-2.5 h-2.5" />
            SMS
          </div>
        </div>

        {/* Chat area — white background */}
        <div className="flex-1 px-3.5 py-3 flex flex-col gap-2" style={{ background: '#F8F9FA' }}>
          <div className="flex items-center gap-2 my-0.5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[9px] text-gray-400 font-medium">Today</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {CHAT_MESSAGES.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
              className={`flex ${msg.from === 'ai' ? 'justify-start' : 'justify-end'}`}
            >
              {msg.from === 'ai' && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0 mr-1.5 mt-auto"
                  style={{ background: '#7C3AED' }}
                >
                  Q
                </div>
              )}
              <div
                className="max-w-[72%] px-2.5 py-1.5 text-[10px] leading-relaxed shadow-sm"
                style={
                  msg.from === 'ai'
                    ? { background: '#fff', color: '#374151', borderRadius: '3px 12px 12px 12px', border: '1px solid #E5E7EB' }
                    : { background: '#FF5722', color: '#fff', borderRadius: '12px 3px 12px 12px' }
                }
              >
                {msg.text}
                <p className="text-[8px] mt-0.5 text-right" style={{ opacity: msg.from === 'ai' ? 0.45 : 0.7 }}>
                  {msg.time}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0 mr-1.5"
              style={{ background: '#7C3AED' }}
            >
              Q
            </div>
            <div
              className="px-2.5 py-2 border border-gray-200 flex gap-1 items-center"
              style={{ background: '#fff', borderRadius: '3px 12px 12px 12px' }}
            >
              {[0, 0.15, 0.3].map((d) => (
                <motion.span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#9CA3AF' }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Input bar */}
        <div className="px-3 py-2 flex items-center gap-2 border-t border-gray-100 shrink-0" style={{ background: '#fff' }}>
          <div className="flex-1 px-3 py-1.5 rounded-full bg-gray-100 text-[10px] text-gray-400">
            Type a message…
          </div>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ background: '#FF5722' }}
          >
            <ArrowRight className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center pb-2 pt-1 shrink-0" style={{ background: '#fff' }}>
          <div className="w-16 h-1 rounded-full bg-gray-300" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function ChannelIntelligenceSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden" style={{ background: '#111827' }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-60 -right-60 w-[700px] h-[700px] rounded-full opacity-[0.07]"
          style={{ background: '#7C3AED', filter: 'blur(130px)' }}
        />
        <div
          className="absolute -bottom-60 -left-60 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: '#FF5722', filter: 'blur(130px)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-5 border"
            style={{ background: '#1C2333', borderColor: 'rgba(124,58,237,0.35)', color: '#A78BFA' }}
          >
            <Zap className="w-4 h-4" style={{ color: '#FF5722' }} />
            AI Channel Intelligence
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            AI That Speaks Your
            <span style={{ color: '#FF5722' }}> Customer&apos;s</span> Language
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Our Channel Intelligence Engine learns how each customer prefers to communicate—then automatically
            reaches out on the channel where they&apos;re most likely to respond.
          </p>
        </motion.div>

        {/* Body — two columns */}
        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* ── LEFT: Phone + floating overlays ──────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center"
          >
            {/* Phone + cards wrapper — sized to phone, cards overflow it */}
            <div className="relative" style={{ width: 380 }}>

              {/* ── Sarah prefers SMS — top-left corner of phone ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -6 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.45 }}
                className="absolute z-100"
                style={{ top: 72, left: -30 }}
              >
                <div
                  className="px-2.5 py-2 rounded-xl border shadow-2xl flex flex-col gap-1.5"
                  style={{
                    background: '#1C2333',
                    borderColor: 'rgba(255,255,255,0.12)',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.55)',
                    width: 148,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: '#FF5722' }} />
                    <span className="text-[10px] text-gray-300 font-medium leading-tight">
                      Sarah prefers <span className="text-white font-bold">SMS</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(['Email', 'SMS', 'WhatsApp'] as const).map((ch) => (
                      <span
                        key={ch}
                        className="text-[8px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                          background: ch === 'SMS' ? '#7C3AED' : 'rgba(255,255,255,0.08)',
                          color: ch === 'SMS' ? '#fff' : '#9CA3AF',
                        }}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                  <span className="text-[8px] text-gray-500">⚡ Responds within 5 min</span>
                </div>
              </motion.div>

              {/* ── Channel Performance — top-right corner of phone ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -6 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.45 }}
                className="absolute z-20"
                style={{ top: 72, right: -12, width: 155 }}
              >
                <div
                  className="rounded-xl p-3 border shadow-2xl"
                  style={{
                    background: '#1C2333',
                    borderColor: 'rgba(255,255,255,0.12)',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.55)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-[10px]">Channel Performance</h3>
                    <div
                      className="flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(255,87,34,0.15)', color: '#FF5722' }}
                    >
                      <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#FF5722' }} />
                      Live
                    </div>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: '#ffffff' }}>
                    <div className="flex flex-col gap-2.5">
                      {CHANNELS.map((ch, i) => (
                        <ChannelBar
                          key={ch.label}
                          label={ch.label}
                          icon={ch.icon}
                          color={ch.color}
                          pct={ch.pct}
                          note={ch.note}
                          best={'best' in ch ? ch.best : false}
                          delay={0.1 + i * 0.08}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Phone */}
              <PhoneMockup />
            </div>
          </motion.div>

          {/* ── RIGHT: Smart Channel Selection — full column with image BG ── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="rounded-2xl overflow-hidden relative"
            style={{ minHeight: 620 }}
          >
            {/* Background image */}
            <img
              src={BG_IMAGE_URL}
              alt="Professional woman working on laptop"
              className="absolute inset-0 w-full h-full object-cover object-center"
              aria-hidden="true"
            />

            {/* Dark gradient overlay — ensures text legibility */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(160deg, rgba(17,24,39,0.82) 0%, rgba(45,16,96,0.78) 40%, rgba(17,24,39,0.90) 100%)',
              }}
            />

            {/* Content */}
            <div className="relative z-10 p-7 flex flex-col h-full" style={{ minHeight: 620 }}>
              {/* Header */}
              <div className="mb-5">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4 border"
                  style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                >
                  <Zap className="w-3.5 h-3.5" style={{ color: '#FF5722' }} />
                  Smart Channel Selection
                </div>
                <h3 className="text-white font-extrabold text-2xl leading-tight mb-3">
                  Smart Channel Selection<br />for Every Customer
                </h3>
                <p className="text-white/75 text-sm leading-relaxed">
                  QualiFlow analyzes conversation history, response patterns, and engagement
                  behavior across email, SMS, voice, WhatsApp, Instagram, and Facebook—then
                  chooses the optimal channel for every message.
                </p>
              </div>

              {/* Channel chips */}
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { label: 'Email',        color: '#FF5722' },
                  { label: 'SMS',          color: '#7C3AED' },
                  { label: 'Voice',        color: '#FF5722' },
                  { label: 'WhatsApp',     color: '#25D366' },
                  { label: 'Instagram',    color: '#7C3AED' },
                  { label: 'Facebook',     color: '#FF5722' },
                  { label: 'Omni-Channel', color: 'rgba(255,255,255,0.2)' },
                ].map((chip) => (
                  <span
                    key={chip.label}
                    className="text-xs px-3 py-1.5 rounded-full font-semibold text-white backdrop-blur-sm"
                    style={{ background: chip.color }}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>

              {/* Human feel blurb */}
              <div
                className="mb-5 px-4 py-3 rounded-xl backdrop-blur-sm"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <p className="text-sm font-bold text-white mb-1">Make every interaction feel human</p>
                <p className="text-xs text-white/65 leading-relaxed">
                  Bring your messaging together and deliver consistent, responsive experiences across every 
                </p>
                  <p className="text-xs text-white/65 leading-relaxed">
                  channel, from one platform.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { value: '98.5%', label: 'Response Rate', color: '#FF8C42' },
                  { value: '<60s',  label: 'Time to Qualify', color: '#A78BFA' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl px-4 py-3 text-center backdrop-blur-sm"
                    style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-white/60 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Push CTA to bottom */}
              <div className="mt-auto">
                <button
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FF5722, #FF6B35)',
                    boxShadow: '0 8px 24px rgba(255,87,34,0.4)',
                  }}
                >
                  See Channel Intelligence in Action
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ChannelIntelligenceSection;


