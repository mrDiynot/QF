'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/lib/utils';
import {
  Target, BarChart3, Phone,
  MessageSquare, Zap, Settings, LogOut,
  ChevronRight, LayoutDashboard,
  Building2, AlertCircle, Brain, Plug, Bell, Search
} from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut, useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/api/users.service';
import type { LucideIcon } from 'lucide-react';
import { useOnboardingStatus, useResumeOnboarding } from '@/hooks/onboarding/useOnboarding';
import { useFeatureAccess, type PremiumFeature } from '@/hooks/subscriptions/useFeatureAccess';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { useCurrentSubscription, isValidSubscription } from '@/hooks/subscriptions/useSubscriptions';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { UserRole } from '@/types/auth';

interface NavSubItem {
  label: string;
  href: string;
  requiredFeature?: PremiumFeature;
  minimumRole?: UserRole;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  items?: NavSubItem[];
  requiredFeature?: PremiumFeature;
  minimumRole?: UserRole;
}

// Simplified navigation structure with submenus
const mainNavItems: NavItem[] = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    href: '/dashboard' 
  },
  { 
    icon: MessageSquare, 
    label: 'Conversations', 
    href: '/conversations'
  },
  {
    icon: Phone,
    label: 'Channels',
    href: '/channels',
    minimumRole: 'Admin',
    items: [
      { label: 'Overview', href: '/channels' },
      { label: 'AI Voice', href: '/ai-voice', requiredFeature: 'ai_voice' },
      { label: 'SMS', href: '/channels/sms' },
      { label: 'SMS Templates', href: '/channels/sms-templates' },
      { label: 'Voice Calls', href: '/channels/voice' },
      { label: 'WhatsApp', href: '/channels/whatsapp' },
      { label: 'Social Media', href: '/channels/social' },
      { label: 'Web Forms', href: '/channels/webform' },
      { label: 'Forms', href: '/forms' },
      { label: 'Surveys', href: '/surveys' },
      { label: 'QR Codes', href: '/channels/qrcode' },
      { label: 'Chat Widget', href: '/channels/widget' },
      { label: 'Email Templates', href: '/email-templates' },
      { label: 'Web Chat Builder', href: '/web-chat-builder' },
      { label: 'Social Builder', href: '/social-builder' },
    ]
  },
  {
    icon: Target,
    label: 'Leads & CRM',
    href: '/leads',
    items: [
      { label: 'All Leads', href: '/leads' },
      { label: 'Lead Scoring', href: '/lead-scoring' },
      { label: 'Qualification', href: '/leads/qualification' },
      { label: 'Contacts', href: '/crm' },
      { label: 'Calendar', href: '/calendar' },
      { label: 'Bookings', href: '/bookings' },
      { label: 'Proposals', href: '/proposals' },
      { label: 'Links', href: '/links' },
    ]
  },
  {
    icon: Zap,
    label: 'Automation',
    href: '/workflows',
    items: [
      { label: 'Workflows', href: '/workflows' },
      { label: 'Custom Workflows', href: '/workflows/custom' },
      { label: 'Workflow Gallery', href: '/workflows/gallery' },
      { label: 'Journey Builder', href: '/journeys' },
      { label: 'AI Templates', href: '/ai-templates' },
      { label: 'Testing Center', href: '/testing-center' },
    ]
  },
  {
    icon: Brain,
    label: 'Knowledge Base',
    href: '/settings/knowledge-base',
    items: [
      { label: 'All Articles', href: '/settings/knowledge-base' },
      { label: 'FAQs', href: '/settings/knowledge-base?tab=faqs' },
    ]
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    href: '/analytics',
    items: [
      { label: 'Dashboard', href: '/analytics' },
      { label: 'Reports', href: '/analytics/reports' },
      { label: 'AI Usage', href: '/analytics/ai-usage' },
      { label: 'Advanced', href: '/advanced-analytics' },
    ]
  },
  {
    icon: Plug,
    label: 'Integrations',
    href: '/integrations'
  },
  {
    icon: Bell,
    label: 'Notifications',
    href: '/notifications'
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/settings',
    items: [
      { label: 'General', href: '/settings' },
      { label: 'AI Training', href: '/settings/ai-training' },
      { label: 'Voice Agents', href: '/settings/voice-agents' },
      { label: 'Call Scripts', href: '/settings/call-scripts' },
      { label: 'Quick Replies', href: '/settings/quick-replies' },
      { label: 'Auto Assignment', href: '/settings/auto-assignment' },
      { label: 'Scoring Rules', href: '/settings/scoring' },
      { label: 'Source Tracking', href: '/settings/source-tracking' },
      { label: 'Calendar', href: '/settings/calendar' },
      { label: 'Team', href: '/settings/team' },
      { label: 'Billing', href: '/settings/billing' },
      { label: 'Subscription', href: '/settings/subscription' },
      { label: 'Security', href: '/settings/security' },
      { label: 'System', href: '/settings/system', minimumRole: 'Admin' },
      { label: 'API Keys', href: '/settings/api-keys', minimumRole: 'Admin' },
      { label: 'Audit Logs', href: '/settings/audit-logs', minimumRole: 'Admin' },
      { label: 'Bulk Import', href: '/settings/bulk-import' },
      { label: 'Exports', href: '/settings/exports' },
      { label: 'Support', href: '/support' },
    ]
  },
];

