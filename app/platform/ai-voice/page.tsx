'use client';

import { motion } from 'framer-motion';
import AIVoiceCallSimulator from '@/components/AIVoiceCallSimulator';

import { useState } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, Bot, Zap, CheckCircle, ArrowRight, Clock, Target, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { DemoBookingModal } from '@/components/landing/DemoBookingModal';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

import {
  VoiceCallSimulatorSection,
} from '@/components/landing';



const FEATURES = [
  { icon: Bot,           title: 'Natural Conversations',  desc: 'Human-like voice AI that understands context and intent' },
  { icon: Clock,         title: '24/7 Availability',      desc: 'Never miss a call, even after hours or on weekends' },
  { icon: Target,        title: 'Lead Qualification',     desc: 'AI automatically scores and routes qualified leads' },
  { icon: CheckCircle,   title: 'Appointment Booking',    desc: 'Books meetings directly into your calendar' },
  { icon: MessageSquare, title: 'Call Transcription',     desc: 'Every call is transcribed and logged in CRM' },
  { icon: Zap,           title: 'Instant Follow-up',      desc: 'Automatically calls back missed leads in seconds' },
];

export default function AIVoicePage() {
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <div className="min-h-screen" style={{ background: '#0d0618' }}>
      <LandingPageHeader />

      <main className="pt-20">
        <section className="relative py-20 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-orange-500/10 pointer-events-none" />
          <div className="absolute -top-32 right-0 w-[600px] h-[400px] rounded-full opacity-[0.15] pointer-events-none" style={{ background: '#7c3aed', filter: 'blur(120px)' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full opacity-[0.10] pointer-events-none" style={{ background: '#FF5722', filter: 'blur(100px)' }} />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          <div className="relative max-w-7xl mx-auto px-6">
              {/* Hero */}

               
           
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm mb-6">
                  <Phone className="w-4 h-4" />Platform Feature
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  AI Voice Agent:{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42]">
                    Inbound &amp; Outbound
                  </span>
                </h1>
                <p className="text-xl text-purple-200 mb-8 leading-relaxed">
                  Your AI-powered phone receptionist that answers calls 24/7, qualifies leads, books appointments, and makes outbound follow-up calls automatically.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/register"
                    className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2"
                  >
                    Start Free Trial <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <div className="bg-[#2D1B4E]/80 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <PhoneIncoming className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">Inbound Calls</div>
                        <div className="text-green-400 text-sm">Answer 24/7, never miss a lead</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <PhoneOutgoing className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">Outbound Calls</div>
                        <div className="text-blue-400 text-sm">Follow up with leads automatically</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

         

            {/* Interactive Call Simulator */}
            <div className="mb-20">
                <VoiceCallSimulatorSection onBookDemo={() => setDemoOpen(true)} />
            </div>

            {/* White divider section */}
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-8 py-10 mb-20">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                {[
                  { value: '100%', label: 'Calls Answered' },
                  { value: '<3s',  label: 'Answer Time' },
                  { value: '85%',  label: 'Booking Rate' },
                  { value: '24/7', label: 'Always Available' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] mb-1">{stat.value}</div>
                    <div className="text-purple-300 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {FEATURES.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 bg-[#2D1B4E]/80 backdrop-blur-md border border-white/20 rounded-xl hover:border-orange-500/40 transition-all group"
                >
                  <feature.icon className="w-10 h-10 text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-purple-200 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-20 p-12 bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] border-2 border-orange-500/50 rounded-2xl text-center"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Answer Every Call?</h2>
              <p className="text-xl text-purple-200 mb-8">Try AI Voice risk-free for 14 days — no credit card required.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2">
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </Link>
                <button onClick={() => setDemoOpen(true)} className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
                  Book a Demo
                </button>
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
