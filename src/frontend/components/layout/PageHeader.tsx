'use client';

/**
 * Page Header Component
 * Consistent page headers with title, breadcrumbs, and actions
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  Home,
  ArrowLeft,
  MoreVertical,
  Plus,
  Download,
  Upload,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Breadcrumb types
interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center text-sm", className)}>
      <Link href="/" className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
        <Home className="size-4" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="size-4 mx-2 text-muted-foreground/30" />
          {item.href ? (
            <a
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {item.icon}
              {item.label}
            </a>
          ) : (
            <span className="text-foreground font-medium flex items-center gap-1">
              {item.icon}
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Page Header types
interface PageAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  primary?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'error';
  breadcrumbs?: BreadcrumbItem[];
  actions?: PageAction[];
  moreActions?: PageAction[];
  backHref?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  badge,
  badgeVariant = 'default',
  breadcrumbs,
  actions,
  moreActions,
  backHref,
  className,
  children,
}: PageHeaderProps) {
  const badgeColors = {
    default: 'bg-muted/40 text-foreground/80',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
  };

  return (
    <div className={cn("mb-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} className="mb-4" />
      )}

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          {backHref && (
            <Button variant="ghost" size="icon" className="size-9 -ml-2" asChild>
              <a href={backHref}>
                <ArrowLeft className="size-5" />
              </a>
            </Button>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {badge && (
                <Badge variant="secondary" className={badgeColors[badgeVariant]}>
                  {badge}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        {(actions || moreActions) && (
          <div className="flex items-center gap-2">
            {actions?.map((action, index) => (
              <Button
                key={index}
                variant={action.primary ? 'default' : action.variant || 'outline'}
                className={cn(
                  "gap-2",
                  action.primary && "bg-primary hover:bg-purple-700"
                )}
                onClick={action.onClick}
                asChild={!!action.href}
              >
                {action.href ? (
                  <a href={action.href}>
                    {action.icon}
                    {action.label}
                  </a>
                ) : (
                  <>
                    {action.icon}
                    {action.label}
                  </>
                )}
              </Button>
            ))}
            
            {moreActions && moreActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {moreActions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={action.onClick}
                      className="gap-2"
                    >
                      {action.icon}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {/* Optional Children (tabs, filters, etc.) */}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

// Section Header (smaller, for card sections)
interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-primary hover:text-primary"
          onClick={action.onClick}
          asChild={!!action.href}
        >
          {action.href ? (
            <a href={action.href}>
              {action.icon}
              {action.label}
            </a>
          ) : (
            <>
              {action.icon}
              {action.label}
            </>
          )}
        </Button>
      )}
    </div>
  );
}

// Page Container with consistent padding
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function PageContainer({ children, className, maxWidth = 'full' }: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn("p-6", maxWidthClasses[maxWidth], "mx-auto", className)}>
      {children}
    </div>
  );
}

// Action Toolbar
interface ToolbarAction {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  disabled?: boolean;
}

interface ActionToolbarProps {
  actions: ToolbarAction[];
  className?: string;
}

export function ActionToolbar({ actions, className }: ActionToolbarProps) {
  return (
    <div className={cn("flex items-center gap-2 p-2 bg-muted/20 rounded-lg", className)}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'ghost'}
          size="sm"
          className="gap-2"
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
}

// Common action presets
export const CommonActions = {
  add: (onClick?: () => void) => ({ label: 'Add New', icon: <Plus className="size-4" />, onClick, primary: true }),
  export: (onClick?: () => void) => ({ label: 'Export', icon: <Download className="size-4" />, onClick }),
  import: (onClick?: () => void) => ({ label: 'Import', icon: <Upload className="size-4" />, onClick }),
  filter: (onClick?: () => void) => ({ label: 'Filter', icon: <Filter className="size-4" />, onClick }),
  refresh: (onClick?: () => void) => ({ label: 'Refresh', icon: <RefreshCw className="size-4" />, onClick }),
};
