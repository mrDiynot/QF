'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap, Phone, HeartHandshake, TrendingUp, CheckCircle2, Sparkles, Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { DemoBookingModal } from '@/components/landing/DemoBookingModal';





const JOURNEY_CARDS = [
  {
    num: '01',
    icon: Zap,
    glowColor: 'rgba(107,45,158,0.6)',
    gradientFrom: '#6B2D9E',
    gradientTo: '#8B3DAE',
    borderColor: 'rgba(139,61,174,0.4)',
    hoverBorder: 'rgba(139,61,174,0.8)',
    title: 'New Lead Qualification → Booking',
    desc: 'AI responds instantly, qualifies, scores, and books appointments automatically.',
  },
  {
    num: '02',
    icon: Phone,
    glowColor: 'rgba(59,130,246,0.6)',
    gradientFrom: '#3B82F6',
    gradientTo: '#2563EB',
    borderColor: 'rgba(59,130,246,0.4)',
    hoverBorder: 'rgba(59,130,246,0.8)',
    title: 'Missed Call Recovery',
    desc: 'When a call is missed, AI sends SMS, email, and can place an outbound call to recover the lead.',
  },
  {
    num: '03',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    glowColor: 'rgba(236,72,153,0.6)',
    gradientFrom: '#EC4899',
    gradientTo: '#DB2777',
    borderColor: 'rgba(236,72,153,0.4)',
    hoverBorder: 'rgba(236,72,153,0.8)',
    title: 'No-Show Recovery',
    desc: 'Automatically re-engages customers who miss appointments and helps them rebook.',
  },
  {
    num: '04',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    glowColor: 'rgba(245,158,11,0.6)',
    gradientFrom: '#F59E0B',
    gradientTo: '#D97706',
    borderColor: 'rgba(245,158,11,0.4)',
    hoverBorder: 'rgba(245,158,11,0.8)',
    title: 'Review + Survey Flow',
    desc: 'After completed appointments, AI sends thank you messages, review requests, and surveys.',
  },
  {
    num: '05',
    icon: HeartHandshake,
    glowColor: 'rgba(239,68,68,0.6)',
    gradientFrom: '#EF4444',
    gradientTo: '#DC2626',
    borderColor: 'rgba(239,68,68,0.4)',
    hoverBorder: 'rgba(239,68,68,0.8)',
    title: 'Cold Lead Revival',
    desc: 'AI reactivates leads who stopped responding using smart timing and personalized messaging.',
  },
  {
    num: '06',
    icon: TrendingUp,
    glowColor: 'rgba(16,185,129,0.6)',
    gradientFrom: '#10B981',
    gradientTo: '#059669',
    borderColor: 'rgba(16,185,129,0.4)',
    hoverBorder: 'rgba(16,185,129,0.8)',
    title: 'Retention & Re-Engagement',
    desc: 'AI targets inactive customers, offers incentives, and brings them back.',
  },
  {
    num: '07',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
    glowColor: 'rgba(139,92,246,0.6)',
    gradientFrom: '#8B5CF6',
    gradientTo: '#7C3AED',
    borderColor: 'rgba(139,92,246,0.4)',
    hoverBorder: 'rgba(139,92,246,0.8)',
    title: 'Proposal Creation + Assignment',
    desc: 'AI creates proposals, assigns reviewers, and tracks review stages automatically.',
  },
  {
    num: '08',
    icon: CheckCircle2,
    glowColor: 'rgba(107,45,158,0.6)',
    gradientFrom: '#6B2D9E',
    gradientTo: '#8B5CF6',
    borderColor: 'rgba(107,45,158,0.4)',
    hoverBorder: 'rgba(107,45,158,0.8)',
    title: 'Proposal Sending + Acceptance',
    desc: 'AI sends proposals, tracks views, accepts/declines, and triggers next actions.',
  },
  {
    num: '09',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    glowColor: 'rgba(255,87,34,0.6)',
    gradientFrom: '#FF5722',
    gradientTo: '#E64A19',
    borderColor: 'rgba(255,87,34,0.4)',
    hoverBorder: 'rgba(255,87,34,0.8)',
    title: 'Abandoned Form Recovery',
    desc: 'When someone starts but does not submit a form, AI follows up instantly to recover them.',
  },
  {
    num: '10',
    icon: Sparkles,
    glowColor: 'rgba(6,182,212,0.6)',
    gradientFrom: '#06B6D4',
    gradientTo: '#0891B2',
    borderColor: 'rgba(6,182,212,0.4)',
    hoverBorder: 'rgba(6,182,212,0.8)',
    title: 'Post-Purchase Flow',
    desc: 'After the sale, AI provides onboarding messages, upsell opportunities, and retention touchpoints.',
  },
] as const;

