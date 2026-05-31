'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Star, MessageSquare, TrendingUp, Award,
  Send, RotateCcw, Users, Target,
  BarChart3, ArrowRight, CheckCircle, Zap,
  Clock, Gift,
} from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

const HERO_STATS = [
  { value: '10x',  label: 'More Reviews',     icon: Star },
  { value: '92%',  label: 'Response Rate',    icon: MessageSquare },
  { value: '50%',  label: 'Return Customers', icon: RotateCcw },
  { value: 'Auto', label: 'Follow-ups',       icon: Zap },
];

const THREE_PILLARS = [
  { icon: Star,      title: 'Review Collection',      desc: 'AI automatically requests reviews from happy customers at the perfect moment',                          glow: '#FF5722', iconGrad: 'linear-gradient(135deg,#FF8C42,#FF5722)', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)', features: ['Auto-send after service completion', 'Google, Facebook, Yelp integration', 'SMS & email review requests', 'Smart timing for max response'] },
  { icon: MessageSquare, title: 'Customer Surveys',   desc: 'Gather valuable feedback through automated surveys and satisfaction scores',                            glow: '#7c3aed', iconGrad: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)', features: ['NPS, CSAT, CES surveys', 'Custom questionnaires', 'Multi-channel distribution', 'Real-time analytics'] },
  { icon: RotateCcw, title: 'Re-Engagement Campaigns',desc: 'AI identifies and re-activates inactive customers with personalized outreach',                         glow: '#FF5722', iconGrad: 'linear-gradient(135deg,#FF8C42,#FF5722)', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)', features: ['Detects inactive customers', 'Win-back campaigns', 'Special offers & incentives', 'Multi-touch sequences'] },
];

const REVIEW_FEATURES = [
  { title: 'Smart Timing',          desc: 'AI waits for the perfect moment after service completion when customers are most satisfied.', icon: Clock,   glow: '#7c3aed' },
  { title: 'Sentiment Routing',     desc: 'Happy customers go to Google/Facebook. Unhappy customers routed to private feedback first.', icon: Target,  glow: '#FF5722' },
  { title: 'Multi-Platform',        desc: 'Request reviews for Google, Facebook, Yelp, Trustpilot, and industry-specific platforms.',  icon: Award,   glow: '#7c3aed' },
  { title: 'Follow-up Sequences',   desc: 'Gentle reminders via SMS and email if review not completed within 48 hours.',               icon: Send,    glow: '#FF5722' },
];

const RE_ENGAGE_STEPS = [
  { step: '01', title: 'AI Detects Inactivity', desc: "Automatically identifies customers who haven't engaged in 30, 60, or 90 days", icon: Users,   glow: '#FF5722', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)' },
  { step: '02', title: 'Segments by Value',     desc: 'Prioritizes high-value customers and creates personalized re-engagement plans',  icon: Target,  glow: '#7c3aed', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)' },
  { step: '03', title: 'Multi-Touch Campaign',  desc: 'Sends personalized messages via email, SMS, and voice across multiple touchpoints', icon: Send, glow: '#FF5722', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)' },
  { step: '04', title: 'Special Offers',        desc: 'AI suggests incentives like discounts, free trials, or exclusive deals to win them back', icon: Gift, glow: '#7c3aed', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)' },
];

const WIN_BACK = [
  { day: 'Day 1',  channel: 'Email',    message: "We miss you! Here's 20% off your next service",        status: 'sent' },
  { day: 'Day 4',  channel: 'SMS',      message: 'Quick reminder: Your exclusive discount expires soon', status: 'sent' },
  { day: 'Day 7',  channel: 'Email',    message: 'Personal message from owner + customer success story', status: 'sent' },
  { day: 'Day 10', channel: 'AI Voice', message: 'Personal call to check in and offer to book',          status: 'scheduled' },
];

const ANALYTICS = [
  { icon: Star,       title: 'Review Metrics',  metrics: [{ label: 'Total Reviews', value: '1,247' }, { label: 'Avg Rating', value: '4.8 ⭐' }, { label: 'Response Rate', value: '34%' }, { label: 'This Month', value: '+127' }], glow: '#FF5722', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)' },
  { icon: BarChart3,  title: 'Survey Insights', metrics: [{ label: 'NPS Score', value: '72' }, { label: 'CSAT Score', value: '4.6/5' }, { label: 'Responses', value: '2,834' }, { label: 'Completion Rate', value: '82%' }],    glow: '#7c3aed', borderGrad: 'linear-gradient(135deg,#7c3aed,#FF5722)' },
  { icon: TrendingUp, title: 'Re-engagement',   metrics: [{ label: 'Win-back Rate', value: '38%' }, { label: 'Reactivated', value: '156' }, { label: 'Revenue Recovered', value: '$47.2K' }, { label: 'Campaign ROI', value: '540%' }], glow: '#FF5722', borderGrad: 'linear-gradient(135deg,#FF5722,#7c3aed)' },
];

