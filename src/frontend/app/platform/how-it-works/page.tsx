'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Zap, Brain, Target, Calendar, MessageSquare, TrendingUp,
  ArrowRight, Check, Sparkles,
  Phone, Mail, MessageCircle, Instagram, Facebook, Globe,
  Clock, Shield,
} from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';
import WhatsApp from '@/components/icons/WhatsApp';

const STEPS = [
  {
    step: '01', title: 'Capture Every Lead',
    desc: 'Leads come in from web chat, SMS, phone calls, social media, forms, QR codes, and more. QualiFlow AI captures everything in one unified inbox.',
    icon: MessageSquare,
    glow: '#FF5722', iconGrad: 'linear-gradient(135deg, #FF8C42, #FF5722)',
    borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)',
    features: ['Web Chat Widget', 'SMS & MMS', 'Phone Calls', 'Instagram & Facebook DMs', 'Forms & Surveys', 'QR Code Scanning'],
  },
  {
    step: '02', title: 'AI Qualifies Instantly',
    desc: 'AI engages in real conversations, asks qualifying questions, understands intent, and scores each lead automatically based on urgency, budget, and fit.',
    icon: Brain,
    glow: '#7c3aed', iconGrad: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)',
    features: ['Natural Conversation', 'Intent Detection', 'Lead Scoring 0-100', 'Budget Qualification', 'Timeline Assessment', 'Service Matching'],
  },
  {
    step: '03', title: 'Book & Convert',
    desc: 'High-intent leads get appointments booked instantly. AI sends proposals, follows up, handles objections, and nudges toward conversion.',
    icon: Calendar,
    glow: '#FF5722', iconGrad: 'linear-gradient(135deg, #FF8C42, #FF5722)',
    borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)',
    features: ['Auto Booking', 'Calendar Sync', 'Proposal Generation', 'Smart Follow-ups', 'Objection Handling', 'Payment Collection'],
  },
  {
    step: '04', title: 'Retain & Re-Engage',
    desc: 'Post-purchase, AI collects reviews, sends surveys, monitors satisfaction, and re-engages inactive customers for repeat business.',
    icon: TrendingUp,
    glow: '#7c3aed', iconGrad: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
    borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)',
    features: ['Review Requests', 'Survey Collection', 'Re-Engagement Campaigns', 'Upsell Opportunities', 'Referral Requests', 'Loyalty Programs'],
  },
];

const CHANNELS = [
  { icon: Phone,         label: 'Phone Calls',        glow: '#3b82f6', iconGrad: 'from-blue-500 to-blue-600' },
  { icon: MessageCircle, label: 'SMS & MMS',           glow: '#10b981', iconGrad: 'from-green-500 to-green-600' },
  { icon: Mail,          label: 'Email',               glow: '#ef4444', iconGrad: 'from-red-500 to-red-600' },
  { icon: MessageSquare, label: 'Web Chat',            glow: '#7c3aed', iconGrad: 'from-purple-500 to-purple-600' },
  { icon: Instagram,     label: 'Instagram',        glow: '#ec4899', iconGrad: 'from-pink-500 to-pink-600' },
  { icon: Facebook,      label: 'Facebook',  glow: '#3b82f6', iconGrad: 'from-blue-600 to-blue-700' },
    { icon: MessageSquare, label: 'Forms',               glow: '#FF5722', iconGrad: 'from-orange-500 to-orange-600' },
  { icon: Target,        label: 'QR Codes',            glow: '#a855f7', iconGrad: 'from-purple-600 to-purple-700' },
  { icon: WhatsApp, label: 'WhatsApp',     glow: '#25d366', iconGrad: 'from-green-400 to-green-600' },

  //{ icon: Sparkles,      label: 'AI Voice',            glow: '#6366f1', iconGrad: 'from-indigo-500 to-indigo-600' },
  
];

