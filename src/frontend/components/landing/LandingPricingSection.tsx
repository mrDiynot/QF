'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, DollarSign } from 'lucide-react';
import { usePlans } from '@/hooks/subscriptions/useSubscriptions';
import { useLandingPageData } from '@/hooks/cms/useCms';
import { getDefaultFeatureCategories } from '@/lib/default-feature-categories';

// ─── Types ────────────────────────────────────────────────────────────────────
type BillingPeriod = 'monthly' | 'quarterly' | 'annual';

interface PricingPlan {
  name: string;
  slug: string;
  description: string;
  price: { monthly: number | null; quarterly: number | null; annual: number | null };
  annualTotal?: number | null;
  onboarding?: { price: number | null; required: boolean } | null;
  popular?: boolean;
  usageLimits: string[];
  //coreFeatures: string[];
  ctaText?: string;
  ctaLink?: string;
}

// ─── Fallback plans (matches landing page Figma design) ───────────────────────
const FALLBACK_PLANS: PricingPlan[] = [
  {
    name: 'Free Flow',
    slug: 'free-flow',
    description: 'Perfect for testing Qualiflow AI capabilities',
    price: { monthly: 0, quarterly: 0, annual: 0 },
    onboarding: null,
    usageLimits: ['3 test voice calls', 'Limited SMS', '5MB Knowledge Base', '1 user'],
    //coreFeatures: ['Basic widgetzxb', 'Journey builder view-only', 'Prebuilt journeys (disabled)'],
  },
  {
    name: 'Smart Flow',
    slug: 'smartflow',
    description: 'For growing businesses ready to automate',
    price: { monthly: 649, quarterly: 579, annual: 499 },
    annualTotal: 1908,
    onboarding: { price: 700, required: false },
    usageLimits: ['10,000 AI Credits', '100 Voice Minutes', '500 SMS', '20MB Knowledge Base', '3 users'],
    //coreFeatures: ['1 phone number', 'AI SMS + Chat', 'AI qualification & scoring', 'Forms + surveys', 'Smart booking', '2 CRM connections'],
  },
  {
    name: 'Ultra Flow',
    slug: 'ultraflow',
    description: 'Most popular for scaling teams',
    price: { monthly: 999, quarterly: 899, annual: 750 },
    annualTotal: 6708,
    onboarding: { price: 1500, required: true },
    popular: true,
    usageLimits: ['35,000 AI Credits', '600 Voice Minutes', '2,500 SMS', '100MB Knowledge Base', '7 users'],
      },
  {
    name: 'Enterprise Flow',
    slug: 'enterprise',
    description: 'For large organizations with custom needs',
    price: { monthly: null, quarterly: null, annual: null },
    onboarding: null,
    usageLimits: ['Custom AI Credits', 'Custom Voice Minutes', 'Custom SMS', 'Custom Knowledge Base', 'Custom users'],
    //coreFeatures: ['Unlimited CRM connections', 'Custom AI training', 'SOC2-ready security', 'Custom integrations', 'AI model selection', 'Priority support + SLAs'],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function LandingPricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('annual');
  const [showFeatureComparison, setShowFeatureComparison] = useState(false);

  const { data: apiPlans } = usePlans();
  const { data: cmsData } = useLandingPageData();

  // Discounts from API or defaults
  const discounts = useMemo(() => {
    const planWithDiscounts = apiPlans?.find(p => p.discountQuarterly > 0 || p.discountAnnual > 0);
    return {
      quarterly: planWithDiscounts?.discountQuarterly ?? 10,
      annual: planWithDiscounts?.discountAnnual ?? 20,
    };
  }, [apiPlans]);

  // Pricing plans — transform CMS data or use fallback
  const pricingPlans = useMemo((): PricingPlan[] => {
    if (Array.isArray(cmsData?.pricingPlans) && cmsData.pricingPlans.length > 0) {
      return cmsData.pricingPlans.map(p => {
        const parsePrice = (priceStr: string | number | null | undefined): number | null => {
          if (priceStr === null || priceStr === undefined) return null;
          if (typeof priceStr === 'number') return priceStr;
          if (priceStr.toLowerCase() === 'custom') return null;
          const cleaned = priceStr.replace(/[^0-9.]/g, '');
          return cleaned ? parseFloat(cleaned) : 0;
        };
        const features = p.features || [];
        const midPoint = Math.ceil(features.length / 2);
        const usageLimits = p.usageLimits?.length ? p.usageLimits : features.slice(0, midPoint);
        const coreFeatures = p.coreFeatures?.length ? p.coreFeatures : features.slice(midPoint);
        const monthlyPrice = parsePrice(p.monthlyPrice);
        const annualPrice = parsePrice(p.annualPrice);
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
          onboarding: p.onboardingPrice !== null && p.onboardingPrice !== undefined ? { price: parsePrice(p.onboardingPrice), required: p.onboardingRequired ?? false } : null,
          popular: p.isPopular,
          usageLimits,
          coreFeatures,
          ctaText: p.ctaText,
          ctaLink: p.ctaLink,
        };
      });
    }
    return FALLBACK_PLANS;
  }, [cmsData?.pricingPlans]);

  // Helper to render a feature cell value (boolean → check/cross, string → text)
  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value
        ? <Check className="size-4 text-green-500 mx-auto" />
        : <X className="size-4 text-gray-300 mx-auto" />;
    }
    return <span className="text-gray-700">{value}</span>;
  };

  // Feature comparison categories from CMS or fallback
  const featureCategories = useMemo(() => {
    if (Array.isArray(cmsData?.featureComparisons) && cmsData.featureComparisons.length > 0) {
      const grouped: Record<string, { feature: string; freeFlow: string | boolean; smartFlow: string | boolean; ultraFlow: string | boolean; enterprise: string | boolean }[]> = {};
      for (const fc of cmsData.featureComparisons) {
        if (!grouped[fc.category]) grouped[fc.category] = [];
        const parseValue = (val: string): string | boolean => {
          if (val === '✓') return true;
          if (val === '❌') return false;
          return val;
        };
        grouped[fc.category].push({ feature: fc.featureName, freeFlow: parseValue(fc.freeFlowValue), smartFlow: parseValue(fc.smartFlowValue), ultraFlow: parseValue(fc.ultraFlowValue), enterprise: parseValue(fc.enterpriseValue) });
      }
      const categoryOrder = ['Core AI Modules', 'Communication Channels', 'Lead Capture Channels', 'Automation System', 'Booking System', 'Reviews & Retention', 'CRM Integrations', 'Admin / Dashboard', 'Onboarding & Training'];
      return categoryOrder.filter(cat => grouped[cat]).map(cat => ({ category: cat, features: grouped[cat] }));
    }
    return getDefaultFeatureCategories();
  }, [cmsData?.featureComparisons]);

  // Remap featureCategories into the shape consumed by the comparison table
  const comparisonFeatures = useMemo(() =>
    featureCategories.map(cat => ({
      category: cat.category,
      features: cat.features.map(f => ({
        name: f.feature,
        free: f.freeFlow,
        smart: f.smartFlow,
        ultra: f.ultraFlow,
        enterprise: f.enterprise,
      })),
    })),
  [featureCategories]);

  return (
    <>
      {/* ── Pricing Cards Section ── */}
      <section
        id="pricing"
        className="py-32 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D0520 0%, #1a0f2e 50%, #0D0520 100%)' }}
      >
        {/* AI background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full opacity-[0.09]" style={{ background: '#7C3AED', filter: 'blur(120px)' }} />
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full opacity-[0.07]" style={{ background: '#FF5722', filter: 'blur(120px)' }} />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-8 lg:px-16 xl:px-24">
          {/* Header */}
          <div className="text-center mb-20 space-y-7">
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border"
              style={{ background: 'rgba(255,87,34,0.1)', borderColor: 'rgba(255,87,34,0.3)', color: '#FF8A65' }}
            >
              <DollarSign className="size-4" />
              Simple Pricing
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.08] tracking-tight">
              Simple, Transparent{' '}
              <span style={{ color: '#FF5722' }}>Pricing</span>
            </h2>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-12">
            <div
              className="inline-flex items-center p-1 rounded-xl border"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <button
                onClick={() => setBillingPeriod('monthly')}
                className="px-6 py-2 rounded-lg text-sm font-medium transition-all"
                style={billingPeriod === 'monthly'
                  ? { background: 'rgba(124,58,237,0.45)', color: 'white', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }
                  : { color: '#9CA3AF' }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('quarterly')}
                className="px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                style={billingPeriod === 'quarterly'
                  ? { background: 'rgba(124,58,237,0.45)', color: 'white', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }
                  : { color: '#9CA3AF' }}
              >
                Quarterly
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: 'rgba(74,222,128,0.15)', color: '#4ADE80' }}>
                  Save {discounts.quarterly}%
                </span>
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className="px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                style={billingPeriod === 'annual'
                  ? { background: 'rgba(124,58,237,0.45)', color: 'white', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }
                  : { color: '#9CA3AF' }}
              >
                Annual
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: 'rgba(74,222,128,0.15)', color: '#4ADE80' }}>
                  Save {discounts.annual}%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto items-stretch">
            {(pricingPlans || []).map((plan, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl transition-all duration-300 flex flex-col hover:-translate-y-1"
                style={{
                  background: plan.popular
                    ? 'linear-gradient(135deg, #4C1D95 0%, #2D1B4E 100%)'
                    : plan.price.monthly === null
                      ? 'linear-gradient(135deg, rgba(20,5,40,0.85), rgba(40,15,80,0.5))'
                      : 'rgba(255,255,255,0.04)',
                  border: plan.popular
                    ? '2px solid rgba(255,87,34,0.55)'
                    : plan.price.monthly === null
                      ? '1px solid rgba(255,87,34,0.25)'
                      : '1px solid rgba(124,58,237,0.2)',
                  boxShadow: plan.popular ? '0 0 48px rgba(124,58,237,0.3), 0 0 80px rgba(255,87,34,0.08)' : 'none',
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className="px-4 py-1.5 rounded-full text-white text-xs font-semibold shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #FF5722, #FF6B35)' }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}

                {plan.popular && (
                  <div className="absolute top-0 right-0 w-36 h-36 rounded-full opacity-15 pointer-events-none" style={{ background: '#FF5722', filter: 'blur(40px)' }} />
                )}

                {/* Header */}
                <div className="relative pt-2">
                  <h3 className="text-2xl font-bold mb-2 tracking-tight text-white">{plan.name}</h3>
                  <p className="text-sm leading-relaxed mb-6 min-h-[44px]" style={{ color: plan.popular ? 'rgba(233,213,255,0.85)' : 'rgba(167,139,250,0.75)' }}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-3xl font-bold tracking-tight text-white">
                      {plan.price.monthly === null ? 'Custom Pricing' : plan.price.monthly === 0 ? '$0' : `$${plan.price[billingPeriod] ?? plan.price.monthly}`}
                    </span>
                    {plan.price.monthly !== null && (
                      <span className="text-sm font-medium" style={{ color: 'rgba(167,139,250,0.65)' }}>/month</span>
                    )}
                  </div>
                  <div className="mb-6">
                    {plan.price.monthly !== null && plan.price.monthly > 0 && (
                      <div className="text-xs leading-relaxed space-y-1.5 mb-3" style={{ color: 'rgba(167,139,250,0.55)' }}>
                        <p className={billingPeriod === 'monthly' ? 'font-semibold !text-purple-200' : ''}>${plan.price.monthly}/mo monthly</p>
                        <p className={billingPeriod === 'quarterly' ? 'font-semibold !text-purple-200' : ''}>${plan.price.quarterly ??  Math.round(plan.price.monthly * 3)}/mo billed quarterly</p>
                        <p className={billingPeriod === 'annual' ? 'font-semibold !text-purple-200' : ''}>${plan.price.annual ?? Math.round(plan.price.monthly * 12)}/ mo billed annually</p>
                      </div>
                    )}
                    {plan.onboarding && plan.onboarding.price && plan.onboarding.price > 0 ? (
                      <p className="text-xs font-medium" style={{ color: 'rgba(167,139,250,0.65)' }}>
                        {plan.onboarding.required ? 'Onboarding required:' : 'Optional onboarding:'} ${plan.onboarding.price.toLocaleString()}
                      </p>
                    ) : plan.price.monthly === 0 ? (
                      <p className="text-xs font-medium" style={{ color: 'rgba(167,139,250,0.65)' }}>no onboarding required</p>
                    ) : null}
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={plan.ctaLink || (plan.price.monthly === null ? '/contact' : `/register?plan=${plan.slug}`)}
                  className="block w-full py-3.5 px-4 rounded-xl text-center text-sm font-semibold transition-all mb-8"
                  style={plan.popular
                    ? { background: 'linear-gradient(135deg, #FF5722, #FF6B35)', color: 'white', boxShadow: '0 4px 20px rgba(255,87,34,0.45)' }
                    : plan.price.monthly === null
                      ? { background: 'rgba(255,87,34,0.12)', border: '1px solid rgba(255,87,34,0.4)', color: '#FF8A65' }
                      : plan.price.monthly === 0
                        ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(233,213,255,0.85)' }
                        : { background: 'rgba(124,58,237,0.22)', border: '1px solid rgba(124,58,237,0.4)', color: '#D8B4FE' }}
                >
                  {plan.ctaText || (plan.price.monthly === null ? 'Contact Us' : `Start with ${plan.name}`)}
                </Link>

                {/* Features */}
                <div className="flex-1 flex flex-col">
                  <div className="relative mb-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-4" style={{ color: 'rgba(167,139,250,0.55)' }}>
                      Usage Limits
                    </p>
                    <ul className="space-y-2.5">
                      {(plan.usageLimits || []).map((limit, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="size-4 shrink-0 mt-0.5" style={{ color: plan.popular ? '#FF5722' : '#A78BFA' }} />
                          <span className="text-[13px] leading-snug" style={{ color: 'rgba(233,213,255,0.8)' }}>{limit}</span>
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all border"
              style={{ background: 'rgba(255,87,34,0.1)', borderColor: 'rgba(255,87,34,0.3)', color: '#FF8A65' }}
            >
              {showFeatureComparison ? 'Hide Features' : 'Compare All Features'}
              <ArrowRight className="size-4" />
            </button>
          </div>

          {/* ── Feature Comparison Table ── */}
          <AnimatePresence>
            {showFeatureComparison && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.2 }}
                className="mb-20 mt-12"
              >
                <h2 className="text-3xl text-gray-900 mb-8 text-center">Detailed Feature Comparison</h2>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                  {/* Table Header */}
                  <div className="grid grid-cols-5 gap-4 p-6 bg-gray-50 border-b border-gray-200">
                    <div className="text-left">
                      <span className="text-sm text-gray-900">Feature Category</span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-900">Free Flow</span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-900">SmartFlow</span>
                    </div>
                    <div className="text-center relative">
                      <span className="text-sm text-gray-900">UltraFlow</span>
                      <div className="absolute -top-2 -right-2 w-2 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-900">Enterprise</span>
                    </div>
                  </div>
                  {/* Table Body */}
                  {comparisonFeatures.map((category, categoryIdx) => (
                    <div key={categoryIdx}>
                      {/* Category Header */}
                      <div className="bg-gradient-to-r from-purple-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg text-purple-900">{category.category}</h3>
                      </div>
                      {/* Category Features */}
                      {category.features.map((feature, featureIdx) => (
                        <div
                          key={featureIdx}
                          className={`grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            featureIdx === category.features.length - 1 ? 'border-b-2 border-gray-200' : ''
                          }`}
                        >
                          <div className="flex items-center text-sm text-gray-700">
                            {feature.name}
                          </div>
                          <div className="flex items-center justify-center text-sm">
                            {renderFeatureValue(feature.free)}
                          </div>
                          <div className="flex items-center justify-center text-sm">
                            {renderFeatureValue(feature.smart)}
                          </div>
                          <div className="flex items-center justify-center text-sm bg-orange-50/30">
                            {renderFeatureValue(feature.ultra)}
                          </div>
                          <div className="flex items-center justify-center text-sm">
                            {renderFeatureValue(feature.enterprise)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}

export default LandingPricingSection;
