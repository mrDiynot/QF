'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import {
  Check, X, ArrowRight, Info,
  User, MessageSquare, Target, Trophy, Calendar, FileText,
  Users, Send, CheckCircle, RefreshCw, Star, BarChart3,
  TrendingUp, Clock, Zap, Phone, Database, Award,
  Shield, Play, Sparkles, Bot, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { GradientButton } from '@/components/ui/gradient-button';
import { Logo } from '@/components/shared/logo';
import { useLandingPageData, usePublicBlogs } from '@/hooks/cms/useCms';
import Image from 'next/image';
import { ChatWidget } from '@/components/landing/chat-widget';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import {
  HeroSection, CustomerLifecycleFlow,
  PrebuiltJourneysSection, SocialProofSection, AutoSegmentationSection,
  VideoCtaSection, FAQSection,
  ConversationBubblesSection,
  CRMBuiltInSection, IntegrationsSection, AnalyticsDashboardSection,
  SecurityComplianceSection, BlogPreviewSection, FinalCTASection,
  VoiceCallSimulatorSection,
} from '@/components/landing';
import { LandingPricingSection } from '@/components/landing/LandingPricingSection';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';
import { DemoBookingModal } from '@/components/landing/DemoBookingModal';


// Constants moved outside component to avoid React Hook dependency warnings
// ENTERPRISE-GRADE: Single consistent style for all sections
const TESTIMONIAL_STYLE = {
  bgColor: 'bg-white',
  borderColor: 'border-gray-200',
  hoverBorder: 'hover:border-gray-300',
  iconBg: 'bg-gray-100',
  iconColor: 'text-gray-600'
};

// Single brand-focused module style
const MODULE_STYLE = {
  iconBg: 'bg-brand-purple/10',
  iconColor: 'text-brand-purple',
  hoverGlow: 'group-hover:shadow-brand-purple/10'
};

// Consistent journey card style
const JOURNEY_STYLE = {
  bg: 'bg-white',
  accent: 'border-gray-200',
  hoverAccent: 'hover:border-gray-300',
  iconBg: 'bg-gray-100',
  iconColor: 'text-gray-700'
};

