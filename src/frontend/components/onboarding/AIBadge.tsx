'use client';

/**
 * AI Badge Component
 * Shows AI status and recommendations
 */

import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AIBadgeProps {
  label?: string;
  variant?: 'default' | 'pulse';
  className?: string;
}

export function AIBadge({ 
  label = 'AI Powered',
  variant = 'default',
  className 
}: AIBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Badge 
        variant="secondary"
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium',
          'bg-gradient-to-r from-(--ai-primary)/10 to-(--ai-accent)/10',
          'border border-(--ai-primary)/20',
          'text-(--ai-primary)',
          variant === 'pulse' && 'animate-pulse-slow',
          className
        )}
      >
        <Sparkles className="size-3" />
        <span>{label}</span>
      </Badge>
    </motion.div>
  );
}
