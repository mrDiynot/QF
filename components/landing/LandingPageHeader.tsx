'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Menu, X as CloseIcon,
  Briefcase, Smile, Settings, Building, Heart, Package, Zap, Star,
} from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/lib/utils';
import { DemoBookingModal } from '@/components/landing/DemoBookingModal';

// ─── Route helpers ───────────────────────────────────────────────────────────
const PLATFORM_ITEMS = [
  { label: 'How It Works',                          href: '/platform/how-it-works' },
  { label: 'Journey Automation Engine™',            href: '/platform/journey-automation' },
  { label: 'AI Conversational Engagement',          href: '/platform/ai-engagement' },
  { label: 'AI Voice (Inbound & Outbound)',         href: '/platform/ai-voice' },
  { label: 'Omnichannel Lead Capture',              href: '/platform/lead-capture' },
  { label: 'AI Social Engagement',                  href: '/platform/social-engagement' },
  { label: 'Built-In CRM + AI Powered Lead Scoring', href: '/platform/crm' },
  { label: 'Smart Booking & Calendar Automation',   href: '/platform/booking' },
  { label: 'Proposals Automation',                  href: '/platform/proposals' },
  { label: 'Reviews, Surveys & Re-Engagement',      href: '/platform/reviews' },
  { label: 'Integrations',                          href: '/platform/integrations' },
];

const INDUSTRIES = [
  { label: 'Service & Home Improvement',   href: '/solutions/industries/service-home-improvement', Icon: Briefcase },
  { label: 'Beauty, Wellness & Personal Care', href: '/solutions/industries/beauty-wellness',     Icon: Smile },
  { label: 'Automotive',                   href: '/solutions/industries/automotive',               Icon: Settings },
  { label: 'Auto Dealerships',             href: '/solutions/industries/auto-dealerships',         Icon: Settings },
  { label: 'Real Estate & Property',       href: '/solutions/industries/real-estate',              Icon: Building },
  { label: 'Healthcare & Clinics',         href: '/solutions/industries/healthcare',               Icon: Heart },
  { label: 'Professional Services',        href: '/solutions/industries/professional-services',    Icon: Briefcase },
  { label: 'Retail & E-commerce',          href: '/solutions/industries/retail-ecommerce',         Icon: Package },
  { label: 'SaaS, Tech & B2B',            href: '/solutions/industries/saas-b2b',                 Icon: Zap },
  { label: 'Other',                        href: '/solutions/industries/other',                    Icon: Star },
];

const USE_CASES = [
  { label: 'AI Phone Receptionist',        href: '/solutions/use-cases/ai-phone-receptionist', emoji: '🤖' },
  { label: 'Instant Lead Response',        href: '/platform/lead-capture',                     emoji: '⚡' },
  { label: 'Automate Appointment Booking', href: '/platform/booking',                          emoji: '📅' },
  { label: 'Proposal Automation',          href: '/platform/proposals',                        emoji: '📄' },
  { label: 'Collect More Reviews',         href: '/platform/reviews',                          emoji: '⭐' },
  { label: 'Re-engage Cold Leads',         href: '/platform/journey-automation',               emoji: '🔄' },
  { label: 'Reduce No-Shows',              href: '/platform/booking',                          emoji: '🚫' },
  { label: 'Qualify Leads 24/7',           href: '/platform/lead-capture',                     emoji: '📊' },
  { label: 'Omnichannel Inbox',            href: '/platform/lead-capture',                     emoji: '💬' },
  { label: 'Boost Conversions',            href: '/solutions/use-cases/boost-conversions',     emoji: '🎯' },
];

const RESOURCES_ITEMS = [
  { label: 'Blog',                    href: '/resources/blog' },
  { label: 'Help Center',             href: '/resources/help-center' },
  { label: 'Webinars',                href: '/resources/webinars' },
  { label: 'Accessibility Statement', href: '/accessibility' },
  { label: 'Refund Policy',           href: '/refund-policy' },
];

const COMPANY_ITEMS = [
  { label: 'About Us', href: '/about' },
  { label: 'Careers',  href: '/careers' },
  { label: 'Contact',  href: '/contact' },
];

// ─── Dropdown animation ───────────────────────────────────────────────────────
const DD_ANIM = {
  initial:    { opacity: 0, y: 6, scale: 0.97 },
  animate:    { opacity: 1, y: 0, scale: 1 },
  exit:       { opacity: 0, y: 4, scale: 0.98 },
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
};

// ─── Dark dropdown item styles ───────────────────────────────────────────────
const itemCls =
  'w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-left text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors duration-150 rounded-lg';

