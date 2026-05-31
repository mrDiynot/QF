'use client';

/**
 * Navigation Components
 * Tab navigation, sidebar menus, and navigation utilities
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  FileText,
  Phone,
  Calendar,
  Zap,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

// Tab Navigation
interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TabNavigation({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  size = 'md',
  className,
}: TabNavigationProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2.5',
  };

  const variantClasses = {
    default: {
      container: 'border-b',
      tab: 'border-b-2 border-transparent -mb-px',
      active: 'border-primary text-primary',
      inactive: 'text-muted-foreground hover:text-foreground/80 hover:border-border',
    },
    pills: {
      container: 'bg-muted/40 p-1 rounded-lg',
      tab: 'rounded-md',
      active: 'bg-white shadow text-foreground',
      inactive: 'text-muted-foreground hover:text-foreground/80',
    },
    underline: {
      container: '',
      tab: 'border-b-2 border-transparent',
      active: 'border-primary text-primary',
      inactive: 'text-muted-foreground hover:text-foreground/80',
    },
  };

  const styles = variantClasses[variant];

  return (
    <div className={cn("flex gap-1", styles.container, className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onChange(tab.id)}
          disabled={tab.disabled}
          className={cn(
            "flex items-center gap-2 font-medium transition-all",
            sizeClasses[size],
            styles.tab,
            activeTab === tab.id ? styles.active : styles.inactive,
            tab.disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.badge !== undefined && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {tab.badge}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}

// Sidebar Menu Item
interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  children?: MenuItem[];
  disabled?: boolean;
}

interface SidebarMenuProps {
  items: MenuItem[];
  activeId?: string;
  collapsed?: boolean;
  onItemClick?: (item: MenuItem) => void;
  className?: string;
}

export function SidebarMenu({
  items,
  activeId,
  collapsed = false,
  onItemClick,
  className,
}: SidebarMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeId === item.id;

    const content = (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/40",
          item.disabled && "opacity-50 cursor-not-allowed",
          depth > 0 && "ml-6"
        )}
        onClick={() => {
          if (item.disabled) return;
          if (hasChildren) {
            toggleExpanded(item.id);
          } else {
            item.onClick?.();
            onItemClick?.(item);
          }
        }}
      >
        {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge !== undefined && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              <span className="flex-shrink-0">
                {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              </span>
            )}
          </>
        )}
      </div>
    );

    return (
      <div key={item.id}>
        {item.href && !item.disabled ? (
          <a href={item.href}>{content}</a>
        ) : (
          content
        )}
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1">
            {item.children!.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={cn("space-y-1", className)}>
      {items.map(item => renderItem(item))}
    </nav>
  );
}

// Mobile Navigation
interface MobileNavProps {
  items: MenuItem[];
  activeId?: string;
  onItemClick?: (item: MenuItem) => void;
  logo?: React.ReactNode;
  className?: string;
}

export function MobileNav({ items, activeId, onItemClick, logo, className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className={cn("flex items-center justify-between p-4 border-b lg:hidden", className)}>
        {logo}
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <Menu className="size-6" />
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              {logo}
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="size-6" />
              </Button>
            </div>
            <div className="p-4">
              <SidebarMenu
                items={items}
                activeId={activeId}
                onItemClick={(item) => {
                  onItemClick?.(item);
                  setIsOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Bottom Navigation (for mobile)
interface BottomNavProps {
  items: Array<{ id: string; label: string; icon: React.ReactNode; href?: string; badge?: number }>;
  activeId?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function BottomNav({ items, activeId, onChange, className }: BottomNavProps) {
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around py-2 px-4 lg:hidden z-40",
      className
    )}>
      {items.map((item) => {
        const isActive = activeId === item.id;
        const content = (
          <button
            key={item.id}
            onClick={() => onChange?.(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-lg relative",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <span className="relative">
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 size-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </span>
            <span className="text-xs">{item.label}</span>
          </button>
        );

        return item.href ? (
          <a key={item.id} href={item.href}>{content}</a>
        ) : (
          content
        );
      })}
    </nav>
  );
}

// Breadcrumb Navigation (simple)
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export function BreadcrumbNav({ items, separator = '/', className }: BreadcrumbNavProps) {
  return (
    <nav className={cn("flex items-center text-sm text-muted-foreground", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className="mx-2 text-muted-foreground/30">{separator}</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Quick Navigation Presets
export const DefaultNavItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home className="size-5" />, href: '/dashboard' },
  { id: 'leads', label: 'Leads', icon: <Users className="size-5" />, href: '/leads' },
  { id: 'conversations', label: 'Conversations', icon: <MessageSquare className="size-5" />, href: '/conversations', badge: 5 },
  { id: 'voice', label: 'Voice AI', icon: <Phone className="size-5" />, href: '/voice' },
  { id: 'automations', label: 'Automations', icon: <Zap className="size-5" />, href: '/automations' },
  { id: 'calendar', label: 'Calendar', icon: <Calendar className="size-5" />, href: '/calendar' },
  { id: 'forms', label: 'Forms', icon: <FileText className="size-5" />, href: '/forms' },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="size-5" />, href: '/analytics' },
  { id: 'settings', label: 'Settings', icon: <Settings className="size-5" />, href: '/settings' },
];

export const BottomNavItems = [
  { id: 'home', label: 'Home', icon: <Home className="size-5" />, href: '/dashboard' },
  { id: 'leads', label: 'Leads', icon: <Users className="size-5" />, href: '/leads' },
  { id: 'inbox', label: 'Inbox', icon: <MessageSquare className="size-5" />, href: '/conversations', badge: 3 },
  { id: 'more', label: 'More', icon: <Menu className="size-5" /> },
];
