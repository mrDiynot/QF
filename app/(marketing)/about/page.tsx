'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare, Bot, BarChart3, Calendar, Database, RefreshCw,
  ArrowRight, Phone, QrCode, FileText, Mail, Instagram, Facebook,
  MessageCircle, Target, Zap, Users, Sparkles,
} from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

// ---------------------------------------------------------------------------
// Journey steps
// ---------------------------------------------------------------------------
const journeySteps = [
  { icon: MessageSquare, label: 'Lead Captured',  sub: 'SMS, WhatsApp, IG, FB, Phone Calls, Email, Webchat, Forms, QR code', glow: '#3b82f6', iconGrad: 'from-blue-500 to-cyan-400' },
  { icon: Bot,           label: 'AI Responds',    sub: 'Instant, agentic reply',          glow: '#a855f7', iconGrad: 'from-violet-500 to-purple-400' },
  { icon: BarChart3,     label: 'Lead Qualified', sub: 'Scored & prioritised',            glow: '#FF5722', iconGrad: 'from-orange-500 to-red-400' },
  { icon: Calendar,      label: 'Booking Made',   sub: 'Auto-scheduled in seconds',       glow: '#10b981', iconGrad: 'from-emerald-500 to-green-400' },
  { icon: Database,      label: 'CRM Synced',     sub: 'Real-time pipeline update',       glow: '#6366f1', iconGrad: 'from-indigo-500 to-violet-400' },
  { icon: RefreshCw,     label: 'Retention Loop', sub: 'Re-engage & upsell on autopilot', glow: '#ec4899', iconGrad: 'from-pink-500 to-rose-400' },
];

const channels = [Phone, QrCode, FileText, Mail, Instagram, Facebook, MessageCircle, MessageSquare];

// ---------------------------------------------------------------------------
// Differentiators
// ---------------------------------------------------------------------------
const differentiators = [
  {
    icon: Target,
    title: 'Goal-Based Automation',
    description: 'Not step-based workflows. Outcome-driven intelligence.',
    glow: '#FF5722',
    borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)',
    iconGrad: 'linear-gradient(135deg, #FF8C42, #FF5722)',
  },
  {
    icon: MessageSquare,
    title: 'True Omnichannel',
    description: 'SMS, WhatsApp, IG, FB, Phone Calls, Email, Webchat, Forms, QR code.',
    glow: '#7c3aed',
    borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)',
    iconGrad: 'linear-gradient(135deg, #7c3aed, #a855f7)',
  },
  {
    icon: Bot,
    title: 'Agentic AI',
    description: "AI that doesn't just respond — it takes action, drives outcomes, and executes revenue-generating tasks autonomously.",
    glow: '#FF5722',
    borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)',
    iconGrad: 'linear-gradient(135deg, #FF8C42, #FF5722)',
  },
  {
    icon: Database,
    title: 'CRM-First Architecture',
    description: 'We sync clean, structured data — not messy message logs.',
    glow: '#7c3aed',
    borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)',
    iconGrad: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
  },
  {
    icon: Sparkles,
    title: 'Built-In Journeys',
    description: 'Prebuilt lifecycle automation out of the box.',
    glow: '#FF5722',
    borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)',
    iconGrad: 'linear-gradient(135deg, #FF8C42, #FF5722)',
  },
  {
    icon: BarChart3,
    title: 'Actionable Analytics',
    description: "Real insights that drive revenue decisions. See exactly where your sales pipeline converts and where prospects drop off — so you stop wasting budget on what doesn't work.",
    glow: '#7c3aed',
    borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)',
    iconGrad: 'linear-gradient(135deg, #7c3aed, #a855f7)',
  },
];

