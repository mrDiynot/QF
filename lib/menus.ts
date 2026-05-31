import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Workflow,
  Mail,
  FileText,
  Phone,
  Zap,
  Building2,
  Megaphone,
  FormInput,
  QrCode,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

export interface Submenu {
  href: string;
  label: string;
  active?: boolean;
  icon?: string;
  children?: SubChildren[];
}

export interface SubChildren {
  href: string;
  label: string;
  active?: boolean;
}

export interface Menu {
  id?: string;
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
  badge?: string;
}

export interface Group {
  id?: string;
  groupLabel: string;
  menus: Menu[];
}

// Translation function type
type TranslationFn = (key: string) => string;

export function getMenuList(pathname: string, t?: TranslationFn): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: t ? t("dashboard") : "Dashboard",
          icon: LayoutDashboard,
          active: pathname === "/dashboard",
        },
      ],
    },
    {
      groupLabel: t ? t("engagement") : "Engagement",
      menus: [
        {
          href: "/conversations",
          label: t ? t("conversations") : "Conversations",
          icon: MessageSquare,
          active: pathname.includes("/conversations"),
          badge: "12", // Dynamic badge count from API
        },
        {
          href: "/leads",
          label: t ? t("leads") : "Leads",
          icon: Users,
          active: pathname.includes("/leads"),
        },
        {
          href: "/lead-scoring",
          label: t ? t("lead_scoring") : "Lead Scoring",
          icon: Users,
          active: pathname.includes("/lead-scoring"),
        },
        {
          href: "/crm",
          label: t ? t("crm") : "Contacts",
          icon: Users,
          active: pathname.includes("/crm"),
        },
        {
          href: "/calendar",
          label: t ? t("calendar") : "Calendar",
          icon: Calendar,
          active: pathname.includes("/calendar"),
        },
        {
          href: "/bookings",
          label: t ? t("bookings") : "Bookings",
          icon: Calendar,
          active: pathname.includes("/bookings"),
        },
        {
          href: "/proposals",
          label: t ? t("proposals") : "Proposals",
          icon: FileText,
          active: pathname.includes("/proposals"),
        },
        {
          href: "/links",
          label: t ? t("links") : "Links",
          icon: FileText,
          active: pathname.includes("/links"),
        },
      ],
    },
    {
      groupLabel: t ? t("channels") : "Channels",
      menus: [
        {
          href: "/channels",
          label: t ? t("channels") : "All Channels",
          icon: Megaphone,
          active: pathname === "/channels",
        },
        {
          href: "/channels/widget",
          label: t ? t("chat_widget") : "Chat Widget",
          icon: MessageSquare,
          active: pathname.includes("/channels/widget"),
        },
        {
          href: "/web-chat-builder",
          label: t ? t("web_chat_builder") : "Web Chat Builder",
          icon: MessageSquare,
          active: pathname.includes("/web-chat-builder"),
        },
        {
          href: "/channels/sms",
          label: t ? t("sms") : "SMS",
          icon: Phone,
          active: pathname.includes("/channels/sms"),
        },
        {
          href: "/channels/sms-templates",
          label: t ? t("sms_templates") : "SMS Templates",
          icon: Phone,
          active: pathname.includes("/channels/sms-templates"),
        },
        {
          href: "/channels/voice",
          label: t ? t("voice") : "Voice",
          icon: Phone,
          active: pathname.includes("/channels/voice"),
        },
        {
          href: "/channels/whatsapp",
          label: t ? t("whatsapp") : "WhatsApp",
          icon: MessageSquare,
          active: pathname.includes("/channels/whatsapp"),
        },
        {
          href: "/channels/social",
          label: t ? t("social_media") : "Social Media",
          icon: MessageSquare,
          active: pathname.includes("/channels/social"),
        },
        {
          href: "/channels/webform",
          label: t ? t("web_forms") : "Web Forms",
          icon: ClipboardList,
          active: pathname.includes("/channels/webform"),
        },
        {
          href: "/channels/qrcode",
          label: t ? t("qr_codes") : "QR Codes",
          icon: QrCode,
          active: pathname.includes("/channels/qrcode"),
        },
        {
          href: "/email-templates",
          label: t ? t("email") : "Email",
          icon: Mail,
          active: pathname.includes("/email-templates"),
        },
        {
          href: "/social-builder",
          label: t ? t("social_builder") : "Social Builder",
          icon: MessageSquare,
          active: pathname.includes("/social-builder"),
        },
      ],
    },
    {
      groupLabel: t ? t("automation") : "Automation",
      menus: [
        {
          href: "/workflows",
          label: t ? t("workflows") : "Workflows",
          icon: Workflow,
          active: pathname.includes("/workflows"),
        },
        {
          href: "/journeys",
          label: t ? t("journeys") : "Journeys",
          icon: Zap,
          active: pathname.includes("/journeys"),
        },
        {
          href: "/ai-templates",
          label: t ? t("ai_templates") : "AI Templates",
          icon: MessageSquare,
          active: pathname.includes("/ai-templates"),
        },
        {
          href: "/testing-center",
          label: t ? t("testing_center") : "Testing Center",
          icon: ClipboardList,
          active: pathname.includes("/testing-center"),
        },
        {
          href: "/integrations",
          label: t ? t("integrations") : "Integrations",
          icon: Workflow,
          active: pathname.includes("/integrations"),
        },
        {
          href: "/forms",
          label: t ? t("forms") : "Forms",
          icon: FormInput,
          active: pathname.includes("/forms"),
        },
        {
          href: "/surveys",
          label: t ? t("surveys") : "Surveys",
          icon: ClipboardList,
          active: pathname.includes("/surveys"),
        },
      ],
    },
    {
      groupLabel: t ? t("analytics") : "Analytics",
      menus: [
        {
          href: "/analytics",
          label: t ? t("analytics") : "Analytics",
          icon: BarChart3,
          active: pathname === "/analytics",
          submenus: [
            {
              href: "/analytics",
              label: t ? t("overview") : "Overview",
              active: pathname === "/analytics",
            },
            {
              href: "/analytics/ai-usage",
              label: t ? t("ai_usage") : "AI Usage",
              active: pathname === "/analytics/ai-usage",
            },
          ],
        },
        {
          href: "/crm",
          label: t ? t("crm") : "CRM",
          icon: Building2,
          active: pathname.includes("/crm"),
        },
      ],
    },
    {
      groupLabel: t ? t("settings") : "Settings",
      menus: [
        {
          href: "/settings",
          label: t ? t("settings") : "Settings",
          icon: Settings,
          active: pathname.includes("/settings") || pathname.includes("/support") || pathname.includes("/articles") || pathname.includes("/notifications"),
          submenus: [
            {
              href: "/settings",
              label: t ? t("general") : "General",
              active: pathname === "/settings",
            },
            {
              href: "/settings/subscription",
              label: t ? t("subscription") : "Subscription",
              active: pathname === "/settings/subscription",
            },
            {
              href: "/settings/billing",
              label: t ? t("billing") : "Billing",
              active: pathname === "/settings/billing",
            },
            {
              href: "/settings/team",
              label: t ? t("team") : "Team",
              active: pathname.includes("/settings/team"),
            },
            {
              href: "/settings/ai-training",
              label: t ? t("ai_training") : "AI Training",
              active: pathname === "/settings/ai-training",
            },
            {
              href: "/settings/knowledge-base",
              label: t ? t("knowledge_base") : "Knowledge Base",
              active: pathname === "/settings/knowledge-base",
            },

            {
              href: "/settings/calendar",
              label: t ? t("calendar_integration") : "Calendar",
              active: pathname === "/settings/calendar",
            },
            {
              href: "/settings/auto-assignment",
              label: t ? t("auto_assignment") : "Auto Assignment",
              active: pathname === "/settings/auto-assignment",
            },
            {
              href: "/settings/scoring",
              label: t ? t("scoring") : "Scoring Rules",
              active: pathname === "/settings/scoring",
            },
            {
              href: "/settings/source-tracking",
              label: t ? t("source_tracking") : "Source Tracking",
              active: pathname === "/settings/source-tracking",
            },
            {
              href: "/settings/bulk-import",
              label: t ? t("bulk_import") : "Bulk Import",
              active: pathname === "/settings/bulk-import",
            },
            {
              href: "/settings/api-keys",
              label: t ? t("api_keys") : "API Keys",
              active: pathname === "/settings/api-keys",
            },
            {
              href: "/settings/webhooks",
              label: t ? t("webhooks") : "Webhooks",
              active: pathname === "/settings/webhooks",
            },
            {
              href: "/settings/integrations",
              label: t ? t("integrations") : "Integrations",
              active: pathname === "/settings/integrations",
            },
            {
              href: "/settings/security",
              label: t ? t("security") : "Security",
              active: pathname.includes("/settings/security"),
            },
            {
              href: "/settings/audit-logs",
              label: t ? t("audit_logs") : "Audit Logs",
              active: pathname === "/settings/audit-logs",
            },
            {
              href: "/settings/voice-agents",
              label: t ? t("voice_agents") : "Voice Agents",
              active: pathname === "/settings/voice-agents",
            },
            {
              href: "/settings/quick-replies",
              label: t ? t("quick_replies") : "Quick Replies",
              active: pathname === "/settings/quick-replies",
            },
            {
              href: "/settings/call-scripts",
              label: t ? t("call_scripts") : "Call Scripts",
              active: pathname === "/settings/call-scripts",
            },
            {
              href: "/settings/exports",
              label: t ? t("exports") : "Data Export",
              active: pathname === "/settings/exports",
            },
            {
              href: "/notifications",
              label: t ? t("notifications") : "Notifications",
              active: pathname.includes("/notifications"),
            },
            {
              href: "/support",
              label: t ? t("support") : "Support",
              active: pathname.includes("/support"),
            },
          ],
        },
      ],
    },
  ];
}