export function PrebuiltJourneysSection() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
    <section className="py-28 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D0A1A 0%, #1a1030 50%, #0D0A1A 100%)' }}>
      {/* Ambient glow orbs */}
      <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(107,45,158,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,87,34,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #a78bfa 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300 tracking-wide uppercase">AI Journeys</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent leading-tight">
            Pre-Built AI Customer Journey.
          </h2>

        </ScrollReveal>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {JOURNEY_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                className="group relative rounded-2xl p-5 cursor-default transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  border: `1px solid ${card.borderColor}`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                {/* Hover glow overlay */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${card.glowColor.replace('0.6', '0.08')} 0%, transparent 70%)` }}
                />

                {/* Top border glow on hover */}
                <div
                  className="absolute top-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${card.gradientFrom}, transparent)` }}
                />

                {/* Number badge */}
                <div
                  className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest"
                  style={{
                    background: `linear-gradient(135deg, ${card.gradientFrom}22, ${card.gradientTo}22)`,
                    border: `1px solid ${card.borderColor}`,
                    color: card.gradientFrom,
                  }}
                >
                  {card.num}
                </div>

                {/* Icon */}
                <div
                  className="relative w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${card.gradientFrom}, ${card.gradientTo})`,
                    boxShadow: `0 0 20px ${card.glowColor.replace('0.6', '0.4')}`,
                  }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-sm font-bold text-white/90 mb-2 leading-snug pr-6">{card.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{card.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <ScrollReveal className="mt-16">
          <div
            className="relative rounded-3xl p-8 md:p-12 max-w-2xl mx-auto text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(107,45,158,0.15) 0%, rgba(255,87,34,0.08) 100%)',
              border: '1px solid rgba(107,45,158,0.35)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Top shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #6B2D9E, #EC4899, #FF5722, transparent)' }} />
            {/* Ambient center glow */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: 'radial-gradient(circle at 50% -20%, rgba(107,45,158,0.2) 0%, transparent 60%)' }} />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 font-medium mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                All 10 journeys included in every plan
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Ready to automate your journeys?</h3>
              {/* CTA row: Schedule Demo + Start Free Trial */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                {/* Schedule YOUR DEMO — opens DemoBookingModal */}
                <motion.div className="relative" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <button
                    onClick={() => setDemoOpen(true)}
                    className={cn(
                      'relative inline-flex items-center justify-center gap-1.5 h-11 px-6 rounded-full overflow-hidden',
                      'text-white text-sm font-semibold',
                      'bg-gradient-to-r from-[#FF5722] to-[#FF6B35]',
                      'shadow-lg shadow-orange-500/30',
                      'transition-shadow duration-200 hover:shadow-orange-500/50',
                    )}
                  >
                    Schedule Your Demo
                  </button>
                </motion.div>
                {/* Start Free Trial — links to /register */}
                <motion.div className="relative" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/register"
                    className={cn(
                      'relative inline-flex items-center justify-center gap-1.5 h-11 px-6 rounded-full overflow-hidden',
                      'text-white text-sm font-semibold',
                      'bg-white/15 backdrop-blur-sm border border-white/30',
                      'transition-all duration-200 hover:bg-white/25 hover:border-white/50',
                    )}
                  >
                    Start Free Trial
                  </Link>
                </motion.div>
              </div>
















            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>

    <DemoBookingModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}

export default PrebuiltJourneysSection;
