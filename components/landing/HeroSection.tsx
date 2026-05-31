'use client';

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from '@/lib/utils';
import { FloatingElements } from "@/components/ui/FloatingElements";
import { AIDecisionEngineAnimation } from "@/components/AIDecisionEngineAnimation";
import { WaitlistCounter } from "@/components/WaitlistCounter";
import { submitToBrevo } from "@/lib/brevo";
import { validateEmail } from "@/lib/validation";
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { DemoBookingModal } from '@/components/landing/DemoBookingModal';

import { 
  Mail, MessageCircle, Phone, MessageSquare, Instagram, Facebook,
  Brain, Target, BarChart3, Clock, ArrowRight, QrCode, FileText
} from 'lucide-react';

export function HeroSection() {
  const [heroEmail, setHeroEmail] = useState('');
  const [_heroSubmitting, setHeroSubmitting] = useState(false);
  const [_heroSuccess, setHeroSuccess] = useState(false);
  const [_heroAlreadySubscribed, setHeroAlreadySubscribed] = useState(false);
  const [_heroError, setHeroError] = useState('');
  const [_heroSubmittedEmail, setHeroSubmittedEmail] = useState('');
  const [demoOpen, setDemoOpen] = useState(false);

  const _handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHeroError('');

    const emailValidation = validateEmail(heroEmail);
    if (!emailValidation.isValid) {
      setHeroError(emailValidation.error || 'Invalid email');
      return;
    }

    setHeroSubmitting(true);
    try {
      const result = await submitToBrevo(heroEmail, 'hero-section');
      if (result.success) {
        setHeroSubmittedEmail(heroEmail);
        setHeroSuccess(true);
        setHeroAlreadySubscribed(result.alreadySubmitted === true);
        setHeroEmail('');
      } else {
        setHeroError(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setHeroError('Network error. Please check your connection and try again.');
    } finally {
      setHeroSubmitting(false);
    }
  };

  return (
    <>
    <section className="relative pt-22 pb-24 lg:pt-32 lg:pb-36 px-6 overflow-hidden bg-gradient-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#4a2875]">
      {/* Animated floating elements */}
      <FloatingElements />

      {/* Large Q Logo Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none hidden sm:block">
        <Image
          src="/assets/qualiflow-logo_no_text.png"
          alt="Qualiflow AI Logo"
          width={600}
          height={600}
          className="w-[400px] md:w-[600px] h-auto"
        />
      </div>

      {/* Gradient orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-radial from-[#FF5722]/20 via-[#FF5722]/5 to-transparent rounded-full blur-[100px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-gradient-radial from-[#8B5CF6]/25 to-transparent rounded-full blur-[100px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-gradient-radial from-[#EC4899]/15 to-transparent rounded-full blur-[80px]"
        animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Mesh pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* AI animation — mobile only (shown above text) */}
        <motion.div
          className="flex items-center justify-center mb-8 lg:hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="w-full max-w-[340px]">
            <AIDecisionEngineAnimation />
            
          </div>
        </motion.div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <motion.div
            className="text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
        

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-4xl lg:text-[5rem] font-extrabold tracking-tight leading-[1.05] mb-10">
              <span className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.0)]">Never Miss a</span>
              <br />
              <span className="bg-gradient-to-r from-[#FF6B35] via-[#FF8C42] to-[#FFB347] bg-clip-text text-transparent">
                Lead{' '}
              </span>
              <span className="relative inline-block">
                {/* Decorative swoosh underline — rendered behind the text */}
                <svg
                  className="absolute bottom-[-10px] sm:bottom-[-14px] left-[10%] w-[80%] h-auto pointer-events-none"
                  viewBox="0 0 200 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="swoosh-gradient" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF8C42" />
                      <stop offset="0.5" stopColor="#E8596E" />
                      <stop offset="1" stopColor="#D946EF" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M6 12C40 4 90 2 130 6C165 10 185 8 194 5"
                    stroke="url(#swoosh-gradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Text on top — thick dark purple halo so "g" descender pops above the line */}
                <span
                  className="relative z-10 bg-gradient-to-r from-[#FF6B35] via-[#E8596E] to-[#D946EF] bg-clip-text text-transparent"
                  style={{
                    filter: 'drop-shadow(0 0 0px #1a0a2e) drop-shadow(0 0 0px #1a0a2e) drop-shadow(0 0 0px #1a0a2e) drop-shadow(0 0 5px #1a0a2e) drop-shadow(0 0 8px #1a0a2e)',
                  }}
                >
                  Again
                </span>
              </span>
            </h1>

            

            {/* Platform badge */}
            <motion.div
              //className="inline-block mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF6B35] shadow-lg shadow-orange-500/40"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >

               {/* Headline 2 — pill badge */}
              <div className="inline-flex items-center px-8 py-4 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                <span className="text-white font-bold text-lg md:text-xl tracking-wide">
                  The AI Powered Customer Journey Platform
                </span>
              </div>
            </motion.div>

            {/* Subheadline */}
            <p className="text-lg md:text-x text-white/80 mb-6 max-w-lg leading-relaxed font-light mt-8">
              QualiFlow AI, Captures and converts every lead into revenue..Handling responses, qualification, booking, proposals and follow-ups.
            </p>

          {/* CTA row: Schedule Demo + Start Free Trial */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {/* Schedule YOUR DEMO — opens DemoBookingModal */}
            <motion.div className="relative" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button
                onClick={() => setDemoOpen(true)}
                className={cn(
                  'relative inline-flex items-center justify-center gap-1.5 h-11 px-6 rounded-full overflow-hidden',
                  'text-white text-sm font-semibold',
                  'bg-gradient-to-r from-[#FF5722] to-[#FF6B35]',
                  'shadow-lg shadow-orange-500/30',
                  'transition-shadow duration-200 hover:shadow-orange-500/50',
                )}
              >
               Schedule Your Demo
              </button>
            </motion.div>

            {/* Start Free Trial — links to /register */}
            <motion.div className="relative" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className={cn(
                  'relative inline-flex items-center justify-center gap-1.5 h-11 px-6 rounded-full overflow-hidden',
                  'text-white text-sm font-semibold',
                  'bg-white/15 backdrop-blur-sm border border-white/30',
                  'transition-all duration-200 hover:bg-white/25 hover:border-white/50',
                )}
              >
                Start Free Trial
              </Link>
            </motion.div>
          </div>

          </motion.div>

          {/* Right: AI animation — desktop only */}
          <motion.div
            className="hidden lg:flex items-center justify-center lg:justify-end w-full overflow-visible"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="scale-[0.92] lg:mt-8 lg:mb-0 lg:-mr-4">
              <AIDecisionEngineAnimation />
           
            <div><p>

              <span className="text-[11px] text-white/80 whitespace-nowrap">  
              <p>&nbsp;&nbsp;</p> 
              <p>&nbsp;&nbsp;</p> 
              </span>
            </p></div>
            {/* Channel Icons Row — desktop */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20">
                <Mail className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <span className="text-[11px] text-white/80 whitespace-nowrap">Email</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20">
                <FileText className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <span className="text-[11px] text-white/80 whitespace-nowrap">Forms</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20">
                <QrCode className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <span className="text-[11px] text-white/80 whitespace-nowrap">QR Code</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20">
                <MessageCircle className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <span className="text-[11px] text-white/80 whitespace-nowrap">Chat</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20">
                <Phone className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <span className="text-[11px] text-white/80 whitespace-nowrap">Phone</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20">
                <MessageSquare className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <span className="text-[11px] text-white/80 whitespace-nowrap">SMS</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20">
                <Instagram className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <span className="text-[11px] text-white/80 whitespace-nowrap">Instagram</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20">
                <Facebook className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <span className="text-[11px] text-white/80 whitespace-nowrap">Facebook</span>
              </div>
            </div>
             </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Modal rendered outside <section> to avoid CSS-transform stacking context issues */}
    <DemoBookingModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}

export default HeroSection;
