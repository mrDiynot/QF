'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Calendar, Phone, MessageSquare, ArrowRight, Sparkles, Zap, Users } from 'lucide-react';
import Link from 'next/link';
import { DemoBookingModal } from '@/components/landing/DemoBookingModal';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

const CAPABILITIES = [
  { icon: Phone,         title: 'AI Phone Reception',    desc: '24/7 call answering and lead qualification for any industry',   color: 'from-blue-500 to-blue-600' },
  { icon: Calendar,      title: 'Smart Scheduling',      desc: 'Automate appointments and bookings for any service type',       color: 'from-purple-500 to-purple-600' },
  { icon: MessageSquare, title: 'Omnichannel Inbox',     desc: 'Manage SMS, email, chat, and social in one unified inbox',      color: 'from-green-500 to-green-600' },
  { icon: Zap,           title: 'Instant Response',      desc: 'Respond to every lead in under 60 seconds automatically',      color: 'from-orange-500 to-orange-600' },
  { icon: Star,          title: 'Review Automation',     desc: 'Collect 5-star reviews after every customer interaction',       color: 'from-yellow-500 to-yellow-600' },
  { icon: Users,         title: 'CRM & Lead Tracking',   desc: 'Keep every lead, deal, and conversation organized and scored', color: 'from-pink-500 to-pink-600' },
];

export default function OtherIndustriesPage() {
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
            <div className="text-center max-w-3xl mx-auto mb-20">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm mb-6"><Sparkles className="w-4 h-4" />All Industries</div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">Automate Any <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42]">Customer Journey</span></h1>
                <p className="text-xl text-purple-200 mb-8 leading-relaxed">QualiFlow AI adapts to any industry. Automate lead response, appointment booking, and customer engagement for your unique business needs.</p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
                  <button onClick={() => setDemoOpen(true)} className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">Book a Demo</button>
                </div>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
              {CAPABILITIES.map((feature, idx) => (<motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} className="group p-6 bg-[#2D1B4E]/80 backdrop-blur-md border border-white/20 rounded-xl hover:border-orange-500/50 transition-all"><div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><feature.icon className="w-6 h-6 text-white" /></div><h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3><p className="text-purple-200 text-sm">{feature.desc}</p></motion.div>))}
            </div>

            <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-8 py-10 mb-20">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                {[
                  { value: '50+',  label: 'Industries Served' },
                  { value: '24/7', label: 'Always Active' },
                  { value: '60sec', label: 'Lead Response' },
                  { value: '3x',   label: 'Revenue Growth' },
                ].map((stat, i) => (<motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}><div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] mb-1">{stat.value}</div><div className="text-purple-300 text-sm">{stat.label}</div></motion.div>))}
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-12 bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] border-2 border-orange-500/50 rounded-2xl text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Automate Your Business?</h2>
              <p className="text-xl text-purple-200 mb-8">QualiFlow AI works for any business that needs to capture, qualify, and convert leads</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
                <Link href="/demo" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">Talk to Sales</Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <LandingPageFooter />
      <DemoBookingModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
