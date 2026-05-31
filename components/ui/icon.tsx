"use client";
import React from "react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Icon mapping from Iconify names (used by DashCode) to Lucide components
const iconMap: Record<string, LucideIcon> = {
  // Navigation
  "heroicons:home": LucideIcons.Home,
  "heroicons:user": LucideIcons.User,
  "heroicons:users": LucideIcons.Users,
  "heroicons:cog": LucideIcons.Settings,
  "heroicons:cog-6-tooth": LucideIcons.Settings,

  // Communication
  "heroicons:chat-bubble-left": LucideIcons.MessageSquare,
  "heroicons:chat-bubble-left-right": LucideIcons.MessagesSquare,
  "heroicons:envelope": LucideIcons.Mail,
  "heroicons:phone": LucideIcons.Phone,
  "heroicons:bell": LucideIcons.Bell,

  // Content
  "heroicons:document-text": LucideIcons.FileText,
  "heroicons:folder": LucideIcons.Folder,
  "heroicons:newspaper": LucideIcons.Newspaper,
  "heroicons:clipboard": LucideIcons.Clipboard,

  // Analytics
  "heroicons:chart-bar": LucideIcons.BarChart3,
  "heroicons:chart-pie": LucideIcons.PieChart,
  "heroicons:presentation-chart-line": LucideIcons.LineChart,

  // Actions
  "heroicons:plus": LucideIcons.Plus,
  "heroicons:minus": LucideIcons.Minus,
  "heroicons:pencil": LucideIcons.Pencil,
  "heroicons:trash": LucideIcons.Trash2,
  "heroicons:arrow-right": LucideIcons.ArrowRight,
  "heroicons:arrow-left": LucideIcons.ArrowLeft,
  "heroicons:arrow-up": LucideIcons.ArrowUp,
  "heroicons:arrow-down": LucideIcons.ArrowDown,
  "heroicons:x-mark": LucideIcons.X,
  "heroicons:check": LucideIcons.Check,

  // UI Elements
  "heroicons:bars-3": LucideIcons.Menu,
  "heroicons:magnifying-glass": LucideIcons.Search,
  "heroicons:funnel": LucideIcons.Filter,
  "heroicons:ellipsis-horizontal": LucideIcons.MoreHorizontal,
  "heroicons:ellipsis-vertical": LucideIcons.MoreVertical,
  "heroicons:question-mark-circle": LucideIcons.HelpCircle,
  "heroicons:information-circle": LucideIcons.Info,
  "heroicons:exclamation-triangle": LucideIcons.AlertTriangle,

  // Business
  "heroicons:building-office": LucideIcons.Building2,
  "heroicons:calendar": LucideIcons.Calendar,
  "heroicons:clock": LucideIcons.Clock,
  "heroicons:currency-dollar": LucideIcons.DollarSign,
  "heroicons:shopping-cart": LucideIcons.ShoppingCart,

  // Media
  "heroicons:photo": LucideIcons.Image,
  "heroicons:video-camera": LucideIcons.Video,
  "heroicons:microphone": LucideIcons.Mic,
  "heroicons:play": LucideIcons.Play,
  "heroicons:pause": LucideIcons.Pause,

  // Status
  "heroicons:lock-closed": LucideIcons.Lock,
  "heroicons:lock-open": LucideIcons.LockOpen,
  "heroicons:eye": LucideIcons.Eye,
  "heroicons:eye-slash": LucideIcons.EyeOff,
  "heroicons:star": LucideIcons.Star,
  "heroicons:heart": LucideIcons.Heart,

  // System
  "heroicons:power": LucideIcons.Power,
  "heroicons:arrow-path": LucideIcons.RefreshCw,
  "heroicons:cloud": LucideIcons.Cloud,
  "heroicons:server": LucideIcons.Server,
  "heroicons:shield-check": LucideIcons.ShieldCheck,

  // Add more mappings as needed...
};

interface IconProps {
  icon: string | LucideIcon | React.ComponentType<{ className?: string }>;
  className?: string;
  size?: number;
  width?: number;
  height?: number;
}

/**
 * Icon component that bridges DashCode's Iconify usage with Qualiflow AI's Lucide React
 *
 * This component accepts either:
 * - Iconify icon names (e.g., "heroicons:home") - mapped to Lucide components
 * - Lucide React component references directly
 *
 * If a string mapping is not found, it falls back to a HelpCircle icon.
 *
 * @example
 * ```tsx
 * <Icon icon="heroicons:home" className="h-5 w-5" />
 * <Icon icon={Home} size={20} />
 * ```
 */
const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon, className, size, width, height, ...props }, ref) => {
    // Determine the icon component
    let IconComponent: LucideIcon | React.ComponentType<{ className?: string }>;

    if (typeof icon === 'string') {
      // First check iconMap for heroicons format
      if (iconMap[icon]) {
        IconComponent = iconMap[icon];
      } else {
        // Try to resolve as a direct Lucide icon name (e.g., "LayoutDashboard", "BookOpen")
        const lucideIcon = (LucideIcons as unknown as Record<string, LucideIcon>)[icon];
        IconComponent = lucideIcon || LucideIcons.HelpCircle;
      }
    } else {
      // Already a component reference
      IconComponent = icon;
    }

    // Calculate dimensions
    const iconSize = size || width || height || 24;
    const iconWidth = width || iconSize;
    const iconHeight = height || iconSize;

    return (
      <IconComponent
        ref={ref}
        className={cn("", className)}
        width={iconWidth}
        height={iconHeight}
        {...props}
      />
    );
  }
);

Icon.displayName = "Icon";

export { Icon };
