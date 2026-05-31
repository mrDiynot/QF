/**
 * Business Portal Menu Configuration
 *
 * Centralized menu configuration for the DashCode sidebar integration.
 * Matches the existing navigation structure from the custom sidebar.
 *
 * Features:
 * - Role-based visibility (minimumRole)
 * - Feature access control (requiredFeature)
 * - Active state tracking
 * - Badge support for notifications
 * - Submenu support (multi-level)
 */

import { UserRole } from '@/types/auth';
import { PremiumFeature } from '@/hooks/subscriptions/useFeatureAccess';

export interface BusinessSubmenu {
  href: string;
  label: string;
  active?: boolean;
  children?: BusinessSubmenu[]; // Support nested submenus
  requiredFeature?: PremiumFeature;
  minimumRole?: UserRole;
}

export interface BusinessMenu {
  id: string;
  href: string;
  label: string;
  active?: boolean;
  icon: string; // Icon name as string (e.g., "LayoutDashboard")
  submenus?: BusinessSubmenu[];
  badge?: string; // Notification count or label
  requiredFeature?: PremiumFeature;
  minimumRole?: UserRole;
}

export interface BusinessMenuGroup {
  groupLabel: string;
  menus: BusinessMenu[];
}

export interface MenuOptions {
  /** Unread conversation count for badge */
  unreadCount?: number;

  /** User's current role */
  userRole?: UserRole;

  /** Available premium features */
  availableFeatures?: PremiumFeature[];

  /** Show all items regardless of permissions (for admin view) */
  showAll?: boolean;
}

/**
 * Get the Business Portal menu list
 *
 * This matches the existing navigation structure from components/dashboard/sidebar.tsx
 * but adapted for DashCode MenuClassic component.
 *
 * @param pathname - Current URL pathname for active state
 * @param t - Translation function (optional, for i18n)
 * @param options - Additional options for customization
 * @returns Array of menu groups
 */
