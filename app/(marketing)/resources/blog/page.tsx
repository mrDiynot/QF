'use client';

import { motion } from 'framer-motion';
import {
  BookOpen, ArrowRight, Bot, Zap, Brain, TrendingUp,
  MessageSquare, BarChart3, Mail, Clock, Tag,
} from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';
import { BrevoNewsletterForm } from '@/components/landing/BrevoNewsletterForm';

// ─── Ghost article previews ───────────────────────────────────────────────────
const COMING_ARTICLES = [
  {
    category: 'AI Automation',
    title: 'How Agentic AI Is Replacing Traditional Lead Funnels',
    excerpt: 'Discover how goal-driven AI agents are transforming the entire customer acquisition process — from first touch to signed deal.',
    readTime: '8 min read',
    icon: Bot,
    gradBorder: 'linear-gradient(135deg, #7c3aed, #FF5722)',
    iconGrad: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    iconGlow: '#7c3aed',
    accentColor: '#a855f7',
  },
  {
    category: 'Lead Generation',
    title: 'Why Instant Response Rates Are the #1 Driver of Lead Conversions',
    excerpt: 'The data is clear: companies that respond within 5 minutes are 21× more likely to qualify a lead. Here\'s how to hit that benchmark automatically.',
    readTime: '6 min read',
    icon: Zap,
    gradBorder: 'linear-gradient(135deg, #FF5722, #7c3aed)',
    iconGrad: 'linear-gradient(135deg, #FF5722, #FF8C42)',
    iconGlow: '#FF5722',
    accentColor: '#FF8C42',
  },
  {
    category: 'Platform Deep-Dive',
    title: 'Inside QualiFlow AI\'s Journey Automation Engine™',
    excerpt: 'A behind-the-scenes look at how our engine orchestrates multi-channel engagement, dynamic lead scoring, and autonomous booking in real-time.',
    readTime: '10 min read',
    icon: Brain,
    gradBorder: 'linear-gradient(135deg, #7c3aed, #FF5722)',
    iconGrad: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    iconGlow: '#7c3aed',
    accentColor: '#a855f7',
  },
  {
    category: 'Industry Insights',
    title: 'The $1.2 Trillion Problem: Missed Revenue from Unanswered Leads',
    excerpt: 'Small and mid-sized businesses globally are leaving billions on the table every year. We break down the root cause — and the fix.',
    readTime: '7 min read',
    icon: TrendingUp,
    gradBorder: 'linear-gradient(135deg, #FF5722, #7c3aed)',
    iconGrad: 'linear-gradient(135deg, #FF5722, #FF8C42)',
    iconGlow: '#FF5722',
    accentColor: '#FF8C42',
  },
  {
    category: 'Customer Stories',
    title: 'How a Local HVAC Company Booked 3× More Appointments with AI',
    excerpt: 'A real-world case study on how automating follow-ups, voice calls, and scheduling can transform a trades business in 30 days.',
    readTime: '5 min read',
    icon: MessageSquare,
    gradBorder: 'linear-gradient(135deg, #7c3aed, #FF5722)',
    iconGrad: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    iconGlow: '#7c3aed',
    accentColor: '#a855f7',
  },
  {
    category: 'Analytics',
    title: 'Beyond Vanity Metrics: The Revenue-Driving KPIs Every SMB Should Track',
    excerpt: 'Open rates and click-throughs won\'t pay your bills. Here\'s the dashboard that actually tells you what\'s working in your pipeline.',
    readTime: '9 min read',
    icon: BarChart3,
    gradBorder: 'linear-gradient(135deg, #FF5722, #7c3aed)',
    iconGrad: 'linear-gradient(135deg, #FF5722, #FF8C42)',
    iconGlow: '#FF5722',
    accentColor: '#FF8C42',
  },
];

const CATEGORIES = [
  'AI Automation', 'Lead Generation', 'Platform Deep-Dive',
  'Industry Insights', 'Customer Stories', 'Analytics', 'Best Practices',
];

