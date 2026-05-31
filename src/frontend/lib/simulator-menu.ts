export interface SimulatorSubmenu {
  href: string;
  label: string;
  active?: boolean;
  children?: SimulatorSubmenu[];
}

export interface SimulatorMenu {
  href: string;
  label: string;
  active?: boolean;
  icon: string;
  submenus?: SimulatorSubmenu[];
  badge?: string;
  id: string;
}

export interface SimulatorGroup {
  groupLabel: string;
  menus: SimulatorMenu[];
}

export function getSimulatorMenuList(pathname: string): SimulatorGroup[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          id: "dashboard",
          href: "/simulator",
          label: "Dashboard",
          icon: "LayoutGrid",
          active: pathname === "/simulator",
        },
      ],
    },
    {
      groupLabel: "Core Tools",
      menus: [
        {
          id: "website",
          href: "/simulator/website",
          label: "Website",
          icon: "Monitor",
          active: pathname.includes("/simulator/website"),
          badge: "Core",
        },
        {
          id: "chat-widget",
          href: "/simulator/chat-widget",
          label: "Chat Widget",
          icon: "MessageSquare",
          active: pathname.includes("/simulator/chat-widget"),
          badge: "Core",
        },
        {
          id: "forms",
          href: "/simulator/forms",
          label: "Forms",
          icon: "FileText",
          active: pathname.includes("/simulator/forms"),
          badge: "Core",
        },
      ],
    },
    {
      groupLabel: "Channels",
      menus: [
        {
          id: "sms",
          href: "/simulator/channels/sms",
          label: "SMS",
          icon: "Phone",
          active: pathname.includes("/simulator/channels/sms"),
        },
        {
          id: "whatsapp",
          href: "/simulator/channels/whatsapp",
          label: "WhatsApp",
          icon: "MessageSquare",
          active: pathname.includes("/simulator/channels/whatsapp"),
        },
        {
          id: "voice",
          href: "/simulator/channels/voice",
          label: "Voice",
          icon: "Phone",
          active: pathname.includes("/simulator/channels/voice"),
        },
      ],
    },
    {
      groupLabel: "Advanced",
      menus: [
        {
          id: "qr-codes",
          href: "/simulator/qr-codes",
          label: "QR Codes",
          icon: "QrCode",
          active: pathname.includes("/simulator/qr-codes"),
        },
        {
          id: "webhooks",
          href: "/simulator/webhooks",
          label: "Webhooks",
          icon: "Webhook",
          active: pathname.includes("/simulator/webhooks"),
          badge: "Pro",
        },
        {
          id: "ai-qualification",
          href: "/simulator/ai-qualification",
          label: "AI Qualification",
          icon: "Target",
          active: pathname.includes("/simulator/ai-qualification"),
          badge: "AI",
        },
        {
          id: "ai-monitor",
          href: "/simulator/ai-monitor",
          label: "AI Monitor",
          icon: "Brain",
          active: pathname.includes("/simulator/ai-monitor"),
          badge: "AI",
        },
      ],
    },
  ];
}