export function getBusinessMenuList(
  pathname: string,
  t?: (key: string) => string,
  options?: MenuOptions
): BusinessMenuGroup[] {
  const translate = t || ((key: string) => key);

  return [
    // Group 1: Dashboard (no label)
    {
      groupLabel: "",
      menus: [
        {
          id: "dashboard",
          href: "/dashboard",
          label: translate("Dashboard"),
          icon: "LayoutDashboard",
          active: pathname === "/dashboard",
        },
      ],
    },

    // Group 2: Conversations (Unified Inbox - no submenus needed)
    {
      groupLabel: "",
      menus: [
        {
          id: "conversations",
          href: "/conversations",
          label: translate("Conversations"),
          icon: "MessageSquare",
          active: pathname.includes("/conversations"),
          badge: options?.unreadCount?.toString(),
        },
      ],
    },

    // Group 3: Channels (Admin only)
    {
      groupLabel: translate("Channels"),
      menus: [
        {
          id: "channels",
          href: "/channels",
          label: translate("Channels"),
          icon: "Phone",
          active: pathname === "/channels" || pathname.includes("/ai-voice") || pathname.includes("/forms") || pathname.includes("/email-templates") || pathname.includes("/web-chat-builder") || pathname.includes("/surveys") || pathname.includes("/channels/") || pathname.includes("/social-builder"),
          minimumRole: 'Admin',
          submenus: [
            {
              href: "/channels",
              label: translate("Overview"),
              active: pathname === "/channels",
            },
            {
              href: "/ai-voice",
              label: translate("AI Voice"),
              active: pathname.includes("/ai-voice"),
              requiredFeature: "ai_voice",
            },
            {
              href: "/channels/sms",
              label: translate("SMS"),
              active: pathname.includes("/channels/sms"),
            },
            {
              href: "/channels/sms-templates",
              label: translate("SMS Templates"),
              active: pathname.includes("/channels/sms-templates"),
            },
            {
              href: "/channels/voice",
              label: translate("Voice"),
              active: pathname.includes("/channels/voice"),
            },
            {
              href: "/channels/whatsapp",
              label: translate("WhatsApp"),
              active: pathname.includes("/channels/whatsapp"),
            },
            {
              href: "/channels/social",
              label: translate("Social Media"),
              active: pathname.includes("/channels/social") || pathname.includes("/channels/meta"),
            },
            {
              href: "/channels/webform",
              label: translate("Web Forms"),
              active: pathname.includes("/channels/webform"),
            },
            {
              href: "/forms",
              label: translate("Forms"),
              active: pathname.includes("/forms"),
            },
            {
              href: "/surveys",
              label: translate("Surveys"),
              active: pathname.includes("/surveys"),
            },
            {
              href: "/channels/qrcode",
              label: translate("QR Codes"),
              active: pathname.includes("/channels/qrcode"),
            },
            {
              href: "/channels/widget",
              label: translate("Chat Widget"),
              active: pathname.includes("/channels/widget"),
            },
            {
              href: "/email-templates",
              label: translate("Email Templates"),
              active: pathname.includes("/email-templates"),
            },
            {
              href: "/web-chat-builder",
              label: translate("Web Chat Builder"),
              active: pathname.includes("/web-chat-builder"),
            },
            {
              href: "/social-builder",
              label: translate("Social Builder"),
              active: pathname.includes("/social-builder"),
            },
          ],
        },
      ],
    },

    // Group 4: Leads & CRM
    {
      groupLabel: translate("Leads & CRM"),
      menus: [
        {
          id: "leads",
          href: "/leads",
          label: translate("Leads & CRM"),
          icon: "Target",
          active: pathname.includes("/leads") || pathname.includes("/crm") || pathname.includes("/calendar") || pathname.includes("/proposals") || pathname.includes("/bookings") || pathname.includes("/lead-scoring") || pathname.includes("/links"),
          submenus: [
            {
              href: "/leads",
              label: translate("All Leads"),
              active: pathname === "/leads" || pathname.includes("/leads/[id]"),
            },
            {
              href: "/lead-scoring",
              label: translate("Lead Scoring"),
              active: pathname.includes("/lead-scoring"),
            },
            {
              href: "/leads/qualification",
              label: translate("Qualification"),
              active: pathname.includes("/leads/qualification"),
            },
            {
              href: "/crm",
              label: translate("Contacts"),
              active: pathname.includes("/crm"),
            },
            {
              href: "/calendar",
              label: translate("Calendar"),
              active: pathname.includes("/calendar"),
            },
            {
              href: "/bookings",
              label: translate("Bookings"),
              active: pathname.includes("/bookings"),
            },
            {
              href: "/proposals",
              label: translate("Proposals"),
              active: pathname.includes("/proposals"),
            },
            {
              href: "/links",
              label: translate("Links"),
              active: pathname.includes("/links"),
            },
          ],
        },
      ],
    },

    // Group 5: Automation
    {
      groupLabel: translate("Automation"),
      menus: [
        {
          id: "automation",
          href: "/workflows",
          label: translate("Automation"),
          icon: "Zap",
          active: pathname.includes("/workflows") || pathname.includes("/journeys") || pathname.includes("/ai-templates") || pathname.includes("/integrations") || pathname.includes("/testing-center"),
          submenus: [
            {
              href: "/workflows",
              label: translate("Workflows"),
              active: pathname === "/workflows",
            },
            {
              href: "/workflows/custom",
              label: translate("Custom Workflows"),
              active: pathname.includes("/workflows/custom"),
            },
            {
              href: "/workflows/gallery",
              label: translate("Workflow Gallery"),
              active: pathname.includes("/workflows/gallery"),
            },
            {
              href: "/journeys",
              label: translate("Journey Builder"),
              active: pathname.includes("/journeys"),
            },
            {
              href: "/ai-templates",
              label: translate("AI Templates"),
              active: pathname.includes("/ai-templates"),
            },
            {
              href: "/integrations",
              label: translate("Integrations"),
              active: pathname.includes("/integrations"),
            },
            {
              href: "/testing-center",
              label: translate("Testing Center. hdgfihdf"),
              active: pathname.includes("/testing-center"),
            },
          ],
        },
      ],
    },

    // Group 6: Knowledge Base
    {
      groupLabel: translate("Knowledge"),
      menus: [
        {
          id: "knowledge-base",
          href: "/settings/knowledge-base",
          label: translate("Knowledge Base"),
          icon: "BookOpen",
          active: pathname.includes("/knowledge-base") || pathname.includes("/articles"),
          requiredFeature: "knowledge_base", // Available on all paid plans
          submenus: [
            {
              href: "/settings/knowledge-base",
              label: translate("Documents"),
              active: pathname === "/settings/knowledge-base",
            },

          ],
        },
      ],
    },

    // Group 7: Analytics
    {
      groupLabel: translate("Analytics"),
      menus: [
        {
          id: "analytics",
          href: "/analytics",
          label: translate("Analytics"),
          icon: "BarChart3",
          active: pathname.includes("/analytics") || pathname.includes("/advanced-analytics"),
          submenus: [
            {
              href: "/analytics",
              label: translate("Dashboard"),
              active: pathname === "/analytics",
            },
            {
              href: "/analytics/ai-usage",
              label: translate("AI Usage"),
              active: pathname.includes("/analytics/ai-usage"),
            },
            {
              href: "/advanced-analytics",
              label: translate("Advanced"),
              active: pathname.includes("/advanced-analytics"),
            },
          ],
        },
      ],
    },

    // Group 7: Notifications
    {
      groupLabel: translate("Notifications"),
      menus: [
        {
          id: "notifications",
          href: "/notifications",
          label: translate("Notifications"),
          icon: "Bell",
          active: pathname.includes("/notifications"),
          submenus: [],
        },
      ],
    },

    // Group 8: Settings
    {
      groupLabel: translate("Settings"),
      menus: [
        {
          id: "settings",
          href: "/settings",
          label: translate("Settings"),
          icon: "Settings",
          active: pathname.includes("/settings") || pathname.includes("/support"),
          submenus: [
            {
              href: "/settings",
              label: translate("General"),
              active: pathname === "/settings",
            },
            {
              href: "/settings/ai-training",
              label: translate("AI Training"),
              active: pathname.includes("/settings/ai-training"),
            },
            {
              href: "/settings/voice-agents",
              label: translate("Voice Agents"),
              active: pathname.includes("/settings/voice-agents"),
            },
            {
              href: "/settings/call-scripts",
              label: translate("Call Scripts"),
              active: pathname.includes("/settings/call-scripts"),
            },
            {
              href: "/settings/quick-replies",
              label: translate("Quick Replies"),
              active: pathname.includes("/settings/quick-replies"),
            },
            {
              href: "/settings/auto-assignment",
              label: translate("Auto Assignment"),
              active: pathname.includes("/settings/auto-assignment"),
            },
            {
              href: "/settings/scoring",
              label: translate("Scoring Rules"),
              active: pathname.includes("/settings/scoring"),
            },
            {
              href: "/settings/source-tracking",
              label: translate("Source Tracking"),
              active: pathname.includes("/settings/source-tracking"),
            },
            {
              href: "/settings/calendar",
              label: translate("Calendar"),
              active: pathname.includes("/settings/calendar"),
            },
            {
              href: "/settings/team",
              label: translate("Team"),
              active: pathname.includes("/settings/team"),
            },
            {
              href: "/settings/billing",
              label: translate("Billing"),
              active: pathname.includes("/settings/billing"),
            },
            {
              href: "/settings/subscription",
              label: translate("Subscription"),
              active: pathname.includes("/settings/subscription"),
            },
            {
              href: "/settings/security",
              label: translate("Security"),
              active: pathname.includes("/settings/security"),
            },
            {
              href: "/settings/system",
              label: translate("System"),
              active: pathname.includes("/settings/system"),
              minimumRole: 'Admin',
            },
            {
              href: "/settings/api-keys",
              label: translate("API Keys"),
              active: pathname.includes("/settings/api-keys"),
              minimumRole: 'Admin',
            },
            {
              href: "/settings/audit-logs",
              label: translate("Audit Logs"),
              active: pathname.includes("/settings/audit-logs"),
              minimumRole: 'Admin',
            },
            {
              href: "/settings/bulk-import",
              label: translate("Bulk Import"),
              active: pathname.includes("/settings/bulk-import"),
            },
            {
              href: "/settings/exports",
              label: translate("Exports"),
              active: pathname.includes("/settings/exports"),
            },
            {
              href: "/support",
              label: translate("Support"),
              active: pathname.includes("/support"),
            },
          ],
        },
      ],
    },
  ];
}