// Role hierarchy for minimum role checks
const ROLE_HIERARCHY: Record<UserRole, number> = {
  Viewer: 0,
  Manager: 1,
  Admin: 2,
  Owner: 3,
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { data: onboardingStatus } = useOnboardingStatus();
  const resumeOnboardingMutation = useResumeOnboarding();
  const { hasFeatureAccess } = useFeatureAccess();
  const { role } = usePermissions();
  const { data: subscription, isLoading: isLoadingSubscription, isError: isSubscriptionError, subscriptionError } = useCurrentSubscription();
  const [confirmedPlanName, setConfirmedPlanName] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Fetch user profile for profile picture
  const { data: userProfile } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => usersService.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!session?.user,
  });

  // Check for confirmed plan name from payment success (webhook may not have processed yet)
  useEffect(() => {
    const storedPlanName = sessionStorage.getItem('confirmedPlanName');
    if (storedPlanName) {
      setConfirmedPlanName(storedPlanName);
    }
  }, []);

  // Determine subscription display state
  // NEVER default to "Free Flow" - show actual state or error
  const hasValidSubscription = isValidSubscription(subscription);
  const displayPlanName = confirmedPlanName || (hasValidSubscription ? subscription.planName : null);
  const isPaidPlan = displayPlanName?.toLowerCase().includes('smart') || 
                     displayPlanName?.toLowerCase().includes('ultra') || 
                     displayPlanName?.toLowerCase().includes('enterprise') || false;
  const isDevBypass = typeof window !== 'undefined' && sessionStorage.getItem('devBypass') === 'true';
  const showSubscriptionError = isSubscriptionError && !confirmedPlanName && !isDevBypass;

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

  const handleResumeSetup = async () => {
    await resumeOnboardingMutation.mutateAsync();
  };

  // Get business name from onboarding status - only show if it's a real value
  const businessName = onboardingStatus?.businessName;
  const hasValidBusinessName = businessName &&
    businessName.trim() !== '' &&
    !businessName.toLowerCase().includes('your business') &&
    !businessName.toLowerCase().includes("'s business"); // Exclude placeholder patterns
  const isSetupSkipped = onboardingStatus?.isSkipped && !onboardingStatus?.isComplete;

  // Check if user has minimum role
  const hasMinimumRole = (minimumRole: UserRole): boolean => {
    if (!role) return false;
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole];
  };

  // Filter navigation items based on feature access and role
  const filterNavItems = (items: NavItem[]) => {
    return items.filter(item => {
      // Check role requirement
      if (item.minimumRole && !hasMinimumRole(item.minimumRole)) return false;
      // Check feature requirement
      if (item.requiredFeature && !hasFeatureAccess(item.requiredFeature)) return false;
      return true;
    });
  };

  const toggleExpanded = (itemLabel: string) => {
    setExpandedItems(prev => 
      prev.includes(itemLabel) 
        ? prev.filter(l => l !== itemLabel)
        : [...prev, itemLabel]
    );
  };

  const renderNavItem = (item: NavItem, isActive: boolean) => {
    const isExpanded = expandedItems.includes(item.label);
    const hasSubItems = item.items && item.items.length > 0;

    return (
      <div key={item.href}>
        {hasSubItems ? (
          <div
            onClick={() => toggleExpanded(item.label)}
            className={cn(
              'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer',
              'text-slate-300 hover:bg-white/5 hover:text-white'
            )}
          >
            {/* Icon with background */}
            <div className="relative flex size-8 items-center justify-center rounded-lg transition-all duration-200 bg-white/5 group-hover:bg-white/10">
              <item.icon className="size-4 shrink-0 transition-colors text-slate-400 group-hover:text-white" />
            </div>

            <span className="relative tracking-wide flex-1">{item.label}</span>

            <ChevronRight className={cn(
              'size-4 text-slate-400 transition-transform duration-200',
              isExpanded && 'rotate-90'
            )} />
          </div>
        ) : (
          <Link
            href={item.href}
            className={cn(
              'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white shadow-lg border border-indigo-400/30'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            )}
          >
            {/* Active indicator glow */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur-md" />
            )}

            {/* Icon with background */}
            <div className={cn(
              'relative flex size-8 items-center justify-center rounded-lg transition-all duration-200',
              isActive
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg'
                : 'bg-white/5 group-hover:bg-white/10'
            )}>
              <item.icon className={cn(
                'size-4 shrink-0 transition-colors',
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
              )} />
            </div>

            <span className="relative tracking-wide">{item.label}</span>

            {isActive && (
              <div className="ml-auto flex size-6 items-center justify-center rounded-lg bg-indigo-400/20">
                <ChevronRight className="size-3.5 text-indigo-200" />
              </div>
            )}
          </Link>
        )}

        {/* Submenu items */}
        {hasSubItems && isExpanded && (
          <div className="ml-11 mt-1 space-y-1">
            {item.items?.filter(subItem => {
              // Filter submenus by feature and role
              if (subItem.requiredFeature && !hasFeatureAccess(subItem.requiredFeature)) return false;
              if (subItem.minimumRole && !hasMinimumRole(subItem.minimumRole)) return false;
              return true;
            }).map(subItem => {
              // For root paths like /settings, only match exactly to avoid highlighting "General" when on /settings/ai-training
              const isRootPath = subItem.href === item.href;
              const isSubActive = isRootPath 
                ? pathname === subItem.href 
                : pathname === subItem.href || pathname.startsWith(subItem.href + '/');
              return (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={cn(
                    'block px-3 py-2 text-sm rounded-lg transition-colors',
                    isSubActive
                      ? 'text-indigo-300 bg-muted/300/10 font-medium'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  {subItem.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="hidden lg:block fixed left-0 top-0 z-40 h-screen w-80 bg-gradient-to-br from-[#0f1729] via-[#1a2642] to-[#0d1b2a] shadow-2xl">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />

      {/* Animated glow effects - subtle purple accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-muted/300/8 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/50/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 flex h-full flex-col">
        {/* Logo - clean and prominent */}
        <div className="flex h-20 items-center px-6 border-b border-indigo-500/10 bg-gradient-to-r from-slate-800/30 to-slate-900/30">
          <Logo size="md" darkBg />
        </div>

        {/* Business Name - Only show if valid */}
        {hasValidBusinessName && (
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3.5 py-2.5 border border-primary/10">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                <Building2 className="size-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-white tracking-wide truncate min-w-0" title={businessName}>{businessName}</span>
            </div>
          </div>
        )}

        {/* Quick Search Button - Opens Command Palette */}
        <div className="mx-4 mb-3">
          <button
            onClick={() => {
              // Dispatch keyboard event to open command palette
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                bubbles: true,
              });
              document.dispatchEvent(event);
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-indigo-500/20 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Search className="size-4" />
            <span className="text-sm font-medium">Quick search...</span>
            <kbd className="ml-auto text-xs px-2 py-1 rounded border border-slate-600 bg-slate-800/50 font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Complete Setup Banner (if skipped) */}
        {isSetupSkipped && (
          <div className="mx-4 mb-3">
            <button
              onClick={handleResumeSetup}
              disabled={resumeOnboardingMutation.isPending}
              className="group flex w-full items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 px-3.5 py-3 text-left transition-all hover:from-amber-500/25 hover:to-orange-500/25 border border-amber-400/20"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20">
                <AlertCircle className="size-4 shrink-0 text-amber-300 group-hover:text-amber-200 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-100 tracking-wide">Complete Setup</p>
                <p className="text-xs text-amber-200/60 truncate font-medium">Finish setting up your account</p>
              </div>
              <ChevronRight className="size-4 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Navigation - Simplified 7 Categories */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {filterNavItems(mainNavItems).map((item) => renderNavItem(item, pathname.startsWith(item.href)))}
        </nav>

        {/* Bottom Section */}
        <div className="space-y-3 border-t border-cyan-500/10 p-4">
          {/* Subscription Card - Shows loading, error, or actual subscription state */}
          {isLoadingSubscription ? (
            /* Loading State */
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 p-4 shadow-lg animate-pulse">
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-white/20">
                    <Zap className="size-3.5 text-slate-400" />
                  </div>
                  <div className="h-3 w-20 bg-white/20 rounded" />
                </div>
                <div className="h-4 w-32 bg-white/20 rounded mb-3" />
                <div className="h-9 w-full bg-white/20 rounded-lg" />
              </div>
            </div>
          ) : showSubscriptionError ? (
            /* Error State - Never default to Free Flow */
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-600 to-red-700 p-4 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-white/20">
                    <AlertCircle className="size-3.5 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/80">Error</span>
                </div>
                <p className="text-sm font-semibold text-white mb-3 tracking-wide">
                  {subscriptionError?.code === 'NETWORK_ERROR' 
                    ? 'Connection issue' 
                    : 'Unable to load plan'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="block w-full rounded-lg bg-white px-4 py-2 text-center text-sm font-bold text-red-700 shadow-md hover:bg-white/95 transition-all tracking-wide"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : isPaidPlan ? (
            /* Paid Plan Card */
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 p-4 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-white/20">
                    <Zap className="size-3.5 text-amber-300" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/80">{displayPlanName}</span>
                </div>
                <p className="text-sm font-semibold text-white mb-3 tracking-wide">
                  Full access to AI-powered features
                </p>
                <Link
                  href="/settings/subscription"
                  className="block w-full rounded-lg bg-white/20 px-4 py-2 text-center text-sm font-bold text-white shadow-md hover:bg-white/30 transition-all tracking-wide border border-white/20"
                >
                  Manage Plan
                </Link>
              </div>
            </div>
          ) : (
            /* Free/Trial Plan or No Subscription - Show upgrade banner */
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 p-4 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-white/20">
                    <Zap className="size-3.5 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/80">{displayPlanName || 'Free Plan'}</span>
                </div>
                <p className="text-sm font-semibold text-white mb-3 tracking-wide">
                  Unlock unlimited leads & AI power
                </p>
                <Link
                  href="/settings/subscription"
                  className="block w-full rounded-lg bg-white px-4 py-2 text-center text-sm font-bold text-cyan-700 shadow-md hover:bg-white/95 transition-all tracking-wide"
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
          )}

          {/* User Profile */}
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 border border-cyan-500/10">
            <Avatar className="size-10 ring-2 ring-cyan-500/20">
              {userProfile?.profilePictureUrl && (
                <AvatarImage
                  src={userProfile.profilePictureUrl}
                  alt={userProfile?.fullName || 'Profile'}
                />
              )}
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold text-sm">
                {userProfile?.firstName?.[0]?.toUpperCase() || session?.user?.firstName?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'U'}
                {userProfile?.lastName?.[0]?.toUpperCase() || session?.user?.lastName?.[0]?.toUpperCase() || ''}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white truncate tracking-wide">
                  {userProfile?.fullName || (session?.user?.firstName && session?.user?.lastName
                    ? `${session.user.firstName} ${session.user.lastName}`
                    : session?.user?.firstName || session?.user?.email?.split('@')[0] || 'User')}
                </p>
                {role && (
                  <span className={cn(
                    "shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
                    role === 'Owner' && "bg-amber-500/20 text-amber-300",
                    role === 'Admin' && "bg-purple-500/20 text-purple-300",
                    role === 'Manager' && "bg-blue-500/20 text-blue-300",
                    role === 'Viewer' && "bg-slate-500/20 text-slate-300"
                  )}>
                    {role}
                  </span>
                )}
              </div>
              <p className={cn(
                "text-xs font-medium truncate",
                isPaidPlan ? "text-purple-300" : "text-slate-400"
              )}>{displayPlanName || (isLoadingSubscription ? 'Loading...' : 'Free Plan')}</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter className="text-slate-400 hover:text-white" />
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="group flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-300/80 transition-all hover:bg-red-500/15 hover:text-red-300 border border-red-400/20 hover:border-red-400/30 tracking-wide"
          >
            <LogOut className="size-4 group-hover:-rotate-6 transition-transform" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}