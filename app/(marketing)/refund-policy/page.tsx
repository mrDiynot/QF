'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Mail, Globe, Shield, CreditCard, Clock,
  XCircle, AlertTriangle, UserX, FileText, RefreshCw,
  Phone, CheckCircle, HelpCircle, CalendarClock,
} from 'lucide-react';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

// ---------------------------------------------------------------------------
// Policy Sections
// ---------------------------------------------------------------------------
interface PolicySection {
  number: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  glow: string;
  iconGrad: string;
  content: React.ReactNode;
}

const policySections: PolicySection[] = [
  {
    number: '1',
    title: 'Overview',
    icon: FileText,
    glow: '#3b82f6',
    iconGrad: 'from-blue-500 to-cyan-400',
    content: (
      <>
        <p>At QualiFlow AI, we strive to provide a high-quality platform and customer experience. This Refund Policy outlines the terms under which refunds may be issued for subscriptions and services.</p>
        <p>By purchasing or subscribing to QualiFlow AI, you agree to this Refund Policy.</p>
      </>
    ),
  },
  {
    number: '2',
    title: 'Subscription Fees',
    icon: CreditCard,
    glow: '#a855f7',
    iconGrad: 'from-violet-500 to-purple-400',
    content: (
      <>
        <p>QualiFlow AI operates on a subscription-based model.</p>
        <p>All subscription fees (monthly or annual) are billed in advance and are generally non-refundable, except as outlined in this policy.</p>
      </>
    ),
  },
  {
    number: '3',
    title: 'Free Trial & Evaluation',
    icon: CalendarClock,
    glow: '#FF5722',
    iconGrad: 'from-orange-500 to-red-400',
    content: (
      <>
        <p>If a free trial or demo is offered, we strongly encourage users to evaluate the platform before committing to a paid plan.</p>
        <p>Once a subscription is activated, it is considered acceptance of the platform&apos;s functionality and features.</p>
      </>
    ),
  },
  {
    number: '4',
    title: 'Eligible Refunds',
    icon: CheckCircle,
    glow: '#10b981',
    iconGrad: 'from-emerald-500 to-green-400',
    content: (
      <>
        <p>Refunds may be considered under the following circumstances:</p>
        <ul>
          <li>Duplicate or accidental charges</li>
          <li>Billing errors caused by our system</li>
          <li>Unauthorized transactions (subject to verification)</li>
        </ul>
        <p>Approved refunds will be processed back to the original payment method.</p>
      </>
    ),
  },
  {
    number: '5',
    title: 'Non-Refundable Items',
    icon: XCircle,
    glow: '#ef4444',
    iconGrad: 'from-red-500 to-rose-400',
    content: (
      <>
        <p>The following are non-refundable:</p>
        <ul>
          <li>Partial subscription periods (unused time)</li>
          <li>Fees for SMS, voice calls, or usage-based services</li>
          <li>Charges incurred through third-party integrations (e.g., Twilio, email providers)</li>
          <li>Setup, onboarding, or customization services (if applicable)</li>
        </ul>
      </>
    ),
  },
  {
    number: '6',
    title: 'Cancellation Policy',
    icon: AlertTriangle,
    glow: '#f59e0b',
    iconGrad: 'from-amber-500 to-yellow-400',
    content: (
      <>
        <p>You may cancel your subscription at any time.</p>
        <ul>
          <li>Cancellation will prevent future billing</li>
          <li>Your subscription will remain active until the end of the current billing cycle</li>
          <li>No refunds will be issued for the remaining time in the billing period</li>
        </ul>
      </>
    ),
  },
  {
    number: '7',
    title: 'Service Disruptions',
    icon: AlertTriangle,
    glow: '#6366f1',
    iconGrad: 'from-indigo-500 to-violet-400',
    content: (
      <>
        <p>While we strive for uptime and reliability, QualiFlow AI does not guarantee uninterrupted service.</p>
        <p>Temporary outages, third-party failures, or performance issues do not qualify for refunds, unless otherwise required by law.</p>
      </>
    ),
  },
  {
    number: '8',
    title: 'Account Termination',
    icon: UserX,
    glow: '#ec4899',
    iconGrad: 'from-pink-500 to-rose-400',
    content: (
      <>
        <p>If your account is suspended or terminated due to a violation of our Terms and Conditions:</p>
        <ul>
          <li>You will not be eligible for a refund</li>
          <li>Any outstanding balances remain due</li>
        </ul>
      </>
    ),
  },
  {
    number: '9',
    title: 'Refund Requests',
    icon: Mail,
    glow: '#14b8a6',
    iconGrad: 'from-teal-500 to-cyan-400',
    content: (
      <>
        <p>To request a refund, please contact us at:</p>
        <p><strong>Email:</strong> info@qualiflow.ai</p>
        <p>Include:</p>
        <ul>
          <li>Your account email</li>
          <li>Transaction details</li>
          <li>Reason for request</li>
        </ul>
        <p>We will review all requests on a case-by-case basis.</p>
      </>
    ),
  },
  {
    number: '10',
    title: 'Processing Time',
    icon: Clock,
    glow: '#8b5cf6',
    iconGrad: 'from-purple-500 to-violet-400',
    content: (
      <p>Approved refunds are typically processed within 5–10 business days, depending on your payment provider.</p>
    ),
  },
  {
    number: '11',
    title: 'Changes to This Policy',
    icon: RefreshCw,
    glow: '#f97316',
    iconGrad: 'from-orange-500 to-amber-400',
    content: (
      <>
        <p>We reserve the right to update this Refund Policy at any time.</p>
        <p>Continued use of the platform constitutes acceptance of any changes.</p>
      </>
    ),
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function RefundPolicyPage() {
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
                <Shield className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-semibold text-purple-300">Refund Policy</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-purple-200 to-orange-300 bg-clip-text text-transparent">
                Refund Policy for QualiFlow AI
              </h1>
              <p className="text-lg sm:text-xl text-white/65 max-w-3xl mx-auto leading-relaxed">
                We strive to provide a high-quality platform and customer experience. This policy outlines the terms under which refunds may be issued for subscriptions and services.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Policy Sections ── */}
        <section
          className="relative px-6 py-20 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0d0618 0%, #1a0a2e 60%, #0d0618 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#7c3aed]/15 blur-[80px] pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10 space-y-6">
            {policySections.map((section, index) => (
              <motion.div
                key={section.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative rounded-2xl p-px overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${section.glow}66, #7c3aed44)` }}
              >
                <div
                  className="relative rounded-2xl p-6 sm:p-8 overflow-hidden"
                  style={{ background: 'linear-gradient(145deg, #0f0420 0%, #1a0a2e 50%, #1a0800 100%)' }}
                >
                  {/* Glow */}
                  <div
                    className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                    style={{ background: section.glow + '55' }}
                  />

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-5">
                      <div
                        className={`w-[48px] h-[48px] rounded-xl bg-gradient-to-br ${section.iconGrad} flex items-center justify-center shadow-lg shrink-0`}
                        style={{ boxShadow: `0 0 18px ${section.glow}55` }}
                      >
                        <section.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Section {section.number}</span>
                        <h3 className="text-lg font-bold text-white leading-snug">{section.title}</h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-sm text-white/75 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-1.5 [&_ul]:text-white/65 [&_strong]:text-white/90 [&_strong]:font-semibold">
                      {section.content}
                    </div>

                    <div
                      className="mt-6 h-px w-full"
                      style={{ background: `linear-gradient(to right, transparent, ${section.glow}66, transparent)` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Contact CTA ── */}
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
                  <span className="text-sm font-semibold text-purple-300 tracking-wide">Contact &amp; Support</span>
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                <span style={{ background: 'linear-gradient(135deg, #ffffff 0%, #e9d5ff 45%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Have Questions?
                </span>
              </h2>

              <p className="text-xl text-white/55 mb-8 max-w-xl mx-auto leading-relaxed">
                If you have any questions regarding this policy or need to submit a refund request, please don&apos;t hesitate to reach out.
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
                This Refund Policy may be updated periodically. Continued use of the platform constitutes acceptance of any changes.
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
