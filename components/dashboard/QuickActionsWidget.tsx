'use client';

/**
 * Quick Actions Widget
 * Provides shortcuts to common actions on the dashboard
 */

import Link from 'next/link';
import {
  UserPlus,
  MessageSquare,
  Calendar,
  FileText,
  Zap,
  Mail,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  color: string;
  bgColor: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: <UserPlus className="size-5" />,
    label: 'Add Lead',
    description: 'Create a new lead manually',
    href: '/leads?action=new',
    color: 'text-primary',
    bgColor: 'bg-primary/10 hover:bg-primary/20',
  },
  {
    icon: <MessageSquare className="size-5" />,
    label: 'Start Chat',
    description: 'Begin a conversation',
    href: '/conversations',
    color: 'text-info',
    bgColor: 'bg-muted/50 hover:bg-blue-200',
  },
  {
    icon: <Calendar className="size-5" />,
    label: 'Book Meeting',
    description: 'Schedule an appointment',
    href: '/calendar?action=new',
    color: 'text-primary',
    bgColor: 'bg-primary/10 hover:bg-indigo-200',
  },
  {
    icon: <FileText className="size-5" />,
    label: 'Create Form',
    description: 'Build a lead capture form',
    href: '/forms/new',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 hover:bg-emerald-200',
  },
  {
    icon: <Zap className="size-5" />,
    label: 'New Journey',
    description: 'Create an automation',
    href: '/automations/new',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 hover:bg-amber-200',
  },
  {
    icon: <Mail className="size-5" />,
    label: 'Email Template',
    description: 'Design a new template',
    href: '/email-templates/new',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50 hover:bg-pink-200',
  },
];

interface QuickActionsWidgetProps {
  className?: string;
  layout?: 'grid' | 'list';
}

export function QuickActionsWidget({ 
  className,
  layout = 'grid' 
}: QuickActionsWidgetProps) {
  if (layout === 'list') {
    return (
      <div className={cn("space-y-2", className)}>
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/20 transition-colors group"
          >
            <div className={cn(
              "flex size-10 items-center justify-center rounded-xl transition-colors",
              action.bgColor
            )}>
              <span className={action.color}>{action.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {action.description}
              </p>
            </div>
            <Plus className="size-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3", className)}>
      {QUICK_ACTIONS.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="group flex flex-col items-center p-4 rounded-2xl bg-white border border-border/50 hover:border-border hover:shadow-lg transition-all duration-200"
        >
          <div className={cn(
            "flex size-12 items-center justify-center rounded-xl mb-3 transition-colors",
            action.bgColor
          )}>
            <span className={action.color}>{action.icon}</span>
          </div>
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors text-center">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
