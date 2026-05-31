'use client';

/**
 * Search & Autocomplete Components
 * Search inputs, command menus, recent searches
 */

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Modal,
  ModalContent,
} from '@/components/modals';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  ArrowRight,
  FileText,
  Users,
  MessageSquare,
  Calendar,
  Settings,
  Command,
  CornerDownLeft,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Search Input with Suggestions
interface SearchSuggestion {
  id: string;
  label: string;
  type?: string;
  icon?: React.ReactNode;
  href?: string;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  placeholder?: string;
  loading?: boolean;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  onClearRecent?: () => void;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  suggestions = [],
  recentSearches = [],
  placeholder = 'Search...',
  loading = false,
  onSuggestionClick,
  onClearRecent,
  className,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const showDropdown = isFocused && (value.length > 0 || recentSearches.length > 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value) {
      onSearch?.(value);
    }
    if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 animate-spin" />
        )}
        {!loading && value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
            onClick={() => onChange('')}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden">
          {/* Suggestions */}
          {value && suggestions.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-muted-foreground/60 px-2 mb-1">Suggestions</p>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/20 text-left"
                  onClick={() => onSuggestionClick?.(suggestion)}
                >
                  {suggestion.icon || <Search className="size-4 text-muted-foreground/60" />}
                  <span className="flex-1 text-sm">{suggestion.label}</span>
                  {suggestion.type && (
                    <Badge variant="secondary" className="text-xs">{suggestion.type}</Badge>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {!value && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 mb-1">
                <p className="text-xs text-muted-foreground/60">Recent</p>
                {onClearRecent && (
                  <button className="text-xs text-primary hover:underline" onClick={onClearRecent}>
                    Clear
                  </button>
                )}
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/20 text-left"
                  onClick={() => onChange(search)}
                >
                  <Clock className="size-4 text-muted-foreground/60" />
                  <span className="flex-1 text-sm">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {value && suggestions.length === 0 && !loading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// Command Menu (Spotlight-style)
interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  action?: () => void;
  href?: string;
  group?: string;
}

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  placeholder?: string;
  className?: string;
}

export function CommandMenu({
  open,
  onOpenChange,
  items,
  placeholder = 'Type a command or search...',
  className,
}: CommandMenuProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredItems = items.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    const group = item.group || 'Actions';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filteredItems.length);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
    }
    if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      filteredItems[selectedIndex].action?.();
      onOpenChange(false);
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md" className={cn("p-0", className)}>
        <div className="flex items-center border-b px-3">
          <Search className="size-4 text-muted-foreground/60 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 py-3 text-sm outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted/40 px-1.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {Object.entries(groupedItems).map(([group, groupItems]) => (
            <div key={group} className="mb-2">
              <p className="text-xs text-muted-foreground/60 px-2 mb-1">{group}</p>
              {groupItems.map((item) => {
                const globalIndex = filteredItems.indexOf(item);
                return (
                  <button
                    key={item.id}
                    className={cn(
                      "w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left",
                      globalIndex === selectedIndex ? "bg-primary/5 text-primary" : "hover:bg-muted/20"
                    )}
                    onClick={() => {
                      item.action?.();
                      onOpenChange(false);
                    }}
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted/40">
                      {item.icon || <Command className="size-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      )}
                    </div>
                    {item.shortcut && (
                      <div className="flex gap-1">
                        {item.shortcut.map((key, i) => (
                          <kbd key={i} className="h-5 min-w-[20px] flex items-center justify-center rounded border bg-muted/40 px-1.5 font-mono text-[10px]">
                            {key}
                          </kbd>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground/60">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <kbd className="h-4 w-4 flex items-center justify-center rounded border bg-muted/40 text-[10px]">↑</kbd>
              <kbd className="h-4 w-4 flex items-center justify-center rounded border bg-muted/40 text-[10px]">↓</kbd>
              to navigate
            </span>
          </div>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="size-3" /> to select
          </span>
        </div>
      </ModalContent>
    </Modal>
  );
}

// Recent Searches
interface RecentSearchesProps {
  searches: string[];
  onSelect: (search: string) => void;
  onRemove?: (search: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function RecentSearches({
  searches,
  onSelect,
  onRemove,
  onClearAll,
  className,
}: RecentSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-foreground/80">Recent Searches</p>
        {onClearAll && (
          <button className="text-xs text-primary hover:underline" onClick={onClearAll}>
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((search, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="gap-1 pr-1 cursor-pointer hover:bg-muted"
            onClick={() => onSelect(search)}
          >
            <Clock className="size-3" />
            {search}
            {onRemove && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(search); }}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="size-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// Trending Searches
interface TrendingSearchesProps {
  searches: string[];
  onSelect: (search: string) => void;
  className?: string;
}

export function TrendingSearches({ searches, onSelect, className }: TrendingSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="size-4 text-muted-foreground/60" />
        <p className="text-sm font-medium text-foreground/80">Trending</p>
      </div>
      <div className="space-y-1">
        {searches.map((search, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/20 text-left"
            onClick={() => onSelect(search)}
          >
            <span className="text-sm text-muted-foreground">{index + 1}</span>
            <span className="text-sm">{search}</span>
            <ArrowRight className="size-4 text-muted-foreground/30 ml-auto" />
          </button>
        ))}
      </div>
    </div>
  );
}

// Search Results Summary
interface SearchResultsSummaryProps {
  query: string;
  totalResults: number;
  timeTaken?: number;
  onClear?: () => void;
  className?: string;
}

export function SearchResultsSummary({
  query,
  totalResults,
  timeTaken,
  onClear,
  className,
}: SearchResultsSummaryProps) {
  return (
    <div className={cn("flex items-center justify-between py-2", className)}>
      <p className="text-sm text-muted-foreground">
        {totalResults.toLocaleString()} results for{' '}
        <span className="font-medium text-foreground">&quot;{query}&quot;</span>
        {timeTaken !== undefined && (
          <span className="text-muted-foreground/60"> ({timeTaken}ms)</span>
        )}
      </p>
      {onClear && (
        <Button variant="ghost" size="sm" onClick={onClear} className="text-primary">
          Clear search
        </Button>
      )}
    </div>
  );
}

// Search Filter Chip
interface SearchFilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  className?: string;
}

export function SearchFilterChip({ label, value, onRemove, className }: SearchFilterChipProps) {
  return (
    <Badge variant="secondary" className={cn("gap-1 pr-1", className)}>
      <span className="text-muted-foreground">{label}:</span>
      <span>{value}</span>
      <button onClick={onRemove} className="ml-1 rounded-full hover:bg-muted p-0.5">
        <X className="size-3" />
      </button>
    </Badge>
  );
}

// Default Command Items
export const DefaultCommandItems: CommandItem[] = [
  { id: 'leads', label: 'Go to Leads', icon: <Users className="size-4" />, group: 'Navigation', shortcut: ['G', 'L'] },
  { id: 'conversations', label: 'Go to Conversations', icon: <MessageSquare className="size-4" />, group: 'Navigation', shortcut: ['G', 'C'] },
  { id: 'calendar', label: 'Go to Calendar', icon: <Calendar className="size-4" />, group: 'Navigation', shortcut: ['G', 'K'] },
  { id: 'settings', label: 'Go to Settings', icon: <Settings className="size-4" />, group: 'Navigation', shortcut: ['G', 'S'] },
  { id: 'new-lead', label: 'Create New Lead', icon: <Users className="size-4" />, group: 'Actions', shortcut: ['N', 'L'] },
  { id: 'new-doc', label: 'Create New Document', icon: <FileText className="size-4" />, group: 'Actions', shortcut: ['N', 'D'] },
];
