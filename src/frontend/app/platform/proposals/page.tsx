'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FileText, Send, CheckCircle, DollarSign, Edit, Eye,
  Clock, TrendingUp, Award, Sparkles, Zap, ArrowRight,
  Star, BarChart3, Users, MessageSquare, Mail, Smartphone,
} from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

const HERO_STATS = [
  { value: '< 5min', label: 'Proposal Created', icon: Zap },
  { value: '3x',     label: 'Faster Close',     icon: TrendingUp },
  { value: '95%',    label: 'Acceptance Rate',  icon: CheckCircle },
  { value: 'Auto',   label: 'Follow-ups',       icon: Mail },
];

const WORKFLOW_STEPS = [
  { step: '01', icon: Sparkles,    title: 'AI Generates Proposal', desc: 'AI uses conversation data, lead info, and your templates to create custom proposals instantly.',     glow: '#FF5722', iconGrad: 'linear-gradient(135deg,#FF8C42,#FF5722)', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)' },
  { step: '02', icon: Edit,        title: 'Team Reviews',          desc: 'Proposals are assigned to team members for review, editing, and approval before sending.',            glow: '#7c3aed', iconGrad: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)' },
  { step: '03', icon: Send,        title: 'Auto Send',             desc: 'Once approved, AI sends the proposal via email with personalized message and tracking.',              glow: '#FF5722', iconGrad: 'linear-gradient(135deg,#FF8C42,#FF5722)', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)' },
  { step: '04', icon: Eye,         title: 'Track Engagement',      desc: "See when proposals are opened, how long they're viewed, and which sections get attention.",           glow: '#7c3aed', iconGrad: 'linear-gradient(135deg,#5b21b6,#7c3aed)', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)' },
  { step: '05', icon: CheckCircle, title: 'Accept & Convert',      desc: 'Leads accept with one click. AI triggers next steps: booking, payment, or onboarding.',              glow: '#10b981', iconGrad: 'linear-gradient(135deg,#10b981,#059669)', borderGrad: 'linear-gradient(135deg,#10b981,#7c3aed)' },
];

const AI_FEATURES = [
  { title: 'Pulls Conversation Data', desc: 'AI extracts requirements, budget, timeline, and preferences from qualification conversations automatically.', icon: MessageSquare, glow: '#7c3aed' },
  { title: 'Uses Your Templates',     desc: 'Works with your existing proposal templates, branding, pricing tables, and terms & conditions.',               icon: FileText,      glow: '#FF5722' },
  { title: 'Personalizes Content',    desc: "Customizes language, recommendations, and pricing based on each lead's specific needs and profile.",            icon: Users,         glow: '#7c3aed' },
  { title: 'Suggests Upsells',        desc: 'AI recommends add-ons and upgrades based on lead intent signals and conversation context.',                    icon: TrendingUp,    glow: '#FF5722' },
];

const PROPOSAL_ITEMS = [
  { service: 'Kitchen Remodel',      price: '$15,000' },
  { service: 'Bathroom Upgrade',     price: '$8,500' },
  { service: 'Flooring Installation',price: '$6,200' },
];

const TRACKING = [
  { icon: Eye,         title: 'View Tracking',      metrics: [{ label: 'Opened', value: '47/52', pct: '90%' }, { label: 'Avg Time Viewed', value: '4m 32s', pct: '+15%' }, { label: 'Return Visits', value: '2.3x', pct: 'Avg' }],    glow: '#7c3aed', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)' },
  { icon: TrendingUp,  title: 'Engagement Metrics', metrics: [{ label: 'Section Views', value: 'All', pct: '100%' }, { label: 'Downloads', value: '23', pct: '44%' }, { label: 'Shared', value: '8', pct: '15%' }],               glow: '#FF5722', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)' },
  { icon: CheckCircle, title: 'Conversion Rates',   metrics: [{ label: 'Accepted', value: '41', pct: '79%' }, { label: 'Pending', value: '8', pct: '15%' }, { label: 'Declined', value: '3', pct: '6%' }],                       glow: '#7c3aed', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)' },
];

