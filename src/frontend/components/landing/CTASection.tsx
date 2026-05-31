'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  className?: string;
}

export function CTASection({ 
  title = "Ready to Transform Your Lead Management?",
  subtitle = "Join thousands of businesses using Qualiflow AI to automate their sales pipeline.",
  primaryCTA = { text: "Start Free Trial", href: "/register" },
  secondaryCTA = { text: "Schedule Demo", href: "/contact" },
  className 
}: CTASectionProps) {
  return (
    <section className={cn("py-20 md:py-32 relative overflow-hidden", className)}>
      {/* Background - Using brand gradient */}
      <div className="absolute inset-0 gradient-brand" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container relative mx-auto px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
            <Sparkles className="size-4 text-yellow-300" />
            <span className="text-sm font-medium text-white">Start your free 14-day trial</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {title}
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
            {subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={primaryCTA.href}
              className={cn(
                "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full",
                "bg-white text-primary font-semibold text-base",
                "shadow-lg shadow-black/20 hover:shadow-xl hover:bg-white/90",
                "transition-all"
              )}
            >
              {primaryCTA.text}
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href={secondaryCTA.href}
              className={cn(
                "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full",
                "border-2 border-white/30 text-white font-semibold text-base",
                "hover:bg-white/10 transition-all"
              )}
            >
              {secondaryCTA.text}
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/80">
            <span>✓ No credit card required</span>
            <span>✓ 14-day free trial</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
