'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Ticket,
  FileEdit,
  Brain,
  Activity,
  ScrollText,
  Download,
  ShieldCheck,
  Settings,
  Moon,
  Sun,
  LogOut,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import { useAdminTheme } from '@/contexts/AdminThemeContext';
import { useAdminLogout } from '@/hooks/admin/useAdminAuth';

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  shortcut?: string;
  group: 'navigation' | 'actions' | 'settings';
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useAdminTheme();
  const logoutMutation = useAdminLogout();

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, setIsOpen]);

  const navigationItems: CommandItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin',
      shortcut: 'G D',
      group: 'navigation',
    },
    {
      id: 'businesses',
      label: 'Businesses',
      icon: Building2,
      href: '/admin/businesses',
      shortcut: 'G B',
      group: 'navigation',
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      href: '/admin/users',
      shortcut: 'G U',
      group: 'navigation',
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: CreditCard,
      href: '/admin/subscriptions',
      shortcut: 'G S',
      group: 'navigation',
    },
    {
      id: 'support',
      label: 'Support Tickets',
      icon: Ticket,
      href: '/admin/support',
      shortcut: 'G T',
      group: 'navigation',
    },
    {
      id: 'cms',
      label: 'CMS & Content',
      icon: FileEdit,
      href: '/admin/cms',
      group: 'navigation',
    },
    {
      id: 'ai-usage',
      label: 'AI Usage',
      icon: Brain,
      href: '/admin/ai-usage',
      group: 'navigation',
    },
    {
      id: 'coming-soon-analytics',
      label: 'Coming Soon Analytics',
      icon: BarChart3,
      href: '/admin/coming-soon-analytics',
      group: 'navigation',
    },
    {
      id: 'system-health',
      label: 'System Health',
      icon: Activity,
      href: '/admin/system-health',
      group: 'navigation',
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      icon: ScrollText,
      href: '/admin/audit-logs',
      group: 'navigation',
    },
    {
      id: 'exports',
      label: 'Exports',
      icon: Download,
      href: '/admin/exports',
      group: 'navigation',
    },
    {
      id: 'admin-users',
      label: 'Admin Users',
      icon: ShieldCheck,
      href: '/admin/admin-users',
      group: 'navigation',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/admin/settings',
      group: 'navigation',
    },
  ];

  const actionItems: CommandItem[] = [
    {
      id: 'toggle-theme',
      label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        toggleTheme();
        setIsOpen(false);
      },
      group: 'actions',
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      action: () => {
        logoutMutation.mutate();
        setIsOpen(false);
      },
      group: 'actions',
    },
  ];

  const handleSelect = (item: CommandItem) => {
    if (item.href) {
      router.push(item.href);
      setIsOpen(false);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput 
        placeholder="Type a command or search..." 
        className="border-none focus:ring-0"
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.id}
              value={item.label}
              onSelect={() => handleSelect(item)}
              className="cursor-pointer"
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {actionItems.map((item) => (
            <CommandItem
              key={item.id}
              value={item.label}
              onSelect={() => handleSelect(item)}
              className="cursor-pointer"
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Help">
          <CommandItem
            value="keyboard-shortcuts"
            onSelect={() => setIsOpen(false)}
            className="cursor-pointer"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Keyboard Shortcuts</span>
            <CommandShortcut>?</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CommandPalette />
    </>
  );
}
