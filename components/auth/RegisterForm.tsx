'use client';

/**
 * Multi-step registration form
 * Steps: pricing → signup → payment (paid plans) | onboarding-free (free/ultra)
 * Auth wired to useRegister hook + OAuth via next-auth signIn
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  Sparkles, ChevronDown, CheckCircle, Zap, Crown, Star,
  Briefcase, User, Mail, Building, Phone, Lock, Eye, EyeOff,
  ArrowRight, CreditCard, Shield,
} from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { ClearSessionOnMount } from './ClearSessionOnMount';
import { OnboardingWizard } from './OnboardingWizard';
import { useRegister } from '@/hooks/auth/useRegister';
import { subscriptionsService } from '@/services/api/subscriptions.service';
import { toast } from 'sonner';
import type { BillingInterval } from '@/types/api';

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 'pricing' | 'signup' | 'payment' | 'onboarding-free' | 'onboarding-paid';
type PlanKey = 'free' | 'smart' | 'ultra' | 'enterprise';
type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

interface RegisterFormProps {
  onNavigate?: (section: string) => void;
  onSwitchToLogin?: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PLAN_SLUG_MAP: Record<PlanKey, string> = {
  free: 'freeflow',
  smart: 'smartflow',
  ultra: 'ultraflow',
  enterprise: 'enterprise',
};

const PRICES: Record<PlanKey, Record<BillingCycle, number>> = {
  free: { monthly: 0, quarterly: 0, yearly: 0 },
  smart: { monthly: 199, quarterly: 179, yearly: 159 },
  ultra: { monthly: 699, quarterly: 629, yearly: 559 },
  enterprise: { monthly: 0, quarterly: 0, yearly: 0 },
};

const businessTypes = [
  'Real Estate', 'Solar', 'Home Services', 'Insurance',
  'Healthcare', 'Legal', 'Finance', 'E-commerce', 'SaaS', 'Other',
];

const goalOptions = [
  'Qualify more leads automatically',
  'Book more appointments',
  'Reduce no-shows',
  'Re-engage cold leads',
  'Improve response time',
  'Scale without hiring',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculatePrice(plan: PlanKey, cycle: BillingCycle): number {
  return PRICES[plan]?.[cycle] ?? 0;
}

function getBillingLabel(cycle: BillingCycle): string {
  switch (cycle) {
    case 'quarterly': return '/mo, billed quarterly';
    case 'yearly': return '/mo, billed annually';
    default: return '/month';
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RegisterForm({ onNavigate, onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter();

  // ── Step & Plan state
  const [step, setStep] = useState<Step>('pricing');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const [expandedPlan, setExpandedPlan] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('free');

  // ── Form data
  const [formData, setFormData] = useState({ name: '', email: '', company: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // ── Payment data
  const [paymentData, setPaymentData] = useState({ cardNumber: '', expiry: '', cvc: '', billingName: '' });
  const [includeOnboarding, setIncludeOnboarding] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // ── Onboarding data
  const [onboardingData, setOnboardingData] = useState<{
    businessType: string;
    goals: string[];
    wantsOnboarding: string;
  }>({ businessType: '', goals: [], wantsOnboarding: '' });

  // ── Derived values
  const planSlug = PLAN_SLUG_MAP[selectedPlan];
  const isUltra = selectedPlan === 'ultra';
  const effectiveIncludeOnboarding = isUltra || (selectedPlan === 'smart' && includeOnboarding);

  const calculateTotal = (): number => {
    const base = calculatePrice(selectedPlan, billingCycle);
    const onboardingFee = isUltra ? 1500 : (selectedPlan === 'smart' && includeOnboarding ? 700 : 0);
    return base + onboardingFee;
  };

  // ── Advance to the correct next step after signup (success or error)
  const advanceFromSignup = () => {
    if (selectedPlan === 'enterprise') {
      setStep('onboarding-free');
    } else {
      // All plans (free, smart, ultra) go through OnboardingWizard first
      setStep('onboarding-paid');
    }
  };

  // ── Auth hook (always called at top level, values update on re-render)
  const { mutate: register, isPending } = useRegister({
    planId: planSlug,
    billingInterval: billingCycle as BillingInterval,
    includeOnboarding: effectiveIncludeOnboarding,
    onSuccess: advanceFromSignup,
    onError: advanceFromSignup,
  });

  // ── Handlers

  const handlePlanSelect = (plan: PlanKey) => {
    setSelectedPlan(plan);
    setStep('signup');
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = formData.name.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    register({
      firstName,
      lastName,
      companyName: formData.company,
      phoneNumber: formData.phone,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.password,
      acceptTerms: true,
    });
  };

  const storeOAuthData = () => {
    localStorage.setItem('oauthPendingPlan', planSlug);
    localStorage.setItem('oauthPendingBillingInterval', billingCycle);
    localStorage.setItem('oauthPendingIncludeOnboarding', effectiveIncludeOnboarding ? 'true' : 'false');
    if (formData.company) {
      localStorage.setItem('oauthPendingCompanyName', formData.company);
      document.cookie = `oauthPendingCompanyName=${encodeURIComponent(formData.company)}; path=/; max-age=3600; SameSite=Lax`;
    }
    if (formData.phone) {
      localStorage.setItem('oauthPendingPhoneNumber', formData.phone);
      document.cookie = `oauthPendingPhoneNumber=${encodeURIComponent(formData.phone)}; path=/; max-age=3600; SameSite=Lax`;
    }
  };

  const handleGoogleSignup = () => {
    storeOAuthData();
    signIn('google', { callbackUrl: '/oauth/callback', redirectTo: '/oauth/callback' });
  };

  const handleOutlookSignup = () => {
    storeOAuthData();
    signIn('microsoft-entra-id', { callbackUrl: '/oauth/callback', redirectTo: '/oauth/callback' });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingOut(true);
    try {
      const checkoutResponse = await subscriptionsService.createCheckoutSession({
        planId: planSlug,
        billingInterval: billingCycle as BillingInterval,
        includeOnboarding: effectiveIncludeOnboarding,
        successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/register?plan=${planSlug}&canceled=true`,
      });
      window.location.href = checkoutResponse.checkoutUrl;
    } catch {
      toast.error('Could not start checkout. Please try again.');
      setIsCheckingOut(false);
      // Advance to dashboard so the form flow can continue
      router.push('/dashboard');
    }
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  const toggleGoal = (goal: string) => {
    setOnboardingData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleSwitchToLogin = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      router.push('/login');
    }
  };

  const handleNavigateToPricing = () => {
    if (onNavigate) {
      onNavigate('pricing');
    } else {
      router.push('/pricing');
    }
  };

  // ── Render

  // Onboarding wizard: full-viewport centered overlay — hides left panel naturally
  if (step === 'onboarding-paid') {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#0f0620] via-[#1e0a3c] to-[#3b1060] flex items-center justify-center overflow-y-auto p-6">
        <div className="w-full max-w-3xl my-auto">
          <OnboardingWizard
            userName={formData.name}
            selectedPlan={selectedPlan}
            onComplete={() => {
              if (selectedPlan === 'enterprise') {
                router.push('/dashboard');
              } else {
                // All plans (including free) proceed to payment after onboarding
                setStep('payment');
              }
            }}
            onSkip={() => {
              if (selectedPlan === 'enterprise') {
                router.push('/dashboard');
              } else {
                setStep('payment');
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-2xl p-8"
    >
      <ClearSessionOnMount />

      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Logo href="/" size="md" />
      </div>

      {step === 'pricing' && (
        <>
          {/* Pricing Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl text-blue-950">
                Select your plan 
              </h3>
              <button
                onClick={handleNavigateToPricing}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Compare all plans →
              </button>
            </div>
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('quarterly')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'quarterly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Quarterly
                <span className="ml-1 text-xs text-green-600">
                  &nbsp;
                  Save 10%</span>
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="ml-1 text-xs text-green-600">Save 20%</span>
              </button>
            </div>
          </div>
          {/* Pricing Cards - Modern Expandable Design */}
          <div className="space-y-3 mb-6">
            {/* Free Flow */}
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all">
              <button
                onClick={() => setExpandedPlan(expandedPlan === 'free' ? '' : 'free')}
                className="w-full p-4 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-all">
                     <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Free Flow</h4>
                    <p className="text-sm text-gray-500">$0/month • Perfect for testing</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedPlan === 'free' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedPlan === 'free' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200 bg-gray-50"
                  >
                    <div className="p-4 space-y-3">
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          500 AI credits
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          3 test voice calls
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Limited SMS
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          5MB Knowledge Base
                        </li>
                      </ul>
                      <button
                        onClick={() => handlePlanSelect('free')}
                        className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2.5 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all font-medium"
                      >
                        Start Free Trial
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Smart Flow */}
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-all">
              <button
                onClick={() => setExpandedPlan(expandedPlan === 'smart' ? '' : 'smart')}
                className="w-full p-4 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-all">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Smart Flow</h4>
                    <p className="text-sm text-gray-500">
                      ${calculatePrice('smart', billingCycle).toLocaleString()}{getBillingLabel(billingCycle)} • For growing businesses
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedPlan === 'smart' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedPlan === 'smart' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200 bg-blue-50"
                  >
                    <div className="p-4 space-y-3">
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          10,000 AI Credits/month
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          100 Voice Minutes
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          500 SMS Messages
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          25MB Knowledge Base
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          3 Team Members
                        </li>
                      </ul>
                      <button
                        onClick={() => handlePlanSelect('smart')}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
                      >
                        Get Started with Smart Flow
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Ultra Flow */}
            <div className="border-2 border-orange-500 rounded-xl overflow-hidden hover:border-orange-600 transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
              
                </div>
              </div>
              <button
                onClick={() => setExpandedPlan(expandedPlan === 'ultra' ? '' : 'ultra')}
                className="w-full p-4 flex items-center justify-between text-left group bg-gradient-to-r from-orange-50 to-pink-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center group-hover:shadow-lg transition-all">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Ultra Flow</h4>
                    <p className="text-sm text-orange-600">
                      ${calculatePrice('ultra', billingCycle).toLocaleString()}{getBillingLabel(billingCycle)} • Complete automation
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-orange-500 transition-transform ${expandedPlan === 'ultra' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedPlan === 'ultra' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-orange-200 bg-gradient-to-br from-orange-50 to-pink-50"
                  >
                    <div className="p-4 space-y-3">
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          35,000 AI Credits/month
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          600 Voice Minutes
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          2,500 SMS Messages
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          100MB Knowledge Base
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          7 Team Members
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium">Outbound Calls &amp; Email</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium">Social Messaging (Instagram, Facebook &amp; WhatsApp)</span>
                        </li>
                      </ul>
                      <button
                        onClick={() => handlePlanSelect('ultra')}
                        className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white py-2.5 rounded-lg hover:from-orange-600 hover:to-pink-700 hover:shadow-lg transition-all font-medium"
                      >
                        Get Started with Ultra Flow
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Enterprise Flow */}
            <div className="border-2 border-purple-300 rounded-xl overflow-hidden hover:border-purple-400 transition-all">
              <button
                onClick={() => setExpandedPlan(expandedPlan === 'enterprise' ? '' : 'enterprise')}
                className="w-full p-4 flex items-center justify-between text-left group bg-gradient-to-r from-purple-50 to-indigo-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center group-hover:shadow-lg transition-all">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Enterprise</h4>
                    <p className="text-sm text-purple-600">Custom pricing • Unlimited scale</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-purple-500 transition-transform ${expandedPlan === 'enterprise' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedPlan === 'enterprise' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50"
                  >
                    <div className="p-4 space-y-3">
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Custom AI Credits
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Custom Voice &amp; SMS
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Unlimited Knowledge Base
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Unlimited Team Members
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium">SOC2 Compliance</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium">Priority Support &amp; SLA</span>
                        </li>
                      </ul>
                      <button
                        onClick={() => router.push('/contact')}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 rounded-lg hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all font-medium"
                      >
                        Contact Sales
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Sign in link */}
          <div className="mt-6 text-center">
            <button
              onClick={handleSwitchToLogin}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Already have an account? <span className="text-orange-600">Sign in</span>
            </button>
          </div>
        </>
      )}

      {step === 'signup' && (
        <>
          {/* Signup Form */}
          <div className="mb-6">
            <button
              onClick={() => setStep('pricing')}
              className="text-sm text-gray-600 hover:text-gray-800 mb-4"
            >
              ← Back to plans
            </button>
            <h3 className="text-2xl text-blue-950 mb-2">
              Create your account
            </h3>
            <p className="text-gray-600 text-sm">
              You selected: <span className="font-semibold">{selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Flow</span>
            </p>
          </div>
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            {/* OAuth Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              <button
                type="button"
                onClick={handleOutlookSignup}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M23 5.5V18.5C23 19.88 21.88 21 20.5 21H3.5C2.12 21 1 19.88 1 18.5V5.5C1 4.12 2.12 3 3.5 3H20.5C21.88 3 23 4.12 23 5.5Z" fill="#0078D4"/>
                  <path d="M12 13.5L1 7.5V5.5L12 11.5L23 5.5V7.5L12 13.5Z" fill="white"/>
                </svg>
                Continue with Outlook
              </button>
            </div>
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="John Smith"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="john@company.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Acme Inc."
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? 'Creating account…' : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={handleSwitchToLogin}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Already have an account? <span className="text-orange-600">Sign in</span>
            </button>
          </div>
        </>
      )}

      

      {step === 'onboarding-free' && (
        <>
          {/* Onboarding Questions - For Free Flow */}
          <div className="mb-6">
            <h3 className="text-2xl text-blue-950 mb-2">
              Tell us about your business
            </h3>
            <p className="text-gray-600 text-sm">
              {selectedPlan === 'free'
                ? 'Help us personalize your Free Flow experience'
                : 'Help us personalize your Ultra Flow experience'}
            </p>
          </div>
          <form onSubmit={handleOnboardingSubmit} className="space-y-6">
            {/* Question 1: Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Which best describes your business?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {businessTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOnboardingData({ ...onboardingData, businessType: type })}
                    className={`p-3 text-sm border-2 rounded-lg transition-all ${
                      onboardingData.businessType === type
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            {/* Question 2: Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What are your top goals with Qualiflow AI?
              </label>
              <div className="space-y-2">
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`w-full p-3 text-sm text-left border-2 rounded-lg transition-all ${
                      onboardingData.goals.includes(goal)
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        onboardingData.goals.includes(goal)
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-gray-300'
                      }`}>
                        {onboardingData.goals.includes(goal) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      {goal}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {/* Question 3: Onboarding Support */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Would you like onboarding &amp; implementation support?
              </label>
              <div className="space-y-2">
                {["Yes, I want help getting started", "No, I'll set it up myself"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setOnboardingData({ ...onboardingData, wantsOnboarding: option })}
                    className={`w-full p-4 text-sm text-left border-2 rounded-lg transition-all ${
                      onboardingData.wantsOnboarding === option
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
            >
              Complete Setup
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </>
      )}



{step === 'payment' && (
        <>
          {/* Payment Form */}
          <div className="mb-6">
            <h3 className="text-2xl text-blue-950 mb-2">
              Payment Details
            </h3>
            <p className="text-gray-600 text-sm">
              ${calculatePrice(selectedPlan, billingCycle).toLocaleString()}{getBillingLabel(billingCycle)} - {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Flow
            </p>
          </div>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            {/* Onboarding Fee Section */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Implementation &amp; Onboarding</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedPlan === 'ultra'
                      ? 'Included with Ultra Flow - Full setup assistance'
                      : 'Professional setup and training (optional)'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">
                    ${selectedPlan === 'ultra' ? '1,500' : '700'}
                  </div>
                  <div className="text-xs text-gray-500">one-time</div>
                </div>
              </div>
              {selectedPlan === 'smart' ? (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeOnboarding}
                    onChange={(e) => setIncludeOnboarding(e.target.checked)}
                    className="w-5 h-5 text-orange-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">
                    Add professional onboarding &amp; implementation support
                  </span>
                </label>
              ) : (
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Required for Ultra Flow - Included in total</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="4242 4242 4242 4242"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={paymentData.expiry}
                  onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVC
                </label>
                <input
                  type="text"
                  value={paymentData.cvc}
                  onChange={(e) => setPaymentData({ ...paymentData, cvc: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="123"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={paymentData.billingName}
                  onChange={(e) => setPaymentData({ ...paymentData, billingName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="John Smith"
                  required
                />
              </div>
            </div>
            {/* Order Summary */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Flow Plan
                  </span>
                  <span className="font-medium">
                    ${selectedPlan === 'smart' ? '199' : '699'}{getBillingLabel(billingCycle)}
                  </span>
                </div>
                {(selectedPlan === 'ultra' || (selectedPlan === 'smart' && includeOnboarding)) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Onboarding Fee</span>
                    <span className="font-medium">
                      ${selectedPlan === 'ultra' ? '1,500' : '700'} (one-time)
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-300 flex justify-between">
                  <span className="font-bold text-gray-900">Today&apos;s Total</span>
                  <span className="font-bold text-gray-900">
                    ${calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span>Your payment information is secure and encrypted</span>
            </div>
            <button
              type="submit"
              disabled={isCheckingOut}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? 'Redirecting to checkout…' : (
                <>
                  Complete Payment
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </>
      )}


      {/* onboarding-paid is handled by the OnboardingWizard early return above */}
    </motion.div>
  );
}
