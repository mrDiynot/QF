'use client';

import { TrendingUp, AlertCircle, Lightbulb, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AIInsightCardProps {
  type: 'suggestion' | 'alert' | 'trend' | 'opportunity';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority?: 'high' | 'medium' | 'low';
}

export function AIInsightCard({ type, title, description, action, priority = 'medium' }: AIInsightCardProps) {
  const getTypeConfig = () => {
    switch (type) {
      case 'suggestion':
        return {
          icon: <Lightbulb className="size-4" />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
        };
      case 'alert':
        return {
          icon: <AlertCircle className="size-4" />,
          bgColor: 'bg-warning-bg',
          textColor: 'text-warning',
          borderColor: 'border-warning/30',
        };
      case 'trend':
        return {
          icon: <TrendingUp className="size-4" />,
          bgColor: 'bg-success-bg',
          textColor: 'text-success',
          borderColor: 'border-success/30',
        };
      case 'opportunity':
        return {
          icon: <Target className="size-4" />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative p-4 rounded-xl border',
        config.borderColor,
        'bg-white',
        'hover:shadow-md transition-all duration-200'
      )}
    >
      {/* Content */}
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0 p-2 rounded-xl', config.bgColor)}>
          <div className={config.textColor}>
            {config.icon}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          <p className="text-xs text-gray-600 mb-2">
            {description}
          </p>
          
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold',
                config.bgColor,
                config.textColor,
                'hover:opacity-80 transition-opacity'
              )}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>

      {/* Priority indicator */}
      {priority === 'high' && (
        <div className="absolute top-2 right-2">
          <div className="size-2 rounded-full bg-red-500 animate-pulse" />
        </div>
      )}
    </motion.div>
  );
}

// Panel wrapper for multiple insights
interface AIInsightPanelProps {
  children: React.ReactNode;
}

export function AIInsightPanel({ children }: AIInsightPanelProps) {
  return (
    <div className="space-y-2">
      {children}
    </div>
  );
}
