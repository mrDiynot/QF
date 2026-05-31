'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Accessibility, Eye, Ear, Hand, Brain, ArrowRight,
  Monitor, Keyboard, Type, Smartphone, MessageSquare,
  RefreshCw, Link2, Mail, Globe,
} from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

// ---------------------------------------------------------------------------
// Accessibility Features
// ---------------------------------------------------------------------------
const accessibilityFeatures = [
  { icon: Monitor,      title: 'Clear & Consistent Navigation',      desc: 'Structured layout that is easy to understand and navigate.',                       glow: '#3b82f6', iconGrad: 'from-blue-500 to-cyan-400' },
  { icon: Type,         title: 'Readable Fonts & Color Contrast',    desc: 'Sufficient color contrast and legible typography throughout.',                     glow: '#a855f7', iconGrad: 'from-violet-500 to-purple-400' },
  { icon: Keyboard,     title: 'Keyboard Navigation Support',        desc: 'Full keyboard accessibility for users who cannot use a mouse.',                    glow: '#FF5722', iconGrad: 'from-orange-500 to-red-400' },
  { icon: Eye,          title: 'Screen Reader Compatibility',        desc: 'Compatible with screen readers and assistive technologies.',                       glow: '#10b981', iconGrad: 'from-emerald-500 to-green-400' },
  { icon: MessageSquare,title: 'Alternative Text for Images',        desc: 'Descriptive alt text provided for images where applicable.',                       glow: '#6366f1', iconGrad: 'from-indigo-500 to-violet-400' },
  { icon: Smartphone,   title: 'Responsive Design',                  desc: 'Accessible experience across different devices and screen sizes.',                 glow: '#ec4899', iconGrad: 'from-pink-500 to-rose-400' },
];

