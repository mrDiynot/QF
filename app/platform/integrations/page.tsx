'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Zap, Check, ArrowRight, Database, MessageSquare, Calendar,
  Mail, Phone, RefreshCw, Activity, Plug, Code, Globe, Settings,
  Sparkles, BarChart3,
} from 'lucide-react';
import { DemoBookingModal } from '@/components/landing/DemoBookingModal';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_STATS = [
  { label: 'Total Integrations', value: '13', icon: Plug },
  { label: 'CRM Platforms',      value: '10', icon: Database },
  { label: 'Communication Channels', value: '6', icon: MessageSquare },
  //{ label: '2-Way Data Sync',    value: 'Live', icon: RefreshCw },
];

const CATEGORIES = [
  {
    name: 'Communication',
    description: 'Twilio SMS/Voice, WhatsApp messaging',
    icon: Phone,
    glow: '#10b981',
    borderGrad: 'linear-gradient(135deg, #10b981, #7c3aed)',
    count: 2,
  },
  {
    name: 'Calendar',
    description: 'Google Calendar and Outlook Calendar sync',
    icon: Calendar,
    glow: '#3b82f6',
    borderGrad: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
    count: 2,
  },
  {
    name: 'Email',
    description: 'Gmail and Outlook Email integration',
    icon: Mail,
    glow: '#ef4444',
    borderGrad: 'linear-gradient(135deg, #ef4444, #FF5722)',
    count: 2,
  },
  {
    name: 'Social Media',
    description: 'Facebook Messenger and Instagram DMs',
    icon: MessageSquare,
    glow: '#ec4899',
    borderGrad: 'linear-gradient(135deg, #ec4899, #7c3aed)',
    count: 2,
  },
  {
    name: 'CRM Systems',
    description: 'HubSpot, Zoho, Monday, Pipedrive, GoHighLevel, Close, FreshSales, ActiveCampaign, Copper, Salesforce',
    icon: Database,
    glow: '#7c3aed',
    borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)',
    count: 10,
  },
];

