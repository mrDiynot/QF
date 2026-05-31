import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';

import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginPageBackground } from '@/components/auth/LoginPageBackground';
import { RegisterLeftPanel } from '@/components/auth/RegisterLeftPanel';
import { ExitIntentModal } from '@/components/shared/ExitIntentModal';
import { ScrollIndicator } from '@/components/shared/ScrollIndicator';

export const metadata: Metadata = {
  title: 'Register | Qualiflow AI',
  description: 'Create your Qualiflow AI account',
};

export default function RegisterPage() {
  return (
    <>
      {/* Exit Intent Modal */}
      <ExitIntentModal
        enabled
        title="Wait! Don't miss out on Qualiflow AI"
        description="Join 2,000+ businesses already using AI to qualify leads automatically. Start your free 7-day trial now - no credit card required."
        ctaText="Continue Registration"
        delay={3000}
      />

      {/* Scroll Indicator */}
      <ScrollIndicator threshold={100} />

      <div className="relative min-h-screen bg-gradient-to-br from-[#0f0620] via-[#1e0a3c] to-[#3b1060]">
        {/* Animated AI background orbs */}
        <LoginPageBackground />

        {/* Back to home — top left */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white/90 transition-colors group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Home
        </Link>

        {/* Two-column layout */}
        <div className="relative z-10 flex min-h-screen items-center">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">

            {/* Left Panel */}
            <div className="hidden lg:block">
              <RegisterLeftPanel />
            </div>

            {/* Right: Multi-step form (the card is self-contained inside RegisterForm) */}
            <div className="w-full max-w-[520px] mx-auto lg:mx-0 lg:ml-auto">
              <RegisterForm />

              {/* Security badges */}
              <div className="mt-6 flex items-center justify-center gap-8">
                <div className="flex items-center gap-1.5">
                  <Lock className="size-3.5 text-green-400" />
                  <span className="text-xs font-medium text-white/50">256-bit SSL</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-green-400" />
                  <span className="text-xs font-medium text-white/50">SOC 2 Compliant</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
