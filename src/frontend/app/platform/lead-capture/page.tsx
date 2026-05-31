'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MessageSquare, Mail, Phone, Instagram, Facebook,
  Globe, Smartphone, MessageCircle, ArrowRight, Check, Zap,
  Users, TrendingUp, Star, Sparkles, MonitorSmartphone, Send, QrCode,
} from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';
import WhatsApp from '@/components/icons/WhatsApp';

const HERO_STATS = [
  { value: '8+',  label: 'Lead Channels',    icon: Globe },
  { value: '98.5%',label: 'Capture Rate',     icon: TrendingUp },
  { value: '24/7', label: 'Always Active',    icon: Zap },
  { value: '< 2s', label: 'Response Time',    icon: MessageCircle },
];

const CHANNELS = [
  { icon: MessageSquare, title: 'Web Chat Widget',           desc: 'Embed AI-powered chat on your website. Instant responses, lead qualification, and booking — all automated.',    glow: '#FF5722', iconGrad: 'linear-gradient(135deg,#FF8C42,#FF5722)', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)', features: ['Customizable design', 'Proactive chat triggers', 'Mobile responsive'] },
  { icon: QrCode,        title: 'QR Code Forms',             desc: 'Generate QR codes for events, signage, print materials. Scan to instantly capture and qualify leads.',         glow: '#7c3aed', iconGrad: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)', features: ['Unlimited QR codes', 'Custom landing pages', 'Trackable analytics'] },
  { icon: Mail,          title: 'Email Integration',         desc: 'AI reads and responds to emails automatically. Qualifies leads, books appointments, and follows up.',           glow: '#FF5722', iconGrad: 'linear-gradient(135deg,#FF8C42,#FF5722)', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)', features: ['Smart inbox parsing', 'Auto-categorization', 'Template responses'] },
  { icon: Phone,         title: 'Phone & SMS',               desc: 'Dedicated business number with AI voice and SMS. Never miss a call or text again.',                           glow: '#7c3aed', iconGrad: 'linear-gradient(135deg,#5b21b6,#7c3aed)', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)', features: ['Local phone numbers', 'Call recording', '2-way SMS messaging'] },
  { icon: Instagram,     title: 'Instagram',             desc: 'AI responds to Instagram direct messages instantly. Qualify leads from social comments and stories.',          glow: '#FF5722', iconGrad: 'linear-gradient(135deg,#FF8C42,#FF5722)', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)', features: ['Story mentions', 'Comment replies', 'Auto-DM sequences'] },
  { icon: Facebook,      title: 'Facebook',        desc: 'Capture and engage leads from Facebook Messenger. AI handles conversations 24/7.',                            glow: '#7c3aed', iconGrad: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)', features: ['Page inbox integration', 'Ad lead forms', 'Messenger chatbots'] },
  { icon: WhatsApp,         title: 'WhatsApp',  desc: '2 - way chat automation.',                                  glow: '#FF5722', iconGrad: 'linear-gradient(135deg,#FF8C42,#FF5722)', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)', features: ['Inbound Calls','Call Recording'] },
  { icon: MessageCircle, title: 'Custom Forms',              desc: 'Build unlimited custom forms with drag-and-drop. Embed anywhere or share direct links.',                      glow: '#7c3aed', iconGrad: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)', features: ['Drag-drop builder', 'Conditional logic', 'Multi-step forms'] },
  { icon: Smartphone,    title: 'SMS Keywords',              desc: 'Text-to-join campaigns. Customers text a keyword to your number and AI takes over.',                          glow: '#FF5722', iconGrad: 'linear-gradient(135deg,#FF8C42,#FF5722)', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)', features: ['Unlimited keywords', 'Auto-responders', 'Drip campaigns'] },
];

const INBOX_CONVOS = [
  { channel: 'Web Chat', name: 'Sarah Johnson', message: 'Looking for pricing info...', time: '2m ago', icon: MessageSquare },
  { channel: 'Instagram', name: 'Mike Chen',    message: 'Interested in demo',          time: '5m ago', icon: Instagram },
  { channel: 'SMS',       name: 'Amy Roberts',  message: 'Can I book for tomorrow?',    time: '8m ago', icon: Smartphone },
  { channel: 'Email',     name: 'John Davis',   message: 'Follow-up on proposal',       time: '12m ago',icon: Mail },
];

const FEATURES = [
  { icon: Zap,              title: 'Instant Response',       desc: 'AI responds in under 2 seconds across all channels. Never lose a lead to slow response times again.',         glow: '#FF5722' },
  { icon: Users,            title: 'Lead Enrichment',        desc: 'Automatically capture name, email, phone, location, and preferences from every conversation.',                glow: '#7c3aed' },
  { icon: Star,             title: 'Smart Routing',          desc: 'AI routes high-value leads to sales team instantly based on qualification and scoring.',                       glow: '#FF5722' },
  { icon: TrendingUp,       title: 'Channel Analytics',      desc: 'Track which channels bring the most leads, highest conversion rates, and best ROI.',                          glow: '#7c3aed' },
  { icon: MonitorSmartphone,title: 'Cross-Device Tracking',  desc: 'Follow leads across devices and channels with unified customer profiles.',                                     glow: '#FF5722' },
  { icon: Send,             title: 'Automated Follow-ups',   desc: 'AI sends personalized follow-ups based on lead behavior and engagement level.',                               glow: '#7c3aed' },
];