const INTEGRATIONS = [
  // Communication
  { name: 'Twilio',           category: 'Communication', description: 'SMS and voice calling infrastructure',               glow: '#ef4444', borderGrad: 'linear-gradient(135deg,#ef4444,#FF5722)' },
  { name: 'WhatsApp',         category: 'Communication', description: 'WhatsApp messaging integration',                    glow: '#10b981', borderGrad: 'linear-gradient(135deg,#10b981,#059669)' },
  // Calendar
  { name: 'Google Calendar',  category: 'Calendar',      description: 'Sync appointments to Google Calendar',              glow: '#3b82f6', borderGrad: 'linear-gradient(135deg,#3b82f6,#7c3aed)' },
  { name: 'Outlook Calendar', category: 'Calendar',      description: 'Sync appointments to Outlook Calendar',             glow: '#0ea5e9', borderGrad: 'linear-gradient(135deg,#0ea5e9,#3b82f6)' },
  // Email
  { name: 'Gmail',            category: 'Email',         description: 'Gmail email integration',                           glow: '#ef4444', borderGrad: 'linear-gradient(135deg,#ef4444,#f97316)' },
  { name: 'Outlook Email',    category: 'Email',         description: 'Outlook email integration',                         glow: '#3b82f6', borderGrad: 'linear-gradient(135deg,#3b82f6,#0ea5e9)' },
  // Social Media
  { name: 'Facebook',         category: 'Social Media',  description: 'Facebook Messenger and DM integration',             glow: '#3b82f6', borderGrad: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
  { name: 'Instagram',        category: 'Social Media',  description: 'Instagram DM integration',                          glow: '#ec4899', borderGrad: 'linear-gradient(135deg,#ec4899,#7c3aed)' },
  // CRM
  { name: 'HubSpot',          category: 'CRM',           description: 'View-only access to HubSpot data',                  glow: '#f97316', borderGrad: 'linear-gradient(135deg,#f97316,#ef4444)', viewOnly: true },
  { name: 'Zoho CRM',         category: 'CRM',           description: 'Sync leads and contacts with Zoho',                 glow: '#ef4444', borderGrad: 'linear-gradient(135deg,#ef4444,#dc2626)' },
  { name: 'Pipedrive',        category: 'CRM',           description: 'Sync sales pipeline with Pipedrive',                glow: '#10b981', borderGrad: 'linear-gradient(135deg,#10b981,#059669)' },
  { name: 'GoHighLevel',      category: 'CRM',           description: 'Sync leads and automation with GoHighLevel',        glow: '#7c3aed', borderGrad: 'linear-gradient(135deg,#7c3aed,#6d28d9)' },
  { name: 'Monday.com',       category: 'CRM',           description: 'Sync workflow with Monday.com',                     glow: '#ec4899', borderGrad: 'linear-gradient(135deg,#ec4899,#ef4444)' },
  { name: 'Close CRM',        category: 'CRM',           description: 'Sync sales activities with Close',                  glow: '#6366f1', borderGrad: 'linear-gradient(135deg,#6366f1,#3b82f6)' },
  { name: 'FreshSales',       category: 'CRM',           description: 'Sync leads and contacts with FreshSales',           glow: '#14b8a6', borderGrad: 'linear-gradient(135deg,#14b8a6,#0ea5e9)' },
  { name: 'ActiveCampaign',   category: 'CRM',           description: 'Sync marketing automation with ActiveCampaign',     glow: '#3b82f6', borderGrad: 'linear-gradient(135deg,#3b82f6,#7c3aed)' },
  { name: 'Copper',           category: 'CRM',           description: 'Sync contacts and deals with Copper CRM',           glow: '#f97316', borderGrad: 'linear-gradient(135deg,#f97316,#ef4444)' },
  { name: 'Salesforce',       category: 'CRM',           description: 'Sync leads and contacts with Salesforce',           glow: '#0ea5e9', borderGrad: 'linear-gradient(135deg,#0ea5e9,#3b82f6)' },
];

const HOW_IT_WORKS = [
  {
    icon: MessageSquare,
    title: 'Capture from Any Channel',
    description: 'Conversations flow in from SMS, Instagram, Facebook, WhatsApp, Email',
    glow: '#10b981',
    borderGrad: 'linear-gradient(135deg, #10b981, #7c3aed)',
  },
  {
    icon: Database,
    title: 'Sync to CRM',
    description: 'Contacts, conversations, and data automatically sync to Salesforce, HubSpot, Zoho, Monday, or Pipedrive',
    glow: '#3b82f6',
    borderGrad: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
  },
  {
    icon: Calendar,
    title: 'Update Calendars',
    description: 'Appointments sync bidirectionally with Google Calendar and Outlook Calendar',
    glow: '#7c3aed',
    borderGrad: 'linear-gradient(135deg, #7c3aed, #ec4899)',
  },
  {
    icon: RefreshCw,
    title: 'Keep Everything in Sync',
    description: 'Real-time updates across all connected platforms — no manual data entry required',
    glow: '#FF5722',
    borderGrad: 'linear-gradient(135deg, #FF5722, #f97316)',
  },
];

const BENEFITS = [
  {
    icon: Check,
    title: 'No Manual Data Entry',
    description: 'Conversations, contacts, and appointments sync automatically across all platforms',
    stat: '0 hrs',
    glow: '#10b981',
    borderGrad: 'linear-gradient(135deg, #10b981, #7c3aed)',
  },
  {
    icon: RefreshCw,
    title: 'Real-Time Sync',
    description: 'Updates happen instantly — your CRM, calendar, and inbox always match',
    stat: '<1s',
    glow: '#3b82f6',
    borderGrad: 'linear-gradient(135deg, #3b82f6, #FF5722)',
  },
  {
    icon: Activity,
    title: 'Single Source of Truth',
    description: 'All customer data lives in QualiFlow AI and syncs to your existing tools seamlessly',
    stat: '100%',
    glow: '#7c3aed',
    borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)',
  },
];