// ---------------------------------------------------------------------------
// Founding Team
// ---------------------------------------------------------------------------
const foundingTeam = [
  { name: 'Jurgen',    role: 'Co-Founder, Chief Growth Officer',             borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)', glowColor: '#FF5722', iconGrad: 'linear-gradient(135deg, #FF5722, #FF8C42)' },
  { name: 'Edem',      role: 'Co-Founder, VP of Product & Cybersecurity',    borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)', glowColor: '#7c3aed', iconGrad: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
  { name: 'Johannies', role: 'Co-Founder, VP of Product Engineering',        borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)', glowColor: '#FF5722', iconGrad: 'linear-gradient(135deg, #FF5722, #FF8C42)' },
  { name: 'Luis',      role: 'Co-Founder, Chief Revenue & Technology Officer', borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)', glowColor: '#7c3aed', iconGrad: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
  { name: 'Sami',      role: 'Product Manager',                              borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)', glowColor: '#FF5722', iconGrad: 'linear-gradient(135deg, #FF5722, #FF8C42)' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0d0618' }}>
      <LandingPageHeader />

      <main className="pt-20 pb-20">

        {/* ── Hero Section ── */}
        <section
          className="relative px-4 sm:px-6 py-16 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 60%, #1a0a18 100%)' }}
        >
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
          {/* Ambient orbs */}
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#7c3aed]/20 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#FF5722]/10 blur-[80px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center mb-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm">
                <Bot className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-semibold text-purple-300">About Qualiflow AI</span>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

              {/* Left Column */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
                  We&apos;re Building the Future of Automated Customer Journeys
                </h2>
                <div className="space-y-4 text-base sm:text-lg mb-8">
                  <p className="text-white/65">
                    QualiFlow AI is redefining how businesses capture, qualify, book, and retain customers — automatically.
                  </p>
                  <p className="font-semibold text-white/85">
                    Welcome to agentic revenue generation — where AI doesn&apos;t just respond, it drives outcomes.
                    We believe no business should lose revenue because of slow responses, missed calls, or disconnected systems.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-[#FF5722] to-[#FF8C42] text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all font-semibold no-underline"
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => document.getElementById('team-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-6 sm:px-8 py-3 border border-white/20 text-white/80 rounded-xl hover:bg-white/10 hover:border-white/40 transition-all font-semibold backdrop-blur-sm text-center"
                  >
                    Meet The Team
                  </button>
                </div>
              </motion.div>

              {/* Right Column — AI Journey Flow Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative w-full min-w-0"
              >
                {/* Outer glow halo */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#7c3aed]/60 via-[#FF5722]/30 to-[#7c3aed]/20 blur-[2px] pointer-events-none" />

                {/* Main card */}
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{ background: 'linear-gradient(145deg, #0d0618 0%, #1a0a2e 60%, #2a0e1a 100%)' }}
                >
                  {/* Dot grid */}
                  <div
                    className="absolute inset-0 opacity-[0.10] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '22px 22px' }}
                  />
                  {/* Ambient orbs */}
                  <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#7c3aed]/25 blur-[60px] pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-[#FF5722]/20 blur-[50px] pointer-events-none" />

                  <div className="relative z-10 p-4 sm:p-7">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                      <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
                      <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">AI Customer Journey</span>
                    </div>

                    {/* Steps */}
                    <div className="space-y-1">
                      {journeySteps.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.35 + index * 0.09 }}
                        >
                          <div className="group flex items-center gap-2 sm:gap-4 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl hover:bg-white/5 transition-colors duration-200 cursor-default">
                            <div className="flex flex-col items-center shrink-0">
                              <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${step.iconGrad} flex items-center justify-center shadow-lg`}
                                style={{ boxShadow: `0 0 16px ${step.glow}55` }}
                              >
                                <step.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-white text-xs sm:text-sm leading-tight">{step.label}</div>
                              <div className="text-[10px] sm:text-xs text-white/45 mt-0.5 truncate">{step.sub}</div>
                            </div>
                            <div className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-white/40">{index + 1}</span>
                            </div>
                          </div>

                          {/* Connector */}
                          {index < journeySteps.length - 1 && (
                            <div className="flex items-start gap-2 sm:gap-4 px-2 sm:px-3 py-0.5">
                              <div className="w-8 sm:w-10 flex justify-center shrink-0">
                                <div className="w-px h-4 bg-gradient-to-b from-white/20 to-white/5" />
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="mt-5 mb-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Channel row */}
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      <span className="text-[10px] text-white/30 mr-1 uppercase tracking-widest">Channels</span>
                      {channels.map((Icon, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-lg bg-white/5 border border-white/[0.08] flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <Icon className="w-3.5 h-3.5 text-white/40" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Mission & Vision ── */}
        <section className="relative pt-16 pb-10 px-6 overflow-hidden bg-white">
          {/* Subtle light ambient orbs */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,87,34,0.08) 0%, transparent 70%)' }} />

          <div className="max-w-[1200px] mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-orange-100 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
                <span className="text-sm font-semibold text-[#6B2D9E] tracking-wide">Our Purpose</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Mission &amp; Vision
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Mission Card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group relative rounded-2xl p-px overflow-hidden shadow-2xl shadow-purple-900/30"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}
              >
                <div className="relative rounded-2xl bg-[#0f0620] backdrop-blur-xl p-8 h-full overflow-hidden">
                  <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-violet-600/35 blur-2xl group-hover:bg-violet-500/55 transition-all duration-500" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(168,85,247,0.08) 50%, transparent 60%)' }} />
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 backdrop-blur-md border border-white/20 shadow-lg shadow-purple-900/30"
                      style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(168,85,247,0.15) 100%)' }}>
                      <Zap className="w-3.5 h-3.5 text-purple-300" />
                      <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Mission</span>
                    </div>
                    <p className="text-white/85 text-sm leading-relaxed">
                      Empower businesses to scale revenue through fully automated, agentic, intelligent customer journeys, ensuring every lead is captured, every conversation is handled instantly, and every opportunity is maximized.
                    </p>
                    <div className="mt-8 h-px bg-gradient-to-r from-violet-500/60 via-purple-400/30 to-transparent" />
                  </div>
                </div>
              </motion.div>

              {/* Vision Card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="group relative rounded-2xl p-px overflow-hidden shadow-2xl shadow-orange-900/20"
                style={{ background: 'linear-gradient(135deg, #FF5722, #7c3aed)' }}
              >
                <div className="relative rounded-2xl bg-[#0f0620] backdrop-blur-xl p-8 h-full overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-500/30 blur-2xl group-hover:bg-orange-400/50 transition-all duration-500" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,87,34,0.07) 50%, transparent 60%)' }} />
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 backdrop-blur-md border border-white/20 shadow-lg shadow-orange-900/30"
                      style={{ background: 'linear-gradient(135deg, rgba(255,87,34,0.35) 0%, rgba(255,140,66,0.15) 100%)' }}>
                      <Target className="w-3.5 h-3.5 text-orange-300" />
                      <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Vision</span>
                    </div>
                    <p className="text-white/85 text-sm leading-relaxed">
                      To become the global standard for AI-powered customer engagement — transforming how organizations capture, qualify, book, and retain customers without adding headcount.
                    </p>
                    <div className="mt-8 h-px bg-gradient-to-r from-orange-500/60 via-orange-400/30 to-transparent" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Our Team ── */}
        <section
          id="team-section"
          className="relative px-6 py-20 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#7c3aed]/15 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#FF5722]/[0.08] blur-[80px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-sm font-semibold text-purple-300 tracking-wide">Our Team</span>
              </div>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                QualiFlow AI was built by a team combining product engineering, cybersecurity, AI infrastructure, GTM strategy, and revenue execution.
              </p>
            </motion.div>

            {/* Team Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {foundingTeam.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                  style={{ background: member.borderGrad }}
                >
                  <div
                    className="relative rounded-2xl p-5 h-full overflow-hidden flex flex-col items-center text-center"
                    style={{ background: 'linear-gradient(145deg, #1a0800 0%, #2a0e00 50%, #1f0a05 100%)' }}
                  >
                    {/* Corner ambient glow */}
                    <div
                      className="absolute -top-8 -left-8 w-28 h-28 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none"
                      style={{ background: member.glowColor + '55' }}
                    />
                    {/* Dot grid texture */}
                    <div
                      className="absolute inset-0 opacity-[0.07] pointer-events-none"
                      style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    />
                    {/* Shimmer on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -skew-x-12"
                      style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.05) 50%, transparent 65%)' }}
                    />
                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-lg"
                        style={{ background: member.iconGrad, boxShadow: `0 0 20px ${member.glowColor}66` }}
                      >
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <p className="font-bold text-white text-sm leading-snug mb-1">{member.name}</p>
                      <p className="text-xs text-white/45 leading-snug">{member.role}</p>
                      <div
                        className="mt-4 h-px w-full"
                        style={{ background: `linear-gradient(to right, transparent, ${member.glowColor}88, transparent)` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why QualiFlow AI Is Different ── */}
        <section
          className="relative px-6 py-20 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 40%, #1a0800 80%, #0d0618 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
          <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full bg-[#7c3aed]/15 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[450px] h-[300px] rounded-full bg-[#FF5722]/[0.12] blur-[80px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  <span className="text-sm font-semibold text-orange-300 tracking-wide">Our Edge</span>
                </div>
              </div>

              <h3 className="text-4xl font-bold mb-14 text-center">
                <span style={{ background: 'linear-gradient(135deg, #ffffff 0%, #e9d5ff 40%, #FF8C42 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Why QualiFlow AI Is Different
                </span>
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {differentiators.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                    style={{ background: item.borderGrad }}
                  >
                    <div
                      className="relative rounded-2xl p-6 h-full overflow-hidden flex flex-col"
                      style={{ background: 'linear-gradient(145deg, #0f0420 0%, #1a0a2e 50%, #1a0800 100%)' }}
                    >
                      <div
                        className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                        style={{ background: item.glow + '55' }}
                      />
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -skew-x-12"
                        style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.04) 50%, transparent 65%)' }}
                      />
                      <div className="relative z-10">
                        <div
                          className="w-13 h-13 rounded-xl flex items-center justify-center mb-5 shadow-lg"
                          style={{ background: item.iconGrad, boxShadow: `0 0 18px ${item.glow}55`, width: '52px', height: '52px' }}
                        >
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-base font-bold text-white mb-2 leading-snug">{item.title}</h4>
                        <p className="text-xs text-white/50 leading-relaxed">{item.description}</p>
                        <div
                          className="mt-5 h-px w-full"
                          style={{ background: `linear-gradient(to right, transparent, ${item.glow}88, transparent)` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Closing Statement ── */}
        <section
          className="relative py-28 px-6 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 50%, #0f041a 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[#7c3aed]/30 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] rounded-full bg-[#FF5722]/15 blur-[90px] pointer-events-none" />
          <div className="absolute -top-20 -left-20 w-[350px] h-[350px] rounded-full bg-[#5b21b6]/25 blur-[70px] pointer-events-none" />

          <div className="max-w-[900px] mx-auto relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
            >
              {/* Agentic status chip */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                  </span>
                  <span className="text-sm font-semibold text-purple-300 tracking-wide">Agentic Revenue Generation</span>
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span style={{ background: 'linear-gradient(135deg, #ffffff 0%, #e9d5ff 45%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  We believe the future of customer engagement is automated, intelligent, and outcome-driven.
                </span>
              </h2>

              <p className="text-xl text-white/55 mb-12 max-w-xl mx-auto leading-relaxed">
                QualiFlow AI is building that future — one agentic journey at a time.
              </p>

              <div className="flex gap-4 justify-center flex-wrap">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/contact"
                    className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white overflow-hidden no-underline transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                    <ArrowRight className="w-4 h-4" />
                    Request Demo
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white border border-white/20 bg-white/[0.08] backdrop-blur-sm hover:bg-white/15 hover:border-white/35 transition-all duration-300 no-underline"
                  >
                    Join Early Access
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>

              <div className="mt-16 mx-auto max-w-xs h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.6), rgba(168,85,247,0.5), transparent)' }} />
            </motion.div>
          </div>
        </section>

      </main>

      <LandingPageFooter />
    </div>
  );
}
