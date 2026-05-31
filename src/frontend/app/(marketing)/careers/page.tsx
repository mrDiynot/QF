'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Upload, Mail, User, Phone, Briefcase, Send,
  Heart, Zap, Users, TrendingUp, Sparkles,
} from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

// ─── Data ─────────────────────────────────────────────────────────────────────
const PERKS = [
  { icon: Zap,         title: 'Cutting-Edge Tech',  description: 'Work with the latest AI and automation technologies',     glow: '#FF5722', iconGrad: 'linear-gradient(135deg, #FF5722, #FF8C42)', borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)' },
  { icon: Users,       title: 'Amazing Team',        description: 'Collaborate with talented, passionate people',            glow: '#7c3aed', iconGrad: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)' },
  { icon: TrendingUp,  title: 'Real Impact',         description: 'Help thousands of businesses grow and succeed',           glow: '#FF5722', iconGrad: 'linear-gradient(135deg, #FF5722, #FF8C42)', borderGrad: 'linear-gradient(135deg, #FF5722, #7c3aed)' },
  { icon: Heart,       title: 'Great Culture',       description: 'Remote-first with competitive benefits',                 glow: '#7c3aed', iconGrad: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderGrad: 'linear-gradient(135deg, #7c3aed, #FF5722)' },
];

const _JOBS = [
  { title: 'Senior Full-Stack Engineer',  location: 'Remote', type: 'Full-Time', department: 'Engineering' },
  { title: 'Product Designer',            location: 'Remote', type: 'Full-Time', department: 'Design' },
  { title: 'Customer Success Manager',    location: 'Remote', type: 'Full-Time', department: 'Customer Success' },
];

