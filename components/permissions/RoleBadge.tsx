'use client';

/**
 * Role Badge Component
 * Displays a styled badge for user roles
 */

import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/auth';
import { Shield, Crown, Users, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    icon: typeof Shield;
    className: string;
    description: string;
  }
> = {
  Owner: {
    label: 'Owner',
    icon: Crown,
    className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/10',
    description: 'Full access to all features including billing and team management',
  },
  Admin: {
    label: 'Admin',
    icon: Shield,
    className: 'bg-muted/50 text-info border-border hover:bg-muted/50',
    description: 'Can manage team members, settings, and all business operations',
  },
  Manager: {
    label: 'Manager',
    icon: Users,
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
    description: 'Can manage leads, conversations, and view reports',
  },
  Viewer: {
    label: 'Viewer',
    icon: Eye,
    className: 'bg-muted/40 text-foreground/90 border-border hover:bg-muted/40',
    description: 'Read-only access to view data and reports',
  },
};

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
};

const ICON_SIZES = {
  sm: 'size-3',
  md: 'size-3.5',
  lg: 'size-4',
};

/**
 * Displays a styled badge for a user role
 */
export function RoleBadge({
  role,
  showIcon = false,
  size = 'md',
  className,
}: RoleBadgeProps) {
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border',
        config.className,
        SIZE_CLASSES[size],
        className
      )}
      title={config.description}
    >
      {showIcon && <Icon className={cn(ICON_SIZES[size], 'mr-1')} />}
      {config.label}
    </Badge>
  );
}

/**
 * Get role configuration for external use
 */
export function getRoleConfig(role: UserRole) {
  return ROLE_CONFIG[role];
}

/**
 * Get all roles in hierarchy order (highest to lowest)
 */
export function getRolesInOrder(): UserRole[] {
  return ['Owner', 'Admin', 'Manager', 'Viewer'];
}

/**
 * Get assignable roles (excludes Owner - can't assign Owner role)
 */
export function getAssignableRoles(): UserRole[] {
  return ['Admin', 'Manager', 'Viewer'];
}

