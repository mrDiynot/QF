'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Instagram, Facebook, MessageCircle, ThumbsUp, Share2,
  Heart, TrendingUp, Users, Zap, CheckCircle, ArrowRight,
  MessageSquare, Bell, Star, BarChart3, Sparkles,
} from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

const HERO_STATS = [
  { value: '< 30s', label: 'Response Time',    icon: Zap },
  { value: '24/7',  label: 'Always Active',    icon: Bell },
  { value: '95%+',  label: 'Engagement Rate',  icon: TrendingUp },
  { value: '3x',    label: 'More Leads',       icon: Users },
];

const PLATFORMS = [
  { icon: Instagram, platform: 'Instagram', gradient: 'linear-gradient(135deg,#7c3aed,#ec4899,#FF5722)', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)', glow: '#ec4899',
    features: ['Respond to DMs instantly', 'Reply to comments automatically', 'Engage with story mentions', 'Convert followers to leads', 'Track engagement analytics'],
    desc: 'AI monitors and responds to Instagram DMs, comments, and story mentions. Qualify leads and book appointments directly from conversations.' },
  { icon: Facebook,  platform: 'Facebook',  gradient: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',         borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)', glow: '#3b82f6',
    features: ['Facebook Messenger integration', 'Page comment responses', 'Ad lead form automation', 'Group engagement tracking', 'Review management'],
    desc: 'Engage with Facebook Messenger conversations, page comments, and ad leads. AI qualifies and nurtures every interaction automatically.' },
];

const HOW_STEPS = [
  { step: '01', icon: MessageSquare, title: 'AI Monitors Social',   desc: 'AI watches all comments, DMs, mentions, and messages across connected platforms 24/7.',                                               glow: '#FF5722', iconGrad: 'linear-gradient(135deg,#FF8C42,#FF5722)', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)' },
  { step: '02', icon: Zap,           title: 'Instant Response',     desc: 'AI responds in under 30 seconds with personalized, contextual messages based on the conversation.',                                   glow: '#7c3aed', iconGrad: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)' },
  { step: '03', icon: Users,         title: 'Lead Qualification',   desc: 'AI asks smart questions to understand intent, needs, budget, and timeline through natural conversation.',                             glow: '#FF5722', iconGrad: 'linear-gradient(135deg,#FF8C42,#FF5722)', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)' },
  { step: '04', icon: CheckCircle,   title: 'Book & Convert',       desc: 'Qualified leads are automatically booked for appointments and added to your CRM with full conversation history.',                    glow: '#7c3aed', iconGrad: 'linear-gradient(135deg,#5b21b6,#7c3aed)', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)' },
];

const ENGAGEMENT_FEATURES = [
  { icon: Heart,          title: 'Sentiment Analysis', desc: 'AI detects emotion and tone to respond appropriately to positive, negative, or neutral comments.', glow: '#FF5722' },
  { icon: MessageCircle,  title: 'Contextual Replies', desc: 'Responses are personalized based on conversation history, profile data, and previous interactions.', glow: '#7c3aed' },
  { icon: ThumbsUp,       title: 'Engagement Optimization', desc: 'AI learns which responses drive the most engagement and continuously improves performance.', glow: '#FF5722' },
  { icon: Star,           title: 'Priority Handling', desc: 'High-value leads and urgent inquiries are flagged and escalated to your team instantly.', glow: '#7c3aed' },
];

const LIVE_FEED = [
  { platform: 'Instagram', user: '@sarahjones', message: 'Love this! Do you offer consultations?', reply: "Thanks Sarah! Yes, we do! I can help you book a free consultation. When works best for you?", icon: Instagram, time: '2m ago' },
  { platform: 'Facebook',  user: 'Mike Chen',   message: 'Interested in your services. How much?', reply: "Hey Mike! I'd love to help. Pricing depends on your specific needs. Can I ask a few quick questions?", icon: Facebook, time: '5m ago' },
  { platform: 'Instagram', user: '@amyroberts', message: 'Is this available in my area?',           reply: "Great question! What area are you in? I can check availability right away.", icon: Instagram, time: '8m ago' },
];

const ANALYTICS = [
  { icon: BarChart3,  title: 'Engagement Metrics', metrics: [{ label: 'Response Rate', value: '98.5%' }, { label: 'Avg Response Time', value: '28s' }, { label: 'Conversations', value: '2,847' }], glow: '#7c3aed', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)' },
  { icon: TrendingUp, title: 'Lead Performance',   metrics: [{ label: 'Leads Captured', value: '1,234' }, { label: 'Qualified Leads', value: '67%' }, { label: 'Bookings Made', value: '456' }],     glow: '#FF5722', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)' },
  { icon: Star,       title: 'Platform Breakdown', metrics: [{ label: 'Instagram Leads', value: '58%' }, { label: 'Facebook Leads', value: '42%' }, { label: 'Total Reach', value: '45.2K' }],      glow: '#7c3aed', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)' },
];

