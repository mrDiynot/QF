'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, ArrowRight, PartyPopper, Rocket, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface OnboardingCelebrationProps {
  businessName?: string;
  userName?: string;
  onContinue: () => void;
  /** Whether this celebration is shown after successful payment */
  paymentCompleted?: boolean;
  /** Business type for personalized messaging */
  businessType?: string;
  /** Selected goals for personalized features */
  goals?: string[];
}

// Industry-specific feature highlights
const getIndustryFeatures = (businessType?: string, goals?: string[]): string[] => {
  const baseFeatures = ['AI Lead Qualification', 'Multi-channel Inbox'];

  // Add goal-specific features
  const goalFeatures: string[] = [];
  if (goals?.includes('qualify_leads')) goalFeatures.push('Smart Lead Scoring');
  if (goals?.includes('book_meetings')) goalFeatures.push('Automated Scheduling');
  if (goals?.includes('automate_followups')) goalFeatures.push('Follow-up Automation');
  if (goals?.includes('capture_leads')) goalFeatures.push('Lead Capture Forms');

  // Add industry-specific features
  switch (businessType?.toLowerCase()) {
    case 'real_estate':
      return [...baseFeatures, 'Property Inquiry Handling', 'Showing Scheduler', ...goalFeatures.slice(0, 2)];
    case 'home_services':
      return [...baseFeatures, 'Service Request Triage', 'Emergency Prioritization', ...goalFeatures.slice(0, 2)];
    case 'saas':
      return [...baseFeatures, 'Demo Booking', 'Trial Conversion', ...goalFeatures.slice(0, 2)];
    case 'healthcare':
      return [...baseFeatures, 'Patient Intake', 'Appointment Scheduling', ...goalFeatures.slice(0, 2)];
    case 'legal':
      return [...baseFeatures, 'Case Intake', 'Consultation Booking', ...goalFeatures.slice(0, 2)];
    case 'agency':
      return [...baseFeatures, 'Client Onboarding', 'Project Inquiries', ...goalFeatures.slice(0, 2)];
    case 'finance':
      return [...baseFeatures, 'Financial Consultation', 'Client Qualification', ...goalFeatures.slice(0, 2)];
    case 'coaching':
      return [...baseFeatures, 'Discovery Calls', 'Client Matching', ...goalFeatures.slice(0, 2)];
    default:
      return [...baseFeatures, 'Smart Automation', 'Analytics Dashboard'];
  }
};

export function OnboardingCelebration({
  businessName = 'your business',
  userName = 'there',
  onContinue,
  paymentCompleted = false,
  businessType,
  goals,
}: OnboardingCelebrationProps) {
  const [showContent, setShowContent] = useState(false);
  const features = getIndustryFeatures(businessType, goals);

  useEffect(() => {
    // Trigger confetti animation with QualiFlow AI brand colors
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#FF6900', '#4F39F6', '#E60076', '#FF1E87', '#10B981'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Show content after initial animation
    setTimeout(() => setShowContent(true), 500);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center gradient-landing-hero">
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-2xl mx-auto px-6 text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-8"
            >
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-6 shadow-2xl">
                  <CheckCircle2 className="w-16 h-16 text-white" />
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-2 -right-2"
                >
                  <PartyPopper className="w-8 h-8 text-amber-500" />
                </motion.div>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              <span className="gradient-brand-text">
                You&apos;re All Set! 🎉
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground mb-4"
            >
              {paymentCompleted ? (
                <>
                  Payment successful! Welcome to Qualiflow AI, {userName}! <strong>{businessName}</strong> is ready to capture,
                  qualify, and convert leads with AI-powered automation.
                </>
              ) : (
                <>
                  Congratulations, {userName}! <strong>{businessName}</strong> is ready to capture,
                  qualify, and convert leads with AI-powered automation.
                </>
              )}
            </motion.p>

            {/* Welcome Email Confirmation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex items-center justify-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-full px-4 py-2 mb-8"
            >
              <Mail className="w-4 h-4" />
              <span>A welcome email with next steps has been sent to your inbox</span>
            </motion.div>

            {/* Features completed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-border/50 mb-8"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">What&apos;s Ready For You</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-left">
                {features.slice(0, 4).map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-foreground/80"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={onContinue}
                size="lg"
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

