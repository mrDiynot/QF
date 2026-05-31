'use client';

/**
 * Status Badges Component
 * Reusable status indicators for various entity states
 */

import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Pause,
  Play,
  Send,
  Eye,
  EyeOff,
  Star,
  Zap,
  Shield,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusConfig {
  label: string;
  color: string;
  icon?: React.ReactNode;
}

const STATUS_VARIANTS: Record<StatusVariant, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-error/10 text-error border-error/20',
  info: 'bg-info/10 text-info border-info/20',
  neutral: 'bg-muted text-muted-foreground border-border',
};

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, variant = 'neutral', icon, className, size = 'md' }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-medium border",
        STATUS_VARIANTS[variant],
        size === 'sm' && "text-[10px] px-1.5 py-0",
        className
      )}
    >
      {icon}
      {status}
    </Badge>
  );
}

// Lead Status Badges
const LEAD_STATUS: Record<string, StatusConfig> = {
  new: { label: 'New', color: 'info', icon: <Star className="size-3" /> },
  contacted: { label: 'Contacted', color: 'neutral', icon: <Send className="size-3" /> },
  qualified: { label: 'Qualified', color: 'success', icon: <CheckCircle className="size-3" /> },
  proposal: { label: 'Proposal', color: 'warning', icon: <Clock className="size-3" /> },
  negotiation: { label: 'Negotiation', color: 'warning', icon: <AlertCircle className="size-3" /> },
  won: { label: 'Won', color: 'success', icon: <CheckCircle className="size-3" /> },
  lost: { label: 'Lost', color: 'error', icon: <XCircle className="size-3" /> },
};

export function LeadStatusBadge({ status, className }: { status: string; className?: string }) {
  const config = LEAD_STATUS[status.toLowerCase()] || { label: status, color: 'neutral' };
  return (
    <StatusBadge
      status={config.label}
      variant={config.color as StatusVariant}
      icon={config.icon}
      className={className}
    />
  );
}

// Conversation Status Badges
const CONVERSATION_STATUS: Record<string, StatusConfig> = {
  open: { label: 'Open', color: 'success', icon: <Play className="size-3" /> },
  pending: { label: 'Pending', color: 'warning', icon: <Clock className="size-3" /> },
  closed: { label: 'Closed', color: 'neutral', icon: <CheckCircle className="size-3" /> },
  spam: { label: 'Spam', color: 'error', icon: <XCircle className="size-3" /> },
};

export function ConversationStatusBadge({ status, className }: { status: string; className?: string }) {
  const config = CONVERSATION_STATUS[status.toLowerCase()] || { label: status, color: 'neutral' };
  return (
    <StatusBadge
      status={config.label}
      variant={config.color as StatusVariant}
      icon={config.icon}
      className={className}
    />
  );
}

// Proposal Status Badges
const PROPOSAL_STATUS: Record<string, StatusConfig> = {
  draft: { label: 'Draft', color: 'neutral', icon: <EyeOff className="size-3" /> },
  sent: { label: 'Sent', color: 'info', icon: <Send className="size-3" /> },
  viewed: { label: 'Viewed', color: 'info', icon: <Eye className="size-3" /> },
  accepted: { label: 'Accepted', color: 'success', icon: <CheckCircle className="size-3" /> },
  declined: { label: 'Declined', color: 'error', icon: <XCircle className="size-3" /> },
  expired: { label: 'Expired', color: 'warning', icon: <Clock className="size-3" /> },
};

export function ProposalStatusBadge({ status, className }: { status: string; className?: string }) {
  const config = PROPOSAL_STATUS[status.toLowerCase()] || { label: status, color: 'neutral' };
  return (
    <StatusBadge
      status={config.label}
      variant={config.color as StatusVariant}
      icon={config.icon}
      className={className}
    />
  );
}

// Automation Status Badges
const AUTOMATION_STATUS: Record<string, StatusConfig> = {
  active: { label: 'Active', color: 'success', icon: <Zap className="size-3" /> },
  paused: { label: 'Paused', color: 'warning', icon: <Pause className="size-3" /> },
  draft: { label: 'Draft', color: 'neutral', icon: <EyeOff className="size-3" /> },
  error: { label: 'Error', color: 'error', icon: <AlertCircle className="size-3" /> },
};

export function AutomationStatusBadge({ status, className }: { status: string; className?: string }) {
  const config = AUTOMATION_STATUS[status.toLowerCase()] || { label: status, color: 'neutral' };
  return (
    <StatusBadge
      status={config.label}
      variant={config.color as StatusVariant}
      icon={config.icon}
      className={className}
    />
  );
}

// User/Member Status Badges
const USER_STATUS: Record<string, StatusConfig> = {
  active: { label: 'Active', color: 'success', icon: <CheckCircle className="size-3" /> },
  inactive: { label: 'Inactive', color: 'neutral', icon: <Pause className="size-3" /> },
  pending: { label: 'Pending', color: 'warning', icon: <Clock className="size-3" /> },
  suspended: { label: 'Suspended', color: 'error', icon: <Lock className="size-3" /> },
};

export function UserStatusBadge({ status, className }: { status: string; className?: string }) {
  const config = USER_STATUS[status.toLowerCase()] || { label: status, color: 'neutral' };
  return (
    <StatusBadge
      status={config.label}
      variant={config.color as StatusVariant}
      icon={config.icon}
      className={className}
    />
  );
}

// Role Badges
const ROLE_COLORS: Record<string, StatusVariant> = {
  owner: 'info',
  admin: 'error',
  manager: 'warning',
  member: 'info',
  viewer: 'neutral',
};

export function RoleBadge({ role, className }: { role: string; className?: string }) {
  const variant = ROLE_COLORS[role.toLowerCase()] || 'neutral';
  return (
    <StatusBadge
      status={role}
      variant={variant}
      icon={<Shield className="size-3" />}
      className={className}
    />
  );
}

// Priority Badges
const PRIORITY_CONFIG: Record<string, StatusConfig> = {
  high: { label: 'High', color: 'error' },
  medium: { label: 'Medium', color: 'warning' },
  low: { label: 'Low', color: 'info' },
};

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const config = PRIORITY_CONFIG[priority.toLowerCase()] || { label: priority, color: 'neutral' };
  return (
    <StatusBadge
      status={config.label}
      variant={config.color as StatusVariant}
      className={className}
    />
  );
}

// Online/Offline Indicator
export function OnlineIndicator({ online, className }: { online: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full",
        online ? "bg-success" : "bg-muted",
        className
      )}
    />
  );
}

// Dot Status (minimal)
export function DotStatus({ variant = 'neutral', className }: { variant?: StatusVariant; className?: string }) {
  const colors: Record<StatusVariant, string> = {
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    info: 'bg-info',
    neutral: 'bg-muted-foreground',
  };

  return (
    <span className={cn("inline-block size-2 rounded-full", colors[variant], className)} />
  );
}
