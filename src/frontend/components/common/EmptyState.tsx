'use client';

/**
 * Empty State Components
 * Reusable empty states for various sections of the app
 */

import { Button } from '@/components/ui/button';
import {
  Users,
  FileText,
  Phone,
  Calendar,
  Mail,
  BarChart3,
  Zap,
  Plus,
  Upload,
  Search,
  FolderOpen,
  Inbox,
  Bell,
  Link,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: { wrapper: 'py-6', icon: 'size-8', title: 'text-sm', desc: 'text-xs' },
    md: { wrapper: 'py-12', icon: 'size-12', title: 'text-base', desc: 'text-sm' },
    lg: { wrapper: 'py-16', icon: 'size-16', title: 'text-lg', desc: 'text-sm' },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn("text-center", sizes.wrapper, className)}>
      {icon && (
        <div className={cn("mx-auto text-muted-foreground/30 mb-4", sizes.icon)}>
          {icon}
        </div>
      )}
      <h3 className={cn("font-medium text-foreground", sizes.title)}>{title}</h3>
      <p className={cn("text-muted-foreground mt-1 max-w-sm mx-auto", sizes.desc)}>
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="flex items-center justify-center gap-3 mt-4">
          {action && (
            <Button
              onClick={action.onClick}
              className="gap-2"
              asChild={!!action.href}
            >
              {action.href ? (
                <a href={action.href}>
                  {action.icon || <Plus className="size-4" />}
                  {action.label}
                </a>
              ) : (
                <>
                  {action.icon || <Plus className="size-4" />}
                  {action.label}
                </>
              )}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick} asChild={!!secondaryAction.href}>
              {secondaryAction.href ? (
                <a href={secondaryAction.href}>{secondaryAction.label}</a>
              ) : (
                secondaryAction.label
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-built empty states for common scenarios
export function EmptyLeads({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="size-12" />}
      title="No leads yet"
      description="Start capturing leads by creating a form or adding them manually."
      action={{ label: 'Add Lead', onClick: onAdd }}
      secondaryAction={{ label: 'Import CSV', href: '/leads/import' }}
    />
  );
}

export function EmptyConversations() {
  return (
    <EmptyState
      icon={<Inbox className="size-12" />}
      title="No conversations"
      description="When customers reach out, their messages will appear here."
      action={{ label: 'Send Message', href: '/conversations/new' }}
    />
  );
}

export function EmptyForms({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="size-12" />}
      title="No forms created"
      description="Create your first form to start capturing leads."
      action={{ label: 'Create Form', onClick: onCreate }}
      secondaryAction={{ label: 'Browse Templates', href: '/forms/templates' }}
    />
  );
}

export function EmptyProposals({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="size-12" />}
      title="No proposals yet"
      description="Create professional proposals to send to your leads."
      action={{ label: 'Create Proposal', onClick: onCreate }}
    />
  );
}

export function EmptyCalls() {
  return (
    <EmptyState
      icon={<Phone className="size-12" />}
      title="No calls recorded"
      description="AI voice calls and their transcripts will appear here."
      action={{ label: 'Configure Voice Agent', href: '/voice/settings' }}
    />
  );
}

export function EmptyAppointments({ onSchedule }: { onSchedule?: () => void }) {
  return (
    <EmptyState
      icon={<Calendar className="size-12" />}
      title="No appointments scheduled"
      description="Your upcoming appointments will show here."
      action={{ label: 'Schedule Appointment', onClick: onSchedule }}
    />
  );
}

export function EmptyEmails({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<Mail className="size-12" />}
      title="No email templates"
      description="Create reusable email templates for faster communication."
      action={{ label: 'Create Template', onClick: onCreate }}
    />
  );
}

export function EmptyAutomations({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<Zap className="size-12" />}
      title="No automations set up"
      description="Automate your workflows to save time and never miss a follow-up."
      action={{ label: 'Create Automation', onClick: onCreate }}
      secondaryAction={{ label: 'Browse Templates', href: '/automations/templates' }}
    />
  );
}

export function EmptyAnalytics() {
  return (
    <EmptyState
      icon={<BarChart3 className="size-12" />}
      title="Not enough data"
      description="Analytics will appear once you have more activity."
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={<Bell className="size-12" />}
      title="No notifications"
      description="You're all caught up! New notifications will appear here."
      size="sm"
    />
  );
}

export function EmptySearch({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="size-12" />}
      title={`No results for "${query}"`}
      description="Try adjusting your search or filters."
      size="sm"
    />
  );
}

export function EmptyIntegrations() {
  return (
    <EmptyState
      icon={<Link className="size-12" />}
      title="No integrations connected"
      description="Connect your favorite tools to supercharge your workflow."
      action={{ label: 'Browse Integrations', href: '/settings/integrations' }}
    />
  );
}

export function EmptyFiles() {
  return (
    <EmptyState
      icon={<FolderOpen className="size-12" />}
      title="No files uploaded"
      description="Upload documents to train your AI assistant."
      action={{ label: 'Upload Files', icon: <Upload className="size-4" /> }}
    />
  );
}

// Loading placeholder that looks like empty state
export function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn("text-center py-12", className)}>
      <div className="size-12 mx-auto rounded-full bg-muted/40 animate-pulse mb-4" />
      <div className="h-4 w-32 bg-muted/40 rounded mx-auto animate-pulse mb-2" />
      <div className="h-3 w-48 bg-muted/40 rounded mx-auto animate-pulse" />
    </div>
  );
}
