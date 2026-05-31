'use client';

/**
 * Command Palette (Cmd+K / Ctrl+K)
 * Global keyboard-accessible navigation and actions
 * US-36-002: Command Palette Implementation
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Search,
  Clock,
} from 'lucide-react';
import { Modal, ModalContent } from '@/components/modals';
import { cn } from '@/lib/utils';
import { getSimplifiedMenu } from '@/lib/simplified-menu';
import type { LucideIcon } from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  action?: () => void;
  keywords: string[];
  category: 'navigation' | 'action' | 'recent';
}

// Build navigation items from simplified menu
function getNavigationItems(): CommandItem[] {
  const menu = getSimplifiedMenu();
  return menu.flatMap(item => [
    // Main item
    {
      id: item.id,
      label: item.label,
      icon: item.icon,
      href: item.href,
      keywords: [item.label.toLowerCase(), item.id],
      category: 'navigation' as const,
    },
    // Sub items
    ...(item.subItems?.map(sub => ({
      id: `${item.id}-${sub.href}`,
      label: `${item.label} → ${sub.label}`,
      icon: item.icon,
      href: sub.href,
      keywords: [
        item.label.toLowerCase(),
        sub.label.toLowerCase(),
        sub.description?.toLowerCase() || '',
      ],
      category: 'navigation' as const,
    })) || []),
  ]);
}

const NAVIGATION_ITEMS = getNavigationItems();

interface CommandPaletteProps {
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps = {}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [recentPages, setRecentPages] = useState<CommandItem[]>([]);

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Load recent pages from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentPages');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const recent = NAVIGATION_ITEMS.filter(item =>
          parsed.includes(item.id)
        ).slice(0, 5);
        setRecentPages(recent);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save page to recent
  const saveToRecent = useCallback((itemId: string) => {
    const stored = localStorage.getItem('recentPages');
    let recent: string[] = [];
    if (stored) {
      try {
        recent = JSON.parse(stored);
      } catch {
        // Ignore
      }
    }
    // Add to front, remove duplicates, limit to 10
    recent = [itemId, ...recent.filter(id => id !== itemId)].slice(0, 10);
    localStorage.setItem('recentPages', JSON.stringify(recent));
  }, []);

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const handleSelect = useCallback((item: CommandItem) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      saveToRecent(item.id);
      router.push(item.href);
    }
    setOpen(false);
    setSearch('');
  }, [router, saveToRecent, setOpen, setSearch]);

  // Filter items based on search
  const filteredItems = NAVIGATION_ITEMS.filter(item => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      item.label.toLowerCase().includes(searchLower) ||
      item.keywords.some(keyword => keyword.includes(searchLower))
    );
  });

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalContent size="lg" className="p-0 overflow-hidden">
        <Command className="rounded-lg border-none shadow-lg">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Search pages and actions..."
              value={search}
              onValueChange={setSearch}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">ESC</span>
            </kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {/* Recent Pages */}
            {!search && recentPages.length > 0 && (
              <Command.Group heading="Recent">
                {recentPages.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={item.label}
                    onSelect={() => handleSelect(item)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                    </div>
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Navigation */}
            <Command.Group heading="Navigation">
              {filteredItems.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.label}
                  keywords={item.keywords}
                  onSelect={() => handleSelect(item)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          <div className="border-t p-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between px-2">
              <span>Navigate with ↑↓ arrows</span>
              <div className="flex items-center gap-2">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                  ⌘K
                </kbd>
                <span>to open</span>
              </div>
            </div>
          </div>
        </Command>
      </ModalContent>
    </Modal>
  );
}
