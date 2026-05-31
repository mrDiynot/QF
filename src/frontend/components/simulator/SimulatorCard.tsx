'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, LucideIcon } from 'lucide-react';
import Link from 'next/link';

/**
 * SimulatorCard Component
 * 
 * A themed card for the simulator following Dashcode v1.2.0 patterns.
 * Supports both light and dark modes with consistent styling.
 */
interface SimulatorCardProps {
  children: ReactNode;
  darkMode?: boolean;
  className?: string;
  title?: string;
  icon?: ReactNode;
}

export function SimulatorCard({
  children,
  darkMode = true,
  className,
  title,
  icon,
}: SimulatorCardProps) {
  return (
    <Card
      className={cn(
        'rounded-xl border p-6 transition-all',
        darkMode
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200 shadow-sm',
        className
      )}
    >
      {title && (
        <h3
          className={cn(
            'text-lg font-semibold flex items-center gap-2 mb-5',
            darkMode ? 'text-white' : 'text-slate-900'
          )}
        >
          {icon}
          {title}
        </h3>
      )}
      {children}
    </Card>
  );
}

/**
 * SimulatorToolCard Component
 * 
 * A card for displaying simulator tools with icon, title, description, and features.
 */
interface SimulatorToolCardProps {
  href: string;
  icon: LucideIcon;
  gradient: string;
  title: string;
  description: string;
  features: string[];
  darkMode?: boolean;
  className?: string;
}

export function SimulatorToolCard({
  href,
  icon: Icon,
  gradient,
  title,
  description,
  features,
  darkMode = true,
  className,
}: SimulatorToolCardProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          'group rounded-xl border transition-all hover:shadow-xl h-full p-6',
          darkMode
            ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-violet-500/5'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-lg',
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className={cn('p-2.5 rounded-xl bg-gradient-to-br shadow-lg', gradient)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <ArrowRight
            className={cn(
              'w-4 h-4 group-hover:translate-x-1 transition-all',
              darkMode
                ? 'text-slate-600 group-hover:text-slate-400'
                : 'text-slate-400 group-hover:text-slate-600'
            )}
          />
        </div>
        <h3
          className={cn(
            'text-lg font-semibold mt-4',
            darkMode ? 'text-white' : 'text-slate-900'
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'text-sm leading-relaxed line-clamp-2 mt-1.5',
            darkMode ? 'text-slate-400' : 'text-slate-600'
          )}
        >
          {description}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {features.map((feature) => (
            <Badge
              key={feature}
              variant="secondary"
              className={cn(
                'text-xs font-medium px-2.5 py-0.5',
                darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
              )}
            >
              {feature}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default SimulatorCard;

