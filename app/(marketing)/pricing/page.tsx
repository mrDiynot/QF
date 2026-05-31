'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { LandingPageHeader } from '@/components/landing/LandingPageHeader';
import { LandingPageFooter } from '@/components/landing/LandingPageFooter';

// Disable SSR for the pricing section — it is fully interactive and fetches data
// client-side via React Query. SSR causes "map of undefined" when API response
// shape doesn't match expectations during server hydration.
const LandingPricingSection = dynamic(
  () => import('@/components/landing/LandingPricingSection').then(m => m.LandingPricingSection),
  {
    ssr: false,
    loading: () => (
      <div className="py-32 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0D0520 0%, #1a0f2e 50%, #0D0520 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-purple-300 text-sm">Loading pricing…</p>
        </div>
      </div>
    ),
  }
);

export default function PricingPage() {

  return (
    <div className="min-h-screen" style={{ background: '#0d0618' }}>
      <LandingPageHeader />

  
       

        {/* ── Trust bar ── */}
     

        {/* ── Pricing Section ── */}
        <LandingPricingSection />

        {/* ── FAQ teaser ── */}
        <div className="py-16 text-center">
          <p className="text-purple-300 mb-4">Questions? We&apos;re happy to help.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all font-medium"
          >
            Contact our sales team <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
   

      <LandingPageFooter />
    </div>
  );
}