// ---------------------------------------------------------------------------
// Disability Categories
// ---------------------------------------------------------------------------
const disabilityCategories = [
  { icon: Eye,   label: 'Visual impairments',   color: '#3b82f6' },
  { icon: Ear,   label: 'Hearing impairments',  color: '#a855f7' },
  { icon: Hand,  label: 'Motor limitations',     color: '#FF5722' },
  { icon: Brain, label: 'Cognitive disabilities', color: '#10b981' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AccessibilityPage() {
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
                <Accessibility className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-semibold text-purple-300">Accessibility Statement</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
                Accessibility Statement for QualiFlow AI
              </h1>
              <p className="text-lg sm:text-xl text-white/65 max-w-3xl mx-auto leading-relaxed">
                At QualiFlow AI, we are committed to ensuring digital accessibility for all users, including people with disabilities. We are continuously working to improve the accessibility and usability of our website and platform to provide an inclusive experience for everyone.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Our Commitment ── */}
        <section className="relative pt-16 pb-10 px-6 overflow-hidden bg-white">
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
                <span className="text-sm font-semibold text-[#6B2D9E] tracking-wide">Our Commitment</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Digital Accessibility for All
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Commitment Card */}
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
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 backdrop-blur-md border border-white/20 shadow-lg shadow-purple-900/30"
                      style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(168,85,247,0.15) 100%)' }}>
                      <Accessibility className="w-3.5 h-3.5 text-purple-300" />
                      <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Commitment</span>
                    </div>
                    <p className="text-white/85 text-sm leading-relaxed">
                      Our goal is to align with recognized accessibility standards and best practices to ensure that all users—regardless of ability—can access and benefit from our services.
                    </p>
                    <div className="mt-8 h-px bg-gradient-to-r from-violet-500/60 via-purple-400/30 to-transparent" />
                  </div>
                </div>
              </motion.div>

              {/* Standards Card */}
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
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 backdrop-blur-md border border-white/20 shadow-lg shadow-orange-900/30"
                      style={{ background: 'linear-gradient(135deg, rgba(255,87,34,0.35) 0%, rgba(255,140,66,0.15) 100%)' }}>
                      <Globe className="w-3.5 h-3.5 text-orange-300" />
                      <span className="text-xs font-bold text-white/90 uppercase tracking-widest">WCAG 2.1 Level AA</span>
                    </div>
                    <p className="text-white/85 text-sm leading-relaxed mb-4">
                      We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, which outline best practices for making web content more accessible for people with a wide range of disabilities.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {disabilityCategories.map((cat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                          <cat.icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                          <span className="text-xs text-white/70">{cat.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 h-px bg-gradient-to-r from-orange-500/60 via-orange-400/30 to-transparent" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Accessibility Features ── */}
        <section
          className="relative px-6 py-20 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#7c3aed]/15 blur-[80px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-sm font-semibold text-purple-300 tracking-wide">Features</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span style={{ background: 'linear-gradient(135deg, #ffffff 0%, #e9d5ff 40%, #FF8C42 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Accessibility Features
                </span>
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                QualiFlow AI&apos;s website and platform are designed with accessibility in mind
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {accessibilityFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                  style={{ background: `linear-gradient(135deg, ${feature.glow}, #7c3aed)` }}
                >
                  <div
                    className="relative rounded-2xl p-6 h-full overflow-hidden flex flex-col"
                    style={{ background: 'linear-gradient(145deg, #0f0420 0%, #1a0a2e 50%, #1a0800 100%)' }}
                  >
                    <div
                      className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                      style={{ background: feature.glow + '55' }}
                    />
                    <div className="relative z-10">
                      <div
                        className={`w-[52px] h-[52px] rounded-xl bg-gradient-to-br ${feature.iconGrad} flex items-center justify-center mb-5 shadow-lg`}
                        style={{ boxShadow: `0 0 18px ${feature.glow}55` }}
                      >
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-base font-bold text-white mb-2 leading-snug">{feature.title}</h4>
                      <p className="text-xs text-white/50 leading-relaxed">{feature.desc}</p>
                      <div
                        className="mt-5 h-px w-full"
                        style={{ background: `linear-gradient(to right, transparent, ${feature.glow}88, transparent)` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center text-white/50 text-sm mt-8 max-w-2xl mx-auto"
            >
              We are also working to ensure that AI-driven interactions (such as chat, voice, and messaging features) remain usable and accessible across different user needs.
            </motion.p>
          </div>
        </section>

        {/* ── Ongoing Improvements & Third-Party ── */}
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

          <div className="max-w-[1200px] mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Ongoing Improvements */}
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
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 backdrop-blur-md border border-white/20 shadow-lg shadow-purple-900/30"
                      style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(168,85,247,0.15) 100%)' }}>
                      <RefreshCw className="w-3.5 h-3.5 text-purple-300" />
                      <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Ongoing Improvements</span>
                    </div>
                    <p className="text-white/85 text-sm leading-relaxed mb-4">
                      Accessibility is an ongoing effort. We regularly review our website and platform to identify and fix accessibility issues, improve usability, and enhance the overall experience for all users.
                    </p>
                    <p className="text-white/65 text-sm leading-relaxed">
                      As our platform evolves—especially with AI-powered features and multi-channel communication—we are committed to maintaining accessibility across all touchpoints.
                    </p>
                    <div className="mt-8 h-px bg-gradient-to-r from-violet-500/60 via-purple-400/30 to-transparent" />
                  </div>
                </div>
              </motion.div>

              {/* Third-Party Integrations */}
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
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 backdrop-blur-md border border-white/20 shadow-lg shadow-orange-900/30"
                      style={{ background: 'linear-gradient(135deg, rgba(255,87,34,0.35) 0%, rgba(255,140,66,0.15) 100%)' }}>
                      <Link2 className="w-3.5 h-3.5 text-orange-300" />
                      <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Third-Party Integrations</span>
                    </div>
                    <p className="text-white/85 text-sm leading-relaxed mb-4">
                      QualiFlow AI integrates with third-party tools and platforms (such as messaging, voice, and social channels). While we strive to ensure accessibility across our ecosystem, we cannot guarantee the accessibility of third-party services.
                    </p>
                    <p className="text-white/65 text-sm leading-relaxed">
                      We encourage users to review the accessibility policies of those providers as well.
                    </p>
                    <div className="mt-8 h-px bg-gradient-to-r from-orange-500/60 via-orange-400/30 to-transparent" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Feedback & Contact ── */}
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

          <div className="max-w-[900px] mx-auto relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
            >
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                  </span>
                  <span className="text-sm font-semibold text-purple-300 tracking-wide">Feedback &amp; Support</span>
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                <span style={{ background: 'linear-gradient(135deg, #ffffff 0%, #e9d5ff 45%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  We Welcome Your Feedback
                </span>
              </h2>

              <p className="text-xl text-white/55 mb-8 max-w-xl mx-auto leading-relaxed">
                If you encounter any barriers or have suggestions for improvement, please contact us. We aim to respond to accessibility-related inquiries promptly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <a
                  href="mailto:info@qualiflow.ai"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-sm hover:bg-white/15 hover:border-white/35 transition-all text-white font-medium no-underline"
                >
                  <Mail className="w-4 h-4 text-purple-300" />
                  info@qualiflow.ai
                </a>
                <a
                  href="https://dev.qualiflow.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-sm hover:bg-white/15 hover:border-white/35 transition-all text-white font-medium no-underline"
                >
                  <Globe className="w-4 h-4 text-orange-300" />
                  dev.qualiflow.ai
                </a>
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/contact"
                    className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white overflow-hidden no-underline transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, #FF5722, #FF8C42)', boxShadow: '0 0 32px rgba(255,87,34,0.35)' }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                    <ArrowRight className="w-4 h-4" />
                    Contact Us
                  </Link>
                </motion.div>
              </div>

              <p className="text-sm text-white/35 mt-12 max-w-lg mx-auto">
                This Accessibility Statement may be updated periodically to reflect improvements and changes to our platform and accessibility practices.
              </p>

              <div className="mt-16 mx-auto max-w-xs h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.6), rgba(168,85,247,0.5), transparent)' }} />
            </motion.div>
          </div>
        </section>

      </main>

      <LandingPageFooter />
    </div>
  );
}
