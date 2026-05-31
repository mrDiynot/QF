'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/lib/utils';
import {
  Menu, X, LayoutDashboard, MessageSquare, Users, Calendar as CalendarIcon,
  Target, BarChart3, Settings, LogOut, Building2
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useOnboardingStatus } from '@/hooks/onboarding/useOnboarding';
import { useQueryClient } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: MessageSquare, label: 'Conversations', href: '/conversations' },
  { icon: Users, label: 'CRM', href: '/crm' },
  { icon: CalendarIcon, label: 'Calendar', href: '/calendar' },
  { icon: Target, label: 'Leads', href: '/leads' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { data: onboardingStatus } = useOnboardingStatus();

  const businessName = onboardingStatus?.businessName;
  const hasValidBusinessName = businessName &&
    businessName.trim() !== '' &&
    !businessName.toLowerCase().includes('your business');

  const handleLogout = async () => {
    // Clear sessionStorage tokens before logout
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('confirmedPlanName');
    sessionStorage.removeItem('channelSetupComplete');
    
    // Clear React Query cache to prevent stale data on next login
    queryClient.clear();
    
    await signOut({ 
      callbackUrl: `${window.location.origin}/login`,
      redirect: true 
    });
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo variant="default" size="sm" />
          <div className="flex items-center gap-2">
            <NotificationCenter className="text-muted-foreground hover:text-foreground" />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-muted/40 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 z-50 h-screen w-80 bg-gradient-to-br from-[#0f1729] via-[#1a2642] to-[#0d1b2a] shadow-2xl transform transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-indigo-500/10">
            <Logo size="md" darkBg />
            <button
              onClick={closeSidebar}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="size-5 text-white" />
            </button>
          </div>

          {/* Business Name */}
          {hasValidBusinessName && (
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3.5 py-2.5 border border-primary/10">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                  <Building2 className="size-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-white tracking-wide truncate min-w-0" title={businessName}>
                  {businessName}
                </span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <item.icon className="size-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="border-t border-cyan-500/10 p-4 space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <Avatar className="size-10">
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold text-sm">
                  {session?.user?.firstName?.[0] || 'J'}{session?.user?.lastName?.[0] || 'D'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {session?.user?.firstName || 'John'} {session?.user?.lastName || 'Doe'}
                </p>
                <p className="text-xs text-slate-400">Free Plan</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-300/80 hover:bg-red-500/15 hover:text-red-300 border border-red-400/20"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

