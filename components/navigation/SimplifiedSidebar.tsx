'use client';

/**
 * Simplified Sidebar - Multi-section navigation
 * AI-modern glassmorphic styling with smooth interactions
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo, LogoMark } from '@/components/shared/logo';
import {
  ChevronLeft,
  ChevronRight,
  Command as CommandIcon,
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Users,
  Bot,
  Calendar,
  FileText,
  BarChart3,
  TrendingUp,
  Activity,
  Radio,
  Phone,
  MessageCircle,
  Mail,
  QrCode,
  FormInput,
  Workflow,
  Route,
  Mic,
  FlaskConical,
  Plug,
  GraduationCap,
  HelpCircle,
  Library,
  Settings,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/api/users.service';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { useCurrentSubscription, useSubscriptionUsage, isValidSubscription } from '@/hooks/subscriptions/useSubscriptions';
import { useBusinessProfile } from '@/hooks/api/useBusinessProfile';
import { BusinessPopover, SubscriptionPopover, UserPopover, SidebarNotificationBell } from './sidebar-footer';
import { surveysService } from '@/services/api/surveys.service';

// ── Nav Item Type ───────────────────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

// ── Menu Definitions ────────────────────────────────────────────────────────
const menuItems: NavItem[] = [
  { id: 'dashboard',     label: 'Overview',      icon: LayoutDashboard, href: '/dashboard' },
    { id: 'my-work',       label: 'My Work',         icon: Bot,             href: '/my-work' },
      { id: 'conversations', label: 'live Conversations',   icon: MessageSquare,   href: '/conversations' },
      { id: 'crm-contacts',         label: 'CRM & Contacts',     icon: Users,           href: '/leads' },
  { id: 'calendar',      label: 'Calendar',        icon: Calendar,        href: '/calendar' },
  { id: 'proposals',     label: 'Proposals',       icon: FileText,        href: '/proposals' },
];

const statisticsItems: NavItem[] = [
    { id: 'ai-usage',           label: 'Omnichannel Lead Capture', icon: TrendingUp,  href: '/analytics/ai-usage' },
  { id: 'analytics',          label: 'Analytics',          icon: BarChart3,   href: '/analytics' },
  { id: 'advanced-analytics', label: 'Advanced Analytics', icon: Activity,    href: '/advanced-analytics' },
];



const builderItems: NavItem[] = [
  //{ id: 'channels',   label: 'All Channels',   icon: Radio,         href: '/channels' },

  { id: 'voice-agents',   label: 'AI Voice Agents',   icon: Phone,          href: '/ai-voice' },
  //{ id: 'voice',      label: 'Voice',           icon: Phone,         href: '/channels/voice' },
  { id: 'forms',      label: 'Forms',           icon: FormInput,     href: '/forms' },
  { id: 'survey',     label: 'Survey',          icon: Mail,     href: '/survey' },
  { id: 'email',      label: 'Email Templates', icon: Mail,          href: '/email-templates' },
  { id: 'sms',        label: 'SMS',             icon: MessageCircle, href: '/channels/sms' },
  { id: 'links',        label: 'Links',         icon: Route, href: '/channels/sms' },
    { id: 'social',     label: 'Social builder',    icon: Radio,         href: '/channels/social' },
  { id: 'web-chat',   label: 'Web Chat Builder',        icon: MessageCircle, href: '/channels/whatsapp' },



  { id: 'qr-codes',   label: 'QR Codes',        icon: QrCode,        href: '/channels/qrcode' },
];

const toolsItems: NavItem[] = [
  { id: 'journeys',       label: 'Journeys Automation',       icon: Route,        href: '/journeys' },
  { id: 'lead-scoring',      label: 'Lead Scoring',      icon: MessageCircle,     href: '/lead-scoring' },
  { id: 'testing-center', label: 'Testing Center', icon: FlaskConical, href: '/testing-center' },
  { id: 'integrations',   label: 'Integrations',   icon: Plug,         href: '/integrations' },
  { id: 'Usage',   label: 'Usage',           icon: HelpCircle, href: '/usage' },
];

const learningItems: NavItem[] = [
{ id: 'ai-readiness', label: 'AI Readiness', icon: GraduationCap, href: '/dashboard/ai-readiness' },
  { id: 'support',      label: 'Articles & FAQ',      icon: HelpCircle,    href: '/support' },
];

const configItems: NavItem[] = [
  { id: 'knowledge-base',   label: 'Knowledge Base',   icon: Library,    href: '/settings/knowledge-base' },
  { id: 'general-settings', label: 'General Settings',  icon: Settings,   href: '/settings' },
  { id: 'system-settings',  label: 'System Settings',   icon: Shield,     href: '/settings/system' },
      { id: 'team-members',     label: 'Team Members',      icon: Users,      href: '/settings/team' },

];

// ── Helpers ─────────────────────────────────────────────────────────────────
function isItemActive(href: string, pathname: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(href + '/');
}

// ── Component ───────────────────────────────────────────────────────────────

interface SimplifiedSidebarProps {
  onLogout?: () => void;
  unreadCount?: number;
  onCommandPaletteOpen?: () => void;
  className?: string;
}

export function SimplifiedSidebar({
  onLogout,
  unreadCount,
  onCommandPaletteOpen,
  className,
}: SimplifiedSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [confirmedPlanName, setConfirmedPlanName] = useState<string | null>(null);

  // Get user session and profile
  const { data: session } = useSession();
  const { role } = usePermissions();
  const { data: subscription, isLoading: isLoadingSubscription } = useCurrentSubscription();
  const { data: usage, isLoading: isLoadingUsage } = useSubscriptionUsage();
  const { data: businessProfile, isLoading: isLoadingBusiness } = useBusinessProfile();

  // Fetch user profile for profile picture
  const { data: userProfile } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => usersService.getCurrentUser(),
    staleTime: 1000 * 60 * 5,
    enabled: !!session?.user,
  });

  // Check for confirmed plan name from payment success
  useEffect(() => {
    const storedPlanName = sessionStorage.getItem('confirmedPlanName');
    if (storedPlanName) {
      setConfirmedPlanName(storedPlanName);
    }
  }, []);

  // Subscription display logic
  const hasValidSubscription = isValidSubscription(subscription);
  const effectiveSubscription = hasValidSubscription && confirmedPlanName
    ? { ...subscription, planName: confirmedPlanName }
    : subscription;

  /** Render a single nav link with AI glassy styling */
  const renderNavLink = (item: NavItem, size: 'lg' | 'sm' = 'sm') => {
    const active = isItemActive(item.href, pathname);
    const Icon = item.icon;
    const py = size === 'lg' ? 'py-3' : 'py-2';
    const iconSize = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

    if (collapsed) {
      return (
        <TooltipProvider key={item.id}>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  'relative flex items-center justify-center size-11 rounded-xl transition-all duration-200',
                  active
                    ? 'bg-gradient-to-br from-purple-600/90 to-indigo-700/90 backdrop-blur-md text-white shadow-lg shadow-purple-500/25 border border-purple-400/20 ring-1 ring-white/10'
                    : 'text-gray-500 hover:bg-white/60 hover:backdrop-blur-sm hover:text-purple-700 hover:shadow-md hover:shadow-purple-500/10 hover:border hover:border-purple-200/40 active:scale-95 active:bg-purple-50/80'
                )}
              >
                <Icon className="size-[18px]" strokeWidth={active ? 2.2 : 1.8} />
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={12}
              className="font-medium bg-gray-900 text-white border-0 shadow-xl px-3 py-1.5 text-xs rounded-lg"
            >
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          'group relative w-full flex items-center gap-3 px-4 rounded-xl transition-all duration-200',
          py,
          active
            ? 'bg-gradient-to-r from-purple-600/90 via-indigo-600/85 to-purple-700/90 backdrop-blur-md text-white shadow-lg shadow-purple-500/20 border border-purple-400/20 ring-1 ring-white/10'
            : 'text-gray-600 hover:bg-white/70 hover:backdrop-blur-sm hover:shadow-md hover:shadow-purple-500/8 hover:border hover:border-purple-200/30 hover:text-gray-900 active:scale-[0.98] active:bg-purple-50/60'
        )}
      >
        <Icon className={iconSize} strokeWidth={active ? 2.2 : 1.8} />
        <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
        {active && <ChevronRight className="w-4 h-4 text-white/60" />}
      </Link>
    );
  };

  /** Render a section with a label divider */
  const renderSection = (title: string, items: NavItem[]) => {
    if (collapsed) {
      return (
        <div key={title} className="mt-3 pt-3 border-t border-gray-200/60 space-y-1.5">
          {items.map((item) => renderNavLink(item))}
        </div>
      );
    }

    return (
      <div key={title} className="mt-6 pt-4 border-t border-purple-200/30">
        <div className="text-[10px] text-purple-400/70 px-4 mb-3 uppercase tracking-[0.15em] font-semibold">
          {title}
        </div>
        <div className="space-y-1">
          {items.map((item) => renderNavLink(item))}
        </div>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen z-40',
        'flex flex-col transition-all duration-300 ease-in-out',
        'bg-white border-r border-gray-200/80',
        'shadow-[0_0_40px_-12px_rgba(88,28,135,0.08)]',
        collapsed ? 'w-16' : 'w-72',
        className
      )}
    >
      {/* Background ambient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-12 w-48 h-48 bg-orange-50/30 rounded-full blur-3xl" />
        <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-purple-200/30 to-transparent" />
      </div>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className={cn(
        'relative h-14 flex items-center border-b border-gray-100 shrink-0',
        collapsed ? 'justify-center px-0' : 'justify-between px-4'
      )}>
        <div className="relative z-10 flex items-center gap-2">
          {collapsed ? (
            <LogoMark className="h-7" />
          ) : (
            <Logo showText size="sm" />
          )}
        </div>
        {!collapsed && (
          <Sparkles className="relative z-10 size-3.5 text-purple-400/40" />
        )}
      </div>

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav
        className={cn(
          'relative z-10 flex-1 overflow-y-auto min-h-0',
          collapsed ? 'px-2 py-3' : 'py-6 px-3'
        )}
        style={!collapsed ? { maxHeight: 'calc(100vh - 240px)' } : undefined}
      >
        {/* Command Palette */}
        {!collapsed && onCommandPaletteOpen && (
          <button
            onClick={onCommandPaletteOpen}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/80 text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:border-gray-300 transition-all mb-4 group"
          >
            <CommandIcon className="size-3.5" />
            <span className="text-[13px]">Search...</span>
            <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded border border-gray-200 bg-white font-mono text-gray-400 group-hover:border-gray-300">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Main Menu */}
        <div className={cn(collapsed ? 'space-y-1.5' : 'space-y-1 mb-6')}>
          {menuItems.map((item) => renderNavLink(item, 'lg'))}
        </div>

        {/* Sections */}
        {renderSection('Statistics', statisticsItems)}
        {renderSection('Channels', builderItems)}
        {renderSection('Tools', toolsItems)}
        {renderSection('Learning', learningItems)}
        {renderSection('Configuration', configItems)}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div className={cn(
        'relative z-10 border-t border-gray-100 space-y-1.5',
        collapsed ? 'p-2' : 'p-3'
      )}>
        <BusinessPopover
          business={businessProfile}
          isLoading={isLoadingBusiness}
          collapsed={collapsed}
        />
        <SubscriptionPopover
          subscription={effectiveSubscription}
          usage={usage}
          isLoadingSubscription={isLoadingSubscription}
          isLoadingUsage={isLoadingUsage}
          collapsed={collapsed}
        />
        <SidebarNotificationBell collapsed={collapsed} />
        <UserPopover
          user={userProfile}
          sessionUser={session?.user}
          role={role}
          collapsed={collapsed}
          onLogout={onLogout}
        />

        {/* Collapse toggle */}
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                  'w-full flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all',
                  collapsed ? 'size-10' : 'px-3 py-1.5'
                )}
              >
                {collapsed ? (
                  <ChevronRight className="size-4" />
                ) : (
                  <ChevronLeft className="size-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent
              side={collapsed ? 'right' : 'top'}
              sideOffset={8}
              className="font-medium bg-gray-900 text-white border-0 shadow-xl px-3 py-1.5 text-xs rounded-lg"
            >
              {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
