'use client';

/**
 * Global Search Component
 * Search across all entities - leads, conversations, forms, etc.
 */

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Modal,
  ModalContent,
} from '@/components/modals';
import {
  Search,
  Users,
  MessageSquare,
  FileText,
  Phone,
  Calendar,
  Mail,
  ArrowRight,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuickSearch, type SearchResult as ApiSearchResult } from '@/hooks/api/useSearch';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface DisplaySearchResult {
  id: string;
  type: 'lead' | 'conversation' | 'form' | 'proposal' | 'call' | 'appointment' | 'email' | 'contact' | 'deal';
  title: string;
  subtitle?: string;
  timestamp?: Date;
  url: string;
}

// Transform API search result to display format
function transformSearchResult(result: ApiSearchResult): DisplaySearchResult {
  return {
    id: result.id,
    type: result.type as DisplaySearchResult['type'],
    title: result.title,
    subtitle: result.subtitle || result.description,
    timestamp: result.createdAt ? new Date(result.createdAt) : undefined,
    url: result.url,
  };
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  lead: { icon: <Users className="size-4" />, color: 'bg-primary/10 text-primary', label: 'Lead' },
  contact: { icon: <Users className="size-4" />, color: 'bg-muted/50 text-info', label: 'Contact' },
  conversation: { icon: <MessageSquare className="size-4" />, color: 'bg-muted/50 text-info', label: 'Conversation' },
  form: { icon: <FileText className="size-4" />, color: 'bg-green-100 text-green-600', label: 'Form' },
  proposal: { icon: <FileText className="size-4" />, color: 'bg-amber-100 text-amber-600', label: 'Proposal' },
  deal: { icon: <Sparkles className="size-4" />, color: 'bg-emerald-100 text-emerald-600', label: 'Deal' },
  call: { icon: <Phone className="size-4" />, color: 'bg-red-100 text-red-600', label: 'Call' },
  appointment: { icon: <Calendar className="size-4" />, color: 'bg-primary/10 text-primary', label: 'Appointment' },
  email: { icon: <Mail className="size-4" />, color: 'bg-muted/50 text-muted-foreground', label: 'Email' },
};

const QUICK_ACTIONS = [
  { label: 'Add new lead', shortcut: 'N', url: '/leads/new' },
  { label: 'Send message', shortcut: 'M', url: '/conversations' },
  { label: 'Create proposal', shortcut: 'P', url: '/proposals/new' },
  { label: 'View analytics', shortcut: 'A', url: '/analytics' },
];

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Debounce search query
  const debouncedQuery = useDebouncedValue(query, 300);

  // Fetch search results from API
  const { data: apiResults, isLoading } = useQuickSearch(
    debouncedQuery,
    open && debouncedQuery.length >= 2
  );

  // Transform API results to display format
  const results = (apiResults || []).map(transformSearchResult);

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = query ? results : QUICK_ACTIONS;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (query && results[selectedIndex]) {
          window.location.href = results[selectedIndex].url;
        } else if (!query && QUICK_ACTIONS[selectedIndex]) {
          window.location.href = QUICK_ACTIONS[selectedIndex].url;
        }
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, query, results, selectedIndex]);

  return (
    <>
      {/* Search Trigger */}
      <Button
        variant="outline"
        className={cn("relative w-full sm:w-64 justify-start text-sm text-muted-foreground", className)}
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 size-4" />
        <span className="hidden sm:inline">Search everything...</span>
        <span className="sm:hidden">Search</span>
        <kbd className="pointer-events-none absolute right-2 hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] sm:flex">
          <span>⌘</span>K
        </kbd>
      </Button>

      {/* Search Dialog */}
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent size="lg" className="overflow-hidden p-0">
          {/* Search Input */}
          <div className="flex items-center border-b px-4">
            <Search className="size-4 text-muted-foreground/60" />
            <Input
              placeholder="Search leads, conversations, proposals..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 focus-visible:ring-0 h-12"
              autoFocus
            />
            {isLoading && <Loader2 className="size-4 animate-spin text-muted-foreground/60" />}
            {query && !isLoading && (
              <Button variant="ghost" size="icon" className="size-6" onClick={() => setQuery('')}>
                <X className="size-4" />
              </Button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {/* Quick Actions (when no query) */}
            {!query.trim() && (
              <div className="space-y-1">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Quick Actions</p>
                {QUICK_ACTIONS.map((action, index) => (
                  <button
                    key={action.label}
                    onClick={() => { window.location.href = action.url; setOpen(false); }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left",
                      selectedIndex === index ? "bg-primary/5 text-primary" : "hover:bg-muted/20"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      <span>{action.label}</span>
                    </div>
                    <kbd className="rounded border bg-muted/40 px-1.5 py-0.5 text-[10px]">{action.shortcut}</kbd>
                  </button>
                ))}
              </div>
            )}

            {/* Search Results */}
            {query.trim() && results.length > 0 && (
              <div className="space-y-1">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Results</p>
                {results.map((result, index) => {
                  const config = TYPE_CONFIG[result.type];
                  return (
                    <button
                      key={result.id}
                      onClick={() => { window.location.href = result.url; setOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left",
                        selectedIndex === index ? "bg-primary/5" : "hover:bg-muted/20"
                      )}
                    >
                      <div className={cn("flex size-8 items-center justify-center rounded-lg", config.color)}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{result.title}</span>
                          <Badge variant="secondary" className="text-[10px]">{config.label}</Badge>
                        </div>
                        {result.subtitle && <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>}
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground/30" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* No Results */}
            {query.trim() && results.length === 0 && !isLoading && (
              <div className="py-8 text-center">
                <Search className="size-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">No results for &quot;{query}&quot;</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground/60">
            <div className="flex items-center gap-2">
              <kbd className="rounded border px-1.5 py-0.5">↑↓</kbd>
              <span>Navigate</span>
              <kbd className="rounded border px-1.5 py-0.5">↵</kbd>
              <span>Select</span>
              <kbd className="rounded border px-1.5 py-0.5">esc</kbd>
              <span>Close</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="size-3" />
              <span>AI-powered</span>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
