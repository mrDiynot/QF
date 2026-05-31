'use client';

import { motion } from 'framer-motion';
import { Video, Calendar, Play, ArrowRight } from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

export default function WebinarPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0d0618' }}>
      <LandingPageHeader />

      <main className="pt-20">
        <section className="relative py-20 overflow-hidden">
          {/* Background */}
          <div className="absolute -top-32 right-0 w-[600px] h-[400px] rounded-full opacity-[0.12] pointer-events-none" style={{ background: '#7c3aed', filter: 'blur(120px)' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full opacity-[0.08] pointer-events-none" style={{ background: '#FF5722', filter: 'blur(100px)' }} />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          <div className="max-w-7xl mx-auto px-6 relative z-10">

            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm mb-6">
                <Video className="w-4 h-4" />Resources
              </div>
              <h1 className="text-5xl font-bold text-white mb-6">Webinars &amp; Training</h1>
              <p className="text-xl text-purple-200">Learn from experts and master QualiFlow AI with live and on-demand training</p>
            </motion.div>

            {/* Stats bar */}
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-8 py-6 mb-12 grid md:grid-cols-3 gap-6 text-center">
              {[
                { value: '20+',   label: 'On-Demand Webinars' },
                { value: 'Live',  label: 'Monthly Sessions' },
                { value: '5,000+', label: 'Attendees Trained' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42]">{s.value}</div>
                  <div className="text-purple-300 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Featured webinars */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-8 bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] border-2 border-orange-500/50 rounded-xl">
                <div className="flex items-center gap-2 text-orange-400 text-sm mb-4">
                  <Calendar className="w-4 h-4" />
                  Upcoming — Jan 15, 2026
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">10x Your Lead Response Speed</h3>
                <p className="text-purple-200 mb-6">Learn how to automate instant lead response and never lose a customer to slow follow-up again.</p>
                <button className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center gap-2">
                  Register Now <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 bg-[#2D1B4E]/80 backdrop-blur-md border border-white/20 rounded-xl">
                <div className="flex items-center gap-2 text-purple-400 text-sm mb-4">
                  <Play className="w-4 h-4" />On-Demand
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">QualiFlow AI Platform Tour</h3>
                <p className="text-purple-200 mb-6">Complete walkthrough of all 17 core modules and how to set them up for your business.</p>
                <button className="px-6 py-3 bg-white/10 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
                  Watch Now <Play className="w-4 h-4" />
                </button>
              </motion.div>
            </div>

            {/* On-demand library */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">On-Demand Library</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: 'AI Lead Qualification Deep Dive',  duration: '45 min', tag: 'Popular' },
                  { title: 'Setting Up Your First AI Journey', duration: '32 min', tag: 'Beginner' },
                  { title: 'Advanced CRM Integration Guide',   duration: '58 min', tag: 'Advanced' },
                  { title: 'Review Automation Masterclass',    duration: '28 min', tag: 'New' },
                  { title: 'Voice AI Configuration',           duration: '41 min', tag: 'New' },
                  { title: 'Analytics & Reporting Walkthrough',duration: '35 min', tag: 'Popular' },
                ].map((video, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    viewport={{ once: true }}
                    className="p-5 bg-[#2D1B4E]/80 backdrop-blur-md border border-white/20 rounded-xl hover:border-orange-500/40 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">{video.tag}</span>
                      <span className="text-purple-400 text-xs">{video.duration}</span>
                    </div>
                    <div className="w-full aspect-video bg-purple-900/40 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-900/60 transition-all">
                      <Play className="w-8 h-8 text-orange-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <h4 className="text-white font-semibold text-sm group-hover:text-orange-400 transition-colors">{video.title}</h4>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingPageFooter />
    </div>
  );
}