// ─── Component ────────────────────────────────────────────────────────────────
export function LandingPageHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = useCallback((key: string) =>
    setActiveDropdown((prev) => (prev === key ? null : key)), []);
  const close = useCallback(() => setActiveDropdown(null), []);

  const NavTrigger = ({ label, id }: { label: string; id: string }) => (
    <button
      onClick={() => toggle(id)}
      className={cn(
        'group flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200',
        'text-white/65 hover:text-white hover:bg-white/[0.08]',
        activeDropdown === id && 'text-white bg-white/[0.1]',
      )}
    >
      {label}
      <ChevronDown
        className={cn(
          'w-3 h-3 transition-transform duration-300 opacity-50',
          activeDropdown === id && 'rotate-180 opacity-100 text-purple-400',
        )}
      />
    </button>
  );

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-500',
        scrolled && 'shadow-lg shadow-purple-100/50',
      )}
    >
      {/* Animated gradient accent line */}
      <div className="relative h-[2px] w-full overflow-hidden">
        <motion.div
          className="absolute inset-0 h-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #7c3aed, #FF5722, #7c3aed, transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Single row: Logo | Nav Pill | CTAs */}
      <div className="max-w-[1440px] mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">

        {/* Logo — left */}
        <div className="shrink-0">
          <Logo href="/" showText={true} size="md" variant="default" animated={false} />
        </div>

        {/* ── Centered dark nav pill ── */}
        <nav className="hidden lg:flex items-center">
          <div
            className="relative flex items-center gap-0.5 px-2 py-1 rounded-full border border-[#1a0a2e]/10"
            style={{ background: 'linear-gradient(135deg, #0f0620 0%, #1a0a2e 50%, #130818 100%)' }}
          >
            {/* Animated scan line */}
            <motion.span
              className="pointer-events-none absolute inset-y-1 w-8 rounded-full opacity-[0.08]"
              style={{ background: 'linear-gradient(90deg, transparent, #a855f7, transparent)' }}
              animate={{ left: ['-10%', '110%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/[0.06] via-transparent to-orange-500/[0.06]" />

            {/* Platform */}
            <div className="relative">
              <NavTrigger label="Platform" id="platform" />
              <AnimatePresence>
                {activeDropdown === 'platform' && (
                  <motion.div
                    {...DD_ANIM}
                    className="absolute top-full left-0 mt-3 w-72 z-50 rounded-xl border border-white/[0.08] bg-[#130a24]/95 backdrop-blur-2xl shadow-2xl shadow-purple-950/50 py-2"
                  >
                    <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                    {PLATFORM_ITEMS.map((item) => (
                      <Link key={item.href + item.label} href={item.href} onClick={close} className={itemCls}>
                        <span className="w-1 h-1 rounded-full bg-purple-500/60 shrink-0" />
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Solutions */}
            <div className="relative">
              <NavTrigger label="Solutions" id="solutions" />
              <AnimatePresence>
                {activeDropdown === 'solutions' && (
                  <motion.div
                    {...DD_ANIM}
                    className="absolute top-full -left-20 mt-3 z-50 w-[540px] rounded-xl border border-white/[0.08] bg-[#130a24]/95 backdrop-blur-2xl shadow-2xl shadow-purple-950/50 py-5"
                  >
                    <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                    <div className="flex">
                      <div className="px-5 flex-1 border-r border-white/[0.06]">
                        <p className="mb-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Industries</p>
                        <div className="space-y-0.5">
                          {INDUSTRIES.map(({ label, href, Icon }) => (
                            <Link key={label} href={href} onClick={close}
                              className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-white/60 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                            >
                              <Icon className="w-3.5 h-3.5 text-purple-400/60 shrink-0" />
                              {label}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div className="px-5 flex-1">
                        <p className="mb-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Use Cases</p>
                        <div className="space-y-0.5">
                          {USE_CASES.map(({ label, href, emoji }) => (
                            <Link key={label} href={href} onClick={close}
                              className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-white/60 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                            >
                              <span className="text-xs opacity-50 shrink-0">{emoji}</span>
                              {label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Resources */}
            <div className="relative">
              <NavTrigger label="Resources" id="resources" />
              <AnimatePresence>
                {activeDropdown === 'resources' && (
                  <motion.div
                    {...DD_ANIM}
                    className="absolute top-full left-0 mt-3 w-56 z-50 rounded-xl border border-white/[0.08] bg-[#130a24]/95 backdrop-blur-2xl shadow-2xl shadow-purple-950/50 py-2"
                  >
                    <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                    {RESOURCES_ITEMS.map((item) => (
                      <Link key={item.label} href={item.href} onClick={close} className={itemCls}>
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Company */}
            <div className="relative">
              <NavTrigger label="Company" id="company" />
              <AnimatePresence>
                {activeDropdown === 'company' && (
                  <motion.div
                    {...DD_ANIM}
                    className="absolute top-full left-0 mt-3 w-48 z-50 rounded-xl border border-white/[0.08] bg-[#130a24]/95 backdrop-blur-2xl shadow-2xl shadow-purple-950/50 py-2"
                  >
                    <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                    {COMPANY_ITEMS.map((item) => (
                      <Link key={item.label} href={item.href} onClick={close} className={itemCls}>
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pricing */}
            <Link
              href="/pricing"
              className="px-3 py-1.5 text-[13px] font-medium text-white/65 hover:text-white rounded-lg hover:bg-white/[0.08] transition-all duration-200"
            >
              Pricing
            </Link>
          </div>
        </nav>

        {/* ── Desktop CTAs — right ── */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <Link
            href="/login"
            className="px-4 py-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-50"
          >
            Sign In
          </Link>
          <button
            onClick={() => setDemoOpen(true)}
            className="px-4 py-1.5 text-[13px] font-semibold text-gray-700 hover:text-gray-900 rounded-lg border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200"
          >
            Book a Demo
          </button>
          <div className="relative group">
            <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-[#FF5722] via-[#FF8C42] to-[#FF5722] opacity-80 group-hover:opacity-100 transition-opacity duration-300 blur-[0.5px]" />
            <Link
              href="/register"
              className="relative flex items-center justify-center gap-1.5 px-5 py-1.5 rounded-lg text-[13px] font-semibold text-white bg-gradient-to-r from-[#FF5722] to-[#FF6B35] hover:from-[#FF6B35] hover:to-[#FF8C42] transition-all duration-200 shadow-lg shadow-orange-600/20"
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Mobile: CTA buttons + hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          <Link
            href="/register"
            className={cn(
              'inline-flex items-center justify-center h-8 px-3 rounded-lg whitespace-nowrap shrink-0',
              'text-white text-xs font-semibold',
              'bg-gradient-to-r from-[#FF5722] to-[#FF6B35]',
              'shadow-md shadow-orange-500/25',
            )}
          >
            Start Free Trial
          </Link>
          <Link
            href="/login"
            className={cn(
              'inline-flex items-center justify-center h-8 px-3 rounded-lg whitespace-nowrap shrink-0',
              'text-gray-600 text-xs font-semibold',
              'border border-gray-200 bg-white',
            )}
          >
            Sign In
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <CloseIcon className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(6px)', transition: { duration: 0.2 } }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
            className="lg:hidden mx-3 mb-3 rounded-xl border border-white/[0.08] bg-[#130a24]/95 backdrop-blur-2xl py-4 px-2 max-h-[75vh] overflow-y-auto shadow-2xl shadow-purple-950/60"
          >
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            <nav className="flex flex-col gap-0.5">
              <MobileSection label="Platform">
                {PLATFORM_ITEMS.map((item) => (
                  <Link key={item.label} href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
                  >
                    <span className="w-1 h-1 rounded-full bg-purple-500/50 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </MobileSection>

              <MobileSection label="Industries">
                {INDUSTRIES.map(({ label, href, Icon }) => (
                  <Link key={label} href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
                  >
                    <Icon className="w-3.5 h-3.5 text-purple-400/50 shrink-0" />
                    {label}
                  </Link>
                ))}
              </MobileSection>

              <MobileSection label="Use Cases">
                {USE_CASES.map(({ label, href, emoji }) => (
                  <Link key={label} href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
                  >
                    <span className="text-xs opacity-40">{emoji}</span>
                    {label}
                  </Link>
                ))}
              </MobileSection>

              <MobileSection label="Resources">
                {RESOURCES_ITEMS.map((item) => (
                  <Link key={item.label} href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 text-[13px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all block"
                  >
                    {item.label}
                  </Link>
                ))}
              </MobileSection>

              <MobileSection label="Company">
                {COMPANY_ITEMS.map((item) => (
                  <Link key={item.label} href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 text-[13px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all block"
                  >
                    {item.label}
                  </Link>
                ))}
              </MobileSection>

              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-[13px] font-semibold text-white/70 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all block"
              >
                Pricing
              </Link>

              <div className="flex flex-col gap-2.5 px-3 pt-4 mt-2 border-t border-white/[0.06]">
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center h-11 px-5 rounded-lg text-white text-sm font-semibold bg-gradient-to-r from-[#FF5722] to-[#FF6B35] shadow-lg shadow-orange-600/20 transition-all hover:shadow-orange-500/40"
                >
                  Start Free Trial
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); setDemoOpen(true); }}
                  className="inline-flex items-center justify-center h-11 px-5 rounded-lg text-white/80 text-sm font-semibold border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] transition-all"
                >
                  Book a Demo
                </button>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center h-11 px-5 rounded-lg text-white/60 text-sm font-medium hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  Sign In
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <DemoBookingModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </header>
  );
}

// ── Mobile collapsible section ───────────────────────────────────────────────
function MobileSection({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-bold text-purple-400/80 uppercase tracking-[0.15em] hover:bg-white/[0.04] rounded-lg transition-colors"
      >
        {label}
        <ChevronDown className={cn('w-3 h-3 transition-transform duration-200 text-white/30', open && 'rotate-180 text-purple-400')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LandingPageHeader;