const BENEFITS = [
  { icon: Clock,       title: '24/7 Availability',   desc: 'AI never sleeps. Capture and qualify leads at 3 AM with the same quality as 3 PM.',         stat: '98.5% response rate', glow: '#7c3aed' },
  { icon: Zap,         title: 'Instant Response',    desc: 'Respond to every lead in under 60 seconds across all channels simultaneously.',              stat: '<60s avg response',  glow: '#FF5722' },
  { icon: Shield,      title: 'Never Miss Leads',    desc: 'Every call, text, DM, and form submission gets captured and processed automatically.',        stat: '100% capture rate',  glow: '#7c3aed' },
  { icon: TrendingUp,  title: 'Higher Conversions',  desc: 'AI follows up at the perfect time with the perfect message to drive conversions.',            stat: '3x more bookings',   glow: '#FF5722' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0d0618' }}>
      <LandingPageHeader />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 60%, #1a0a18 100%)' }}>
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#7c3aed]/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#FF5722]/10 blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-semibold text-purple-300">End-to-End Automation</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
              How QualiFlow AI Works Its Magic.
            </h1>
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              From the moment a lead reaches out to the final conversion, QualiFlow AI&apos;s AI handles everything automatically across every channel.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-xl transition-all" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}>
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 4-Step Process ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full bg-[#7c3aed]/10 blur-[90px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-sm font-semibold text-orange-300">The Journey</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">The Complete Journey in 4 Steps</h2>
            <p className="text-white/50">AI automation from first contact to loyal customer</p>
          </motion.div>

          <div className="space-y-12">
            {STEPS.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 items-center`}>
                {/* Text side */}
                <div className="flex-1">
                  <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-white mb-4" style={{ background: item.glow + '33', border: `1px solid ${item.glow}55` }}>
                    STEP {item.step}
                  </div>
                  <h3 className="text-3xl font-extrabold text-white mb-4">{item.title}</h3>
                  <p className="text-white/55 mb-6 leading-relaxed">{item.desc}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {item.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60 flex-shrink-0" />
                        <span className="text-white/65 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Card side */}
                <div className="flex-1 w-full">
                  <div className="relative rounded-2xl p-px overflow-hidden" style={{ background: item.borderGrad }}>
                    <div className="relative rounded-2xl p-8 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618 0%, #1a0a2e 60%, #2a0e1a 100%)' }}>
                      <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full blur-2xl opacity-30 pointer-events-none" style={{ background: item.glow + '55' }} />
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg" style={{ background: item.iconGrad, boxShadow: `0 0 24px ${item.glow}55` }}>
                        <item.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="space-y-3">
                        {['Real-time processing', 'AI-powered decisions', 'Automated workflows'].map((txt) => (
                          <div key={txt} className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: item.glow + '33' }}>
                              <Check className="w-3 h-3 text-white" />
                            </span>
                            <span className="text-white/70 text-sm">{txt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Channel Integration ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] rounded-full bg-[#FF5722]/10 blur-[80px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-sm font-semibold text-purple-300">Every Touchpoint</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Works Across Every Channel</h2>
            <p className="text-white/50">One AI, unlimited touchpoints</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CHANNELS.map((channel, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative rounded-xl p-px overflow-hidden cursor-default"
                style={{ background: 'linear-gradient(135deg, #7c3aed44, #FF572244)' }}>
                <div className="relative rounded-xl p-5 flex flex-col items-center overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                  <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none" style={{ background: channel.glow + '55' }} />
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${channel.iconGrad} flex items-center justify-center mb-3 shadow-md`} style={{ boxShadow: `0 0 14px ${channel.glow}44` }}>
                    <channel.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-center text-xs text-white/70 font-medium leading-tight">{channel.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] rounded-full bg-[#7c3aed]/10 blur-[90px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Why Businesses Choose QualiFlow AI</h2>
            <p className="text-white/50">The platform that works while you sleep</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                style={{ background: index % 2 === 0 ? 'linear-gradient(135deg, #FF5722, #7c3aed)' : 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
                <div className="relative rounded-2xl p-6 h-full overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420 0%, #1a0a2e 50%, #1a0800 100%)' }}>
                  <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none" style={{ background: benefit.glow + '55' }} />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-lg" style={{ background: `linear-gradient(135deg, ${benefit.glow}cc, ${benefit.glow}88)`, boxShadow: `0 0 18px ${benefit.glow}55` }}>
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-xs text-white/50 leading-relaxed mb-4">{benefit.desc}</p>
                    <div className="px-3 py-1 rounded-full inline-block" style={{ background: benefit.glow + '22', border: `1px solid ${benefit.glow}44` }}>
                      <span className="text-xs font-bold" style={{ color: benefit.glow }}>{benefit.stat}</span>
                    </div>
                    <div className="mt-4 h-px" style={{ background: `linear-gradient(to right, transparent, ${benefit.glow}88, transparent)` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 50%, #0f041a 100%)' }}>
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[#7c3aed]/30 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] rounded-full bg-[#FF5722]/15 blur-[90px] pointer-events-none" />
        <div className="max-w-[900px] mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }}>
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" /></span>
                <span className="text-sm font-semibold text-purple-300">Automated Customer Journey</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
              Ready to Automate Your Customer Journey?
            </h2>
            <p className="text-xl text-white/55 mb-12 max-w-xl mx-auto leading-relaxed">
              Join businesses using QualiFlow AI to capture, qualify, and convert leads automatically — 24/7.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/register" className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white overflow-hidden no-underline transition-all duration-300" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/#demo" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white border border-white/20 bg-white/[0.08] backdrop-blur-sm hover:bg-white/15 hover:border-white/35 transition-all duration-300 no-underline">
                  Watch Demo <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
            <div className="mt-16 mx-auto max-w-xs h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.6), rgba(168,85,247,0.5), transparent)' }} />
          </motion.div>
        </div>
      </section>

      <LandingPageFooter />
    </div>
  );
}
