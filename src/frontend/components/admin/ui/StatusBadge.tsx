'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  Pause,
  Play,
  Ban,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

// Standardized status colors using admin CSS variables
const VARIANT_STYLES: Record<StatusVariant, string> = {
  success: 'bg-success-10 text-admin-success border-admin-success/30',
  warning: 'bg-warning-10 text-admin-warning border-admin-warning/30',
  error: 'bg-danger-10 text-admin-error border-admin-error/30',
  info: 'bg-info-10 text-admin-info border-admin-info/30',
  neutral: 'bg-admin-muted text-admin-muted-foreground border-admin-border',
};

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  icon?: LucideIcon;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({
  status,
  variant = 'neutral',
  icon: CustomIcon,
  showIcon = true,
  className,
  size = 'md',
}: StatusBadgeProps) {
  const Icon = CustomIcon;

  return (
    <Badge
      className={cn(
        'gap-1 font-medium border transition-all duration-200',
        VARIANT_STYLES[variant],
        size === 'sm' && 'text-[10px] px-1.5 py-0 [&>svg]:size-2.5',
        className
      )}
    >
      {showIcon && Icon && <Icon className="h-3 w-3" />}
      {status}
    </Badge>
  );
}

// Pre-configured status badges for common use cases
export function BusinessStatusBadge({ status }: { status: string }) {
  if (!status) return <StatusBadge status="Unknown" variant="neutral" icon={AlertCircle} />;
  const config: Record<string, { label: string; variant: StatusVariant; icon: LucideIcon }> = {
    active: { label: 'Active', variant: 'success', icon: CheckCircle },
    suspended: { label: 'Suspended', variant: 'error', icon: Ban },
    trial: { label: 'Trial', variant: 'warning', icon: Clock },
    canceled: { label: 'Canceled', variant: 'neutral', icon: XCircle },
  };
  const { label, variant, icon } = config[status.toLowerCase()] || {
    label: status,
    variant: 'neutral' as const,
    icon: AlertCircle
  };
  return <StatusBadge status={label} variant={variant} icon={icon} />;
}

export function SubscriptionStatusBadge({ status }: { status: string }) {
  if (!status) return <StatusBadge status="Unknown" variant="neutral" icon={AlertCircle} />;
  const config: Record<string, { label: string; variant: StatusVariant; icon: LucideIcon }> = {
    active: { label: 'Active', variant: 'success', icon: CheckCircle },
    trialing: { label: 'Trial', variant: 'info', icon: Clock },
    past_due: { label: 'Past Due', variant: 'warning', icon: AlertTriangle },
    canceled: { label: 'Canceled', variant: 'error', icon: XCircle },
    paused: { label: 'Paused', variant: 'neutral', icon: Pause },
    incomplete: { label: 'Incomplete', variant: 'warning', icon: AlertCircle },
  };
  const { label, variant, icon } = config[status.toLowerCase()] || {
    label: status,
    variant: 'neutral' as const,
    icon: AlertCircle
  };
  return <StatusBadge status={label} variant={variant} icon={icon} />;
}

export function TicketStatusBadge({ status }: { status: string }) {
  if (!status) return <StatusBadge status="Unknown" variant="neutral" icon={AlertCircle} />;
  const config: Record<string, { label: string; variant: StatusVariant; icon: LucideIcon }> = {
    new: { label: 'New', variant: 'info', icon: AlertCircle },
    open: { label: 'Open', variant: 'success', icon: Play },
    inprogress: { label: 'In Progress', variant: 'info', icon: Clock },
    awaitingcustomer: { label: 'Awaiting Customer', variant: 'warning', icon: Clock },
    resolved: { label: 'Resolved', variant: 'success', icon: CheckCircle },
    closed: { label: 'Closed', variant: 'neutral', icon: CheckCircle },
  };
  const { label, variant, icon } = config[status.toLowerCase()] || {
    label: status,
    variant: 'neutral' as const,
    icon: AlertCircle
  };
  return <StatusBadge status={label} variant={variant} icon={icon} />;
}

export function TicketPriorityBadge({ priority }: { priority: string }) {
  if (!priority) return <StatusBadge status="Unknown" variant="neutral" icon={AlertCircle} />;
  const config: Record<string, { label: string; variant: StatusVariant; icon: LucideIcon }> = {
    critical: { label: 'Critical', variant: 'error', icon: AlertTriangle },
    high: { label: 'High', variant: 'warning', icon: AlertTriangle },
    medium: { label: 'Medium', variant: 'warning', icon: AlertCircle },
    low: { label: 'Low', variant: 'neutral', icon: AlertCircle },
  };
  const { label, variant, icon } = config[priority.toLowerCase()] || {
    label: priority,
    variant: 'neutral' as const,
    icon: AlertCircle
  };
  return <StatusBadge status={label} variant={variant} icon={icon} />;
}

// Legacy export for backward compatibility
export const AdminStatusBadge = StatusBadge;
