'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Calendar, Clock, CheckCircle, Users, MapPin,
  Zap, Mail, MessageSquare, ArrowRight, Star, TrendingUp,
  RefreshCw, Settings, Video, Phone,
} from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

const HERO_STATS = [
  { value: '85%',    label: 'Auto-Booked',        icon: Zap },
  { value: '60%',    label: 'Less No-Shows',       icon: CheckCircle },
  { value: '24/7',   label: 'Always Available',    icon: Clock },
  { value: '< 2min', label: 'Avg Booking Time',    icon: TrendingUp },
];

const HOW_STEPS = [
  { step: '01', icon: MessageSquare, title: 'AI Offers Booking',    desc: 'During qualification, AI detects when a lead is ready and offers to book an appointment instantly.',              glow: '#FF5722', iconGrad: 'linear-gradient(135deg,#FF8C42,#FF5722)', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)' },
  { step: '02', icon: Calendar,      title: 'Checks Availability',  desc: 'AI checks your real-time calendar availability across team members and locations automatically.',               glow: '#7c3aed', iconGrad: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)' },
  { step: '03', icon: Clock,         title: 'Finds Best Time',      desc: 'AI suggests optimal times based on your preferences, lead timezone, and historical booking patterns.',          glow: '#FF5722', iconGrad: 'linear-gradient(135deg,#FF8C42,#FF5722)', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)' },
  { step: '04', icon: CheckCircle,   title: 'Confirms & Reminds',   desc: 'Sends confirmation immediately, then automated reminders via SMS and email to reduce no-shows.',              glow: '#7c3aed', iconGrad: 'linear-gradient(135deg,#5b21b6,#7c3aed)', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)' },
];

const CAL_FEATURES = [
  { icon: Users,     title: 'Team Scheduling',     desc: 'Round-robin, priority-based, or skill-based assignment. AI routes to the right person automatically.', glow: '#7c3aed' },
  { icon: MapPin,    title: 'Multiple Locations',  desc: 'Manage bookings across multiple locations with location-specific availability and staff.',             glow: '#FF5722' },
  { icon: Video,     title: 'Virtual & In-Person', desc: 'Support both in-person appointments and virtual meetings with auto-generated Zoom/Google Meet links.', glow: '#7c3aed' },
  { icon: RefreshCw, title: 'Buffer Times',         desc: 'Set prep time before appointments and cleanup time after. AI automatically adds buffers.',            glow: '#FF5722' },
];

const SCHEDULE = [
  { time: '9:00 AM',  name: 'Sarah Johnson', type: 'Consultation', status: 'confirmed' },
  { time: '10:30 AM', name: 'Mike Chen',     type: 'Follow-up',    status: 'confirmed' },
  { time: '12:00 PM', name: 'Lunch Break',   type: 'Blocked',      status: 'blocked'   },
  { time: '2:00 PM',  name: 'Amy Roberts',   type: 'Demo',         status: 'pending'   },
  { time: '3:30 PM',  name: 'John Davis',    type: 'Consultation', status: 'confirmed' },
  { time: '5:00 PM',  name: 'Available',     type: 'Open slot',    status: 'available' },
];

const REMINDERS = [
  { icon: Mail,         title: 'Email Reminders',        timing: '24 hours before', desc: 'Professional email with appointment details, location, and calendar file attachment.', glow: '#3b82f6', iconGrad: 'linear-gradient(135deg,#3b82f6,#06b6d4)', borderGrad: 'linear-gradient(135deg,#3b82f6,#7c3aed)' },
  { icon: MessageSquare,title: 'SMS Reminders',           timing: '2 hours before',  desc: 'Text message with time, location, and easy one-tap reschedule or cancel links.',       glow: '#7c3aed', iconGrad: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)' },
  { icon: Phone,        title: 'Voice Call (Optional)',   timing: '1 hour before',   desc: 'AI voice call for high-value appointments to personally confirm attendance.',           glow: '#FF5722', iconGrad: 'linear-gradient(135deg,#FF8C42,#FF5722)', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)' },
];

