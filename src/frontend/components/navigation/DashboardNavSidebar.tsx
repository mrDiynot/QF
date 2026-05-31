'use client';

/**
 * Dashboard Navigation Sidebar
 * White background with dark purple text and light orange border accents.
 * AI-modern styling with glowing orbs and glassmorphic effects.
 * Sections are collapsible with smooth animations.
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/logo';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Bot,
  Calendar,
  FileText,
  ChevronRight,
  ChevronDown,
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
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useBusinessProfile } from '@/hooks/api/useBusinessProfile';
import { BusinessPopover, UserPopover } from './sidebar-footer';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/api/users.service';

// ── Menu Item Type ──────────────────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

// ── Menu Definitions ────────────────────────────────────────────────────────

const menuItems: NavItem[] = [
  { id: 'dashboard',     label: 'Dashboard',      icon: LayoutDashboard, href: '/dashboard' },
  { id: 'conversations', label: 'Conversations',   icon: MessageSquare,   href: '/conversations' },
  { id: 'leads',         label: 'Leads & CRM',     icon: Users,           href: '/leads' },
  { id: 'ai-studio',     label: 'AI Studio',       icon: Bot,             href: '/ai-templates' },
  { id: 'calendar',      label: 'Calendar',        icon: Calendar,        href: '/calendar' },
  { id: 'proposals',     label: 'Proposals',       icon: FileText,        href: '/proposals' },
];

const statisticsItems: NavItem[] = [
  { id: 'analytics',          label: 'Analytics',          icon: BarChart3,   href: '/analytics' },
  { id: 'ai-usage',           label: 'AI Usage',           icon: TrendingUp,  href: '/analytics/ai-usage' },
  { id: 'advanced-analytics', label: 'Advanced Analytics', icon: Activity,    href: '/advanced-analytics' },
];

const builderItems: NavItem[] = [
  { id: 'channels',   label: 'All Channels',   icon: Radio,         href: '/channels' },
  { id: 'sms',        label: 'SMS',             icon: MessageCircle, href: '/channels/sms' },
  { id: 'voice',      label: 'Voice',           icon: Phone,         href: '/channels/voice' },
  { id: 'whatsapp',   label: 'WhatsApp',        icon: MessageCircle, href: '/channels/whatsapp' },
  { id: 'social',     label: 'Social Media',    icon: Radio,         href: '/channels/social' },
  { id: 'email',      label: 'Email Templates', icon: Mail,          href: '/email-templates' },
  { id: 'forms',      label: 'Forms',           icon: FormInput,     href: '/forms' },
  { id: 'qr-codes',   label: 'QR Codes',        icon: QrCode,        href: '/channels/qrcode' },
];

const toolsItems: NavItem[] = [
  { id: 'workflows',      label: 'Workflows',      icon: Workflow,     href: '/workflows' },
  { id: 'journeys',       label: 'Journeys',       icon: Route,        href: '/journeys' },
  { id: 'voice-agents',   label: 'Voice Agents',   icon: Mic,          href: '/ai-voice' },
  { id: 'testing-center', label: 'Testing Center', icon: FlaskConical, href: '/testing-center' },
  { id: 'integrations',   label: 'Integrations',   icon: Plug,         href: '/integrations' },
];

const learningItems: NavItem[] = [
  { id: 'ai-readiness', label: 'AI Readiness', icon: GraduationCap, href: '/dashboard/ai-readiness' },
  { id: 'support',      label: 'Support',      icon: HelpCircle,    href: '/support' },
];

const configItems: NavItem[] = [
  { id: 'knowledge-base',   label: 'Knowledge Base',   icon: Library,    href: '/settings/knowledge-base' },
  { id: 'general-settings', label: 'General Settings',  icon: Settings,   href: '/settings' },
  { id: 'system-settings',  label: 'System Settings',   icon: Shield,     href: '/settings/system' },
  { id: 'support-config',   label: 'Support',           icon: HelpCircle, href: '/support' },
  //{ id: 'team-members',     label: 'Team Members',      icon: Users,      href: '/settings/team' },
];

// ── Section keys for collapse state ────────────────────────────────────────
type SectionKey = 'statistics' | 'channels' | 'tools' | 'learning' | 'configuration';

// ── Helpers ─────────────────────────────────────────────────────────────────

function isItemActive(href: string, pathname: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(href + '/');
}

/** Check if any item in a section is active (auto-expand that section) */
function hasSectionActive(items: NavItem[], pathname: string): boolean {
  return items.some((item) => isItemActive(item.href, pathname));
}

// ── Component ───────────────────────────────────────────────────────────────

interface DashboardNavSidebarProps {
  onLogout?: () => void;
  className?: string;
}

