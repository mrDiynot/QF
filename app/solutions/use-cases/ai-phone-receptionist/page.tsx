'use client';

import { motion } from 'framer-motion';
import {
  Phone, Bot, Calendar, MessageSquare, Clock, CheckCircle,
  ArrowRight, Zap, Users, TrendingUp, Mic, PhoneIncoming,
} from 'lucide-react';
import Link from 'next/link';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

const FEATURES = [
  { icon: Phone,         title: 'Answer Every Call',        desc: '24/7/365 availability — never send a customer to voicemail again',         color: 'from-blue-500 to-blue-600' },
  { icon: Bot,           title: 'Natural Conversations',    desc: 'Sounds human, understands context, and handles complex questions',          color: 'from-purple-500 to-purple-600' },
  { icon: Calendar,      title: 'Book Appointments',        desc: 'Check availability and schedule directly on your calendar',                 color: 'from-green-500 to-green-600' },
  { icon: Users,         title: 'Qualify Leads',            desc: 'Ask the right questions and score leads automatically',                     color: 'from-orange-500 to-orange-600' },
  { icon: MessageSquare, title: 'Transfer When Needed',     desc: 'Intelligently routes urgent calls to your team',                           color: 'from-pink-500 to-pink-600' },
  { icon: Zap,           title: 'Instant CRM Updates',      desc: 'Every call logged with transcripts and action items',                       color: 'from-yellow-500 to-yellow-600' },
];

const STATS = [
  { value: '100%',  label: 'Calls Answered' },
  { value: '<3sec', label: 'Answer Time' },
  { value: '85%',   label: 'Booking Rate' },
  { value: '$0.50', label: 'Cost Per Call' },
];

export default function AIPhoneReceptionistPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0d0618' }}>
      <LandingPageHeader />
      <main className="pt-20">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none" />
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          <div className="relative max-w-7xl mx-auto px-6">
            {/* Hero */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm mb-6">
                  <Bot className="w-4 h-4" />AI Phone Receptionist
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Never Miss a Call{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42]">Ever Again</span>
                </h1>
                <p className="text-xl text-purple-200 mb-8 leading-relaxed">
                  Your AI-powered receptionist answers every call 24/7, qualifies leads, books appointments, and handles customer inquiries — just like a human team member.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2">
                    Start Free Trial <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/demo" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
                    <Mic className="w-5 h-5" />Listen to Demo Call
                  </Link>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <div className="bg-[#2D1B4E]/80 backdrop-blur-md rounded-2xl border border-white/20 p-8">
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30 mb-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <PhoneIncoming className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-bold text-lg">Incoming Call</div>
                        <div className="text-purple-200">+1 (555) 234-5678</div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="px-2 py-1 bg-green-500/30 text-green-300 rounded-full text-xs flex items-center gap-1">
                            <Bot className="w-3 h-3" />AI Answering
                          </div>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-2 bg-green-500/20 text-green-300 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />Lead Qualified → Appointment Booked
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Duration', value: '2:34', icon: Clock },
                      { label: 'Lead Score', value: '92', icon: TrendingUp },
                      { label: 'Outcome', value: 'Booked', icon: CheckCircle },
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
                        <stat.icon className="w-4 h-4 text-purple-400 mb-1 mx-auto" />
                        <div className="text-xs text-purple-200 mb-1">{stat.label}</div>
                        <div className="text-white font-bold text-sm">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
              {FEATURES.map((feature, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} className="group p-6 bg-[#2D1B4E]/80 backdrop-blur-md border border-white/20 rounded-xl hover:border-orange-500/50 transition-all">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-purple-200 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-8 py-10 mb-20">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                {STATS.map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] mb-1">{stat.value}</div>
                    <div className="text-purple-300 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-12 bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] border-2 border-orange-500/50 rounded-2xl text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Answer Every Call?</h2>
              <p className="text-xl text-purple-200 mb-8">Try our AI Phone Receptionist risk-free for 14 days</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2">
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/demo" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
                  Schedule Demo
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <LandingPageFooter />
    </div>
  );
}