// Consistent lifecycle style
const LIFECYCLE_STYLE = {
  bg: 'bg-gray-100',
  ring: 'ring-gray-300',
  activeBg: 'bg-brand-purple',
  activeRing: 'ring-brand-purple/20'
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  // Fetch CMS data from backend API
  const { data: cmsData, isLoading: cmsLoading } = useLandingPageData();
  const { data: blogPosts } = usePublicBlogs();

  // Derive CMS content with fallbacks
  const animatedStats = useMemo(() => {
    if (cmsData?.statistics?.length) {
      return cmsData.statistics.map(s => ({ value: s.value, label: s.label }));
    }
    // Fallback to hardcoded values if API fails
    return [
      { value: '10M+', label: 'Leads Qualified' },
      { value: '500K+', label: 'Appointments Booked' },
      { value: '98%', label: 'Customer Satisfaction' },
      { value: '24/7', label: 'AI Availability' },
    ];
  }, [cmsData?.statistics]);

  const trustedCompanies = useMemo(() => {
    if (cmsData?.trustedCompanies?.length) {
      return cmsData.trustedCompanies.map(c => c.name);
    }
    return ['TechCorp', 'InnovateCo', 'GrowthLabs', 'ScaleUp', 'NextGen', 'FutureTech'];
  }, [cmsData?.trustedCompanies]);

  const faqs = useMemo(() => {
    if (cmsData?.faqs?.length) {
      return cmsData.faqs.map(f => ({ question: f.question, answer: f.answer }));
    }
    return [
      { question: 'Can I switch plans anytime?', answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we will prorate any charges.' },
      { question: 'Is there a contract or commitment?', answer: 'No contracts required. Monthly plans can be cancelled anytime. Annual plans offer 20% savings with a yearly commitment.' },
      { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards (Visa, MasterCard, Amex) and ACH transfers for Enterprise plans.' },
      { question: 'What happens if I exceed my limits?', answer: 'We will notify you at 80% usage. After that, overage pricing applies automatically - no service interruptions.' },
      { question: 'Do you offer refunds?', answer: 'Our Free Flow plan is completely free forever. For paid plans, we provide a 14-day money-back guarantee if you are not satisfied.' },
      { question: 'Can I get a custom Enterprise plan?', answer: 'Absolutely! Contact our sales team to discuss your specific needs. We will create a tailored plan with custom pricing and features.' },
    ];
  }, [cmsData?.faqs]);

  const addOns = useMemo(() => {
    if (cmsData?.pricingAddOns?.length) {
      return cmsData.pricingAddOns.map(a => ({ title: a.title, price: a.price, unit: a.unit }));
    }
    return [
      { title: 'Additional AI Credits', price: '$0.01', unit: 'per credit' },
      { title: 'Additional Voice Minutes', price: '$0.12', unit: 'per minute' },
      { title: 'Additional SMS', price: '$0.02', unit: 'per message' },
      { title: 'Additional Team Members', price: '$25', unit: 'per user/month' },
      { title: 'Additional Storage', price: '$10', unit: 'per 50MB' },
    ];
  }, [cmsData?.pricingAddOns]);

  // Icon mapping for CMS data - maps icon names to Lucide components
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = useMemo(() => ({
    MessageSquare,
    Target,
    Award,
    Calendar,
    Phone,
    Zap,
    Database,
    BarChart3,
    User,
    Trophy,
    FileText,
    Users,
    Send,
    CheckCircle,
    RefreshCw,
    Star,
    TrendingUp,
    Clock,
    Shield,
    Bot,
    Globe,
    Sparkles,
  }), []);

  // Transform CMS testimonials with fallback
  const testimonials = useMemo(() => {
    if (cmsData?.testimonials?.length) {
      return cmsData.testimonials.map((t) => ({
        quote: t.quote,
        author: t.authorName,
        role: `${t.authorRole}${t.companyName ? `, ${t.companyName}` : ''}`,
        rating: t.rating,
        avatarPath: t.avatarPath,
        ...TESTIMONIAL_STYLE,
      }));
    }
    // Fallback testimonials - consistent professional style
    return [
      { quote: 'Qualiflow AI increased our booking rate by 340% in just 3 months. The AI never misses a lead.', author: 'Sarah Johnson', role: 'CEO, TechStart', rating: 5, avatarPath: null, ...TESTIMONIAL_STYLE },
      { quote: 'We used to lose 60% of leads to slow response times. Now our AI responds in seconds, 24/7.', author: 'Michael Chen', role: 'Owner, GrowthCo', rating: 5, avatarPath: null, ...TESTIMONIAL_STYLE },
      { quote: 'The ROI was immediate. We reduced our cost per acquisition by 70% while scaling faster.', author: 'Emily Rodriguez', role: 'CMO, ScaleUp', rating: 5, avatarPath: null, ...TESTIMONIAL_STYLE },
    ];
  }, [cmsData?.testimonials]);

  // Transform CMS feature modules with fallback - enterprise style
  const featureModules = useMemo(() => {
    if (cmsData?.featureModules?.length) {
      return cmsData.featureModules.map((m) => ({
        icon: iconMap[m.iconName] || MessageSquare,
        title: m.title,
        description: m.description,
        ...MODULE_STYLE,
      }));
    }
    // Fallback modules - consistent professional style
    return [
      { icon: MessageSquare, title: 'Omnichannel Lead Capture', description: 'Web Chat, Forms, QR Codes, SMS, Surveys, Phone, Instagram, Facebook — all in one system', ...MODULE_STYLE },
      { icon: Target, title: 'AI Qualification', description: 'AI understands intent, urgency, service needed, budget, timeline automatically', ...MODULE_STYLE },
      { icon: Award, title: 'Lead Scoring', description: 'AI scores each lead 0-100 based on intent signals, behavior, and engagement', ...MODULE_STYLE },
      { icon: Calendar, title: 'Smart Booking + Scheduling', description: 'AI books appointments, sends confirmations, handles reschedules, reduces no-shows', ...MODULE_STYLE },
      { icon: Phone, title: 'AI Outbound Calling', description: 'AI instantly calls, qualifies, books appointments, and recovers missed conversations', ...MODULE_STYLE },
      { icon: Zap, title: 'Journey Automation Engine™', description: 'Autopilot for entire customer lifecycle - decides next steps automatically', ...MODULE_STYLE },
      { icon: Database, title: 'Built-In CRM + AI Segmentation', description: 'Lightweight CRM with contacts, timeline, lists, tags, scoring, and AI summaries', ...MODULE_STYLE },
      { icon: BarChart3, title: 'Analytics & Reporting', description: 'Simple dashboards showing leads, channels, bookings, reviews, and ROI', gradient: 'from-violet-400 to-purple-500', glow: 'group-hover:shadow-violet-500/25' },
    ];
  }, [cmsData?.featureModules, iconMap]);

  // Transform CMS prebuilt journeys with fallback - enterprise style
  const prebuiltJourneys = useMemo(() => {
    if (cmsData?.prebuiltJourneys?.length) {
      return cmsData.prebuiltJourneys.map((j) => ({
        icon: iconMap[j.iconName] || Target,
        title: j.title,
        description: j.description,
        ...JOURNEY_STYLE,
      }));
    }
    // Fallback journeys - consistent professional style
    return [
      { icon: Target, title: 'New Lead Qualification → Booking', description: 'AI responds instantly, qualifies, scores, and books appointments automatically.', ...JOURNEY_STYLE },
      { icon: Phone, title: 'Missed Call Recovery', description: 'When a call is missed, AI sends SMS, email, and can place an outbound call to recover the lead.', ...JOURNEY_STYLE },
      { icon: RefreshCw, title: 'No-Show Recovery', description: 'Automatically re-engages customers who miss appointments and helps them rebook.', ...JOURNEY_STYLE },
      { icon: Star, title: 'Review + Survey Flow', description: 'After completed appointments, AI sends thank-you messages, review requests, and surveys.', ...JOURNEY_STYLE },
      { icon: Zap, title: 'Cold Lead Revival', description: 'AI reactivates leads who stopped responding using smart timing and personalized messaging.', ...JOURNEY_STYLE },
      { icon: Users, title: 'Retention & Re-Engagement', description: 'AI targets inactive customers, offers incentives, and brings them back.', ...JOURNEY_STYLE },
      { icon: FileText, title: 'Proposal Creation + Assignment', description: 'AI creates proposals, assigns reviewers, and tracks review stages automatically.', ...JOURNEY_STYLE },
      { icon: Send, title: 'Proposal Sending + Acceptance', description: 'AI sends proposals, tracks views, accepts/declines, and triggers next actions.', ...JOURNEY_STYLE },
      { icon: CheckCircle, title: 'Abandoned Form Recovery', description: 'When someone starts but does not submit a form, AI follows up instantly to recover them.', ...JOURNEY_STYLE },
      { icon: Trophy, title: 'Post-Purchase Flow', description: 'After the sale, AI provides onboarding messages, upsell opportunities, and retention touchpoints.', ...JOURNEY_STYLE },
    ];
  }, [cmsData?.prebuiltJourneys, iconMap]);

  // Transform CMS lifecycle steps with fallback - enterprise style
  const lifecycleSteps = useMemo(() => {
    if (cmsData?.lifecycleSteps?.length) {
      return cmsData.lifecycleSteps.map((step) => ({
        Icon: iconMap[step.iconName] || User,
       title: step.title,
        ...LIFECYCLE_STYLE,
      }));
    }
    // Fallback lifecycle steps - consistent professional style
    return [
      { Icon: User, title: 'Lead Captured', ...LIFECYCLE_STYLE },
      { Icon: MessageSquare, title: 'AI Responds', ...LIFECYCLE_STYLE },
      { Icon: Target, title: 'AI Qualifies', ...LIFECYCLE_STYLE },
      { Icon: Trophy, title: 'AI Scores', ...LIFECYCLE_STYLE },
      { Icon: Calendar, title: 'AI Books', ...LIFECYCLE_STYLE },
      { Icon: FileText, title: 'Creates Proposal', ...LIFECYCLE_STYLE },
      { Icon: Users, title: 'Assigns Reviewer', ...LIFECYCLE_STYLE },
      { Icon: Send, title: 'Sends Proposal', ...LIFECYCLE_STYLE },
      { Icon: CheckCircle, title: 'Tracks Acceptance', ...LIFECYCLE_STYLE },
      { Icon: RefreshCw, title: 'AI Follows Up', ...LIFECYCLE_STYLE },
      { Icon: Star, title: 'Collects Reviews', ...LIFECYCLE_STYLE },
      { Icon: BarChart3, title: 'CRM Updated', ...LIFECYCLE_STYLE },
    ];
  }, [cmsData?.lifecycleSteps, iconMap]);

  const onNavigate = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const segmentTypes = [
    'Hot Leads',
    'Warm Leads',
    'Cold Leads',
    'Review Ready',
    'VIP Customers',
    'Upsell Opportunities',
    'At-Risk Customers',
    'Monthly Re-engagement',
  ];



  return (
    <div className="min-h-screen bg-white">
      <LandingPageHeader />

      <HeroSection />

      <CustomerLifecycleFlow />

      <ConversationBubblesSection />

      <PrebuiltJourneysSection />
      <VideoCtaSection />

      <CRMBuiltInSection />

      <IntegrationsSection />

      <AnalyticsDashboardSection />

      <SocialProofSection />
      <AutoSegmentationSection />

      <SecurityComplianceSection />

      <VoiceCallSimulatorSection onBookDemo={() => setDemoOpen(true)} />

      {/* Customer Stories / Testimonials Section */}
      <section className="py-28 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0D0A1A 0%, #130D2B 45%, #0F1420 100%)' }}>
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 right-0 w-[700px] h-[500px] rounded-full opacity-[0.08]" style={{ background: '#7C3AED', filter: 'blur(130px)' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full opacity-[0.06]" style={{ background: '#FF5722', filter: 'blur(120px)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] rounded-full opacity-[0.04]" style={{ background: '#9333EA', filter: 'blur(100px)' }} />
          {/* Dot-grid */}
          <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: 'radial-gradient(circle, #a78bfa 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 space-y-5"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border backdrop-blur-sm"
              style={{ background: 'rgba(255,87,34,0.08)', borderColor: 'rgba(255,87,34,0.25)', color: '#FF8A65' }}
            >
              <Star className="size-3.5 fill-orange-400 text-orange-400" />
              Customer Stories
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Loved by{' '}
              <span style={{ background: 'linear-gradient(90deg, #FF5722, #FF8A65)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Growing Businesses
              </span>
            </h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#9B7DCA' }}>
              See how companies are transforming their customer journey with Qualiflow AI
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {cmsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="relative p-7 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="size-4 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <div className="space-y-2.5 mb-6">
                    <div className="h-3.5 rounded w-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    <div className="h-3.5 rounded w-5/6" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    <div className="h-3.5 rounded w-4/6" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    <div className="space-y-1.5">
                      <div className="h-3 rounded w-20" style={{ background: 'rgba(255,255,255,0.07)' }} />
                      <div className="h-3 rounded w-28" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              testimonials.map((testimonial, i) => (
                <motion.div
                  key={`testimonial-${i}`}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative flex flex-col p-7 rounded-2xl transition-all duration-400 hover:-translate-y-1.5"
                  style={{
                    background: 'linear-gradient(145deg, rgba(28,12,70,0.65) 0%, rgba(18,12,38,0.8) 100%)',
                    border: '1px solid rgba(124,58,237,0.18)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 32px rgba(0,0,0,0.35)',
                  }}
                >
                  {/* Top shimmer line */}
                  <div
                    className="absolute top-0 left-6 right-6 h-px rounded-full"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(255,87,34,0.35), transparent)' }}
                  />

                  {/* Hover radial glow */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at top left, rgba(124,58,237,0.1) 0%, transparent 65%)' }}
                  />

                  {/* Large decorative quote */}
                  <div
                    className="absolute top-3 right-5 text-7xl font-serif leading-none select-none"
                    style={{ color: 'rgba(124,58,237,0.12)', fontFamily: 'Georgia, serif' }}
                  >&rdquo;</div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4 relative">
                    {Array.from({ length: testimonial.rating }, (_, j) => (
                      <Star key={`star-${i}-${j}`} className="size-4" style={{ color: '#FF5722', fill: '#FF5722' }} />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="relative flex-1 text-sm leading-relaxed mb-6 italic" style={{ color: '#D4B8FF' }}>
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  {/* Divider */}
                  <div className="h-px mb-5" style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.25), transparent)' }} />

                  {/* Author */}
                  <div className="flex items-center gap-3 relative">
                    {testimonial.avatarPath ? (
                      <Image
                        src={testimonial.avatarPath}
                        alt={testimonial.author}
                        width={40}
                        height={40}
                        className="size-10 rounded-full object-cover shrink-0"
                        style={{ border: '1.5px solid rgba(124,58,237,0.4)' }}
                      />
                    ) : (
                      <div
                        className="size-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white"
                        style={{
                          background: i % 2 === 0
                            ? 'linear-gradient(135deg, #7C3AED, #9333EA)'
                            : 'linear-gradient(135deg, #FF5722, #FF6B35)',
                          border: '1.5px solid rgba(124,58,237,0.35)',
                          boxShadow: i % 2 === 0 ? '0 0 12px rgba(124,58,237,0.35)' : '0 0 12px rgba(255,87,34,0.35)',
                        }}
                      >
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-white leading-tight">{testimonial.author}</p>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: '#8B6DB5' }}>{testimonial.role}</p>
                    </div>
                    {/* Small orange badge */}
                    <div
                      className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: 'rgba(255,87,34,0.15)', color: '#FF8A65', border: '1px solid rgba(255,87,34,0.25)' }}
                    >
                      Verified
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Bottom trust bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-14"
          >
            {[
              { value: '30M+', label: 'Leads Qualified' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '4.9★', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold" style={{ color: '#FF5722' }}>{stat.value}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: '#6B4FA0' }}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>







      {/* Pricing Section */}
      <LandingPricingSection />


      <FAQSection />

      <BlogPreviewSection />

      <FinalCTASection />

      <LandingPageFooter />

      {/* Live Chat Widget */}
      <ChatWidget />
      <DemoBookingModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}