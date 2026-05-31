'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MessageSquare, Brain, Zap, Clock, ArrowRight, Check,
  MessageCircle, Users, TrendingUp, Target,
  Phone, Mail, Instagram, Facebook, CheckCircle,
  Languages, Heart,
} from 'lucide-react';
import { WhatsApp } from '@/components/icons/WhatsApp';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

const DIFFERENTIATORS = [
  { icon: Brain,     title: 'Understands Intent',         desc: "AI doesn't just match keywords. It understands context, emotion, urgency, and true customer intent behind every message.",                                            stat: '98% intent accuracy',    glow: '#7c3aed', borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)', iconGrad: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
  { icon: Zap,       title: 'Takes Action Autonomously',  desc: "Unlike traditional chatbots that just respond, our AI executes tasks: books appointments, sends proposals, creates follow-ups.",                                         stat: 'Real task completion',   glow: '#FF5722', borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)', iconGrad: 'linear-gradient(135deg, #FF8C42, #FF5722)' },
  { icon: Users,     title: 'Builds Relationships',       desc: 'AI remembers past conversations, preferences, and context to create personalized, human-like interactions every time.',                                                   stat: '4.8/5 satisfaction',     glow: '#7c3aed', borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)', iconGrad: 'linear-gradient(135deg, #5b21b6, #7c3aed)' },
];

const CHANNELS = [
  { icon: Phone,         label: 'Phone Calls',       glow: '#3b82f6', iconGrad: 'from-blue-500 to-blue-600' },
  { icon: MessageCircle, label: 'SMS & MMS',         glow: '#10b981', iconGrad: 'from-green-500 to-green-600' },
  { icon: Mail,          label: 'Email',             glow: '#ef4444', iconGrad: 'from-red-500 to-red-600' },
  { icon: MessageSquare, label: 'Web Chat',          glow: '#7c3aed', iconGrad: 'from-purple-500 to-purple-600' },
  { icon: Instagram,     label: 'Instagram',         glow: '#ec4899', iconGrad: 'from-pink-500 to-pink-600' },
  { icon: Facebook,      label: 'Facebook',          glow: '#3b82f6', iconGrad: 'from-blue-600 to-blue-700' },
  { icon: MessageSquare, label: 'Forms',             glow: '#FF5722', iconGrad: 'from-orange-500 to-orange-600' },
  { icon: Target,        label: 'QR Codes',          glow: '#a855f7', iconGrad: 'from-purple-600 to-purple-700' },
  { icon: WhatsApp,      label: 'WhatsApp',          glow: '#25D366', iconGrad: 'from-green-400 to-green-600' },
];

const CAPABILITIES = [
  { title: 'Qualify Leads Automatically',     desc: 'AI asks the right questions to understand budget, timeline, service needs, and urgency—then scores each lead 0-100.',           icon: Target,       features: ['Intent detection', 'Budget qualification', 'Timeline assessment', 'Service matching', 'Lead scoring', 'Priority routing'],            glow: '#7c3aed', borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)' },
  { title: 'Book Appointments Instantly',     desc: 'AI checks calendar availability, offers time slots, books appointments, and sends confirmations—all in one conversation.',      icon: CheckCircle,  features: ['Calendar sync', 'Availability check', 'Time zone handling', 'Instant booking', 'Auto confirmations', 'Reminder scheduling'],         glow: '#FF5722', borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)' },
  { title: 'Handle Objections & Questions',   desc: 'AI is trained on your business knowledge to answer questions, overcome objections, and guide leads toward conversion.',         icon: MessageSquare,features: ['Knowledge base access', 'FAQ answering', 'Objection handling', 'Product info', 'Pricing details', 'Custom responses'],               glow: '#7c3aed', borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)' },
  { title: 'Transfer to Humans Seamlessly',   desc: 'When needed, AI hands off to your team with full context, conversation history, and lead intelligence already captured.',      icon: Users,        features: ['Context handoff', 'Warm transfers', 'Conversation history', 'Lead scoring data', 'Notes & tags', 'Priority flagging'],              glow: '#FF5722', borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)' },
  { title: 'Follow Up Intelligently',         desc: 'AI remembers conversations and follows up at the perfect time with personalized messages based on previous interactions.',     icon: Clock,        features: ['Smart timing', 'Context retention', 'Personalization', 'Multi-touch sequences', 'Response tracking', 'Auto optimization'],          glow: '#7c3aed', borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)' },
  { title: 'Multi-Language Support',          desc: "AI converses in two languages, automatically detecting and responding to customers.",                  icon: Languages,    features: ['English', 'Auto detection', 'Native fluency', 'Spanish', 'Real-time translation', 'More coming soon'],            glow: '#FF5722', borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)' },
];

const CONVERSATION = [
  { type: 'customer', text: "Hi, I'm interested in your dental cleaning service" },
  { type: 'ai',       text: "Great! I'd love to help you book a cleaning. Can I ask—have you been to our practice before, or would this be your first visit?" },
  { type: 'customer', text: 'First time' },
  { type: 'ai',       text: 'Perfect! For a new patient cleaning, we have availability this week. Are you looking for something urgent, or are you flexible with timing?' },
  { type: 'customer', text: 'This week would be great' },
  { type: 'ai',       text: 'Awesome! I have openings on Thursday at 2 PM or Friday at 10 AM. Which works better for you?' },
  { type: 'customer', text: 'Thursday 2pm works' },
  { type: 'ai',       text: "✅ Perfect! You're all set for Thursday, March 27th at 2:00 PM for a dental cleaning. I just sent a confirmation to your phone. Looking forward to seeing you!" },
];

const STATS = [
  { icon: Zap,        value: '<60s',   label: 'Average Response Time',    glow: '#FF5722', iconGrad: 'linear-gradient(135deg, #FF8C42, #FF5722)', borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)' },
  { icon: TrendingUp, value: '98.5%',  label: 'Response Rate',            glow: '#7c3aed', iconGrad: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)' },
  { icon: Target,     value: '85%',    label: 'Qualification Rate',       glow: '#FF5722', iconGrad: 'linear-gradient(135deg, #FF8C42, #FF5722)', borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)' },
  { icon: Heart,      value: '4.8/5',  label: 'Customer Satisfaction',    glow: '#7c3aed', iconGrad: 'linear-gradient(135deg, #5b21b6, #7c3aed)', borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)' },
];

export default function AIEngagementPage() {
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
              <Brain className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-semibold text-purple-300">Agentic AI Conversations</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
              AI Conversation Engagement
            </h1>
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              AI that doesn&apos;t just respond—it engages, qualifies, builds relationships, and drives action across every channel simultaneously.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/register" className="group relative px-8 py-4 text-lg font-semibold text-white rounded-xl inline-flex items-center gap-2 overflow-hidden transition-all" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <Link href="/#demo" className="px-8 py-4 border border-white/20 bg-white/[0.08] backdrop-blur-sm text-white rounded-xl hover:bg-white/15 hover:border-white/35 transition-all inline-flex items-center gap-2 text-lg font-semibold">
                See It Live <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Not Your Average Chatbot ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-sm font-semibold text-orange-300">Agentic AI</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Not Your Average Chatbot</h2>
            <p className="text-white/50">Agentic AI that thinks, decides, and acts autonomously</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {DIFFERENTIATORS.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                style={{ background: item.borderGrad }}>
                <div className="relative rounded-2xl p-6 h-full overflow-hidden flex flex-col" style={{ background: 'linear-gradient(145deg, #0f0420 0%, #1a0a2e 50%, #1a0800 100%)' }}>
                  <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none" style={{ background: item.glow + '55' }} />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: item.iconGrad, boxShadow: `0 0 18px ${item.glow}55` }}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-white/50 mb-4 leading-relaxed">{item.desc}</p>
                    <div className="px-3 py-1 rounded-full inline-block" style={{ background: item.glow + '22', border: `1px solid ${item.glow}44` }}>
                      <span className="text-xs font-bold" style={{ color: item.glow }}>{item.stat}</span>
                    </div>
                    <div className="mt-4 h-px" style={{ background: `linear-gradient(to right, transparent, ${item.glow}88, transparent)` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Works Across Every Channel ── */}
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

      {/* ── AI Capabilities ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">What AI Can Do in Conversations</h2>
            <p className="text-white/50">Beyond simple Q&A—real business outcomes</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            {CAPABILITIES.map((cap, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                style={{ background: cap.borderGrad }}>
                <div className="relative rounded-2xl p-6 h-full overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420 0%, #1a0a2e 50%, #1a0800 100%)' }}>
                  <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full blur-2xl opacity-25 group-hover:opacity-50 transition-opacity pointer-events-none" style={{ background: cap.glow + '55' }} />
                  <div className="relative z-10 flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: `linear-gradient(135deg, ${cap.glow}cc, ${cap.glow}88)`, boxShadow: `0 0 18px ${cap.glow}44` }}>
                      <cap.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">{cap.title}</h3>
                      <p className="text-xs text-white/50 leading-relaxed">{cap.desc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {cap.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-white/55">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Real Conversation ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-[#7c3aed]/15 blur-[80px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">See AI in Action</h2>
            <p className="text-white/50">Real conversation example from lead to booking</p>
          </motion.div>
          <div className="relative rounded-2xl p-px overflow-hidden max-w-2xl mx-auto" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
            <div className="rounded-2xl p-6 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
              <div className="space-y-3">
                {CONVERSATION.map((message, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}
                    className={`flex ${message.type === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${message.type === 'customer' ? 'text-white' : 'text-white/85'}`}
                      style={message.type === 'customer'
                        ? { background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }
                        : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="text-xs opacity-50 mb-1">{message.type === 'customer' ? 'Customer' : 'QualiFlow AI'}</div>
                      <p>{message.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="font-semibold">Lead Qualified & Appointment Booked in under 2 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">AI Performance Metrics</h2>
            <p className="text-white/50">Real results from thousands of conversations</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6">
            {STATS.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.04, y: -4 }}
                className="group relative rounded-2xl p-px overflow-hidden text-center"
                style={{ background: stat.borderGrad }}>
                <div className="relative rounded-2xl p-6 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420, #1a0a2e)' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none" style={{ background: stat.glow + '55' }} />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: stat.iconGrad, boxShadow: `0 0 18px ${stat.glow}55` }}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-4xl font-extrabold text-white mb-1">{stat.value}</div>
                    <div className="text-xs text-white/50">{stat.label}</div>
                    <div className="mt-4 h-px" style={{ background: `linear-gradient(to right, transparent, ${stat.glow}88, transparent)` }} />
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
                <span className="text-sm font-semibold text-purple-300">Engage Every Lead with AI</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
              Ready to Engage Every Lead with AI?
            </h2>
            <p className="text-xl text-white/55 mb-12 max-w-xl mx-auto leading-relaxed">
              Start capturing and converting more leads with intelligent AI conversations across every channel.
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
                  See It Live <ArrowRight className="w-4 h-4" />
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
