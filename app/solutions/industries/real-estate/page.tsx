'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DemoVideoModal } from '@/components/landing/DemoVideoModal';
import { DemoBookingModal } from '@/components/landing/DemoBookingModal';
import {
  Home, Calendar, Phone, MessageSquare, Star, CheckCircle,
  ArrowRight, Zap, Users, Clock, Target, Key,
} from 'lucide-react';
import Link from 'next/link';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';

import { LandingPageFooter } from '@/components/landing/LandingPageFooter';
import { VoicecallSimulator_Real_Estate } from '@/components/landing/VoicecallSimulator_Real_Estate';
import { WorksAcrossEveryChannelSection } from '@/components/landing/WorksAcrossEveryChannelSection';


const CHALLENGES = [
  { icon: Clock,         title: 'Slow Response',      desc: 'Buyers work with the first agent to respond' },
  { icon: Phone,         title: 'Missed Calls',        desc: "Can't answer when showing properties" },
  { icon: Users,         title: 'No-Show Showings',    desc: 'Buyers cancel or forget appointments' },
  { icon: MessageSquare, title: 'Manual Follow-up',    desc: 'Leads need consistent nurturing' },
  { icon: Star,          title: 'Few Reviews',         desc: 'Hard to get clients to leave testimonials' },
  { icon: Target,        title: 'Unqualified Leads',   desc: 'Time wasted on non-serious buyers' },
];

const FEATURES = [
  { icon: Phone,         title: 'Instant Lead Response', desc: 'Contact every lead in under 60 seconds via call, text, or email',    color: 'from-blue-500 to-blue-600' },
  { icon: Zap,           title: 'AI Lead Qualification',  desc: 'Qualify buyers based on budget, timeline, and preferences',          color: 'from-orange-500 to-orange-600' },
  { icon: Calendar,      title: 'Showing Scheduler',      desc: 'Let buyers book property showings online 24/7',                      color: 'from-purple-500 to-purple-600' },
  { icon: MessageSquare, title: 'Automated Nurture',       desc: 'Stay top-of-mind with personalized follow-up campaigns',            color: 'from-green-500 to-green-600' },
  { icon: Star,          title: 'Review Generation',      desc: 'Collect testimonials and reviews from happy clients',               color: 'from-yellow-500 to-yellow-600' },
  { icon: CheckCircle,   title: 'Transaction Tracking',   desc: 'Manage all deals and communications in one place',                  color: 'from-pink-500 to-pink-600' },
];

const STATS = [
  { value: '6x',   label: 'More Showings' },
  { value: '45sec', label: 'Lead Response' },
  { value: '83%',  label: 'Conversion Rate' },
  { value: '24/7', label: 'Lead Engagement' },
];

export default function RealEstatePage() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <div className="min-h-screen" style={{ background: '#0d0618' }}>
      <LandingPageHeader />
      <main className="pt-20">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-orange-500/10 pointer-events-none" />
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm mb-6"><Home className="w-4 h-4" />Real Estate &amp; Property</div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">Close More Deals, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42]">Faster</span></h1>
                <p className="text-xl text-purple-200 mb-8 leading-relaxed">Automate lead response, property showings, and follow-ups for real estate agents, brokers, and property managers. Engage every prospect instantly.</p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
                  <button onClick={() => setVideoOpen(true)} className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">Watch Demo</button>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <div className="bg-[#2D1B4E]/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"><div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center"><Phone className="w-6 h-6 text-white" /></div><div><div className="text-white font-semibold">New Lead: 3BR Condo</div><div className="text-green-400 text-sm">Contacted instantly</div></div></div>
                  <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"><div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center"><Calendar className="w-6 h-6 text-white" /></div><div><div className="text-white font-semibold">Showing Scheduled</div><div className="text-blue-400 text-sm">Tomorrow at 3:00 PM</div></div></div>
                  <div className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl"><div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center"><Key className="w-6 h-6 text-white" /></div><div><div className="text-white font-semibold">Offer Accepted</div><div className="text-purple-400 text-sm">Deal closed in 14 days</div></div></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

     <VoicecallSimulator_Real_Estate onBookDemo={() => setDemoOpen(true)} />

        <WorksAcrossEveryChannelSection />

        <section className="py-20" style={{ background: 'rgba(45,27,78,0.3)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12"><h2 className="text-4xl font-bold text-white mb-4">Real Estate Challenges We Solve</h2><p className="text-xl text-purple-200">Win more listings and close more deals</p></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{CHALLENGES.map((item, idx) => (<motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} className="p-6 bg-[#1a0f2e]/80 backdrop-blur-md border border-red-500/30 rounded-xl"><item.icon className="w-8 h-8 text-red-400 mb-4" /><h3 className="text-white font-semibold mb-2">{item.title}</h3><p className="text-purple-200 text-sm">{item.desc}</p></motion.div>))}</div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12"><h2 className="text-4xl font-bold text-white mb-4">Built for Real Estate Professionals</h2><p className="text-xl text-purple-200">Automate the entire buyer journey</p></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{FEATURES.map((feature, idx) => (<motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} className="group p-6 bg-[#2D1B4E]/80 backdrop-blur-md border border-white/20 rounded-xl hover:border-orange-500/50 transition-all"><div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><feature.icon className="w-6 h-6 text-white" /></div><h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3><p className="text-purple-200 text-sm">{feature.desc}</p></motion.div>))}</div>
          </div>
        </section>

        <section className="py-20" style={{ background: 'rgba(45,27,78,0.3)' }}>
          <div className="max-w-7xl mx-auto px-6"><div className="grid md:grid-cols-4 gap-8">{STATS.map((stat, idx) => (<motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} className="text-center"><div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] mb-2">{stat.value}</div><div className="text-purple-200">{stat.label}</div></motion.div>))}</div></div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-12 bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] border-2 border-orange-500/50 rounded-2xl">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Close More Deals?</h2>
              <p className="text-xl text-purple-200 mb-8">Join real estate professionals using QualiFlow AI to automate lead engagement</p>
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
