'use client';

import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export function FinalCTASection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-br from-[#0f0620] via-[#1e0a3c] to-[#2d1060]">
      {/* Deep purple orb — top right */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-40" style={{ background: 'radial-gradient(circle, #6d28d9, transparent 70%)', filter: 'blur(100px)' }} />
      {/* Subtle dark orange accent — bottom left */}
      <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #c2410c, transparent 70%)', filter: 'blur(90px)' }} />
      {/* Violet mid-tone — bottom right */}
      <div className="absolute bottom-0 right-1/4 w-[280px] h-[280px] rounded-full opacity-25" style={{ background: 'radial-gradient(circle, #4c1d95, transparent 70%)', filter: 'blur(80px)' }} />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to stop losing leads?
          </h2>
          <p className="text-lg text-white/85 mb-10 max-w-xl mx-auto">
            Join thousands of businesses using Qualiflow AI to capture, qualify, and convert leads automatically.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 h-14 px-10 bg-[#FF5722] hover:bg-[#E64A19] text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="resources/blog"
              className="inline-flex items-center justify-center gap-2 h-14 px-10 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl transition-all"
            >
              Read Our Blog
            </Link>
          </div>

         
        </ScrollReveal>
      </div>
    </section>
  );
}

export default FinalCTASection;