const RESCHEDULE_TIMES = ['Wed, Mar 25 at 10:00 AM', 'Wed, Mar 25 at 2:00 PM', 'Thu, Mar 26 at 9:00 AM'];
const CAL_INTEGRATIONS = ['Google Calendar', 'Outlook', 'Apple Calendar', 'Office 365'];

const BENEFITS = [
  { icon: TrendingUp, stat: '3x',   label: 'More Bookings',   desc: 'Convert more leads by offering instant booking 24/7 without delays',                     glow: '#FF5722', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)' },
  { icon: Clock,      stat: '10hrs',label: 'Saved Per Week',   desc: 'No more phone tag, back-and-forth emails, or manual calendar management',               glow: '#7c3aed', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)' },
  { icon: Star,       stat: '60%',  label: 'Fewer No-Shows',   desc: 'Automated reminders and easy rescheduling dramatically reduce no-shows',                glow: '#FF5722', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)' },
];

const statusStyle = (status: string) => {
  if (status === 'confirmed') return { bg: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', badge: { bg: 'rgba(16,185,129,0.2)', color: '#34d399' } };
  if (status === 'pending')   return { bg: 'rgba(255,87,34,0.08)', border: '1px solid rgba(255,87,34,0.25)',   badge: { bg: 'rgba(255,87,34,0.2)',  color: '#fb923c' } };
  if (status === 'blocked')   return { bg: 'rgba(100,116,139,0.08)',border: '1px solid rgba(100,116,139,0.25)',badge: { bg: 'rgba(100,116,139,0.2)',color: '#94a3b8' } };
  return { bg: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', badge: { bg: 'rgba(59,130,246,0.2)', color: '#60a5fa' } };
};

export default function BookingPage() {
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
              <Calendar className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-semibold text-purple-300">Automated Scheduling</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Smart Booking & Calendar Automation</h1>
            <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8">AI books appointments automatically, sends reminders, handles reschedules, and reduces no-shows — all without lifting a finger</p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/register" className="group relative inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-xl overflow-hidden transition-all" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                Automate Your Bookings <ArrowRight className="w-5 h-5" />
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

      {/* ── How It Works ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">AI Handles Booking End-to-End</h2>
            <p className="text-white/50">From first contact to confirmed appointment</p>
          </motion.div>
          <div className="grid lg:grid-cols-4 gap-5">
            {HOW_STEPS.map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="relative">
                <div className="relative rounded-2xl p-px overflow-hidden h-full" style={{ background: step.borderGrad }}>
                  <div className="rounded-2xl p-5 h-full overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420, #1a0a2e)' }}>
                    <div className="text-4xl font-extrabold text-white/10 mb-3">{step.step}</div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: step.iconGrad, boxShadow: `0 0 16px ${step.glow}44` }}>
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-2 text-sm">{step.title}</h3>
                    <p className="text-xs text-white/45 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                {index < 3 && <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10"><ArrowRight className="w-5 h-5 text-orange-400/60" /></div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Calendar Features ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
                <Settings className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-semibold text-purple-300">Powerful Scheduling</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Advanced Calendar Features</h2>
              <p className="text-white/55 mb-8 leading-relaxed">Built-in calendar with smart rules, team scheduling, and seamless integrations</p>
              <div className="space-y-3">
                {CAL_FEATURES.map((feature, index) => (
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
            {/* Schedule card */}
            <div className="relative rounded-2xl p-px overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
              <div className="rounded-2xl p-6 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white text-sm font-bold">Today&apos;s Schedule</h3>
                  <span className="text-white/35 text-xs">Monday, Mar 23</span>
                </div>
                <div className="space-y-2.5">
                  {SCHEDULE.map((slot, index) => {
                    const s = statusStyle(slot.status);
                    return (
                      <div key={index} className="p-3 rounded-xl" style={{ background: s.bg, border: s.border }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-bold text-xs">{slot.time}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize" style={{ background: s.badge.bg, color: s.badge.color }}>{slot.status}</span>
                        </div>
                        <div className="text-white/60 text-xs">{slot.name}</div>
                        <div className="text-white/30 text-[10px]">{slot.type}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reminders ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Automated Reminders Reduce No-Shows</h2>
            <p className="text-white/50">Multi-channel reminders keep customers on track</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {REMINDERS.map((reminder, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                style={{ background: reminder.borderGrad }}>
                <div className="relative rounded-2xl p-6 h-full overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420, #1a0a2e)' }}>
                  <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity pointer-events-none" style={{ background: reminder.glow + '55' }} />
                  <div className="relative z-10">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: reminder.iconGrad, boxShadow: `0 0 16px ${reminder.glow}44` }}>
                      <reminder.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs text-orange-400 font-semibold mb-2">{reminder.timing}</div>
                    <h3 className="font-bold text-white mb-2 text-sm">{reminder.title}</h3>
                    <p className="text-xs text-white/45 leading-relaxed">{reminder.desc}</p>
                    <div className="mt-4 h-px" style={{ background: `linear-gradient(to right, transparent, ${reminder.glow}66, transparent)` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reschedule ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl p-px overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
              <div className="rounded-2xl p-6 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                <div className="flex items-center gap-4 pb-5 border-b border-white/10 mb-5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>SJ</div>
                  <div>
                    <div className="text-white font-bold text-sm">Sarah Johnson</div>
                    <div className="text-white/35 text-xs">Consultation - Tomorrow at 9:00 AM</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-white/40 text-xs mb-3">Incoming SMS from Sarah:</div>
                  <p className="text-white text-sm mb-5">&quot;Hi, can I reschedule tomorrow&apos;s appointment? Something came up.&quot;</p>
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,87,34,0.08)', border: '1px solid rgba(255,87,34,0.2)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-orange-400 text-xs font-bold">AI Auto-Response</span>
                    </div>
                    <p className="text-white/80 text-xs mb-4">&quot;No problem Sarah! I can help you reschedule. Here are some available times:&quot;</p>
                    <div className="space-y-2">
                      {RESCHEDULE_TIMES.map((time, i) => (
                        <button key={i} className="w-full px-3 py-2 rounded-lg text-white text-xs transition-all font-medium" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>{time}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm mb-6">
                <RefreshCw className="w-4 h-4 text-orange-300" />
                <span className="text-sm font-semibold text-orange-300">Self-Service Management</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">AI Handles Reschedules & Cancellations</h2>
              <p className="text-white/55 mb-8 leading-relaxed">Customers can reschedule or cancel via text, email, or chat — AI handles it all automatically</p>
              <div className="space-y-3">
                {['Instant rescheduling with real-time availability', 'One-click cancel links in all reminders', 'AI suggests alternative times automatically', 'Calendar updates across all platforms instantly', 'Team notifications for changes', 'Waitlist management for canceled slots'].map((feature, index) => (
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

      {/* ── Calendar Integrations ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Syncs With Your Existing Calendar</h2>
            <p className="text-white/50">Two-way sync with all major calendar platforms</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {CAL_INTEGRATIONS.map((cal, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}
                className="relative rounded-xl p-px overflow-hidden text-center"
                style={{ background: 'linear-gradient(135deg,#7c3aed44,#FF572444)' }}>
                <div className="rounded-xl p-5 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                  <Calendar className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                  <div className="text-white text-xs font-medium">{cal}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Why Smart Booking Matters</h2>
            <p className="text-white/50">The impact of automated scheduling</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {BENEFITS.map((benefit, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300 text-center"
                style={{ background: benefit.borderGrad }}>
                <div className="relative rounded-2xl p-6 h-full overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420, #1a0a2e)' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none" style={{ background: benefit.glow + '55' }} />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg" style={{ background: `linear-gradient(135deg, ${benefit.glow}cc, ${benefit.glow}88)`, boxShadow: `0 0 18px ${benefit.glow}44` }}>
                      <benefit.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-4xl font-extrabold text-white mb-1">{benefit.stat}</div>
                    <div className="text-sm font-bold mb-3" style={{ color: benefit.glow }}>{benefit.label}</div>
                    <p className="text-xs text-white/45 leading-relaxed">{benefit.desc}</p>
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
                <span className="text-sm font-semibold text-purple-300">Booking on Autopilot</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Automate Your Entire Booking Process</h2>
            <p className="text-xl text-white/55 mb-12 max-w-xl mx-auto leading-relaxed">Let AI handle scheduling so you can focus on serving customers</p>
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
