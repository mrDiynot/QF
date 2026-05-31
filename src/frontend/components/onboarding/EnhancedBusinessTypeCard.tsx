'use client';

/**
 * Enhanced Business Type Card
 * Modern competitive design inspired by Linear/Stripe
 * Features: Gradient hover states, smooth animations, AI glow effects
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface EnhancedBusinessTypeCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  selected?: boolean;
  onClick?: () => void;
  index?: number;
}

export function EnhancedBusinessTypeCard({
  icon,
  title,
  subtitle,
  selected,
  onClick,
  index = 0,
}: EnhancedBusinessTypeCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative flex flex-col items-center gap-2.5 sm:gap-4 rounded-xl border-2 p-4 sm:p-6 text-center transition-all duration-300 ease-out cursor-pointer overflow-hidden',
        // Default state
        !selected &&
          'border-border bg-white hover:border-(--ai-primary) hover:shadow-ai',
        // Selected state with AI gradient
        selected &&
          'border-(--ai-primary) bg-gradient-to-br from-(--ai-surface)/50 via-white to-(--ai-surface)/30 shadow-ai-lg ring-2 ring-(--ai-primary)/20 ring-offset-2',
      )}
    >
      {/* Animated gradient overlay on hover */}
      <div className={cn(
        'absolute inset-0 opacity-0 transition-opacity duration-500',
        !selected && 'group-hover:opacity-100'
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-(--ai-surface)/30 via-transparent to-(--ai-accent)/5" />
      </div>

      {/* Selection indicator */}
      <motion.div
        initial={false}
        animate={{
          scale: selected ? 1 : 0,
          opacity: selected ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 size-6 sm:size-8 rounded-full bg-gradient-to-br from-(--ai-primary) to-(--ai-accent) flex items-center justify-center shadow-lg z-10"
      >
        <Check className="size-3 sm:size-4 text-white" strokeWidth={3} />
      </motion.div>

      {/* Icon container with gradient background */}
      <div className="relative z-10">
        <motion.div
          animate={{
            scale: selected ? 1.1 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className={cn(
            'flex size-12 sm:size-16 items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-300',
            selected
              ? 'bg-gradient-to-br from-(--ai-primary)/10 to-(--ai-accent)/10 shadow-md'
              : 'bg-muted/50 group-hover:bg-gradient-to-br group-hover:from-(--ai-primary)/5 group-hover:to-(--ai-accent)/5'
          )}
        >
          <div className={cn(
            'transition-colors duration-300 [&>svg]:size-5 sm:[&>svg]:size-7',
            selected ? 'text-(--ai-primary)' : 'text-muted-foreground group-hover:text-(--ai-primary)'
          )}>
            {icon}
          </div>
        </motion.div>
      </div>

      {/* Text content */}
      <div className="flex flex-col gap-0.5 sm:gap-1.5 relative z-10">
        <span className={cn(
          'text-sm sm:text-base font-semibold transition-colors duration-300 tracking-tight',
          selected
            ? 'text-(--ai-primary)'
            : 'text-foreground/90 group-hover:text-(--ai-primary)'
        )}>
          {title}
        </span>
        <span className={cn(
          'text-xs sm:text-sm transition-colors duration-300',
          selected
            ? 'text-(--ai-secondary)/80'
            : 'text-muted-foreground group-hover:text-(--ai-secondary)/70'
        )}>
          {subtitle}
        </span>
      </div>

      {/* Bottom accent line */}
      <motion.div
        initial={false}
        animate={{
          width: selected ? '40%' : '0%',
          opacity: selected ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-(--ai-primary) to-(--ai-accent) rounded-full"
      />
    </motion.button>
  );
}
