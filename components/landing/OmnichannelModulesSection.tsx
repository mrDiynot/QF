'use client';

import { motion } from 'framer-motion';
import {
  MessageSquare, Target, Award, Calendar,
  Phone, Zap, Database, BarChart3, ArrowRight, Sparkles,
} from 'lucide-react';

const MODULES = [
  {
    icon: MessageSquare,
    color: '#FF5722',
    title: 'Omnichannel Lead Capture',
    description: 'Web Chat, Forms, QR Codes, SMS, Surveys, Phone, Instagram, Facebook — all in one system',
  },
  {
    icon: Target,
    color: '#7C3AED',
    title: 'AI Qualification',
    description: 'AI understands intent, urgency, service needed, budget, timeline automatically',
  },
  {
    icon: Award,
    color: '#FF5722',
    title: 'Lead Scoring',
    description: 'AI scores each lead 0–100 based on intent signals, behavior, and engagement',
  },
  {
    icon: Calendar,
    color: '#7C3AED',
    title: 'Smart Booking + Scheduling',
    description: 'AI books appointments, sends confirmations, handles reschedules, reduces no-shows',
  },
  {
    icon: Phone,
    color: '#FF5722',
    title: 'AI Outbound Calling',
    description: 'AI instantly calls, qualifies, books appointments, and recovers missed conversations',
  },
  {
    icon: Zap,
    color: '#7C3AED',
    title: 'Journey Automation Engine™',
    description: 'Autopilot for entire customer lifecycle — decides next steps automatically',
  },
  {
    icon: Database,
    color: '#FF5722',
    title: 'Built-In CRM + AI Segmentation',
    description: 'Lightweight CRM with contacts, timeline, lists, tags, scoring, and AI summaries',
  },
  {
    icon: BarChart3,
    color: '#7C3AED',
    title: 'Analytics & Reporting',
    description: 'Simple dashboards showing leads, channels, bookings, reviews, and ROI',
  },
] as const;

export function OmnichannelModulesSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden" style={{ background: '#111827' }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-60 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-[0.06]"
          style={{ background: '#7C3AED', filter: 'blur(120px)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-5 border"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#A78BFA' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#FF5722' }} />
            Omnichannel Automation
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            8 Powerful{' '}
            <span style={{ color: '#FF5722' }}>Modules</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to automate your customer journey from start to finish
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MODULES.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                whileHover={{ y: -4, boxShadow: mod.color === '#FF5722' ? '0 8px 32px rgba(255,87,34,0.25)' : '0 8px 32px rgba(124,58,237,0.25)' }}
                className="group relative rounded-2xl p-5 border cursor-pointer transition-colors duration-300"
                style={{
                  background: mod.color === '#FF5722'
                    ? 'linear-gradient(135deg, rgba(120,30,5,0.55) 0%, rgba(60,15,3,0.75) 100%)'
                    : 'linear-gradient(135deg, rgba(60,20,140,0.55) 0%, rgba(30,10,80,0.75) 100%)',
                  borderColor: mod.color === '#FF5722' ? 'rgba(255,87,34,0.3)' : 'rgba(124,58,237,0.3)',
                }}
              >
                {/* Glow accent top-left */}
                <div
                  className="absolute top-0 left-0 w-20 h-20 rounded-full opacity-20 pointer-events-none"
                  style={{ background: mod.color, filter: 'blur(24px)' }}
                />

                {/* Module number */}
                <div
                  className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{
                    background: mod.color === '#FF5722' ? 'rgba(255,87,34,0.2)' : 'rgba(124,58,237,0.2)',
                    color: mod.color === '#FF5722' ? '#FCA882' : '#C4B5FD',
                    border: `1px solid ${mod.color}40`,
                  }}
                >
                  {i + 1}
                </div>

                {/* Icon */}
                <div
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    background: mod.color === '#FF5722' ? 'rgba(255,87,34,0.28)' : 'rgba(124,58,237,0.28)',
                    border: `1px solid ${mod.color}50`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: mod.color }} strokeWidth={1.75} />
                </div>

                <h3 className="relative font-bold text-white text-sm mb-2 leading-snug">{mod.title}</h3>
                <p className="relative text-xs leading-relaxed mb-4" style={{ color: '#9CA3AF' }}>{mod.description}</p>

                <div className="relative flex items-center gap-1 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: mod.color }}>
                  Learn more <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default OmnichannelModulesSection;
