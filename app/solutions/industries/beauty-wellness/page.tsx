'use client';


import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, MessageSquare, Star,
  ArrowRight, Users, Heart, Gift,
} from 'lucide-react';
import Link from 'next/link';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { DemoVideoModal } from '@/components/landing/DemoVideoModal';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';
import { VoiceCallSimulator_beauty_wellness } from '@/components/landing/VoiceCallSimulator_beauty_wellness';

const FEATURES = [
  { icon: Calendar,      title: '24/7 Online Booking',      desc: "Let clients book appointments anytime, even when you're closed",          color: 'from-pink-500 to-pink-600' },
  { icon: MessageSquare, title: 'Automated Reminders',      desc: 'Reduce no-shows by 80% with smart SMS and email reminders',               color: 'from-purple-500 to-purple-600' },
  { icon: Star,          title: 'Review Collection',        desc: 'Automatically ask happy clients for 5-star reviews',                       color: 'from-yellow-500 to-yellow-600' },
  { icon: Gift,          title: 'Re-engagement Campaigns',  desc: "Bring back clients who haven't visited in a while",                       color: 'from-orange-500 to-orange-600' },
  { icon: Users,         title: 'Client Database',          desc: 'Track preferences, history, and special occasions',                        color: 'from-blue-500 to-blue-600' },
  { icon: Heart,         title: 'Birthday & Special Days',  desc: 'Send personalized offers on birthdays and anniversaries',                  color: 'from-red-500 to-red-600' },
];

const STATS = [
  { value: '80%',  label: 'Fewer No-Shows' },
  { value: '3x',   label: 'More Reviews' },
  { value: '24/7', label: 'Always Bookable' },
  { value: '35%',  label: 'More Repeat Clients' },
];

export default function BeautyWellnessPage() {
    const [videoOpen, setVideoOpen] = useState(false);
    const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: '#0d0618' }}>
      <LandingPageHeader />
      <main className="pt-20">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 pointer-events-none" />
          <div className="absolute top-20 left-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          <div className="relative max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-300 text-sm mb-6">
                  <span role="img" aria-label="Beauty and Wellness">🌸</span>Beauty, Wellness &amp; Personal Care
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Keep Your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42]">Schedule Full</span>{' '}
                  Automatically
                </h1>
                <p className="text-xl text-purple-200 mb-8 leading-relaxed">
                  Perfect for salons, spas, med spas, massage therapy, aesthetics, and personal care businesses. Automate bookings, reduce no-shows, and keep clients coming back.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2">
                    Start Free Trial <ArrowRight className="w-5 h-5" />
                  </Link>
                  <button onClick={() => setVideoOpen(true)} className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">Watch Demo</button>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <div className="bg-[#2D1B4E]/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center"><Calendar className="w-6 h-6 text-white" /></div>
                    <div><div className="text-white font-semibold">New Booking: Hair Color</div><div className="text-pink-400 text-sm">Saturday at 10:00 AM</div></div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center"><MessageSquare className="w-6 h-6 text-white" /></div>
                    <div><div className="text-white font-semibold">Reminder Sent</div><div className="text-purple-400 text-sm">24hr before appointment</div></div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center"><Star className="w-6 h-6 text-white" /></div>
                    <div><div className="text-white font-semibold">5-Star Review</div><div className="text-yellow-400 text-sm">&quot;Best salon experience ever!&quot;</div></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>


<VoiceCallSimulator_beauty_wellness />


        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Built for Beauty &amp; Wellness</h2>
              <p className="text-xl text-purple-200">Everything you need to run a successful practice</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} className="group p-6 bg-[#2D1B4E]/80 backdrop-blur-md border border-white/20 rounded-xl hover:border-orange-500/50 transition-all">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><feature.icon className="w-6 h-6 text-white" /></div>
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-purple-200 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20" style={{ background: 'rgba(45,27,78,0.3)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              {STATS.map((stat, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} className="text-center">
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] mb-2">{stat.value}</div>
                  <div className="text-purple-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-12 bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] border-2 border-orange-500/50 rounded-2xl">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Automate Your Beauty Business?</h2>
              <p className="text-xl text-purple-200 mb-8">Join top salons and spas using QualiFlow AI to keep their schedule full</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
                <Link href="/demo" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">Schedule Demo</Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <LandingPageFooter />
      <DemoVideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} />
    </div>
  );
}
