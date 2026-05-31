'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users, Brain, TrendingUp, Tag, Filter, Search,
  Star, Award, Target, BarChart3, Clock, CheckCircle,
  ArrowRight, Zap, MessageSquare, Calendar, Sparkles,
  List, FileText, Activity, Database,
} from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

const HERO_STATS = [
  { value: 'Auto', label: 'Lead Scoring',    icon: Award },
  { value: '100%', label: 'AI-Powered',      icon: Brain },
  { value: '8+',   label: 'Smart Lists',     icon: List },
  { value: '360°', label: 'Customer View',   icon: Users },
];

const SCORING_FACTORS = [
  { title: 'Intent Signals',          desc: 'AI detects urgency keywords, question types, and language patterns that indicate buying intent.',               icon: Target,       glow: '#FF5722' },
  { title: 'Engagement Behavior',     desc: 'Tracks email opens, link clicks, form submissions, and response times to gauge interest level.',               icon: Activity,     glow: '#7c3aed' },
  { title: 'Conversation Quality',    desc: 'Analyzes conversation depth, questions asked, and information shared during qualification.',                   icon: MessageSquare,glow: '#FF5722' },
  { title: 'Demographics & Fit',      desc: 'Scores based on location, budget indicators, timeline, and ideal customer profile match.',                    icon: Users,        glow: '#7c3aed' },
];

const LIVE_LEADS = [
  { name: 'Sarah Johnson', score: 95, status: 'Hot',  intent: 'High urgency',        color: '#ef4444' },
  { name: 'Mike Chen',     score: 87, status: 'Hot',  intent: 'Ready to buy',        color: '#f97316' },
  { name: 'Amy Roberts',   score: 72, status: 'Warm', intent: 'Researching options', color: '#FF5722' },
  { name: 'John Davis',    score: 58, status: 'Warm', intent: 'Just browsing',       color: '#a855f7' },
  { name: 'Lisa Martinez', score: 34, status: 'Cold', intent: 'Low engagement',      color: '#6366f1' },
];

const SEGMENTS = [
  { list: 'Hot Leads',             count: 47,  change: '+12', desc: 'High intent, ready to buy',           icon: Star,       glow: '#ef4444' },
  { list: 'Warm Leads',            count: 183, change: '+8',  desc: 'Engaged, researching options',        icon: TrendingUp, glow: '#f97316' },
  { list: 'Cold Leads',            count: 234, change: '+5',  desc: 'Low engagement, need nurturing',      icon: Users,      glow: '#3b82f6' },
  { list: 'Review Ready',          count: 64,  change: '+15', desc: 'Recent customers for reviews',        icon: Award,      glow: '#10b981' },
  { list: 'VIP Customers',         count: 29,  change: '+3',  desc: 'High-value repeat customers',         icon: Sparkles,   glow: '#a855f7' },
  { list: 'Upsell Opportunities',  count: 91,  change: '+7',  desc: 'Ready for additional services',       icon: TrendingUp, glow: '#14b8a6' },
  { list: 'At-Risk Customers',     count: 18,  change: '-2',  desc: 'Inactive, need re-engagement',        icon: Clock,      glow: '#eab308' },
  { list: 'Monthly Re-engagement', count: 156, change: '+22', desc: 'Scheduled for monthly touchpoint',    icon: Calendar,   glow: '#ec4899' },
];

const CRM_FEATURES = [
  { icon: Search,    title: 'Smart Search & Filters', desc: 'Find any contact instantly with AI-powered search and advanced filtering by score, tags, activity, and more.',  glow: '#7c3aed' },
  { icon: Tag,       title: 'Auto-Tagging',           desc: 'AI automatically tags contacts based on behavior, preferences, and conversation topics — no manual work.',       glow: '#FF5722' },
  { icon: BarChart3, title: 'Pipeline Management',    desc: 'Visual pipelines show where each lead is in your sales process with automated stage progression.',               glow: '#7c3aed' },
  { icon: Filter,    title: 'Custom Views',           desc: 'Create saved views and filters for different team members, campaigns, or customer segments.',                    glow: '#FF5722' },
  { icon: Zap,       title: 'Bulk Actions',           desc: 'Update, tag, message, or assign hundreds of contacts at once with bulk operations.',                            glow: '#7c3aed' },
  { icon: Activity,  title: 'Activity Tracking',      desc: 'Every email, text, call, and interaction is automatically logged and timestamped.',                              glow: '#FF5722' },
];

const WHY_CRM = [
  { title: 'No Integrations Needed', desc: 'Everything works together natively — no Zapier, no API keys, no syncing delays or errors.', glow: '#7c3aed' },
  { title: 'AI Does the Work',       desc: 'Scoring, segmentation, tagging, and prioritization happen automatically in the background.', glow: '#FF5722' },
  { title: 'Built for Speed',        desc: "Lightweight and fast. No bloated features you don't need. Just what matters for lead conversion.", glow: '#7c3aed' },
  { title: 'Always in Sync',         desc: 'Conversation data, bookings, and customer info update in real-time across all channels.',  glow: '#FF5722' },
];

const TIMELINE_EVENTS = [
  { icon: MessageSquare, action: 'Replied to Instagram DM', time: '2 hours ago' },
  { icon: FileText,      action: 'Submitted contact form',  time: '1 day ago' },
  { icon: Calendar,      action: 'Booked consultation',     time: '1 day ago' },
];