export function DashboardNavSidebar({ onLogout, className }: DashboardNavSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { role } = usePermissions();
  const { data: businessProfile, isLoading: isLoadingBusiness } = useBusinessProfile();

  const { data: userProfile } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => usersService.getCurrentUser(),
    staleTime: 1000 * 60 * 5,
    enabled: !!session?.user,
  });

  // Collapsed state — sections with an active item default to expanded
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    statistics: false,
    channels: false,
    tools: false,
    learning: false,
    configuration: false,
  });

  const toggleSection = useCallback((key: SectionKey) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  /** Renders a single nav link */
  const renderNavItem = (item: NavItem, size: 'lg' | 'sm' = 'sm') => {
    const active = isItemActive(item.href, pathname);
    const Icon = item.icon;
    const iconSize = size === 'lg' ? 'size-5' : 'size-4';
    const py = size === 'lg' ? 'py-3' : 'py-2';

    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          'group relative w-full flex items-center gap-3 px-4 rounded-xl transition-all duration-200 text-sm',
          py,
          active
            ? 'bg-purple-50 text-purple-900 shadow-sm border border-orange-200/70 font-semibold'
            : 'text-purple-700/80 hover:bg-purple-50/60 hover:text-purple-900'
        )}
      >
        {/* Active left accent bar */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-gradient-to-b from-purple-600 to-orange-400" />
        )}
        <Icon
          className={cn(
            iconSize,
            active ? 'text-purple-600' : 'text-purple-400 group-hover:text-purple-600'
          )}
          strokeWidth={active ? 2.5 : 2}
        />
        <span className="flex-1 text-left">{item.label}</span>
        {active && <ChevronRight className="size-4 text-purple-400" />}
      </Link>
    );
  };

  /** Renders a collapsible section with light orange divider accents */
  const renderSection = (key: SectionKey, title: string, items: NavItem[]) => {
    const sectionHasActive = hasSectionActive(items, pathname);
    // If a section has an active route, always show it expanded
    const isCollapsed = collapsed[key] && !sectionHasActive;
    const itemCount = items.length;

    return (
      <div className="mt-5 pt-4 border-t border-orange-200/50">
        {/* Clickable section header */}
        <button
          type="button"
          onClick={() => toggleSection(key)}
          className="group/header flex items-center gap-2 px-4 mb-2 w-full cursor-pointer"
          aria-expanded={!isCollapsed}
        >
          <div className="h-px flex-1 bg-gradient-to-r from-purple-300/30 to-transparent" />
          <span className="text-[10px] text-purple-400 uppercase tracking-[0.15em] font-semibold select-none">
            {title}
          </span>
          {/* Item count badge when collapsed */}
          {isCollapsed && (
            <span className="text-[9px] text-purple-300 bg-purple-50 rounded-full px-1.5 py-px font-medium">
              {itemCount}
            </span>
          )}
          <ChevronDown
            className={cn(
              'size-3 text-purple-300 transition-transform duration-200',
              isCollapsed && '-rotate-90'
            )}
          />
          <div className="h-px flex-1 bg-gradient-to-l from-orange-300/40 to-transparent" />
        </button>

        {/* Collapsible content with CSS transition */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-200 ease-in-out',
            isCollapsed ? 'max-h-0 opacity-0' : 'opacity-100'
          )}
          style={!isCollapsed ? { maxHeight: `${items.length * 44}px` } : undefined}
        >
          <div className="space-y-0.5">
            {items.map((item) => renderNavItem(item))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen z-40 w-64',
        'flex flex-col transition-all duration-300',
        'bg-white',
        'border-r border-orange-200/60',
        'shadow-xl shadow-purple-900/5',
        className
      )}
    >
      {/* ── AI Background Effects (subtle on white) ──────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-200/25 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-1/2 -left-16 w-48 h-48 bg-purple-100/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1.5s', animationDuration: '5s' }}
        />
        <div
          className="absolute top-[15%] -right-10 w-36 h-36 bg-orange-100/40 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s', animationDuration: '4s' }}
        />
        <div
          className="absolute bottom-[20%] -left-8 w-44 h-44 bg-orange-100/25 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '3s', animationDuration: '6s' }}
        />
        <div
          className="absolute bottom-0 right-0 w-52 h-52 bg-purple-100/25 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #7c3aed 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute right-0 top-0 w-[2px] h-full bg-gradient-to-b from-purple-400/20 via-orange-400/30 to-purple-400/20" />
      </div>

      {/* ── Header / Logo ────────────────────────────────────────────── */}
      <div className="relative z-10 h-16 flex items-center justify-between px-4 border-b border-orange-200/50">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 via-white to-orange-50/30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-purple-300/20 via-orange-300/25 to-purple-300/20" />
        <div className="relative z-10">
          <Logo showText size="sm" />
        </div>
        <Sparkles className="relative z-10 size-4 text-orange-400/60 animate-pulse" style={{ animationDuration: '3s' }} />
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <ScrollArea className="relative z-10 flex-1 py-4 px-3">
        {/* Main Menu (always visible, not collapsible) */}
        <div className="space-y-0.5 mb-2">
          {menuItems.map((item) => renderNavItem(item, 'lg'))}
        </div>

        {renderSection('statistics', 'Statistics', statisticsItems)}
        {renderSection('channels', 'Channels', builderItems)}
        {renderSection('tools', 'Tools', toolsItems)}
        {renderSection('learning', 'Learning', learningItems)}
        {renderSection('configuration', 'Configuration', configItems)}
      </ScrollArea>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="relative z-10 border-t border-orange-200/50 p-3">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-50/40 via-white to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-purple-300/20 via-orange-300/25 to-purple-300/20" />

        <div className="relative z-10 space-y-2">
          <BusinessPopover
            business={businessProfile}
            isLoading={isLoadingBusiness}
            collapsed={false}
          />
          <UserPopover
            user={userProfile}
            sessionUser={session?.user}
            role={role}
            collapsed={false}
            onLogout={onLogout}
          />
        </div>
      </div>
    </aside>
  );
}