const FOLLOW_UP_SEQ = [
  { day: 'Day 0', action: 'Proposal Sent',        channel: 'Email',    status: 'sent',      icon: Send },
  { day: 'Day 1', action: 'Opened notification',  channel: 'SMS',      status: 'sent',      icon: Smartphone },
  { day: 'Day 3', action: 'Gentle reminder',      channel: 'Email',    status: 'sent',      icon: Mail },
  { day: 'Day 5', action: 'Check-in call',        channel: 'AI Voice', status: 'scheduled', icon: MessageSquare },
  { day: 'Day 7', action: 'Final follow-up',      channel: 'Email',    status: 'pending',   icon: Mail },
];

const PLATFORM_FEATURES = [
  { icon: FileText,    title: 'Template Library',       desc: 'Pre-built templates for every industry or create your own custom templates with drag-drop editor.', glow: '#7c3aed' },
  { icon: DollarSign,  title: 'Dynamic Pricing',        desc: 'Pricing tables, package options, add-ons, discounts, and payment terms — all customizable.',         glow: '#FF5722' },
  { icon: Award,       title: 'Professional Design',    desc: 'Beautiful, mobile-responsive proposals with your branding, logo, colors, and fonts.',                 glow: '#7c3aed' },
  { icon: CheckCircle, title: 'E-Signature',            desc: 'Built-in electronic signature collection. Legally binding and fully compliant.',                     glow: '#FF5722' },
  { icon: Star,        title: 'Testimonials & Proof',   desc: 'Embed customer reviews, case studies, and portfolio work to build trust.',                            glow: '#7c3aed' },
  { icon: BarChart3,   title: 'Performance Analytics',  desc: 'See which proposals convert best and optimize templates based on data.',                              glow: '#FF5722' },
];