export default function CRMPage() {
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
              <Brain className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-semibold text-purple-300">Intelligent Customer Management</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Built-In CRM + AI-Powered Scoring</h1>
            <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8">Lightweight CRM with AI that automatically scores, segments, and prioritizes every lead — no complex setup required</p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/register" className="group relative inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-xl overflow-hidden transition-all" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                Start Managing Leads Smarter <ArrowRight className="w-5 h-5" />
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

      {/* ── AI Lead Scoring ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm mb-6">
                <Star className="w-4 h-4 text-orange-300" />
                <span className="text-sm font-semibold text-orange-300">AI Intelligence</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">AI Scores Every Lead Automatically</h2>
              <p className="text-white/55 mb-8 leading-relaxed">QualiFlow AI&apos;s AI analyzes intent signals, engagement behavior, and conversation data to score each lead 0-100 automatically.</p>
              <div className="space-y-3">
                {SCORING_FACTORS.map((factor, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-xl" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${factor.glow}cc, ${factor.glow}88)`, boxShadow: `0 0 14px ${factor.glow}44` }}>
                      <factor.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-0.5 text-sm">{factor.title}</h4>
                      <p className="text-xs text-white/45">{factor.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Live scoring card */}
            <div className="relative rounded-2xl p-px overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
              <div className="rounded-2xl p-6 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                <h3 className="text-white text-sm font-bold mb-5">Live Lead Scoring</h3>
                <div className="space-y-3">
                  {LIVE_LEADS.map((lead, index) => (
                    <div key={index} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ background: `linear-gradient(135deg, ${lead.color}cc, ${lead.color}88)` }}>
                            {lead.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-white font-bold text-xs">{lead.name}</div>
                            <div className="text-white/35 text-[10px]">{lead.intent}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-extrabold text-white">{lead.score}</div>
                          <div className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: lead.color + '22', color: lead.color }}>{lead.status}</div>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${lead.score}%`, background: `linear-gradient(to right, ${lead.color}bb, ${lead.color})` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Segments ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">AI Creates & Manages Lists Automatically</h2>
            <p className="text-white/50">No manual tagging required — AI segments contacts intelligently</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SEGMENTS.map((segment, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="relative rounded-xl p-px overflow-hidden hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
                style={{ background: index % 2 === 0 ? 'linear-gradient(135deg,#7c3aed44,#FF572444)' : 'linear-gradient(135deg,#FF572444,#7c3aed44)' }}>
                <div className="rounded-xl p-4 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: segment.glow + '22' }}>
                    <segment.icon className="w-5 h-5" style={{ color: segment.glow }} />
                  </div>
                  <h3 className="text-white text-sm font-bold mb-1">{segment.list}</h3>
                  <p className="text-white/35 text-xs mb-3">{segment.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold text-white">{segment.count}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: segment.change.startsWith('+') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: segment.change.startsWith('+') ? '#34d399' : '#f87171' }}>
                      {segment.change} today
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 360 View ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Profile card */}
            <div className="relative rounded-2xl p-px overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
              <div className="rounded-2xl p-6 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                <div className="flex items-center justify-between mb-5 pb-5 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>SJ</div>
                    <div>
                      <h3 className="text-white font-bold">Sarah Johnson</h3>
                      <p className="text-white/40 text-xs">sarah@example.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-white">95</div>
                    <div className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">Hot Lead</div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <h4 className="text-white text-xs font-bold mb-2">Contact Info</h4>
                    <div className="space-y-1.5 text-xs">
                      {[{ label: 'Phone', value: '+1 (555) 123-4567' }, { label: 'Location', value: 'San Francisco, CA' }, { label: 'Source', value: 'Instagram DM' }].map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-white/35">{item.label}</span>
                          <span className="text-white/70">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold mb-2">Activity Timeline</h4>
                    <div className="space-y-2.5">
                      {TIMELINE_EVENTS.map((event, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,87,34,0.15)' }}>
                            <event.icon className="w-3.5 h-3.5 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-white text-xs">{event.action}</p>
                            <p className="text-white/30 text-[10px]">{event.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {['High Intent', 'Budget Approved', 'Decision Maker'].map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-purple-500/15 text-purple-300 rounded-full text-[10px] font-semibold">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
                <Database className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-semibold text-purple-300">Complete Customer Data</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">360° Customer Profile</h2>
              <p className="text-white/55 mb-8 leading-relaxed">See everything about each contact in one place — conversation history, activities, preferences, and AI insights.</p>
              <div className="space-y-3">
                {['Complete conversation history across all channels', 'Automatic activity tracking and timeline', 'AI-generated customer summaries', 'Custom fields and tags', 'Engagement scoring and analytics', 'Notes and internal collaboration'].map((feature, index) => (
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

      {/* ── CRM Features ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Everything You Need in a CRM</h2>
            <p className="text-white/50">Simple, powerful, and AI-enhanced</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {CRM_FEATURES.map((feature, index) => (
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

      {/* ── Why Built-In ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Why Use QualiFlow AI&apos;s Built-In CRM?</h2>
            <p className="text-white/50">Simpler, smarter, and already integrated</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {WHY_CRM.map((benefit, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                style={{ background: index % 2 === 0 ? 'linear-gradient(135deg,#7c3aed,#FF5722)' : 'linear-gradient(135deg,#FF5722,#7c3aed)' }}>
                <div className="relative rounded-2xl p-6 h-full overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420, #1a0a2e)' }}>
                  <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity pointer-events-none" style={{ background: benefit.glow + '55' }} />
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-white mb-3">{benefit.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{benefit.desc}</p>
                    <div className="mt-4 h-px" style={{ background: `linear-gradient(to right, transparent, ${benefit.glow}66, transparent)` }} />
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
                <span className="text-sm font-semibold text-purple-300">AI-Powered CRM</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Start Managing Leads Smarter</h2>
            <p className="text-xl text-white/55 mb-12 max-w-xl mx-auto leading-relaxed">Let AI score, segment, and prioritize your leads automatically</p>
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