export default function LeadCapturePage() {
  return (
    <div className="min-h-screen" style={{ background: '#0d0618' }}>
      <LandingPageHeader />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 60%, #1a0a18 100%)' }}>
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#7c3aed]/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#FF5722]/10 blur-[80px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
              <MessageSquare className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-semibold text-purple-300">All Channels, One Platform</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Omnichannel Lead Capture</h1>
            <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8">Capture leads from every channel — Web Chat, Forms, SMS, Phone, Social Media, QR Codes — all in one unified system</p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/register" className="group relative inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-xl overflow-hidden transition-all" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                Start Capturing Leads <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-5">
            {HERO_STATS.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                className="relative rounded-2xl p-px overflow-hidden"
                style={{ background: index % 2 === 0 ? 'linear-gradient(135deg,#7c3aed55,#FF572244)' : 'linear-gradient(135deg,#FF572244,#7c3aed55)' }}>
                <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                  <stat.icon className="w-7 h-7 text-orange-400 mb-3" />
                  <div className="text-3xl font-extrabold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-white/45">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── All Channels ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full bg-[#7c3aed]/10 blur-[90px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-sm font-semibold text-orange-300">Every Source</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Capture Leads From Every Channel</h2>
            <p className="text-white/50">All conversations unified in one intelligent inbox</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CHANNELS.map((channel, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl p-px overflow-hidden hover:scale-[1.01] transition-transform duration-300"
                style={{ background: channel.borderGrad }}>
                <div className="relative rounded-2xl p-5 h-full overflow-hidden flex flex-col" style={{ background: 'linear-gradient(145deg, #0f0420 0%, #1a0a2e 50%, #1a0800 100%)' }}>
                  <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity pointer-events-none" style={{ background: channel.glow + '55' }} />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: channel.iconGrad, boxShadow: `0 0 16px ${channel.glow}44` }}>
                      <channel.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-2 text-sm">{channel.title}</h3>
                    <p className="text-xs text-white/45 mb-4 leading-relaxed">{channel.desc}</p>
                    <div className="space-y-1.5">
                      {channel.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <span className="text-xs text-white/40">{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 h-px" style={{ background: `linear-gradient(to right, transparent, ${channel.glow}66, transparent)` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Unified Inbox ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] rounded-full bg-[#FF5722]/10 blur-[80px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-semibold text-purple-300">Unified Communications</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">All Conversations in One Intelligent Inbox</h2>
              <p className="text-white/55 mb-8 leading-relaxed">No more juggling between platforms. Every lead from every channel appears in one unified inbox with full conversation history.</p>
              <div className="space-y-3">
                {['See complete timeline across all channels', 'AI auto-categorizes and prioritizes leads', 'Seamless handoff between AI and human agents', 'Real-time notifications and alerts', 'Mobile app for on-the-go management', 'Team collaboration and assignment'].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)' }}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-white/60">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Inbox card */}
            <div className="relative rounded-2xl p-px overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
              <div className="rounded-2xl p-6 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <span className="text-white font-bold text-sm">Recent Conversations</span>
                  <span className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">Live</span>
                </div>
                {INBOX_CONVOS.map((conv, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,87,34,0.15)' }}>
                      <conv.icon className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white text-xs font-bold">{conv.name}</span>
                        <span className="text-xs text-purple-400">{conv.channel}</span>
                      </div>
                      <p className="text-xs text-white/40 truncate">{conv.message}</p>
                    </div>
                    <span className="text-xs text-white/30 flex-shrink-0">{conv.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Built for Modern Lead Capture</h2>
            <p className="text-white/50">Everything you need to capture and convert more leads</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                style={{ background: index % 2 === 0 ? 'linear-gradient(135deg,#FF5722,#7c3aed)' : 'linear-gradient(135deg,#7c3aed,#FF5722)' }}>
                <div className="relative rounded-2xl p-5 h-full overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420 0%, #1a0a2e 50%, #1a0800 100%)' }}>
                  <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity pointer-events-none" style={{ background: feature.glow + '55' }} />
                  <div className="relative z-10">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: `linear-gradient(135deg, ${feature.glow}cc, ${feature.glow}88)`, boxShadow: `0 0 16px ${feature.glow}44` }}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-2 text-sm">{feature.title}</h3>
                    <p className="text-xs text-white/45 leading-relaxed">{feature.desc}</p>
                    <div className="mt-4 h-px" style={{ background: `linear-gradient(to right, transparent, ${feature.glow}66, transparent)` }} />
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
                <span className="text-sm font-semibold text-purple-300">Zero Missed Leads</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
              Never Miss Another Lead
            </h2>
            <p className="text-xl text-white/55 mb-12 max-w-xl mx-auto leading-relaxed">
              Capture leads from every channel with QualiFlow AI&apos;s omnichannel platform
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/register" className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white overflow-hidden no-underline transition-all duration-300" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/platform/how-it-works" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white border border-white/20 bg-white/[0.08] backdrop-blur-sm hover:bg-white/15 hover:border-white/35 transition-all duration-300 no-underline">
                  See How It Works <ArrowRight className="w-4 h-4" />
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
