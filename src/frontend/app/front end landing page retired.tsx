'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import {
  Check, X, ArrowRight, DollarSign, Info,
  User, MessageSquare, Target, Trophy, Calendar, FileText,
  Users, Send, CheckCircle, RefreshCw, Star, BarChart3,
  TrendingUp, Clock, Zap, Phone, Database, Award,
  Shield, Play, ChevronUp, Sparkles, Bot, Globe,
  Menu, X as CloseIcon,
  ChevronDown, Briefcase, Smile, Settings, Building, Heart, Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { GradientButton } from '@/components/ui/gradient-button';
import { Logo } from '@/components/shared/logo';
import { usePlans } from '@/hooks/subscriptions/useSubscriptions';
import { useLandingPageData, usePublicBlogs } from '@/hooks/cms/useCms';
import { getDefaultFeatureCategories } from '@/lib/default-feature-categories';
import Image from 'next/image';
import { ChatWidget } from '@/components/landing/chat-widget';

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
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showFeatureComparison, setShowFeatureComparison] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Fetch subscription plans from backend API
  const { data: apiPlans } = usePlans();

  // Fetch CMS data from backend API
  const { data: cmsData, isLoading: cmsLoading } = useLandingPageData();
  const { data: blogPosts } = usePublicBlogs();

  // Get discount percentages from API (use first plan with discounts, or defaults)
  const discounts = useMemo(() => {
    const planWithDiscounts = apiPlans?.find(p => p.discountQuarterly > 0 || p.discountAnnual > 0);
    return {
      quarterly: planWithDiscounts?.discountQuarterly ?? 10,
      annual: planWithDiscounts?.discountAnnual ?? 20,
    };
  }, [apiPlans]);

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

  // Transform CMS feature comparisons into grouped categories
  const featureCategories = useMemo(() => {
    if (cmsData?.featureComparisons?.length) {
      // Group by category
      const grouped: Record<string, { feature: string; freeFlow: string | boolean; smartFlow: string | boolean; ultraFlow: string | boolean; enterprise: string | boolean }[]> = {};

      for (const fc of cmsData.featureComparisons) {
        if (!grouped[fc.category]) {
          grouped[fc.category] = [];
        }
        // Convert ✓/❌ to boolean for consistency with existing renderer
        const parseValue = (val: string): string | boolean => {
          if (val === '✓') return true;
          if (val === '❌') return false;
          return val;
        };
        grouped[fc.category].push({
          feature: fc.featureName,
          freeFlow: parseValue(fc.freeFlowValue),
          smartFlow: parseValue(fc.smartFlowValue),
          ultraFlow: parseValue(fc.ultraFlowValue),
          enterprise: parseValue(fc.enterpriseValue),
        });
      }

      // Convert to array format maintaining order
      const categoryOrder = [
        'Core AI Modules',
        'Communication Channels',
        'Lead Capture Channels',
        'Automation System',
        'Booking System',
        'Reviews & Retention',
        'CRM Integrations',
        'Admin / Dashboard',
        'Onboarding & Training',
      ];

      return categoryOrder
        .filter(cat => grouped[cat])
        .map(cat => ({ category: cat, features: grouped[cat] }));
    }

    // Return fallback hardcoded data if API fails
    return getDefaultFeatureCategories();
  }, [cmsData?.featureComparisons]);

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

  // Pricing plans - Transform CMS data or use fallback matching Figma design
  const pricingPlans = useMemo(() => {
    if (cmsData?.pricingPlans?.length) {
      return cmsData.pricingPlans.map(p => {
        // Parse price from string like "$0" or "$199" or "Custom" to number or null
        const parsePrice = (priceStr: string | number | null | undefined): number | null => {
          if (priceStr === null || priceStr === undefined) return null;
          if (typeof priceStr === 'number') return priceStr;
          if (priceStr.toLowerCase() === 'custom') return null;
          const cleaned = priceStr.replace(/[^0-9.]/g, '');
          return cleaned ? parseFloat(cleaned) : 0;
        };

        // Use features array - split into usage limits (first half) and core features (second half)
        const features = p.features || [];
        const midPoint = Math.ceil(features.length / 2);
        const usageLimits = p.usageLimits?.length ? p.usageLimits : features.slice(0, midPoint);
        const coreFeatures = p.coreFeatures?.length ? p.coreFeatures : features.slice(midPoint);

        const monthlyPrice = parsePrice(p.monthlyPrice);
        const annualPrice = parsePrice(p.annualPrice);
        // Calculate quarterly as 10% discount from monthly if not provided
        const quarterlyPrice = parsePrice(p.quarterlyPrice) ?? (monthlyPrice !== null ? Math.round(monthlyPrice * 0.9) : null);

        return {
          name: p.name,
          slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'),
          description: p.description || '',
          price: {
            monthly: monthlyPrice,
            quarterly: quarterlyPrice,
            annual: annualPrice !== null && monthlyPrice !== null ? Math.round(annualPrice / 12) : (monthlyPrice !== null ? Math.round(monthlyPrice * 0.8) : null),
          },
          annualTotal: annualPrice,
          onboarding: p.onboardingPrice !== null && p.onboardingPrice !== undefined ? {
            price: parsePrice(p.onboardingPrice),
            required: p.onboardingRequired,
          } : null,
          popular: p.isPopular,
          usageLimits,
          coreFeatures,
          ctaText: p.ctaText,
          ctaLink: p.ctaLink,
        };
      });
    }
    // Fallback pricing plans matching Figma design
    return [
      {
        name: 'Free Flow',
        slug: 'free-flow',
        description: 'Perfect for testing Qualiflow AI capabilities',
        price: { monthly: 0, quarterly: 0, annual: 0 },
        onboarding: null,
        usageLimits: [
          '3 test voice calls',
          'Limited SMS',
          '5MB Knowledge Base',
          '1 user',
        ],
        coreFeatures: [
          'Basic widget',
          'Journey builder view-only',
          'Prebuilt journeys (disabled)',
        ],
      },
      {
        name: 'Smart Flow',
        slug: 'smartflow',
        description: 'For growing businesses ready to automate',
        price: { monthly: 199, quarterly: 175, annual: 159 },
        annualTotal: 1908,
        onboarding: { price: 700, required: false },
        usageLimits: [
          '10,000 AI Credits',
          '100 Voice Minutes',
          '500 SMS',
          '20MB Knowledge Base',
          '3 users',
        ],
        coreFeatures: [
          '1 phone number',
          'AI SMS + Chat',
          'AI qualification & scoring',
          'Forms + surveys',
          'Smart booking',
          '2 CRM connections',
        ],
      },
      {
        name: 'Ultra Flow',
        slug: 'ultraflow',
        description: 'Most popular for scaling teams',
        price: { monthly: 699, quarterly: 629, annual: 559 },
        annualTotal: 6708,
        onboarding: { price: 1500, required: true },
        popular: true,
        usageLimits: [
          '35,000 AI Credits',
          '600 Voice Minutes',
          '2,500 SMS',
          '100MB Knowledge Base',
          '7 users',
        ],
        coreFeatures: [
          'Unlimited voice agents',
          'Advanced automations',
          'Multi-calendar routing',
          'Full review engine',
          'All CRM connections',
          'Dedicated success manager',
        ],
      },
      {
        name: 'Enterprise Flow',
        slug: 'enterprise',
        description: 'For large organizations with custom needs',
        price: { monthly: null, quarterly: null, annual: null },
        onboarding: null,
        usageLimits: [
          'Custom AI Credits',
          'Custom Voice Minutes',
          'Custom SMS',
          'Custom Knowledge Base',
          'Custom users',
        ],
        coreFeatures: [
          'Unlimited CRM connections',
          'Custom AI training',
          'SOC2-ready security',
          'Custom integrations',
          'AI model selection',
          'Priority support + SLAs',
        ],
      },
    ];
  }, [cmsData?.pricingPlans]);

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        {/* Top bar - dark purple, Sign In + Get Started */}
        <div className="bg-[#1E0A4C]">
          <div className="container mx-auto flex h-16 items-center justify-end px-4 md:px-8 lg:px-16">
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center min-w-[130px] h-11 px-6 rounded-lg border border-white/25 bg-white/5 text-sm font-semibold text-white hover:bg-white/15 hover:border-white/40 transition-all shadow-lg hover:-translate-y-0.5"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center min-w-[140px] h-11 px-6 rounded-lg bg-gradient-to-r from-[#FF5722] to-[#FF6B35] hover:from-[#E64A19] hover:to-[#FF5722] text-white text-sm font-semibold shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className={cn(
          "transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm"
            : "bg-white/80 backdrop-blur-md border-b border-gray-100/50"
        )}>
        <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-8 lg:px-16">
          <Logo href="/" showText={true} size="md" variant="default" animated={false} />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-20 ml-12">
            {/* Platform Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'product' ? null : 'product')}
                className="text-gray-600 hover:text-purple-700 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                Platform <ChevronDown className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {activeDropdown === 'product' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="absolute top-full left-0 mt-2 w-72 bg-[#1E0A4C] rounded-xl shadow-2xl shadow-purple-900/40 border border-purple-700/30 py-2 z-50"
                    >
                      <button onClick={() => { onNavigate('how-it-works'); }} className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors rounded-sm mx-0">How It Works</button>
                      <button onClick={() => { onNavigate('journey-automation'); }} className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors">Journey Automation Engine™</button>
                      <button onClick={() => { onNavigate('ai-conversational'); }} className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors">AI Conversational Engagement</button>
                      <button onClick={() => { onNavigate('ai-voice'); }} className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors">AI Voice (Inbound & Outbound)</button>
                      <button onClick={() => { onNavigate('omnichannel-capture'); }} className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors">Omnichannel Lead Capture</button>
                      <button onClick={() => { onNavigate('ai-social'); }} className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors">AI Social Engagement</button>
                      <button onClick={() => { onNavigate('crm-segmentation'); }} className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors">Built-In CRM + AI Powered Lead Scoring</button>
                      <button onClick={() => { onNavigate('smart-booking'); }} className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors">Smart Booking & Calendar Automation</button>
                      <button onClick={() => { onNavigate('proposals-automation'); }} className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors">Proposals Automation</button>
                      <button onClick={() => { onNavigate('reviews-surveys'); }} className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors">Reviews, Surveys & Re-Engagement</button>
                      <button onClick={() => { onNavigate('integrations'); }} className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors">Integrations</button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Solutions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'solutions' ? null : 'solutions')}
                className="text-gray-600 hover:text-purple-700 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                Solutions <ChevronDown className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {activeDropdown === 'solutions' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="absolute top-full left-0 mt-2 bg-[#1E0A4C] rounded-xl shadow-2xl shadow-purple-900/40 border border-purple-700/30 py-6 z-50 w-[500px]"
                    >
                      <div className="flex gap-0">
                        {/* Industries Column */}
                        <div className="px-6 pr-8 min-w-[220px]">
                          <div className="mb-4 text-xs font-semibold text-purple-400 uppercase tracking-wider">Industries</div>
                          <div className="space-y-3">
                            <button onClick={() => { onNavigate('industry-service-home'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <Briefcase className="w-4 h-4 text-purple-400" /><span className="text-sm">Service & Home Improvement</span>
                            </button>
                            <button onClick={() => { onNavigate('industry-beauty-wellness'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <Smile className="w-4 h-4 text-purple-400" /><span className="text-sm">Beauty, Wellness & Personal Care</span>
                            </button>
                            <button onClick={() => { onNavigate('industry-automotive'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <Settings className="w-4 h-4 text-purple-400" /><span className="text-sm">Automotive</span>
                            </button>
                            <button onClick={() => { onNavigate('industry-auto-dealerships'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <Settings className="w-4 h-4 text-purple-400" /><span className="text-sm">Auto Dealerships</span>
                            </button>
                            <button onClick={() => { onNavigate('industry-real-estate'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <Building className="w-4 h-4 text-purple-400" /><span className="text-sm">Real Estate & Property</span>
                            </button>
                            <button onClick={() => { onNavigate('industry-healthcare'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <Heart className="w-4 h-4 text-purple-400" /><span className="text-sm">Healthcare & Clinics</span>
                            </button>
                            <button onClick={() => { onNavigate('industry-professional-services'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <Briefcase className="w-4 h-4 text-purple-400" /><span className="text-sm">Professional Services</span>
                            </button>
                            <button onClick={() => { onNavigate('industry-retail-ecommerce'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <Package className="w-4 h-4 text-purple-400" /><span className="text-sm">Retail & E-commerce</span>
                            </button>
                            <button onClick={() => { onNavigate('industry-saas-b2b'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <Zap className="w-4 h-4 text-purple-400" /><span className="text-sm">SaaS, Tech & B2B</span>
                            </button>
                            <button onClick={() => { onNavigate('industry-other'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <Star className="w-4 h-4 text-purple-400" /><span className="text-sm">Other</span>
                            </button>
                          </div>
                        </div>
                        {/* Divider */}
                        <div className="w-px bg-purple-700/30 self-stretch mx-0" />
                        {/* Use Cases Column */}
                        <div className="px-6 min-w-[220px]">
                          <div className="mb-4 text-xs font-semibold text-purple-400 uppercase tracking-wider">Use Cases</div>
                          <div className="space-y-3">
                            <button onClick={() => { onNavigate('ai-voice'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <span className="text-sm">🤖</span><span className="text-sm">AI Phone Receptionist</span>
                            </button>
                            <button onClick={() => { onNavigate('omnichannel-capture'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <span className="text-sm">⚡</span><span className="text-sm">Instant Lead Response</span>
                            </button>
                            <button onClick={() => { onNavigate('smart-booking'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <span className="text-sm">📅</span><span className="text-sm">Automate Appointment Booking</span>
                            </button>
                            <button onClick={() => { onNavigate('proposals-automation'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <span className="text-sm">📄</span><span className="text-sm">Proposal Automation</span>
                            </button>
                            <button onClick={() => { onNavigate('reviews-surveys'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <span className="text-sm">⭐</span><span className="text-sm">Collect More Reviews</span>
                            </button>
                            <button onClick={() => { onNavigate('journey-automation'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <span className="text-sm">🔄</span><span className="text-sm">Re-engage Cold Leads</span>
                            </button>
                            <button onClick={() => { onNavigate('smart-booking'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <span className="text-sm">🚫</span><span className="text-sm">Reduce No-Shows</span>
                            </button>
                            <button onClick={() => { onNavigate('omnichannel-capture'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <span className="text-sm">📊</span><span className="text-sm">Qualify Leads 24/7</span>
                            </button>
                            <button onClick={() => { onNavigate('omnichannel-capture'); }} className="w-full flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-left px-2 py-1 rounded-md">
                              <span className="text-sm">💬</span><span className="text-sm">Omnichannel Inbox</span>
                            </button>
                            <a href="#boost-conversions" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 text-purple-100 hover:text-white hover:bg-white/10 transition-colors px-2 py-1 rounded-md">
                              <span className="text-sm">🎯</span><span className="text-sm">Boost Conversions</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'resources' ? null : 'resources')}
                className="text-gray-600 hover:text-purple-700 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                Resources <ChevronDown className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {activeDropdown === 'resources' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="absolute top-full left-0 mt-2 w-56 bg-[#1E0A4C] rounded-xl shadow-2xl shadow-purple-900/40 border border-purple-700/30 py-2 z-50"
                    >
                      <button onClick={() => { onNavigate('blog'); }} className="block w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors">Blog</button>
                      <button onClick={() => { onNavigate('help-center'); }} className="block w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors">Help Center</button>
                      <button onClick={() => { onNavigate('webinars'); }} className="block w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors">Webinars</button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Company Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'company' ? null : 'company')}
                className="text-gray-600 hover:text-purple-700 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                Company <ChevronDown className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {activeDropdown === 'company' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="absolute top-full left-0 mt-2 w-56 bg-[#1E0A4C] rounded-xl shadow-2xl shadow-purple-900/40 border border-purple-700/30 py-2 z-50"
                    >
                      <button onClick={() => { onNavigate('about-us'); }} className="block w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors">About Us</button>
                      <button onClick={() => { onNavigate('careers'); }} className="block w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-white/10 hover:text-white transition-colors">Careers</button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => onNavigate('pricing')} className="text-gray-600 hover:text-purple-700 transition-colors text-sm font-medium">Pricing</button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {mobileMenuOpen ? <CloseIcon className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
        </div>{/* end Main Navigation Bar wrapper */}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-4">
            <nav className="flex flex-col gap-2">
              {['Features', 'Modules', 'Journeys', 'Pricing'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                >
                  {item}
                </a>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-4 flex flex-col gap-2">
                <Link href="/login" className="px-4 py-3 text-base font-medium text-gray-600 text-center">
                  Sign in
                </Link>
                <GradientButton asChild className="mx-4">
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                </GradientButton>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section - Brand Gradient */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-32 md:pt-36 pb-16 gradient-landing-hero">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.05) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container relative mx-auto px-6 md:px-8 lg:px-16 xl:px-24 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-20 lg:gap-24 xl:gap-32 items-center">
            {/* Left: Hero Content */}
            <div className="text-center lg:text-left space-y-12">
              {/* Announcement Badge - Enterprise Style */}
              <div>
                <div className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white border-2 border-primary/20 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 cursor-pointer">
                  <Sparkles className="size-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-semibold text-gray-700">AI-Powered Automation</span>
                </div>
              </div>

              <div className="space-y-10">
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 leading-[1.06]">
                  Never Miss a Lead
                  <span className="block mt-5 text-gray-900">
                    Revenue on Autopilot
                  </span>
                </h1>

                <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Qualiflow AI captures, qualifies, books, and follows up with leads <span className="font-semibold text-gray-900">automatically</span> — across SMS, voice, email, and chat. Your AI sales team never sleeps.
                </p>
              </div>

              {/* CTA Buttons - Enterprise Grade */}
              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                  <Link
                    href="/register"
                    className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full gradient-brand text-white font-bold text-lg shadow-brand-lg hover:shadow-brand-xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 whitespace-nowrap"
                  >
                    Get Started Free
                    <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <button className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full border-2 border-gray-300 bg-white text-gray-900 font-semibold text-lg hover:border-primary hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap">
                    <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <Play className="size-5 text-gray-700 group-hover:text-white ml-0.5 transition-colors duration-300" fill="currentColor" />
                    </div>
                    Watch Demo
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-10 text-sm text-gray-600">
                  <div className="flex items-center gap-2.5">
                    <Check className="size-5 text-green-500" />
                    <span className="font-medium">Free plan available</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="size-5 text-green-500" />
                    <span className="font-medium">No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Shield className="size-5 text-green-500" />
                    <span className="font-medium">SOC 2 Compliant</span>
                  </div>
                </div>
              </div>

              {/* Customer Count Badge */}
              <div>
                <div className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-white border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex -space-x-2.5">
                    {['bg-gradient-to-br from-blue-400 to-blue-500', 'bg-gradient-to-br from-green-400 to-green-500', 'bg-gradient-to-br from-purple-400 to-purple-500', 'bg-gradient-to-br from-indigo-400 to-indigo-500'].map((color, i) => (
                      <div key={i} className={`size-9 rounded-full ${color} ring-2 ring-white flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">2,000+ businesses</p>
                    <p className="text-xs text-gray-600">trust Qualiflow AI daily</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Interactive Dashboard Preview */}
            <div className="relative">
              {/* Floating notification */}
              <div className="absolute -top-4 -left-4 md:left-0 z-20 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white shadow-2xl border-2 border-green-200 hover:shadow-elevation-xl transition-shadow duration-300">
                  <div className="size-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                    <Check className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">New lead qualified!</p>
                    <p className="text-xs text-gray-500">Sarah J. • Score: 94</p>
                  </div>
                </div>
              </div>

              {/* Main Dashboard Card */}
              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 md:p-8 hover:shadow-elevation-xl transition-shadow duration-500">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Performance</h3>
                    <p className="text-sm text-gray-500">Real-time AI activity</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                    <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-green-700">Live</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="group p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">47</div>
                    <div className="text-sm text-gray-600">Leads Today</div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-success">
                      <TrendingUp className="size-3" />
                      23% vs yesterday
                    </div>
                  </div>
                  <div className="group p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">12</div>
                    <div className="text-sm text-gray-600">Booked</div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-success">
                      <TrendingUp className="size-3" />
                      18% conversion
                    </div>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Live Activity</p>
                  <div className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300 cursor-pointer">
                    <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Bot className="size-5 text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">AI qualifying Mike Chen</p>
                      <p className="text-xs text-gray-500">SMS conversation • 2m ago</p>
                    </div>
                    <div className="px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-medium">
                      In Progress
                    </div>
                  </div>
                  <div className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-white border border-green-200 hover:border-green-300 hover:shadow-sm transition-all duration-300 cursor-pointer">
                    <div className="size-10 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="size-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Appointment booked</p>
                      <p className="text-xs text-gray-500">Lisa R. • Tomorrow 2PM</p>
                    </div>
                    <div className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      Confirmed
                    </div>
                  </div>
                </div>

                {/* AI Status Bar */}
                <div className="mt-6 p-4 rounded-2xl gradient-brand text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Sparkles className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">AI Assistant Active</p>
                        <p className="text-xs text-gray-400">Handling 8 conversations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">24/7</p>
                      <p className="text-xs text-gray-400">Always on</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-4 -right-4 md:right-0 z-20">
                <div className="px-4 py-3 rounded-2xl bg-white shadow-2xl border-2 border-primary/20 hover:shadow-elevation-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full gradient-brand flex items-center justify-center shadow-lg">
                      <TrendingUp className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">+340% ROI</p>
                      <p className="text-xs text-gray-500">This month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Logo Cloud */}
      <section className="py-24 border-y border-gray-100 bg-gray-50">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
          <p className="text-center text-sm font-medium text-gray-500 mb-12">
            Trusted by <span className="text-gray-900 font-semibold">2,000+</span> businesses worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
            {trustedCompanies.map((company, i) => (
              <div key={i} className="group px-8 py-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300">
                <span className="text-lg md:text-xl font-bold text-gray-400 group-hover:text-gray-900 transition-colors">{company}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-gray-900">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
            {animatedStats.map((stat, i) => (
              <div key={i} className="group relative p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-center">
                <div className="relative">
                  <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base text-gray-400 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Customer Lifecycle Automation */}
      <section id="lifecycle" className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
          <div className="text-center mb-24 space-y-7">
            <Badge className="mb-6 bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100 px-5 py-2.5">
              <Globe className="size-4 mr-2" />
              End-to-End Automation
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-[1.08] tracking-tight">
              Complete Customer Lifecycle
              <span className="block mt-4 text-gray-900">
                Automated
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              AI handles everything from first touch to loyal customer — automatically
            </p>
          </div>

          {/* Lifecycle Steps as Connected Flow */}
          <div className="relative max-w-6xl mx-auto">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-[45%] left-8 right-8">
              <div className="h-0.5 bg-gray-200 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {lifecycleSteps.map((step, index) => {
                const StepIcon = step.Icon;
                return (
                  <div key={`lifecycle-${index}`} className="group relative">
                    {/* Step Number */}
                    <div className="absolute -top-2 -right-2 z-10 size-6 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-500">{index + 1}</span>
                    </div>

                    <div className="relative flex flex-col items-center p-5 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                      <div className="relative size-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-all duration-300">
                        <StepIcon className="size-7 text-gray-700" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 text-center leading-tight">{step.title}</span>

                      {/* Arrow indicator for larger screens */}
                      <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-gray-300 transition-colors">
                        {index < 11 && index % 6 !== 5 && <ArrowRight className="size-4" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Perfect For Businesses Section */}
      <section id="features" className="py-32 bg-gray-50">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
          <div className="text-center mb-24 space-y-7">
            <Badge className="mb-4 bg-white text-gray-700 border-gray-200 hover:bg-white shadow-sm px-5 py-2.5">
              <Zap className="size-4 mr-2" />
              Built for Growth
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-[1.08] tracking-tight">
              Perfect For Businesses That Need
              <span className="block mt-4 text-gray-900">
                Scalable Growth
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Automate your entire customer journey without hiring more staff
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Calendar, title: 'Appointments', description: 'Automated booking & scheduling 24/7' },
              { icon: Users, title: 'Customer Engagement', description: 'Multi-channel conversations at scale' },
              { icon: Clock, title: '24/7 Instant Replies', description: 'AI responds in seconds, never miss a lead' },
              { icon: TrendingUp, title: 'More Revenue', description: 'Increase conversions without more staff' },
            ].map((feature, index) => (
              <div key={index} className="group relative p-8 rounded-3xl bg-white border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                {/* Number badge */}
                <div className="absolute -top-3 -right-3 size-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 ring-4 ring-white shadow-sm">
                  {index + 1}
                </div>

                <div className="relative">
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className="relative bg-gray-50 size-16 rounded-2xl flex items-center justify-center border border-gray-200 group-hover:scale-105 transition-transform">
                      <feature.icon className="size-8 text-gray-700" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>

                  {/* Learn more CTA */}
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-400 group-hover:text-primary transition-colors">
                    <span>Learn more</span>
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 Powerful Modules */}
      <section id="modules" className="py-32 bg-gray-900">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
          <div className="text-center mb-24 space-y-7">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/10 px-5 py-2.5">
              <Sparkles className="size-4 mr-2" />
              Comprehensive Platform
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.08] tracking-tight">
              8 Powerful Modules
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Everything you need to automate your customer journey in one platform
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cmsLoading ? (
              // Skeleton loading state for modules
              Array.from({ length: 8 }).map((_, i) => (
                <div key={`module-skeleton-${i}`} className="relative p-6 rounded-3xl bg-white/5 border border-white/10 animate-pulse">
                  <div className="size-16 rounded-2xl bg-white/10 mb-5" />
                  <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
                  <div className="space-y-2">
                    <div className="h-3 bg-white/10 rounded w-full" />
                    <div className="h-3 bg-white/10 rounded w-5/6" />
                  </div>
                  <div className="mt-4 h-4 bg-white/10 rounded w-24" />
                </div>
              ))
            ) : (
              featureModules.map((module, index) => {
                const IconComponent = module.icon;
                return (
                  <div key={`module-${index}`} className="group relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                    {/* Icon */}
                    <div className="relative mb-5">
                      <div className="relative size-16 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
                        <IconComponent className="size-8 text-white" />
                      </div>
                    </div>

                    <h3 className="relative text-lg font-bold text-white mb-3">{module.title}</h3>
                    <p className="relative text-sm text-gray-400 leading-relaxed">{module.description}</p>

                    {/* Learn More Link */}
                    <div className="relative mt-4 flex items-center gap-2 text-sm font-medium text-gray-500 group-hover:text-primary transition-colors">
                      <span>Learn more</span>
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 10 Prebuilt Journeys */}
      <section id="journeys" className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
          <div className="text-center mb-24 space-y-7">
            <Badge className="mb-4 bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100 px-5 py-2.5">
              <Zap className="size-4 mr-2" />
              Ready-to-Use Workflows
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-[1.08] tracking-tight">
              10 Prebuilt Journeys
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Turn on powerful automation in seconds — no configuration needed
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {prebuiltJourneys.map((journey, index) => {
              const JourneyIcon = journey.icon;
              return (
                <div key={`journey-${index}`} className="group relative p-5 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  {/* Number badge */}
                  <div className="absolute top-3 right-3 size-6 rounded-full bg-gray-50 flex items-center justify-center shadow-sm border border-gray-200">
                    <span className="text-[10px] font-bold text-gray-400">{index + 1}</span>
                  </div>

                  <div className="relative size-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-all duration-300">
                    <JourneyIcon className="size-6 text-gray-700" />
                  </div>
                  <h3 className="relative text-sm font-bold text-gray-900 mb-2 leading-tight pr-6">{journey.title}</h3>
                  <p className="relative text-xs text-gray-600 leading-relaxed">{journey.description}</p>

                  {/* Activate button on hover */}
                  <div className="relative mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <span>Activate</span>
                      <ArrowRight className="size-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Auto-Segmentation Feature */}
      <section id="ai-segmentation" className="py-32 bg-gray-50">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
          <div className="grid gap-20 lg:gap-24 xl:gap-32 lg:grid-cols-2 items-center">
            {/* Left: Description */}
            <div>
              <Badge className="mb-8 bg-white text-gray-700 border-gray-200 hover:bg-white shadow-sm px-5 py-2.5">
                <Bot className="size-4 mr-2" />
                Smart Segmentation
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-8 leading-[1.08] tracking-tight">
                AI Creates & Manages Lists
                <span className="block mt-4 text-gray-900">
                  Automatically
                </span>
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed">
                Qualiflow AI&apos;s AI automatically segments your contacts, maintains lists, and keeps everything organized without lifting a finger.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {segmentTypes.map((type, index) => (
                  <div key={`segment-${index}`} className="group flex items-center gap-3 p-4 rounded-xl bg-white border-2 border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 hover:-translate-y-1 transition-all duration-300">
                    <div className="relative size-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Check className="size-5 text-gray-700" />
                    </div>
                    <span className="relative text-sm font-semibold text-gray-700 transition-colors">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dashboard Mockup */}
            <div className="relative">

              <div className="relative bg-white rounded-3xl shadow-lg border-2 border-gray-200 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">AI Auto-Segmentation</h3>
                    <p className="text-sm text-gray-500">Real-time list management</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success-bg border border-success/20">
                    <div className="size-2.5 rounded-full bg-success animate-pulse" />
                    <span className="text-xs font-semibold text-success-dark">Active</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Hot Leads', count: 47, change: '+12' },
                    { name: 'Warm Leads', count: 32, change: '+8' },
                    { name: 'VIP Customers', count: 29, change: '+3' },
                    { name: 'Review Ready', count: 64, change: '+5' },
                  ].map((segment, i) => (
                    <div key={i} className="group flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-sm hover:border-gray-300 transition-all duration-300">
                      <div className="size-4 rounded-full bg-gray-400 ring-4 ring-white shadow-sm" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{segment.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{segment.count}</p>
                      </div>
                      <div className="px-3 py-1.5 rounded-full bg-success-bg text-success-dark text-xs font-bold border border-success/20">
                        {segment.change}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-5 rounded-2xl bg-gray-900 flex items-center justify-between">
                  <div className="relative">
                    <p className="text-sm text-gray-400 font-medium">Total Contacts</p>
                    <p className="text-4xl font-bold text-white">183</p>
                  </div>
                  <div className="relative px-4 py-2 rounded-full bg-success/10 text-success text-sm font-bold border border-success/20">
                    +28 this week
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
          <div className="text-center mb-24 space-y-7">
            <Badge className="mb-4 bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100 px-5 py-2.5">
              <Star className="size-4 mr-2" />
              Customer Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-[1.08] tracking-tight">
              Loved by Growing
              <span className="block mt-4 text-gray-900">
                Businesses
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              See how companies are transforming their customer journey with Qualiflow AI
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {cmsLoading ? (
              // Skeleton loading state
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="relative p-8 rounded-3xl bg-gray-50 border-2 border-gray-100 animate-pulse">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="size-5 rounded bg-gray-200" />
                    ))}
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 rounded w-4/6" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-full bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24" />
                      <div className="h-3 bg-gray-200 rounded w-32" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              testimonials.map((testimonial, i) => (
                <div key={`testimonial-${i}`} className="group relative p-8 rounded-3xl bg-white border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  {/* Quote icon */}
                  <div className="absolute -top-4 -left-2 text-6xl font-serif text-gray-200 transition-colors">&ldquo;</div>

                  {/* Number badge */}
                  <div className="absolute -top-3 -right-3 size-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 ring-4 ring-white shadow-sm">
                    {i + 1}
                  </div>

                  <div className="relative">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }, (_, j) => (
                        <Star key={`star-${i}-${j}`} className="size-5 text-warning fill-warning" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed text-lg font-medium">&quot;{testimonial.quote}&quot;</p>
                    <div className="flex items-center gap-4">
                      {testimonial.avatarPath ? (
                        <Image
                          src={testimonial.avatarPath}
                          alt={testimonial.author}
                          width={56}
                          height={56}
                          className="size-14 rounded-full object-cover shadow-sm ring-4 ring-white"
                        />
                      ) : (
                        <div className="size-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-lg shadow-sm ring-4 ring-white">
                          {testimonial.author.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900">{testimonial.author}</p>
                        <p className="text-sm text-gray-500 font-medium">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section id="demo" className="py-32 bg-gray-900">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
          <div className="text-center mb-20 space-y-7">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/10 px-5 py-2.5">
              <Play className="size-4 mr-2" />
              See It in Action
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.08] tracking-tight">
              Watch Qualiflow AI Work Its Magic     
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              From lead capture to booking in under 2 minutes. 
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Video Placeholder */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-800 border border-white/10 shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="group size-20 rounded-full bg-brand-purple flex items-center justify-center hover:bg-brand-purple/90 transition-all hover:scale-110 shadow-lg">
                  <Play className="size-8 text-white ml-1" fill="white" />
                </button>
              </div>
              {/* Demo preview grid */}
              <div className="absolute inset-0 p-8 grid grid-cols-3 gap-4 opacity-20">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/10 rounded-xl" />
                ))}
              </div>
            </div>

            {/* CTA below video */}
            <div className="mt-12 text-center">
              <Link href="/register" className="inline-flex items-center gap-2 px-10 py-5 rounded-full gradient-brand text-white font-bold text-lg shadow-brand-lg hover:shadow-brand-xl transition-all hover:scale-105">
                Get Started Free
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="mt-4 text-sm text-gray-400">No credit card required • Free plan available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-gray-50">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
          <div className="text-center mb-20 space-y-7">
            <Badge className="mb-4 bg-white text-gray-700 border-gray-200 hover:bg-white shadow-sm px-5 py-2.5">
              <DollarSign className="size-4 mr-2" />
              Simple Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-[1.08] tracking-tight">
              Simple, Transparent{' '}
              <span className="text-gray-900">
                Pricing
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Start free. Only pay when you scale. No hidden fees.
            </p>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center p-1 rounded-lg bg-gray-100">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={cn(
                  'px-6 py-2 rounded-md text-sm font-medium transition-all',
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Monthly
              </button>
                <button
                onClick={() => setBillingPeriod('quarterly')}
                className={cn(
                  'px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                  billingPeriod === 'quarterly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Quarterly
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-success-bg text-success-dark">
                  Save {discounts.quarterly}%
                </span>
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={cn(
                  'px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                  billingPeriod === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Annual
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-success-bg text-success-dark">
                  Save {discounts.annual}%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards - Figma Design */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto items-stretch">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={cn(
                  "group relative p-6 rounded-2xl transition-all duration-300 flex flex-col",
                  plan.popular
                    ? "bg-gray-900 text-white shadow-xl border-2 border-brand-purple"
                    : "bg-white border border-gray-200 hover:shadow-md hover:border-gray-300"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-brand-purple text-white text-xs font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Header section with fixed height */}
                <div className="relative pt-2">
                  <h3 className={cn("text-2xl font-bold mb-2 tracking-tight", plan.popular ? "text-white" : "text-gray-900")}>
                    {plan.name}
                  </h3>
                  <p className={cn("text-sm leading-relaxed mb-6 min-h-[44px]", plan.popular ? "text-white/80" : "text-gray-500")}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className={cn("text-4xl font-bold tracking-tight", plan.popular ? "text-white" : "text-gray-900")}>
                      {plan.price.monthly === null ? 'Custom' : plan.price.monthly === 0 ? '$0' : `$${plan.price[billingPeriod] ?? plan.price.monthly}`}
                    </span>
                    {plan.price.monthly !== null && (
                      <span className={cn("text-sm font-medium", plan.popular ? "text-white/70" : "text-gray-500")}>
                        /month
                      </span>
                    )}
                  </div>
                  {/* Pricing variants container */}
                  <div className="mb-6">
                    {plan.price.monthly !== null && plan.price.monthly > 0 && (
                      <div className={cn("text-xs leading-relaxed space-y-1.5 mb-3", plan.popular ? "text-white/60" : "text-gray-400")}>
                        <p className={cn(billingPeriod === 'monthly' && 'font-semibold', plan.popular ? "text-white/80" : "text-gray-600")}>${plan.price.monthly}/mo monthly</p>
                        <p className={cn(billingPeriod === 'quarterly' && 'font-semibold', plan.popular ? "text-white/80" : "text-gray-600")}>${plan.price.quarterly ?? Math.round(plan.price.monthly * 0.9)}/mo billed quarterly</p>
                        <p className={cn(billingPeriod === 'annual' && 'font-semibold', plan.popular ? "text-white/80" : "text-gray-600")}>${plan.price.annual ?? Math.round(plan.price.monthly * 0.8)}/mo billed annually</p>
                      </div>
                    )}
                    {plan.onboarding && plan.onboarding.price && plan.onboarding.price > 0 ? (
                      <p className={cn("text-xs font-medium", plan.popular ? "text-white/70" : "text-gray-500")}>
                        {plan.onboarding.required ? 'Onboarding required:' : 'Optional onboarding:'} ${plan.onboarding.price.toLocaleString()}
                      </p>
                    ) : plan.price.monthly === 0 ? (
                      <p className={cn("text-xs font-medium", plan.popular ? "text-white/70" : "text-gray-500")}>
                        no onboarding required
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* CTA Button - fixed position after header */}
                <Link
                  href={plan.price.monthly === null ? '/contact' : `/register?plan=${plan.slug}`}
                  className={cn(
                    "block w-full py-3.5 px-4 rounded-xl text-center text-sm font-semibold transition-all mb-8",
                    plan.popular
                      ? "bg-brand-purple text-white hover:bg-brand-purple/90 shadow-md"
                      : plan.price.monthly === null
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : plan.price.monthly === 0
                          ? "border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                  )}
                >
                  {plan.price.monthly === null
                    ? 'Contact Us'
                    : `Start with ${plan.name}`}
                </Link>

                {/* Features section - grows to fill remaining space */}
                <div className="flex-1 flex flex-col">
                  {/* Usage Limits */}
                  <div className="relative mb-6">
                    <p className={cn("text-[11px] font-bold uppercase tracking-wider mb-4", plan.popular ? "text-white/70" : "text-gray-400")}>
                      Usage Limits
                    </p>
                    <ul className="space-y-2.5">
                      {plan.usageLimits.map((limit, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className={cn("size-4 shrink-0 mt-0.5", plan.popular ? "text-brand-purple" : "text-gray-700")} />
                          <span className={cn("text-[13px] leading-snug", plan.popular ? "text-white/90" : "text-gray-600")}>
                            {limit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Core Features */}
                  <div className="relative">
                    <p className={cn("text-[11px] font-bold uppercase tracking-wider mb-4", plan.popular ? "text-white/70" : "text-gray-400")}>
                      Core Features
                    </p>
                    <ul className="space-y-2.5">
                      {plan.coreFeatures.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className={cn("size-4 shrink-0 mt-0.5", plan.popular ? "text-brand-purple" : "text-gray-700")} />
                          <span className={cn("text-[13px] leading-snug", plan.popular ? "text-white/90" : "text-gray-600")}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Compare All Features Button */}
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setShowFeatureComparison(!showFeatureComparison)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all"
            >
              {showFeatureComparison ? 'Hide Features' : 'Compare All Features'}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      {showFeatureComparison && (
      <section id="compare-features" className="py-28 bg-white">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 xl:px-20">
          <div className="text-center mb-20 space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Compare All Features
            </h3>
            <p className="text-lg text-gray-600">See exactly what you get with each plan</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Feature</th>
                  <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Free Flow</th>
                  <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Smart Flow</th>
                  <th className="p-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wide bg-gray-50">Ultra Flow</th>
                  <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {featureCategories.map((category, catIndex) => (
                  <React.Fragment key={`cat-${catIndex}`}>
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="p-3 text-sm font-semibold text-gray-900">
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((row, rowIndex) => (
                      <tr key={`row-${catIndex}-${rowIndex}`} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 text-sm text-gray-600">{row.feature}</td>
                        <td className="p-4 text-center text-sm text-gray-600">
                          {typeof row.freeFlow === 'boolean' ? (
                            row.freeFlow ? (
                              <Check className="size-4 text-success mx-auto" />
                            ) : (
                              <X className="size-4 text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-gray-700">{row.freeFlow}</span>
                          )}
                        </td>
                        <td className="p-4 text-center text-sm text-gray-600">
                          {typeof row.smartFlow === 'boolean' ? (
                            row.smartFlow ? (
                              <Check className="size-4 text-success mx-auto" />
                            ) : (
                              <X className="size-4 text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-gray-700">{row.smartFlow}</span>
                          )}
                        </td>
                        <td className="p-4 text-center text-sm bg-gray-50">
                          {typeof row.ultraFlow === 'boolean' ? (
                            row.ultraFlow ? (
                              <Check className="size-4 text-success mx-auto" />
                            ) : (
                              <X className="size-4 text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="font-medium text-gray-900">{row.ultraFlow}</span>
                          )}
                        </td>
                        <td className="p-4 text-center text-sm text-gray-600">
                          {typeof row.enterprise === 'boolean' ? (
                            row.enterprise ? (
                              <Check className="size-4 text-success mx-auto" />
                            ) : (
                              <X className="size-4 text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-gray-700">{row.enterprise}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hide button at bottom */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowFeatureComparison(false)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:border-gray-300 hover:text-gray-900 transition-all"
            >
              Hide Comparison
              <ChevronUp className="size-4" />
            </button>
          </div>
        </div>
      </section>
      )}

      {/* Add-Ons Section */}
      <section id="addons" className="py-28 bg-white relative">
        <div className="container relative mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
          <div className="text-center mb-20 space-y-7">
            <Badge className="mb-4 bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100 px-5 py-2.5">
              <DollarSign className="size-4 mr-2" />
              Flexible Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-[1.08] tracking-tight">
              Add-Ons & Overage Pricing
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Need more? Add extra resources to any plan with transparent pricing
            </p>
          </div>

          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-6xl mx-auto mb-12">
            {addOns.map((addon, index) => (
              <div key={index} className="group relative p-5 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                {/* Number badge */}
                <div className="absolute -top-2 -right-2 size-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 ring-2 ring-white shadow-sm">
                  {index + 1}
                </div>

                <div className="relative text-center">
                  <h3 className="text-xs font-bold text-gray-900 mb-2 leading-tight">{addon.title}</h3>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {addon.price}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">{addon.unit}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Overage Info */}
          <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-gray-50 border-2 border-gray-200 shadow-sm">
            <div className="flex gap-4 items-start">
              <div className="size-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <Info className="size-5 text-gray-700" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-2">Transparent Overage Pricing</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  When you exceed your plan limits, we automatically apply fair overage pricing:{' '}
                  <span className="font-semibold text-gray-900">SMS ($0.015)</span>,{' '}
                  <span className="font-semibold text-gray-900">AI Interactions ($0.012)</span>,{' '}
                  <span className="font-semibold text-gray-900">Voice ($0.08/min)</span>. 
                  You&apos;ll receive alerts at 80% and 100% usage — no surprises.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-gray-50">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
          <div className="text-center mb-24 space-y-7">
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-[1.08] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about Qualiflow AI
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2">
            {faqs.map((faq, index) => (
              <div key={index} className="group relative p-7 rounded-3xl bg-white border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                {/* Number badge */}
                <div className="absolute -top-3 -left-3 size-8 rounded-full gradient-brand flex items-center justify-center text-sm font-bold text-white ring-4 ring-white shadow-lg">
                  {index + 1}
                </div>

                <div className="relative">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Enterprise Grade */}
      <section id="cta" className="py-40 bg-gray-900 relative overflow-hidden">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="container relative mx-auto px-6 md:px-8 lg:px-16 xl:px-24 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-10 leading-[1.06]">
            Ready to Transform Your
            <span className="block mt-5 text-white">
              Customer Journey?
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
            Join thousands of businesses using Qualiflow AI to automate their customer lifecycle and grow revenue.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-3 px-12 py-6 rounded-full gradient-brand text-white font-bold text-lg shadow-brand-lg hover:shadow-brand-xl transition-all hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="group px-12 py-6 rounded-full border-2 border-white/30 text-white font-bold text-lg hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm">
              Contact Sales
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-10 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <Check className="size-5 text-green-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-5 text-green-400" />
              Free plan available
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-5 text-green-400" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      {blogPosts && blogPosts.length > 0 && (
        <section className="py-32 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
          <div className="container relative mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <Badge className="mb-6 bg-brand-purple/10 text-brand-purple border-brand-purple/20 px-4 py-1.5 text-sm font-semibold">
                Latest Insights
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                From the <span className="text-brand-purple">Blog</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Stay updated with the latest tips, insights, and best practices for lead qualification and automation.
              </p>
            </div>

            {/* Blog Posts Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(0, 3).map((post) => (
                <article
                  key={post.id}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300"
                >
                  {/* Featured Image */}
                  {post.featuredImagePath && (
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      <Image
                        src={post.featuredImagePath}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-6">
                    {/* Category & Reading Time */}
                    <div className="flex items-center gap-3 mb-3">
                      {post.category && (
                        <Badge className="bg-brand-purple/10 text-brand-purple border-brand-purple/20 text-xs">
                          {post.category}
                        </Badge>
                      )}
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {post.readingTimeMinutes} min read
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-purple transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Author & Date */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-brand-purple/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-brand-purple" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {post.authorName}
                        </span>
                      </div>
                      {post.publishedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>

                    {/* Featured Badge */}
                    {post.isFeatured && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* View All Button */}
            {blogPosts.length > 3 && (
              <div className="text-center mt-12">
                <a
                  href="resources/blog"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-semibold hover:border-brand-purple hover:text-brand-purple transition-all group"
                >
                  View All Articles
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-950 py-28 relative">

        <div className="container relative mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
          <div className="grid gap-20 md:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Logo href="/" size="md" darkBg />
              <p className="mt-8 text-gray-400 max-w-sm leading-relaxed text-lg">
                The AI-powered platform that automates your entire customer journey from lead capture to loyal customer.
              </p>
              <div className="mt-10 flex gap-4">
                <a href="#" className="group size-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all">
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="group size-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all">
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="#" className="group size-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all">
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="mb-8 text-sm font-bold text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-5">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors font-medium">Features</a></li>
                <li><a href="#modules" className="text-gray-400 hover:text-white transition-colors font-medium">Modules</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors font-medium">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">Integrations</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="mb-8 text-sm font-bold text-white uppercase tracking-wider">Company</h4>
              <ul className="space-y-5">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-8 text-sm font-bold text-white uppercase tracking-wider">Legal</h4>
              <ul className="space-y-5">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-gray-500 text-sm font-medium">
              © {new Date().getFullYear()} Qualiflow AI. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success-bg border border-success/30">
                <Shield className="size-4 text-success" />
                <span className="text-xs font-bold text-success-dark">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-info-bg border border-info/30">
                <Shield className="size-4 text-info" />
                <span className="text-xs font-bold text-info-dark">GDPR Ready</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Live Chat Widget */}
      <ChatWidget />
    </div>
  );
}