const SURVEY_OPTIONS = ['Quality of Service', 'Speed', 'Price', 'Customer Support'];
const SURVEY_FEATURES = ['NPS (Net Promoter Score) tracking', 'CSAT (Customer Satisfaction) surveys', 'CES (Customer Effort Score)', 'Custom multi-question surveys', 'Conditional logic & branching', 'Anonymous feedback options', 'Real-time response analytics', 'Automated reporting & alerts'];

export default function ReviewsPage() {
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
              <Star className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-semibold text-purple-300">Retention Automation</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Reviews, Surveys & Re-Engagement</h1>
            <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8">Automatically collect 5-star reviews, gather customer feedback, and re-engage inactive customers — all on autopilot</p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/register" className="group relative inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-xl overflow-hidden transition-all" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                Start Building Reputation <ArrowRight className="w-5 h-5" />
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

      {/* ── Three Pillars ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Three Pillars of Customer Retention</h2>
            <p className="text-white/50">Collect reviews, gather feedback, and bring customers back</p>
          </motion.div>
          <div className="grid lg:grid-cols-3 gap-5">
            {THREE_PILLARS.map((pillar, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl p-px overflow-hidden hover:scale-[1.01] transition-transform duration-300"
                style={{ background: pillar.borderGrad }}>
                <div className="relative rounded-2xl p-6 h-full overflow-hidden flex flex-col" style={{ background: 'linear-gradient(145deg, #0f0420 0%, #1a0a2e 50%, #1a0800 100%)' }}>
                  <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-25 group-hover:opacity-55 transition-opacity pointer-events-none" style={{ background: pillar.glow + '55' }} />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg" style={{ background: pillar.iconGrad, boxShadow: `0 0 20px ${pillar.glow}44` }}>
                      <pillar.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">{pillar.title}</h3>
                    <p className="text-xs text-white/50 mb-5 leading-relaxed">{pillar.desc}</p>
                    <div className="space-y-2">
                      {pillar.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <span className="text-xs text-white/45">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 h-px" style={{ background: `linear-gradient(to right, transparent, ${pillar.glow}66, transparent)` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Review Automation ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm mb-6">
                <Star className="w-4 h-4 text-orange-300" />
                <span className="text-sm font-semibold text-orange-300">Review Automation</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">10x Your Reviews Automatically</h2>
              <p className="text-white/55 mb-8 leading-relaxed">AI sends review requests at the optimal moment, routes happy customers to review sites, and handles negative feedback privately</p>
              <div className="space-y-3">
                {REVIEW_FEATURES.map((feature, index) => (
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
            {/* Review flow card */}
            <div className="relative rounded-2xl p-px overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
              <div className="rounded-2xl p-6 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                <h3 className="text-white text-sm font-bold mb-5">Review Request Flow</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-white font-bold text-xs">Service Completed</span>
                    </div>
                    <p className="text-white/40 text-[10px] pl-6">Customer appointment marked as complete in system</p>
                  </div>
                  <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-orange-400 rotate-90" /></div>
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,87,34,0.08)', border: '1px solid rgba(255,87,34,0.2)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-orange-400" />
                      <span className="text-white font-bold text-xs">AI Sends Thank You + Survey</span>
                    </div>
                    <p className="text-white/40 text-[10px] pl-6">Quick satisfaction check: &quot;How was your experience?&quot;</p>
                  </div>
                  <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-orange-400 rotate-90" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <div className="text-green-400 text-[10px] mb-1">⭐ 4-5 Stars</div>
                      <p className="text-white text-xs mb-1">→ Google Review</p>
                      <p className="text-white/35 text-[10px]">Direct link to leave public review</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div className="text-red-400 text-[10px] mb-1">⭐ 1-3 Stars</div>
                      <p className="text-white text-xs mb-1">→ Private Feedback</p>
                      <p className="text-white/35 text-[10px]">Routed to support for resolution</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Survey Features ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl p-px overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
              <div className="rounded-2xl p-6 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
                <h3 className="text-white text-sm font-bold mb-5">Survey Builder</h3>
                <div className="space-y-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="text-white/35 text-[10px] mb-2">Question 1 - NPS Score</div>
                    <p className="text-white text-xs mb-3">How likely are you to recommend us?</p>
                    <div className="flex gap-1 flex-wrap">
                      {[0,1,2,3,4,5,6,7,8,9,10].map((num) => (
                        <button key={num} className="w-7 h-7 rounded text-white text-[10px] transition-all" style={{ background: 'rgba(255,255,255,0.08)' }}>{num}</button>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="text-white/35 text-[10px] mb-2">Question 2 - Multiple Choice</div>
                    <p className="text-white text-xs mb-3">What did you value most?</p>
                    <div className="space-y-1.5">
                      {SURVEY_OPTIONS.map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="value" className="text-orange-500" readOnly />
                          <span className="text-white/45 text-xs">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
                <MessageSquare className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-semibold text-purple-300">Customer Feedback</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Powerful Survey Tools</h2>
              <p className="text-white/55 mb-8 leading-relaxed">Create custom surveys, measure satisfaction, and gather actionable insights from every customer interaction</p>
              <div className="space-y-2.5">
                {SURVEY_FEATURES.map((feature, index) => (
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

      {/* ── Re-engagement ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 40%, #1a0800 80%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Re-Engage Inactive Customers Automatically</h2>
            <p className="text-white/50">AI detects churn risk and brings customers back</p>
          </motion.div>
          <div className="grid lg:grid-cols-4 gap-4 mb-10">
            {RE_ENGAGE_STEPS.map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="relative rounded-2xl p-px overflow-hidden" style={{ background: step.borderGrad }}>
                <div className="rounded-2xl p-5 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f0420, #1a0a2e)' }}>
                  <div className="text-4xl font-extrabold text-white/10 mb-3">{step.step}</div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 shadow-lg" style={{ background: `linear-gradient(135deg, ${step.glow}cc, ${step.glow}88)`, boxShadow: `0 0 14px ${step.glow}44` }}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white font-bold mb-2 text-xs">{step.title}</h3>
                  <p className="text-white/40 text-[10px] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Win-back example */}
          <div className="relative rounded-2xl p-px overflow-hidden max-w-4xl mx-auto" style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}>
            <div className="rounded-2xl p-6 overflow-hidden" style={{ background: 'linear-gradient(145deg, #0d0618, #1a0a2e)' }}>
              <h3 className="text-white text-sm font-bold mb-5">Win-Back Campaign Example</h3>
              <div className="space-y-3">
                {WIN_BACK.map((touch, index) => (
                  <div key={index} className="p-3 rounded-xl flex items-center justify-between" style={{ background: touch.status === 'sent' ? 'rgba(16,185,129,0.08)' : 'rgba(255,87,34,0.08)', border: touch.status === 'sent' ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,87,34,0.25)' }}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{ background: touch.status === 'sent' ? 'rgba(16,185,129,0.2)' : 'rgba(255,87,34,0.2)', color: touch.status === 'sent' ? '#34d399' : '#fb923c' }}>{touch.day}</span>
                        <span className="text-white/35 text-[10px]">{touch.channel}</span>
                      </div>
                      <p className="text-white text-xs">{touch.message}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 ml-4 flex-shrink-0" style={{ color: touch.status === 'sent' ? '#34d399' : '#fb923c' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Analytics ── */}
      <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Track Your Reputation & Retention</h2>
            <p className="text-white/50">Real-time analytics and insights</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {ANALYTICS.map((card, index) => (
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
                    <div className="space-y-2.5">
                      {card.metrics.map((metric, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-xs text-white/40">{metric.label}</span>
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
                <span className="text-sm font-semibold text-purple-300">Build Your Reputation</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">Build Your Reputation & Retain More Customers</h2>
            <p className="text-xl text-white/55 mb-12 max-w-xl mx-auto leading-relaxed">Automate reviews, surveys, and re-engagement to grow your business</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/register" className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white overflow-hidden no-underline transition-all duration-300" style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/platform/journey-automation" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white border border-white/20 bg-white/[0.08] backdrop-blur-sm hover:bg-white/15 hover:border-white/35 transition-all duration-300 no-underline">
                  See Journey Automation <ArrowRight className="w-4 h-4" />
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
