'use client';

import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  ScrollText,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Ticket,
  FileEdit,
  Brain,
  Activity,
  Download,
  CreditCard,
  Search,
  Workflow,
  GitBranch,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { AdminUser, AdminRole } from '@/types/admin';

interface AdminSidebarProps {
  adminUser: AdminUser | null;
  onLogout: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: AdminRole[];
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['PlatformAdmin', 'SupportAdmin', 'BillingAdmin'] },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Businesses', href: '/admin/businesses', icon: Building2, roles: ['PlatformAdmin', 'SupportAdmin'] },
      { label: 'Users', href: '/admin/users', icon: Users, roles: ['PlatformAdmin', 'SupportAdmin'] },
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard, roles: ['PlatformAdmin', 'BillingAdmin'] },
      { label: 'Plans', href: '/admin/plans', icon: CreditCard, roles: ['PlatformAdmin'] },
      { label: 'Features', href: '/admin/features', icon: Settings, roles: ['PlatformAdmin'] },
      { label: 'Billing', href: '/admin/billing', icon: CreditCard, roles: ['PlatformAdmin', 'BillingAdmin'] },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Support Tickets', href: '/admin/support', icon: Ticket, roles: ['PlatformAdmin', 'SupportAdmin'], badge: 'New' },
      { label: 'CMS', href: '/admin/cms', icon: FileEdit, roles: ['PlatformAdmin', 'ContentAdmin'] },
      { label: 'AI Usage', href: '/admin/ai-usage', icon: Brain, roles: ['PlatformAdmin', 'BillingAdmin'] },
    ],
  },
  {
    label: 'Workflows',
    items: [
      { label: 'Workflow Templates', href: '/admin/workflows/templates', icon: Workflow, roles: ['PlatformAdmin'] },
      { label: 'Plan Assignments', href: '/admin/workflows/assignments', icon: GitBranch, roles: ['PlatformAdmin'] },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Revenue Analytics', href: '/admin/analytics', icon: Activity, roles: ['PlatformAdmin', 'BillingAdmin'] },
      { label: 'Coming Soon', href: '/admin/coming-soon-analytics', icon: MessageSquare, roles: ['PlatformAdmin'] },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'System Health', href: '/admin/system-health', icon: Activity, roles: ['PlatformAdmin'] },
      { label: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText, roles: ['PlatformAdmin', 'SupportAdmin'] },
      { label: 'Exports', href: '/admin/exports', icon: Download, roles: ['PlatformAdmin'] },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Admin Users', href: '/admin/admin-users', icon: ShieldCheck, roles: ['PlatformAdmin'] },
      { label: 'Settings', href: '/admin/settings', icon: Settings, roles: ['PlatformAdmin'] },
    ],
  },
];

export function AdminSidebar({ adminUser, onLogout, mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const filterNavGroups = () => {
    return navGroups.map(group => ({
      ...group,
      items: group.items.filter(item => {
        // SuperAdmin and PlatformAdmin have access to all items
        const hasFullAccess = adminUser?.role === 'SuperAdmin' || adminUser?.role === 'PlatformAdmin';
        
        if (item.roles && adminUser && !hasFullAccess && !item.roles.includes(adminUser.role)) {
          return false;
        }
        if (searchQuery && !item.label.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        return true;
      }),
    })).filter(group => group.items.length > 0);
  };

  const filteredGroups = filterNavGroups();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen flex flex-col transition-all duration-300 z-50',
        'bg-admin-sidebar border-r border-gray-200 shadow-sm',
        collapsed ? 'w-[72px]' : 'w-[280px]',
        // Mobile: hidden by default, shown when mobileOpen
        'max-xl:fixed max-xl:translate-x-[-100%]',
        mobileOpen && 'max-xl:translate-x-0'
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        {!collapsed ? (
          <Link href="/admin" className="flex-1 min-w-0 group">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-gray-200/80 inline-block transform -rotate-1 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105 animate-float">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/qualiflow-logo-full-v8.jpg"
                alt="Qualiflow AI"
                className="h-8 w-auto object-contain"
              />
            </div>
          </Link>
        ) : (
          <Link href="/admin" className="flex justify-center w-full group">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-lg border border-gray-200/80 inline-block transition-transform duration-300 group-hover:scale-110 animate-float">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/qualiflow-logo-full-v8.jpg"
                alt="Qualiflow AI"
                className="h-7 w-auto object-contain"
              />
            </div>
          </Link>
        )}
        <div className="flex items-center gap-1">
          {/* Mobile Close Button */}
          {onMobileClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileClose}
              className="xl:hidden h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {/* Desktop Collapse Button */}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden xl:flex h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {!collapsed && (
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 bg-gray-50 border border-gray-200 text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-[#FF6900]/30 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Collapsed Toggle */}
      {collapsed && (
        <div className="px-2 mb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(false)}
                  className="w-full h-9 text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-muted"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Navigation - with proper scrolling */}
      <ScrollArea className="flex-1 px-2 overflow-y-auto">
        <nav className="space-y-5 pb-6">
          {filteredGroups.map((group) => (
            <div key={group.label}>
              {/* Group Label */}
              {!collapsed && (
                <div className="px-3 mb-2 mt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {group.label}
                  </span>
                </div>
              )}

              {/* Group Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));

                  const menuItem = (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group mx-2',
                          isActive
                            ? 'bg-[#FF6900] text-white shadow-[0_2px_8px_rgba(255,105,0,0.35)]'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                          collapsed && 'justify-center px-2 mx-0'
                        )}
                      >
                        <item.icon className={cn(
                          'h-5 w-5 flex-shrink-0 transition-colors',
                          isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-700'
                        )} />
                        {!collapsed && (
                          <>
                            <span className="text-[15px] font-medium flex-1">{item.label}</span>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[#FF6900] text-white">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <TooltipProvider key={item.href}>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            {menuItem}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="flex items-center gap-2">
                            {item.label}
                            {item.badge && (
                              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-[#FF6900]/20 text-orange-400">
                                {item.badge}
                              </span>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  }

                  return menuItem;
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={onLogout}
                className={cn(
                  'w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors',
                  collapsed ? 'px-0 justify-center' : 'justify-start px-3'
                )}
              >
                <LogOut className="h-5 w-5" />
                {!collapsed && <span className="ml-2 font-medium">Logout</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Logout</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}

