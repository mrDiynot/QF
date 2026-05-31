'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DemoVideoModal } from '@/components/landing/DemoVideoModal';
import { DemoBookingModal } from '@/components/landing/DemoBookingModal';
import { Zap, FileText, Calendar, MessageSquare, CheckCircle, ArrowRight, Rocket, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';
import { WorksAcrossEveryChannelSection } from '@/components/landing/WorksAcrossEveryChannelSection';



import { VoiceCallSimulator_saas_b2b } from '@/components/landing/VoiceCallSimulator_saas_b2b';

const FEATURES = [
  { icon: Zap,           title: 'Instant Trial Activation',  desc: 'Engage free trial users immediately to drive activation and conversion', color: 'from-orange-500 to-orange-600' },
  { icon: Calendar,      title: 'Demo Scheduling',           desc: 'Automate enterprise demo booking across time zones 24/7',                color: 'from-purple-500 to-purple-600' },
  { icon: Target,        title: 'AI Lead Qualification',     desc: 'Score leads by company size, intent, and fit before SDR handoff',        color: 'from-blue-500 to-blue-600' },
  { icon: MessageSquare, title: 'Multi-Touch Follow-up',     desc: 'Automated email + SMS sequences that keep deals moving forward',         color: 'from-green-500 to-green-600' },
  { icon: FileText,      title: 'Proposal Automation',       desc: 'Send personalized proposals and track engagement in real time',          color: 'from-yellow-500 to-yellow-600' },
  { icon: TrendingUp,    title: 'Revenue Analytics',         desc: 'Full funnel visibility from MQL to closed-won in one dashboard',        color: 'from-pink-500 to-pink-600' },
];

const STATS = [
  { value: '3x',   label: 'Pipeline Growth' },
  { value: '60sec', label: 'Lead Response' },
  { value: '75%',  label: 'Demo Show Rate' },
  { value: '24/7', label: 'Lead Engagement' },
];

export default function SaaSB2BPage() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <div className="min-h-screen" style={{ background: '#0d0618' }}>
      <LandingPageHeader />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-orange-500/10 pointer-events-none" />
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm mb-6"><Rocket className="w-4 h-4" />SaaS, Tech &amp; B2B</div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">Scale Your B2B <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42]">Sales Process</span></h1>
                <p className="text-xl text-purple-200 mb-8 leading-relaxed">Automate lead qualification, demo scheduling, and enterprise follow-ups for SaaS companies, tech startups, and B2B businesses.</p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
                  <button onClick={() => setVideoOpen(true)} className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">Watch Demo</button>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <div className="bg-[#2D1B4E]/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"><div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center"><Target className="w-6 h-6 text-white" /></div><div><div className="text-white font-semibold">Enterprise Lead: TechCorp</div><div className="text-blue-400 text-sm">Score: 94 — Hot prospect</div></div></div>
                  <div className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl"><div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center"><Calendar className="w-6 h-6 text-white" /></div><div><div className="text-white font-semibold">Demo Scheduled</div><div className="text-purple-400 text-sm">Tuesday at 3:00 PM EST</div></div></div>
                  <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"><div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center"><CheckCircle className="w-6 h-6 text-white" /></div><div><div className="text-white font-semibold">Proposal Accepted</div><div className="text-green-400 text-sm">$48K ARR deal closed</div></div></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        < VoiceCallSimulator_saas_b2b onBookDemo={() => setDemoOpen(true)} />

        <WorksAcrossEveryChannelSection />

        {/* Features */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12"><h2 className="text-4xl font-bold text-white mb-4">Built for SaaS &amp; B2B</h2><p className="text-xl text-purple-200">Close more deals with AI automation</p></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature, idx) => (<motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} className="group p-6 bg-[#2D1B4E]/80 backdrop-blur-md border border-white/20 rounded-xl hover:border-orange-500/50 transition-all"><div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><feature.icon className="w-6 h-6 text-white" /></div><h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3><p className="text-purple-200 text-sm">{feature.desc}</p></motion.div>))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20" style={{ background: 'rgba(45,27,78,0.3)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              {STATS.map((stat, idx) => (<motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} className="text-center"><div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] mb-2">{stat.value}</div><div className="text-purple-200">{stat.label}</div></motion.div>))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-12 bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] border-2 border-orange-500/50 rounded-2xl">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Scale Your Pipeline?</h2>
              <p className="text-xl text-purple-200 mb-8">Join B2B companies using QualiFlow AI to automate their entire sales process</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
                <button onClick={() => setDemoOpen(true)} className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">Schedule Demo</button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <LandingPageFooter />
      <DemoVideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} />
      <DemoBookingModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
