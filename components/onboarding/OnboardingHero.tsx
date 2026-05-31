'use client';

/**
 * Onboarding Hero Section
 * Large heading with AI branding and contextual messaging
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface OnboardingHeroProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export function OnboardingHero({
  title,
  subtitle,
  icon,
  className,
}: OnboardingHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('text-center max-w-2xl mx-auto', className)}
    >
      {/* Optional icon */}
      {icon && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-6 flex justify-center"
        >
          <div className="size-16 rounded-2xl bg-gradient-to-br from-(--ai-primary)/10 to-(--ai-accent)/10 flex items-center justify-center text-(--ai-primary)">
            {icon}
          </div>
        </motion.div>
      )}

      {/* Title with gradient */}
      <h1 className="heading-1 mb-4">
        <span className="gradient-ai-text inline-flex items-center gap-2">
          {title}
          <Sparkles className="size-8 text-(--ai-accent) inline-block" />
        </span>
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="body-large text-muted-foreground"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
