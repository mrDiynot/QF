'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Workflow, Zap, Brain, ArrowRight,
  Sparkles, GitBranch, Target, TrendingUp,
  Users, Mail, Phone, RefreshCw, CheckCircle, AlertCircle,
  Code, Layers, Shield,
} from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

const DIFFERENTIATORS = [
  { icon: Brain,     title: 'AI-Powered Decisions',  desc: "Unlike traditional automation that follows rigid \"if-this-then-that\" rules, our AI actually thinks. It analyzes context, intent, behavior, and timing to make smart decisions about what to do next.", glow: '#7c3aed', borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)', iconGrad: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
  { icon: GitBranch, title: 'Dynamic Branching',     desc: "Journeys adapt in real-time based on customer responses, engagement levels, and behaviors. No two customers follow the exact same path—AI personalizes every journey.",             glow: '#FF5722', borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)', iconGrad: 'linear-gradient(135deg, #FF8C42, #FF5722)' },
  { icon: Zap,       title: 'Instant Execution',     desc: "Actions happen in real-time across all channels. The moment AI detects a trigger—missed call, form submission, appointment booked—workflows execute instantly.",              glow: '#7c3aed', borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)', iconGrad: 'linear-gradient(135deg, #5b21b6, #7c3aed)' },
];

const PREBUILT_JOURNEYS = [
  { title: 'New Lead → Qualification → Booking', desc: 'AI captures lead, qualifies intent, scores based on signals, and books high-intent prospects instantly.', icon: Target,        color: 'from-orange-500 to-orange-600' },
  { title: 'Missed Call Recovery',               desc: 'Detects missed calls, sends SMS within seconds, and can trigger AI outbound call to recover the lead.', icon: Phone,          color: 'from-red-500 to-red-600' },
  { title: 'No-Show Recovery',                   desc: 'Re-engages customers who missed appointments with smart follow-ups and rebooking offers.',               icon: RefreshCw,      color: 'from-purple-500 to-purple-600' },
  { title: 'Review & Survey Collection',         desc: 'Post-appointment flow that sends thank-you messages, review requests, and surveys automatically.',       icon: CheckCircle,    color: 'from-green-500 to-green-600' },
  { title: 'Cold Lead Revival',                  desc: 'Re-activates leads that went cold using AI-timed nudges and personalized re-engagement messages.',       icon: Sparkles,       color: 'from-blue-500 to-blue-600' },
  { title: 'Retention & Re-Engagement',          desc: 'Identifies inactive customers and brings them back with incentives, reminders, and offers.',            icon: Users,          color: 'from-pink-500 to-pink-600' },
  { title: 'Proposal Creation & Assignment',     desc: 'Generates proposals, assigns team members for review, and tracks proposal status automatically.',      icon: Mail,           color: 'from-indigo-500 to-indigo-600' },
  { title: 'Proposal Send & Acceptance Tracking',desc: 'Sends proposals to customers, tracks opens/views, follows up on declines, and triggers next steps.',   icon: TrendingUp,     color: 'from-teal-500 to-teal-600' },
  { title: 'Abandoned Form Recovery',            desc: 'Detects partial form submissions and follows up via SMS/email to recover abandoned leads.',             icon: AlertCircle,    color: 'from-yellow-500 to-yellow-600' },
  { title: 'Post-Purchase Onboarding',           desc: 'Delivers onboarding content, upsell offers, and retention touchpoints after the sale closes.',         icon: CheckCircle,    color: 'from-purple-600 to-purple-700' },
];

const HOW_STEPS = [
  { step: '01', title: 'Trigger Event',             desc: 'Journey starts when a specific event occurs: form submitted, call missed, appointment booked, etc.', icon: Zap,      examples: ['Form submission', 'Missed call', 'New message', 'Appointment booked'] },
  { step: '02', title: 'AI Analysis',               desc: 'AI analyzes the context, customer data, past behavior, and intent to determine the best next action.', icon: Brain,    examples: ['Intent scoring', 'Behavior analysis', 'Context evaluation', 'Timing optimization'] },
  { step: '03', title: 'Action Execution',          desc: 'AI executes actions across channels: send SMS, make call, send email, book appointment, create task.', icon: Workflow, examples: ['Send SMS', 'Make AI call', 'Send email', 'Book calendar', 'Assign task'] },
  { step: '04', title: 'Continuous Optimization',  desc: 'Journey adapts based on responses. AI learns what works and optimizes future journeys automatically.',  icon: TrendingUp, examples: ['Response tracking', 'A/B testing', 'Performance learning', 'Auto-optimization'] },
];

const BUILDER_FEATURES = [
  { icon: Code,     title: 'No Code Required',       desc: 'Drag, drop, and connect. Build complex workflows without writing a single line of code.' },
  { icon: Sparkles, title: 'AI Prompt Builder',      desc: 'Describe your workflow in plain English and AI builds it for you automatically.' },
  { icon: Layers,   title: 'Multi-Channel Actions',  desc: 'Execute actions across SMS, email, voice, web chat, and social media in one journey.' },
  { icon: Shield,   title: 'Testing & Validation',   desc: 'Test journeys before activation to ensure they work perfectly every time.' },
];

const FLOW_STEPS = [
  { label: 'Trigger: Form Submitted',   color: 'from-blue-500 to-blue-600' },
  { label: 'AI: Qualify Intent',        color: 'from-purple-500 to-purple-600' },
  { label: 'Condition: High Intent?',   color: 'from-orange-500 to-orange-600' },
  { label: 'Action: Book Appointment',  color: 'from-green-500 to-green-600' },
  { label: 'Action: Send Confirmation', color: 'from-teal-500 to-teal-600' },
  { label: 'Wait: 24 hours',            color: 'from-gray-500 to-gray-600' },
  { label: 'Action: Send Reminder',     color: 'from-pink-500 to-pink-600' },
];

export default function JourneyAutomationPage() {
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
              <Workflow className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-semibold text-purple-300">Intelligent Automation</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
              Journey Automation Engine™
            </h1>
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              The autopilot for your entire customer lifecycle. AI makes decisions, triggers actions, and executes workflows without manual intervention.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/register" className="group relative px-8 py-4 text-lg font-semibold text-white rounded-xl inline-flex items-center justify-center gap-2 transition-all overflow-hidden" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <Link href="/#demo" className="px-8 py-4 border border-white/20 bg-white/[0.08] backdrop-blur-sm text-white rounded-xl hover:bg-white/15 hover:border-white/35 transition-all inline-flex items-center justify-center gap-2 text-lg font-semibold">
                See Demo <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── What Makes It Different ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full bg-[#7c3aed]/10 blur-[90px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-sm font-semibold text-orange-300">Our Edge</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">What Makes Our Engine Different</h2>
            <p className="text-white/50">Not just triggers and actions—true AI decision-making</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {DIFFERENTIATORS.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                style={{ background: item.borderGrad }}>
                <div className="relative rounded-2xl p-6 h-full overflow-hidden flex flex-col" style={{ background: 'linear-gradient(145deg, #0f0420 0%, #1a0a2e 50%, #1a0800 100%)' }}>
                  <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none" style={{ background: item.glow + '55' }} />
                  <div className="relative z-10">
                    <div className="w-13 h-13 rounded-xl flex items-center justify-center mb-5 shadow-lg" style={{ background: item.iconGrad, boxShadow: `0 0 18px ${item.glow}55`, width: '52px', height: '52px' }}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                    <div className="mt-5 h-px" style={{ background: `linear-gradient(to right, transparent, ${item.glow}88, transparent)` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pre-Built Journeys ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full bg-[#7c3aed]/12 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[450px] h-[300px] rounded-full bg-[#FF5722]/10 blur-[80px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-semibold text-purple-300">Ready-Made</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">10 Pre-Built Journeys Ready to Activate</h2>
            <p className="text-white/50">Turn them on and they start working immediately — no setup required</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PREBUILT_JOURNEYS.map((journey, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group relative rounded-xl p-px overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #7c3aed44, #FF572244)' }}>
                <div className="relative rounded-xl p-5 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${journey.color} flex items-center justify-center mb-4 shadow-md`}>
                    <journey.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{journey.title}</h3>
                  <p className="text-xs text-white/45 leading-relaxed">{journey.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How Journeys Work ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">How Journey Automation Works</h2>
            <p className="text-white/50">From trigger to completion—fully automated</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6">
            {HOW_STEPS.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }} className="relative">
                <div className="relative rounded-2xl p-px overflow-hidden h-full" style={{ background: index % 2 === 0 ? 'linear-gradient(135deg, #7c3aed55, #FF572244)' : 'linear-gradient(135deg, #FF572244, #7c3aed55)' }}>
                  <div className="rounded-2xl p-5 overflow-hidden h-full" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                    <div className="text-3xl font-extrabold text-white/10 mb-3">{item.step}</div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-white/45 mb-3 leading-relaxed">{item.desc}</p>
                    <div className="space-y-1.5">
                      {item.examples.map((ex, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-white/35">
                          <span className="w-1 h-1 bg-purple-400/60 rounded-full flex-shrink-0" />
                          <span>{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-5 h-5 text-orange-400/60" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Visual Journey Builder ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
                <Layers className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-semibold text-purple-300">Build Your Own</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Visual Journey Builder</h2>
              <p className="text-white/55 mb-8 leading-relaxed">Build custom journeys with our drag-and-drop builder or use AI to create workflows from natural language prompts.</p>
              <div className="space-y-4">
                {BUILDER_FEATURES.map((feature, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-xl" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1 text-sm">{feature.title}</h4>
                      <p className="text-xs text-white/50">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Flow preview card */}
            <div className="relative rounded-2xl p-px overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
              <div className="rounded-2xl p-6 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                <h3 className="text-sm font-bold text-white mb-5">Example Journey Flow</h3>
                <div className="space-y-3">
                  {FLOW_STEPS.map((step, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 p-2.5 rounded-lg text-xs text-white/70" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {step.label}
                        </div>
                      </div>
                      {index < FLOW_STEPS.length - 1 && <div className="ml-4.5 h-3 w-px bg-white/10 ml-[18px]" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                <span className="text-sm font-semibold text-purple-300">Journey on Autopilot</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
              Ready to Put Your Customer Journey on Autopilot?
            </h2>
            <p className="text-xl text-white/55 mb-12 max-w-xl mx-auto leading-relaxed">
              Start with 10 pre-built journeys or create your own in minutes.
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
                  See Demo <ArrowRight className="w-4 h-4" />
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