const CUSTOM_SERVICES = ['Custom API Development', 'Legacy System Integration', 'Database Sync', 'Workflow Automation', 'Technical Support'];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <div className="min-h-screen" style={{ background: '#0d0618' }}>
      <LandingPageHeader />

      {/* ── Hero ── */}
      <section
        className="relative pt-32 pb-20 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 60%, #1a0a18 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#7c3aed]/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#FF5722]/10 blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
              <Zap className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-semibold text-purple-300">Platform Integrations</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
              Connect Your <span className="text-purple-400">Entire Stack</span>
            </h1>
            <p className="text-xl text-white/60 max-w-3xl mx-auto mb-10">
              QualiFlow AI integrates with your existing tools — seamlessly syncing conversations, contacts, and calendars across every platform you use.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="group relative inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-xl overflow-hidden transition-all"
                style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-3">
            {HERO_STATS.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative rounded-2xl p-px overflow-hidden"
                style={{ background: index % 2 === 0 ? 'linear-gradient(135deg,#7c3aed55,#FF572444)' : 'linear-gradient(135deg,#FF572444,#7c3aed55)' }}
              >
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

      {/* ── Integration Categories ── */}
      <section
        className="relative py-20 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-sm font-semibold text-orange-300">Integration Categories</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
              Connect the Tools You Already Use
            </h2>
            <p className="text-white/50">Five categories covering your entire business stack</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
            {CATEGORIES.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl p-px overflow-hidden transition-transform duration-300"
                style={{ background: category.borderGrad }}
              >
                <div className="relative rounded-2xl p-6 h-full overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420, #1a0a2e)' }}>
                  <div
                    className="absolute -top-8 -left-8 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                    style={{ background: category.glow + '55' }}
                  />
                  <div className="relative z-10">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${category.glow}cc, ${category.glow}88)`, boxShadow: `0 0 16px ${category.glow}44` }}
                    >
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{category.name}</h3>
                    <p className="text-white/50 text-sm mb-5 leading-relaxed">{category.description}</p>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: category.glow + '22', border: `1px solid ${category.glow}44`, color: category.glow }}
                    >
                      {category.count} {category.count === 1 ? 'Integration' : 'Integrations'}
                    </span>
                    <div className="mt-5 h-px" style={{ background: `linear-gradient(to right, transparent, ${category.glow}66, transparent)` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── All Integrations Grid ── */}
      <section
        className="relative py-20 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
              All Integrations
            </h2>
            <p className="text-white/50">18 native integrations to power your entire customer journey</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {INTEGRATIONS.map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -4 }}
                className="group relative rounded-2xl p-px overflow-hidden transition-transform duration-300"
                style={{ background: integration.borderGrad }}
              >
                <div className="relative rounded-2xl p-6 h-full overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420, #1a0a2e)' }}>
                  <div
                    className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none"
                    style={{ background: integration.glow + '55' }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${integration.glow}cc, ${integration.glow}88)`, boxShadow: `0 0 14px ${integration.glow}44` }}
                      >
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <span
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                        style={
                          integration.viewOnly
                            ? { background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd' }
                            : { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }
                        }
                      >
                        {integration.viewOnly ? 'View Only' : 'Active'}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{integration.name}</h3>
                    <p className="text-white/50 text-sm mb-4">{integration.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: integration.glow }}>{integration.category}</span>
                      <ArrowRight className="w-4 h-4 text-white/25 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="mt-4 h-px" style={{ background: `linear-gradient(to right, transparent, ${integration.glow}55, transparent)` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How Integrations Work ── */}
      <section
        className="relative py-20 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full bg-[#7c3aed]/10 blur-[90px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-sm font-semibold text-purple-300">Data Flow</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
              How Integrations Work
            </h2>
            <p className="text-white/50">QualiFlow AI seamlessly syncs data across your entire tech stack</p>
          </motion.div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12, duration: 0.5 }}
                className="group relative rounded-2xl p-px overflow-hidden"
                style={{ background: step.borderGrad }}
              >
                <div className="relative rounded-2xl p-6 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                  <div
                    className="absolute -top-8 -left-8 w-28 h-28 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity pointer-events-none"
                    style={{ background: step.glow + '55' }}
                  />
                  <div className="relative z-10 flex items-start gap-5">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${step.glow}cc, ${step.glow}88)`, boxShadow: `0 0 18px ${step.glow}44` }}
                    >
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: step.glow + '22', color: step.glow, border: `1px solid ${step.glow}44` }}>
                          Step {index + 1}
                        </span>
                      </div>
                      <h3 className="text-white text-xl font-bold mb-1.5">{step.title}</h3>
                      <p className="text-white/55 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section
        className="relative py-20 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
              Why Integration Matters
            </h2>
            <p className="text-white/50">Maximize value from your existing tech stack</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {BENEFITS.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300 text-center"
                style={{ background: benefit.borderGrad }}
              >
                <div className="relative rounded-2xl p-8 h-full overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420, #1a0a2e)' }}>
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                    style={{ background: benefit.glow + '55' }}
                  />
                  <div className="relative z-10">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${benefit.glow}cc, ${benefit.glow}88)`, boxShadow: `0 0 18px ${benefit.glow}44` }}
                    >
                      <benefit.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-4xl font-extrabold text-white mb-3">{benefit.stat}</div>
                    <h3 className="text-lg font-bold text-white mb-3">{benefit.title}</h3>
                    <p className="text-xs text-white/45 leading-relaxed">{benefit.description}</p>
                    <div className="mt-6 h-px" style={{ background: `linear-gradient(to right, transparent, ${benefit.glow}66, transparent)` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Custom Integration ── */}
      <section
        className="relative py-20 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-[#7c3aed]/15 blur-[80px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)', boxShadow: '0 0 24px rgba(124,58,237,0.4)' }}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
              Need a Custom Integration?
            </h2>
            <p className="text-white/55 mb-8 leading-relaxed max-w-2xl mx-auto">
              Our team can build custom integrations for enterprise customers. Connect QualiFlow AI to any system, database, or legacy platform.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {CUSTOM_SERVICES.map((service) => (
                <span
                  key={service}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', color: 'rgba(216,180,254,0.8)' }}
                >
                  {service}
                </span>
              ))}
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white border border-white/20 bg-white/[0.08] backdrop-blur-sm hover:bg-white/15 hover:border-white/35 transition-all duration-300 text-sm"
            >
              Contact Integration Team <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="relative py-28 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 50%, #0f041a 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[#7c3aed]/30 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] rounded-full bg-[#FF5722]/15 blur-[90px] pointer-events-none" />
        <div className="max-w-[900px] mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }}>
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                </span>
                <span className="text-sm font-semibold text-purple-300">Connect Your Stack</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
              Connect Your Stack in Minutes
            </h2>
            <p className="text-xl text-white/55 mb-12 max-w-xl mx-auto leading-relaxed">
              18 native integrations ready to sync with your existing tools
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/register"
                  className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white overflow-hidden no-underline transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <button
                  onClick={() => setDemoOpen(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white border border-white/20 bg-white/[0.08] backdrop-blur-sm hover:bg-white/15 hover:border-white/35 transition-all duration-300"
                >
                  Book a Demo <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
            <div className="mt-16 mx-auto max-w-xs h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.6), rgba(168,85,247,0.5), transparent)' }} />
          </motion.div>
        </div>
      </section>

      <LandingPageFooter />
      <DemoBookingModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
