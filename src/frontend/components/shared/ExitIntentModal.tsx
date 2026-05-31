'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Modal, ModalContent, ModalBody } from '@/components/modals';
import { GradientButton } from './gradient-button';

interface ExitIntentModalProps {
  enabled?: boolean;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  onCTA?: () => void;
  delay?: number;
}

/**
 * ExitIntentModal component
 * Shows a modal when user attempts to leave the page
 * Helps reduce abandonment on registration and critical flows
 */
export function ExitIntentModal({
  enabled = true,
  title = "Wait! Don't miss out on Qualiflow AI",
  description = "Join 2,000+ businesses already using AI to qualify leads automatically. Start your free 7-day trial now.",
  ctaText = "Continue Registration",
  ctaHref,
  onCTA,
  delay = 1000,
}: ExitIntentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (!enabled || hasShown) return;

    let isReady = false;

    // Wait for delay before enabling exit intent
    const delayTimer = setTimeout(() => {
      isReady = true;
    }, delay);

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of viewport
      if (isReady && e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(delayTimer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, hasShown, delay]);

  const handleCTA = () => {
    if (onCTA) {
      onCTA();
    } else if (ctaHref) {
      window.location.href = ctaHref;
    }
    setIsOpen(false);
  };

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent
        size="md"
        className="p-0 overflow-hidden border-2 border-brand-orange/20 [&>button]:hidden"
      >
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-brand-purple to-brand-orange p-6 text-white relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 size-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
          <Sparkles className="size-8 mb-3 opacity-90" />
          <h3 className="text-2xl font-bold leading-tight">
            {title}
          </h3>
        </div>

        {/* Content */}
        <ModalBody className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            {description}
          </p>

          {/* Benefits */}
          <div className="space-y-2.5 bg-gray-50 rounded-xl p-4 border border-gray-200">
            {[
              '7 days free trial',
              'No credit card required',
              '24/7 AI-powered lead qualification',
              'Setup in under 5 minutes',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2.5">
                <div className="size-1.5 rounded-full bg-green-500 shrink-0" />
                <span className="text-sm text-gray-700 font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <GradientButton
              onClick={handleCTA}
              className="w-full h-12 text-base font-semibold"
              showArrow
            >
              {ctaText}
            </GradientButton>
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              No thanks, I&apos;ll skip
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