const STATS = [
  { value: '5+',   label: 'Countries Represented' },
  { value: '100%', label: 'Remote Flexibility' },
  { value: '4.9★', label: 'Glassdoor Rating' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CareerPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    linkedin: '', area: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Application submitted:', form);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 6000);
    setForm({ firstName: '', lastName: '', email: '', phone: '', linkedin: '', area: '', message: '' });
  };

  const inputCls =
    'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur';

  return (
    <div className="min-h-screen" style={{ background: '#0d0618' }}>
      <LandingPageHeader />

      <main className="pt-20">

        {/* ── Hero ── */}
        <section
          className="relative px-6 py-24 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0d0618 60%, #1a0a18 100%)' }}
        >
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          {/* Ambient orbs */}
          <div className="absolute -top-32 right-0 w-[600px] h-[400px] rounded-full opacity-[0.12] pointer-events-none" style={{ background: '#7c3aed', filter: 'blur(120px)' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full opacity-[0.08] pointer-events-none" style={{ background: '#FF5722', filter: 'blur(100px)' }} />

          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm">
                <Briefcase className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-semibold text-purple-300">Careers at QualiFlow AI</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
              style={{ background: 'linear-gradient(135deg, #ffffff 0%, #e9d5ff 45%, #FF8C42 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              Join Our Growing Team
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              We&apos;re always looking for talented people who are passionate about helping businesses succeed through AI-powered automation.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <a
                href="#apply"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF5722] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
              >
                <Send className="w-4 h-4" /> Apply Now
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── Why Join Us ── */}
        <section
          className="relative px-6 py-20 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 50%, #0d0618 100%)' }}
        >
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF8C42 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full bg-[#7c3aed]/15 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[450px] h-[300px] rounded-full bg-[#FF5722]/[0.1] blur-[80px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm mb-6">
                <Sparkles className="w-4 h-4 text-orange-300" />
                <span className="text-sm font-semibold text-orange-300 tracking-wide">Why QualiFlow AI</span>
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold"
                style={{ background: 'linear-gradient(135deg, #ffffff 0%, #e9d5ff 50%, #FF8C42 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                Why Join QualiFlow AI?
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PERKS.map((perk, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative rounded-2xl p-px overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                  style={{ background: perk.borderGrad }}
                >
                  <div
                    className="relative rounded-2xl p-6 h-full overflow-hidden flex flex-col items-center text-center"
                    style={{ background: 'linear-gradient(145deg, #0f0420 0%, #1a0a2e 50%, #1a0800 100%)' }}
                  >
                    <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-25 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none" style={{ background: perk.glow + '55' }} />
                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                        style={{ background: perk.iconGrad, boxShadow: `0 0 20px ${perk.glow}55` }}
                      >
                        <perk.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-base mb-2">{perk.title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed">{perk.description}</p>
                      <div className="mt-5 h-px w-full" style={{ background: `linear-gradient(to right, transparent, ${perk.glow}88, transparent)` }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 rounded-2xl bg-white/[0.04] border border-white/10 px-8 py-6 grid md:grid-cols-3 gap-6 text-center"
            >
              {STATS.map((s, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent">{s.value}</div>
                  <div className="text-purple-300 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

       

        {/* ── Application Form ── */}
        <section
          id="apply"
          className="relative px-6 py-24 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 50%, #0d0618 100%)' }}
        >
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto relative z-10">

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl p-px overflow-hidden shadow-2xl shadow-purple-900/40"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #FF5722)' }}
            >
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #0f0420 0%, #1a0a2e 60%, #2a0e1a 100%)' }}
              >
                {/* Inner glow orbs */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                <div className="relative z-10 p-8 md:p-12">
                  {/* Header */}
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full mb-5">
                      <Send className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-white font-medium">Submit Your Application</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Interested in Joining Us?</h2>
                    <p className="text-purple-200 text-base">
                      Submit your information and we&apos;ll reach out when opportunities arise.
                    </p>
                  </div>

                  {/* Success */}
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-8 p-5 rounded-2xl border border-green-500/30 bg-green-500/10 text-center"
                    >
                      <p className="text-green-400 font-semibold text-lg mb-1">Application Received! 🎉</p>
                      <p className="text-white/60 text-sm">We&apos;ll reach out if there&apos;s a great fit. Thank you!</p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name row */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">First Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/60" />
                          <input
                            type="text" required placeholder="John"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            className={inputCls + ' pl-10'}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Last Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/60" />
                          <input
                            type="text" required placeholder="Doe"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            className={inputCls + ' pl-10'}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/60" />
                        <input
                          type="email" required placeholder="john@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className={inputCls + ' pl-10'}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/60" />
                        <input
                          type="tel" placeholder="+1 (555) 000-0000"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className={inputCls + ' pl-10'}
                        />
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">LinkedIn Profile</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/60" />
                        <input
                          type="url" placeholder="https://linkedin.com/in/yourprofile"
                          value={form.linkedin}
                          onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                          className={inputCls + ' pl-10'}
                        />
                      </div>
                    </div>

                    {/* Area of Interest */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Area of Interest</label>
                      <select
                        value={form.area}
                        onChange={(e) => setForm({ ...form, area: e.target.value })}
                        className={inputCls}
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="" className="bg-[#1a0a2e]">Select area</option>
                        <option value="engineering" className="bg-[#1a0a2e]">Engineering</option>
                        <option value="product" className="bg-[#1a0a2e]">Product</option>
                        <option value="design" className="bg-[#1a0a2e]">Design</option>
                        <option value="sales" className="bg-[#1a0a2e]">Sales</option>
                        <option value="marketing" className="bg-[#1a0a2e]">Marketing</option>
                        <option value="customer-success" className="bg-[#1a0a2e]">Customer Success</option>
                        <option value="operations" className="bg-[#1a0a2e]">Operations</option>
                        <option value="other" className="bg-[#1a0a2e]">Other</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Cover Letter / Message</label>
                      <textarea
                        rows={5} placeholder="Tell us about yourself and why you'd like to join QualiFlow AI..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className={inputCls + ' resize-none'}
                      />
                    </div>

                    {/* Resume Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Resume / CV *</label>
                      <label className="relative block border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-orange-500/60 transition-colors cursor-pointer group">
                        <div className="absolute inset-0 rounded-xl bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors" />
                        <Upload className="w-10 h-10 text-purple-300/50 group-hover:text-orange-400 transition-colors mx-auto mb-3" />
                        <p className="text-sm text-purple-200 mb-1">
                          <span className="text-orange-400 font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-white/40">PDF, DOC, DOCX (Max 5MB)</p>
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                      </label>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#FF5722] to-[#FF8C42] text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-orange-500/40 transition-all"
                    >
                      <Send className="w-5 h-5" />
                      Submit Application
                    </button>

                    <p className="text-xs text-white/40 text-center">
                      We review all applications and will reach out if there&apos;s a potential fit.
                    </p>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CTA / Don't See Your Role ── */}
        <section
          className="relative px-6 py-24 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 50%, #0f041a 100%)' }}
        >
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[#7c3aed]/25 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#FF5722]/15 blur-[90px] pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-12 bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] border-2 border-orange-500/40 rounded-2xl"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Questions About Joining Our Team?</h2>
              <p className="text-purple-200 text-lg mb-2">
                Don&apos;t see the right role? We&apos;re always looking for exceptional talent.
              </p>
              <p className="text-purple-300 mb-8">
                Reach out to our HR team at{' '}
                <a href="mailto:careers@qualiflow.com" className="text-orange-400 font-semibold hover:underline">
                  careers@qualiflow.com
                </a>
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all"
              >
                Contact Us <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

      </main>

      <LandingPageFooter />
    </div>
  );
}