// ─── Animation presets ────────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BlogComingSoonPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0d0618' }}>
      <LandingPageHeader />

      <main className="pt-20">

        {/* ── Hero ── */}
        <section
          className="relative px-6 py-24 md:py-32 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 60%, #1a0a18 100%)' }}
        >
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
          {/* Ambient orbs */}
          <div className="absolute -top-32 right-0 w-[600px] h-[500px] rounded-full opacity-[0.50] pointer-events-none" style={{ background: '#ef5502', filter: 'blur(130px)' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full opacity-[0.1] pointer-events-none" style={{ background: '#FF5722', filter: 'blur(110px)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-[0.06] pointer-events-none" style={{ background: '#5400a2', filter: 'blur(100px)' }} />

          <div className="max-w-4xl mx-auto relative z-10 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center mb-8"
            >
              
            </motion.div>

            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex justify-center mb-8"
            >
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #FF5722)',
                  boxShadow: '0 0 60px rgba(124,58,237,0.5), 0 0 100px rgba(255,87,34,0.2)',
                }}
              >
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #e9d5ff 45%, #FF8C42 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              The QualiFlow AI Blog
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22 }}
              className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Insights, strategies, and deep-dives on AI automation, lead generation, and building agentic revenue systems. Our first articles are on their way.
            </motion.p>

            {/* Email Subscribe — Brevo Form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="max-w-xl mx-auto"
            >
              <BrevoNewsletterForm />
              <p className="text-white/30 text-xs mt-3 text-center">No spam. Unsubscribe any time.</p>
            </motion.div>
          </div>
        </section>

        {/* ── Category Pills ── */}
        <section
          className="relative px-6 py-12 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 50%, #0d0618 100%)' }}
        >
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="text-center mb-8">
              <p className="text-white/40 text-sm font-semibold uppercase tracking-widest">Topics We&apos;ll Cover</p>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-wrap gap-2 justify-center">
              {CATEGORIES.map((cat, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all"
                  style={{
                    background: i % 2 === 0 ? 'rgba(76, 8, 193, 0.1)' : 'rgba(255,87,34,0.08)',
                    borderColor: i % 2 === 0 ? 'rgba(124,58,237,0.3)' : 'rgba(255,87,34,0.25)',
                    color: i % 2 === 0 ? '#c4b5fd' : '#fdba74',
                  }}
                >
                  <Tag className="w-3 h-3" />
                  {cat}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Coming Articles (Glass Cards) ── */}
        <section
          className="relative px-6 py-20 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 50%, #1a0a2e 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
          <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full bg-[#7c3aed]/15 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[450px] h-[300px] rounded-full bg-[#FF5722]/[0.1] blur-[80px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Section header */}
            <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-14">
             
              <h2
                className="text-3xl md:text-4xl font-bold"
                style={{ background: 'linear-gradient(135deg, #ffffff 0%, #e9d5ff 50%, #FF8C42 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                What to Expect from Our Blog.
              </h2>
              <p className="text-white/50 mt-4 max-w-2xl mx-auto">
                A sneak peek at the first wave of articles our team is writing for you.
              </p>
            </motion.div>

            {/* Article grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COMING_ARTICLES.map((article, idx) => (
                <motion.div
                  key={idx}
                  {...fadeUp}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1.5 transition-transform duration-300"
                  style={{ background: article.gradBorder }}
                >
                  {/* Dark purple / dark orange glass inner card */}
                  <div className="relative rounded-2xl h-full overflow-hidden backdrop-blur-xl flex flex-col"
                    style={{ background: 'linear-gradient(145deg, rgba(45,10,80,0.95) 0%, rgba(30,8,55,0.92) 50%, rgba(50,15,70,0.95) 100%)' }}
                  >
                    {/* Corner ambient */}
                    <div
                      className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-25 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
                      style={{ background: article.iconGlow + '55' }}
                    />
                    {/* White shimmer on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -skew-x-12"
                      style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.06) 50%, transparent 65%)' }}
                    />

                    <div className="relative z-10 p-6 flex flex-col flex-1">
                      {/* Category + read time */}
                      <div className="flex items-center justify-between mb-5">
                        <div
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: article.iconGlow + '22',
                            color: article.accentColor,
                            border: `1px solid ${article.iconGlow}44`,
                          }}
                        >
                          <Tag className="w-3 h-3" />
                          {article.category}
                        </div>
                      <div className="flex items-center gap-1 text-xs text-orange-300/80">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </div>
                      </div>

                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg shrink-0"
                        style={{ background: article.iconGrad, boxShadow: `0 0 20px ${article.iconGlow}55` }}
                      >
                        <article.icon className="w-6 h-6 text-white/80" />
                      </div>

                      {/* Title */}
                      <h3 className="text-white font-bold text-base leading-snug mb-3 group-hover:text-white transition-colors">
                        {article.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-white/60 text-sm leading-relaxed flex-1 mb-6">
                        {article.excerpt}
                      </p>

                      {/* Divider */}
                      <div
                        className="h-px w-full mb-5"
                        style={{ background: `linear-gradient(to right, transparent, ${article.iconGlow}88, transparent)` }}
                      />

                      {/* Coming soon pill */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/[0.08] backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-orange-500" />
                          <span className="text-xs font-medium text-orange-300/70">Coming Soon</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Newsletter CTA ── */}
        <section
          className="relative py-28 px-6 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 50%, #0f041a 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[#7c3aed]/25 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#FF5722]/15 blur-[90px] pointer-events-none" />

          <div className="max-w-3xl mx-auto relative z-10">
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl p-px overflow-hidden shadow-2xl shadow-purple-900/40"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}
            >
              <div
                className="relative rounded-3xl overflow-hidden p-10 md:p-14 text-center"
                style={{ background: 'linear-gradient(145deg, rgba(45,10,80,0.95) 0%, rgba(30,8,55,0.92) 50%, rgba(50,15,70,0.95) 100%)' }}
              >
                {/* inner glass glow effects */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <div className="relative z-10">
                  <div
                    className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 40px rgba(255,87,34,0.4)' }}
                  >
                    <Mail className="w-8 h-8 text-white" />
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Be the First to Read
                  </h2>
                  <p className="text-white/55 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                    Subscribe to the QualiFlow AI newsletter and get our best AI and automation insights delivered straight to your inbox.
                  </p>

                  <BrevoNewsletterForm />

                  <p className="text-white/25 text-xs mt-5">No spam, ever. Unsubscribe at any time.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      <LandingPageFooter />
    </div>
  );
}