/**
 * Role hierarchy for checking minimum role requirements
 * Higher number = higher privilege level
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  Viewer: 0,
  Manager: 1,
  Admin: 2,
  Owner: 3,
};

/**
 * Check if user's role meets minimum requirement
 *
 * @param userRole - User's current role
 * @param minimumRole - Minimum required role
 * @returns true if user meets requirement
 */
export function hasMinimumRole(
  userRole?: UserRole,
  minimumRole?: UserRole
): boolean {
  if (!minimumRole) return true; // No requirement
  if (!userRole) return false; // User has no role

  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * Filter menu items based on user's permissions
 *
 * Removes items that user doesn't have access to based on:
 * - Minimum role requirement
 * - Required premium features
 *
 * @param menuGroups - All menu groups
 * @param options - User's permissions and features
 * @returns Filtered menu groups
 */
export function filterMenuByPermissions(
  menuGroups: BusinessMenuGroup[],
  options?: MenuOptions
): BusinessMenuGroup[] {
  if (options?.showAll) {
    return menuGroups; // Show everything in admin mode
  }

  return menuGroups
    .map((group) => ({
      ...group,
      menus: group.menus
        .filter((menu) => {
          // Check minimum role
          if (!hasMinimumRole(options?.userRole, menu.minimumRole)) {
            return false;
          }

          // Check required feature at menu level
          if (
            menu.requiredFeature &&
            !options?.availableFeatures?.includes(menu.requiredFeature)
          ) {
            return false;
          }

          return true;
        })
        .map((menu) => ({
          ...menu,
          // Filter submenus by required feature
          submenus: menu.submenus?.filter((submenu) => {
            if (
              submenu.requiredFeature &&
              !options?.availableFeatures?.includes(submenu.requiredFeature)
            ) {
              return false;
            }
            if (!hasMinimumRole(options?.userRole, submenu.minimumRole)) {
              return false;
            }
            return true;
          }),
        })),
    }))
    .filter((group) => group.menus.length > 0); // Remove empty groups
}

/**
 * Get active menu item based on current pathname
 *
 * @param pathname - Current URL pathname
 * @returns Active menu item or null
 */
export function getActiveMenuItem(
  pathname: string
): BusinessMenu | null {
  const menuGroups = getBusinessMenuList(pathname);

  for (const group of menuGroups) {
    for (const menu of group.menus) {
      if (menu.active) {
        return menu;
      }

      // Check submenus
      if (menu.submenus) {
        for (const submenu of menu.submenus) {
          if (submenu.active) {
            return menu; // Return parent menu
          }
        }
      }
    }
  }

  return null;
}