const USE_CASES = [
  { industry: 'E-Commerce',            example: 'Convert product inquiries into sales' },
  { industry: 'Real Estate',           example: 'Book property viewings from social' },
  { industry: 'Healthcare',            example: 'Schedule patient appointments' },
  { industry: 'Professional Services', example: 'Qualify consulting leads' },
  { industry: 'Home Services',         example: 'Book service appointments' },
  { industry: 'Fitness & Wellness',    example: 'Convert to class bookings' },
  { industry: 'Automotive',            example: 'Schedule test drives' },
  { industry: 'Education',             example: 'Enroll students from social' },
];

export default function SocialEngagementPage() {
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
              <Share2 className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-semibold text-purple-300">Social Media Automation</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">AI Social Engagement</h1>
            <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8">Turn social conversations into qualified leads. AI responds to comments, DMs, and mentions across Instagram, Facebook, and more — automatically</p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/register" className="group relative inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-xl overflow-hidden transition-all" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                Start Engaging on Social <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
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

      {/* ── Platforms ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Connect All Your Social Platforms</h2>
            <p className="text-white/50">One dashboard to manage all social conversations</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {PLATFORMS.map((platform, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: index === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                style={{ background: platform.borderGrad }}>
                <div className="relative rounded-2xl p-7 h-full overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420 0%, #1a0a2e 50%, #1a0800 100%)' }}>
                  <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-2xl opacity-25 group-hover:opacity-50 transition-opacity pointer-events-none" style={{ background: platform.glow + '55' }} />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg" style={{ background: platform.gradient, boxShadow: `0 0 20px ${platform.glow}44` }}>
                      <platform.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{platform.platform}</h3>
                    <p className="text-sm text-white/50 mb-5 leading-relaxed">{platform.desc}</p>
                    <div className="space-y-2.5">
                      {platform.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          </div>
                          <span className="text-sm text-white/55">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 h-px" style={{ background: `linear-gradient(to right, transparent, ${platform.glow}66, transparent)` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">How AI Social Engagement Works</h2>
            <p className="text-white/50">From social interaction to qualified lead in seconds</p>
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

      {/* ── AI Conversations ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-semibold text-purple-300">Smart Engagement</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">AI-Powered Social Conversations</h2>
              <p className="text-white/55 mb-8 leading-relaxed">QualiFlow AI&apos;s AI understands context, sentiment, and intent to have natural conversations that convert followers into customers.</p>
              <div className="space-y-3">
                {ENGAGEMENT_FEATURES.map((feature, index) => (
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
            <div className="relative rounded-2xl p-px overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
              <div className="rounded-2xl p-6 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                <h3 className="text-white text-sm font-bold mb-5">Live Social Feed</h3>
                <div className="space-y-4">
                  {LIVE_FEED.map((conv, index) => (
                    <div key={index} className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center gap-2">
                        <conv.icon className="w-4 h-4 text-purple-400" />
                        <span className="text-white text-xs font-bold">{conv.user}</span>
                        <span className="text-xs text-white/30 ml-auto">{conv.time}</span>
                      </div>
                      <p className="text-xs text-white/50 pl-6">{conv.message}</p>
                      <div className="pl-6 pt-2 border-l-2 border-orange-500/30 ml-2">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Zap className="w-3 h-3 text-orange-400" />
                          <span className="text-xs text-orange-400 font-semibold">AI Response</span>
                        </div>
                        <p className="text-xs text-white/45">{conv.reply}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Analytics ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Social Analytics & Insights</h2>
            <p className="text-white/50">Track engagement, conversions, and ROI from every platform</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {ANALYTICS.map((card, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                style={{ background: card.borderGrad }}>
                <div className="relative rounded-2xl p-6 h-full overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420, #1a0a2e)' }}>
                  <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none" style={{ background: card.glow + '55' }} />
                  <div className="relative z-10">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 shadow-lg" style={{ background: `linear-gradient(135deg, ${card.glow}cc, ${card.glow}88)`, boxShadow: `0 0 16px ${card.glow}44` }}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-5 text-sm">{card.title}</h3>
                    <div className="space-y-3">
                      {card.metrics.map((metric, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-xs text-white/45">{metric.label}</span>
                          <span className="text-sm font-bold text-white">{metric.value}</span>
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

      {/* ── Use Cases ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Perfect For Every Industry</h2>
            <p className="text-white/50">AI social engagement works for businesses of all types</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map((use, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}
                className="relative rounded-xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                style={{ background: index % 2 === 0 ? 'linear-gradient(135deg,#7c3aed44,#FF572444)' : 'linear-gradient(135deg,#FF572444,#7c3aed44)' }}>
                <div className="rounded-xl p-4 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                  <h4 className="text-white font-bold mb-1 text-sm">{use.industry}</h4>
                  <p className="text-xs text-white/40">{use.example}</p>
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
                <span className="text-sm font-semibold text-purple-300">Social Lead Generation</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Turn Social Followers Into Customers</h2>
            <p className="text-xl text-white/55 mb-12 max-w-xl mx-auto leading-relaxed">Start converting social engagement into qualified leads with AI automation</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/register" className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white overflow-hidden no-underline transition-all duration-300" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/platform/ai-engagement" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white border border-white/20 bg-white/[0.08] backdrop-blur-sm hover:bg-white/15 hover:border-white/35 transition-all duration-300 no-underline">
                  See AI Engagement <ArrowRight className="w-4 h-4" />
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