const followUpStyle = (status: string) => {
  if (status === 'sent')      return { bg: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', badge: { bg: 'rgba(16,185,129,0.2)', color: '#34d399' }, icon: '#34d399', iconBg: 'rgba(16,185,129,0.2)' };
  if (status === 'scheduled') return { bg: 'rgba(255,87,34,0.08)', border: '1px solid rgba(255,87,34,0.25)', badge: { bg: 'rgba(255,87,34,0.2)', color: '#fb923c' }, icon: '#fb923c', iconBg: 'rgba(255,87,34,0.2)' };
  return { bg: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', badge: { bg: 'rgba(59,130,246,0.2)', color: '#60a5fa' }, icon: '#60a5fa', iconBg: 'rgba(59,130,246,0.2)' };
};

export default function ProposalsPage() {
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
              <FileText className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-semibold text-purple-300">Automated Proposals</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Proposal Automation</h1>
            <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8">AI creates, sends, and tracks professional proposals automatically. From generation to signature — fully automated</p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/register" className="group relative inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-xl overflow-hidden transition-all" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                Automate Your Proposals <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-5">
            {HERO_STATS.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                className="relative rounded-2xl p-px overflow-hidden"
                style={{ background: index % 2 === 0 ? 'linear-gradient(135deg,#7c3aed55,#FF572444)' : 'linear-gradient(135deg,#FF572444,#7c3aed55)' }}>
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

      {/* ── Workflow ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Proposal Workflow Automation</h2>
            <p className="text-white/50">From creation to signature in minutes</p>
          </motion.div>
          <div className="grid lg:grid-cols-5 gap-4">
            {WORKFLOW_STEPS.map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <div className="relative rounded-2xl p-px overflow-hidden h-full" style={{ background: step.borderGrad }}>
                  <div className="rounded-2xl p-4 h-full overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420, #1a0a2e)' }}>
                    <div className="text-3xl font-extrabold text-white/10 mb-3">{step.step}</div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-lg" style={{ background: step.iconGrad, boxShadow: `0 0 14px ${step.glow}44` }}>
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xs font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-[10px] text-white/40 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Generation ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm mb-6">
                <Sparkles className="w-4 h-4 text-orange-300" />
                <span className="text-sm font-semibold text-orange-300">AI-Powered</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">AI Creates Custom Proposals</h2>
              <p className="text-white/55 mb-8 leading-relaxed">AI generates professional, personalized proposals based on conversation data, lead needs, and your service offerings</p>
              <div className="space-y-3">
                {AI_FEATURES.map((feature, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-xl" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${feature.glow}cc, ${feature.glow}88)`, boxShadow: `0 0 14px ${feature.glow}44` }}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-0.5 text-sm">{feature.title}</h4>
                      <p className="text-xs text-white/45">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Proposal preview */}
            <div className="relative rounded-2xl p-px overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
              <div className="rounded-2xl p-6 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                  <h3 className="text-white font-bold text-sm">Proposal Preview</h3>
                  <span className="px-2.5 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-semibold">Auto-Generated</span>
                </div>
                <div className="space-y-4" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px' }}>
                  <div>
                    <div className="text-[10px] text-white/35 mb-1">Proposal For:</div>
                    <div className="text-white font-bold text-sm">Sarah Johnson - Home Renovation</div>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="text-xs text-white/40 mb-2.5">Services Included:</div>
                    <div className="space-y-2">
                      {PROPOSAL_ITEMS.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-white/55">{item.service}</span>
                          <span className="text-white font-semibold">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between">
                      <span className="text-white font-bold text-sm">Total Investment:</span>
                      <span className="text-orange-400 font-extrabold text-sm">$29,700</span>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="text-[10px] text-white/35 mb-1">Timeline:</div>
                    <div className="text-white text-xs">6-8 weeks starting April 1st</div>
                  </div>
                  <button className="w-full px-4 py-2.5 text-white rounded-lg font-bold text-xs transition-all" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)' }}>
                    Accept Proposal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tracking ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Track Every Proposal</h2>
            <p className="text-white/50">Real-time insights into proposal performance</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {TRACKING.map((card, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                style={{ background: card.borderGrad }}>
                <div className="relative rounded-2xl p-5 h-full overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420, #1a0a2e)' }}>
                  <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none" style={{ background: card.glow + '55' }} />
                  <div className="relative z-10">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: `linear-gradient(135deg, ${card.glow}cc, ${card.glow}88)`, boxShadow: `0 0 16px ${card.glow}44` }}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-4 text-sm">{card.title}</h3>
                    <div className="space-y-3">
                      {card.metrics.map((metric, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-xs text-white/40">{metric.label}</span>
                          <div className="text-right">
                            <div className="text-white font-bold text-sm">{metric.value}</div>
                            <div className="text-[10px] text-green-400">{metric.pct}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 h-px" style={{ background: `linear-gradient(to right, transparent, ${card.glow}66, transparent)` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Follow-ups ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl p-px overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
              <div className="rounded-2xl p-6 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                <h3 className="text-white text-sm font-bold mb-5">Automated Follow-up Sequence</h3>
                <div className="space-y-3">
                  {FOLLOW_UP_SEQ.map((followup, index) => {
                    const s = followUpStyle(followup.status);
                    return (
                      <div key={index} className="p-3 rounded-xl" style={{ background: s.bg, border: s.border }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: s.iconBg }}>
                              <followup.icon className="w-4 h-4" style={{ color: s.icon }} />
                            </div>
                            <div>
                              <div className="text-white font-bold text-xs">{followup.action}</div>
                              <div className="text-white/35 text-[10px]">{followup.channel}</div>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: s.badge.bg, color: s.badge.color }}>{followup.day}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
                <Clock className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-semibold text-purple-300">Smart Follow-ups</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Automated Follow-up Sequences</h2>
              <p className="text-white/55 mb-8 leading-relaxed">AI sends perfectly timed follow-ups across email, SMS, and voice until the proposal is accepted or declined</p>
              <div className="space-y-3">
                {['Multi-channel follow-up sequences', 'Timing optimized based on engagement', 'Stops automatically when accepted', 'Personalized messages for each touchpoint', 'Escalates to human team when needed', 'Tracks all interactions in CRM'].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)' }}>
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-white/55">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform Features ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Complete Proposal Platform</h2>
            <p className="text-white/50">Everything you need to create winning proposals</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {PLATFORM_FEATURES.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                style={{ background: index % 2 === 0 ? 'linear-gradient(135deg,#FF5722,#7c3aed)' : 'linear-gradient(135deg,#7c3aed,#FF5722)' }}>
                <div className="relative rounded-2xl p-5 h-full overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420, #1a0a2e)' }}>
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
                <span className="text-sm font-semibold text-purple-300">Close More Deals</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Close More Deals With Automated Proposals</h2>
            <p className="text-xl text-white/55 mb-12 max-w-xl mx-auto leading-relaxed">Stop spending hours on proposals. Let AI create, send, and track them for you</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/register" className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white overflow-hidden no-underline transition-all duration-300" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/platform/journey-automation" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white border border-white/20 bg-white/[0.08] backdrop-blur-sm hover:bg-white/15 hover:border-white/35 transition-all duration-300 no-underline">
                  See Automation Engine <ArrowRight className="w-4 h-4" />
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
