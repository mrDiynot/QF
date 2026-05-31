/**
 * Simplified Navigation Structure
 * Consolidates 29 routes into 7 core apps
 * 
 * Design Philosophy: AI Command Center
 * - Focus on essential workflows
 * - Reduce cognitive load
 * - Command palette for power users
 */

import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Bot, 
  BarChart3, 
  Radio,
  Settings,
  type LucideIcon
} from 'lucide-react';

export interface SubMenuItem {
  label: string;
  href: string;
  description?: string;
  dividerBefore?: boolean; // Shows a category divider before this item
  category?: string; // Category label for the divider
}

export interface SimplifiedMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number | string;
  subItems?: SubMenuItem[];
}

/**
 * Get simplified 7-app navigation structure
 */
export function getSimplifiedMenu(options?: {
  unreadCount?: number;
  pathname?: string;
}): SimplifiedMenuItem[] {
  const { unreadCount, pathname: _pathname = '' } = options || {};

  return [
    // 1. Overview - Dashboard + AI Readiness
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      href: '/dashboard',
      subItems: [
        {
          label: 'Dashboard',
          href: '/dashboard',
          description: 'AI performance & metrics',
        },
        {
          label: 'AI Readiness',
          href: '/dashboard/ai-readiness',
          description: 'Setup checklist',
        },
      ],
    },

    // 2. Conversations - Unified inbox (all channels)
    {
      id: 'conversations',
      label: 'Conversations',
      icon: MessageSquare,
      href: '/conversations',
      badge: unreadCount,
      subItems: [
        {
          label: 'All Conversations',
          href: '/conversations',
          description: 'Unified inbox',
        },
        {
          label: 'Queue',
          href: '/conversations?filter=queue',
          description: 'Pending responses',
        },
      ],
    },

    // 3. Leads & CRM - Pipeline, contacts, calendar
    {
      id: 'leads',
      label: 'Leads & CRM',
      icon: Users,
      href: '/leads',
      subItems: [
        {
          label: 'All Leads',
          href: '/leads',
          description: 'Lead management',
        },
        {
          label: 'Pipeline',
          href: '/leads?view=pipeline',
          description: 'Visual pipeline',
        },
        {
          label: 'AI Scoring',
          href: '/lead-scoring',
          description: 'AI qualification & BANT',
        },
        {
          label: 'Contacts',
          href: '/crm',
          description: 'Contact database',
        },
        {
          label: 'Calendar',
          href: '/calendar',
          description: 'Bookings & meetings',
        },
        {
          label: 'Proposals',
          href: '/proposals',
          description: 'Quotes & proposals',
        },
        {
          label: 'Tracking Links',
          href: '/links',
          description: 'UTM links',
        },
      ],
    },

    // 4. AI Studio - Templates, workflows, voice
    {
      id: 'ai-studio',
      label: 'AI Studio',
      icon: Bot,
      href: '/ai-templates',
      subItems: [
        {
          label: 'Templates',
          href: '/ai-templates',
          description: 'Conversation templates',
        },
        {
          label: 'Workflows',
          href: '/workflows',
          description: 'Automation builder',
        },
        {
          label: 'Journeys',
          href: '/journeys',
          description: 'Customer journeys',
        },
        {
          label: 'Voice Agents',
          href: '/ai-voice',
          description: 'AI-powered calls',
        },
        {
          label: 'Testing Center askdhfjjasldkfh',
          href: '/testing-center',
          description: 'Test AI responses',
        },
      ],
    },

    // 5. Analytics - Performance, reports
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      href: '/analytics',
      subItems: [
        {
          label: 'Performance',
          href: '/analytics',
          description: 'Key metrics',
        },
        {
          label: 'AI Usage',
          href: '/analytics/ai-usage',
          description: 'AI activity',
        },
        {
          label: 'Advanced',
          href: '/advanced-analytics',
          description: 'Deep insights',
        },
        {
          label: 'Reports',
          href: '/analytics/reports',
          description: 'Custom reports',
        },
      ],
    },

    // 6. Channels - Messaging channels and lead capture
    {
      id: 'channels',
      label: 'Channels',
      icon: Radio,
      href: '/channels',
      subItems: [
        {
          label: 'All Channels',
          href: '/channels',
          description: 'Channel overview',
        },
        {
          label: 'SMS',
          href: '/channels/sms',
          description: 'Text messaging',
        },
        {
          label: 'Voice',
          href: '/channels/voice',
          description: 'Phone calls',
        },
        {
          label: 'WhatsApp',
          href: '/channels/whatsapp',
          description: 'WhatsApp Business',
        },
        {
          label: 'Social Media',
          href: '/channels/social',
          description: 'Instagram & Facebook',
        },
        {
          label: 'Chat Widget',
          href: '/web-chat-builder',
          description: 'Website chat',
        },
        {
          label: 'Forms',
          href: '/forms',
          description: 'Lead capture',
        },
        {
          label: 'Surveys',
          href: '/surveys',
          description: 'Feedback & NPS',
        },
        {
          label: 'QR Codes',
          href: '/channels/qrcode',
          description: 'Scan-to-connect',
        },
        {
          label: 'Email Templates',
          href: '/email-templates',
          description: 'Email designs',
        },
      ],
    },

    // 7. Settings - Organized into logical subcategories
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      subItems: [
        // === ACCOUNT & PROFILE ===
        {
          label: 'Profile & Business',
          href: '/settings',
          description: 'Your account',
          dividerBefore: true,
          category: 'Account',
        },
        {
          label: 'Security',
          href: '/settings/security',
          description: '2FA & password',
        },

        // === AI & AUTOMATION ===
        {
          label: 'AI Configuration',
          href: '/settings/system',
          description: 'AI behavior & BANT',
          dividerBefore: true,
          category: 'AI & Automation',
        },
        {
          label: 'Knowledge Base',
          href: '/settings/knowledge-base',
          description: 'Train your AI',
        },
        {
          label: 'Quick Replies',
          href: '/settings/quick-replies',
          description: 'Saved responses',
        },
        {
          label: 'Call Scripts',
          href: '/settings/call-scripts',
          description: 'Voice scripts',
        },

        // === LEAD MANAGEMENT ===
        {
          label: 'Auto Assignment',
          href: '/settings/auto-assignment',
          description: 'Lead routing',
          dividerBefore: true,
          category: 'Lead Management',
        },
        {
          label: 'Source Tracking',
          href: '/settings/source-tracking',
          description: 'UTM & attribution',
        },

        // === TEAM & BILLING ===
        {
          label: 'Team Members',
          href: '/settings/team',
          description: 'Manage team',
          dividerBefore: true,
          category: 'Team & Billing',
        },
        {
          label: 'Subscription',
          href: '/settings/subscription',
          description: 'Your plan',
        },
        {
          label: 'Billing',
          href: '/settings/billing',
          description: 'Payment & invoices',
        },

        // === INTEGRATIONS ===
        {
          label: 'Integrations',
          href: '/integrations',
          description: 'Connect apps',
          dividerBefore: true,
          category: 'Integrations',
        },

        // === DEVELOPER ===
        {
          label: 'API Keys',
          href: '/settings/api-keys',
          description: 'Developer access',
          dividerBefore: true,
          category: 'Developer',
        },
        {
          label: 'Audit Logs',
          href: '/settings/audit-logs',
          description: 'Activity history',
        },

        // === DATA ===
        {
          label: 'Import Data',
          href: '/settings/bulk-import',
          description: 'CSV upload',
          dividerBefore: true,
          category: 'Data',
        },
        {
          label: 'Export Data',
          href: '/settings/exports',
          description: 'Download data',
        },

        // === HELP (moved outside settings conceptually, but accessible) ===
        {
          label: 'Support',
          href: '/support',
          description: 'Get help',
          dividerBefore: true,
          category: 'Help',
        },
      ],
    },
  ];
}

/**
 * Get active menu item based on current path
 */
export function getActiveMenuItem(
  pathname: string
): SimplifiedMenuItem | null {
  const menu = getSimplifiedMenu({ pathname });
  
  return menu.find(item => 
    pathname === item.href || 
    pathname.startsWith(item.href + '/') ||
    item.subItems?.some(sub => pathname.startsWith(sub.href))
  ) || null;
}

/**
 * Check if a menu item or its sub-items are active
 */
export function isMenuItemActive(
  item: SimplifiedMenuItem,
  pathname: string
): boolean {
  if (pathname === item.href) return true;
  if (pathname.startsWith(item.href + '/')) return true;
  return item.subItems?.some(sub => pathname.startsWith(sub.href)) || false;
}
