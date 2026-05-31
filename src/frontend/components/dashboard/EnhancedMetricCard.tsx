'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface EnhancedMetricCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  sublabel?: string;
  trend?: {
    value: number; // percentage change
    direction: 'up' | 'down' | 'neutral';
  };
  href?: string;
  iconColor?: string;
  iconBg?: string;
  highlight?: boolean; // Add subtle brand accent
}

/**
 * Enhanced Metric Card with trend indicators
 * Inspired by Linear, Stripe, and modern SaaS dashboards
 */
export function EnhancedMetricCard({
  icon,
  value,
  label,
  sublabel,
  trend,
  href,
  iconColor = 'text-purple-600',
  iconBg = 'bg-purple-100',
  highlight = false,
}: EnhancedMetricCardProps) {
  const CardWrapper = href ? Link : 'div';
  
  const getTrendIcon = () => {
    if (!trend) return null;
    
    const iconClass = 'size-3.5';
    if (trend.direction === 'up') {
      return <TrendingUp className={cn(iconClass, 'text-success')} />;
    }
    if (trend.direction === 'down') {
      return <TrendingDown className={cn(iconClass, 'text-error')} />;
    }
    return <Minus className={cn(iconClass, 'text-gray-400')} />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    if (trend.direction === 'up') return 'text-success';
    if (trend.direction === 'down') return 'text-error';
    return 'text-gray-500';
  };

  return (
    <CardWrapper
      href={href || '#'}
      className={cn(
        'group relative overflow-hidden rounded-xl p-5',
        'border transition-all duration-200 backdrop-blur-md',
        highlight
         // ? 'border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-purple-500/10'
         // : 'border-white/10 bg-white/[0.06]',

          ? 'border-white/50 bg-gradient-to-br from-orange-500/10 to-purple-500/10'
          : 'border-white/50 bg-gradient-to-br from-orange-500/10 to-purple-500/10',
        href && 'hover:border-orange-500/30 hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer',
        highlight && href && 'hover:border-orange-500/40 hover:shadow-orange-500/10'
      )}
    >
      {/* Content */}
      <div className="relative">
        {/* Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn('flex size-10 items-center justify-center rounded-lg bg-white/10', iconColor)}>
            {icon}
          </div>
          {trend && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={cn('text-xs font-medium', getTrendColor())}>
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        
        {/* Value */}
        <div className="space-y-0.5">
          <p className="text-3xl font-bold text-white tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-sm font-medium text-white/80">
            {label}
          </p>
          {sublabel && (
            <p className="text-xs text-white/50">
              {sublabel}
            </p>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}
