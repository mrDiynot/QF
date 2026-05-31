'use client';

/**
 * Filter & Sort Components
 * Filter bars, sort dropdowns, and date range pickers
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Filter Option
interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// Filter Definition
interface FilterDef {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'search' | 'date';
  options?: FilterOption[];
  placeholder?: string;
}

// Active Filter
interface ActiveFilter {
  id: string;
  value: string | string[];
  label: string;
}

// Filter Bar Props
interface FilterBarProps {
  filters: FilterDef[];
  activeFilters: ActiveFilter[];
  onFilterChange: (filterId: string, value: string | string[] | null) => void;
  onClearAll?: () => void;
  searchPlaceholder?: string;
  className?: string;
}

export function FilterBar({
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
  searchPlaceholder = 'Search...',
  className,
}: FilterBarProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    const searchFilter = filters.find(f => f.type === 'search');
    if (searchFilter) {
      onFilterChange(searchFilter.id, value || null);
    }
  };

  const removeFilter = (filterId: string) => {
    onFilterChange(filterId, null);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Dropdowns */}
        {filters.filter(f => f.type !== 'search').map((filter) => (
          <FilterDropdown
            key={filter.id}
            filter={filter}
            value={activeFilters.find(af => af.id === filter.id)?.value}
            onChange={(value) => onFilterChange(filter.id, value)}
          />
        ))}

        {/* Clear All */}
        {activeFilters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-muted-foreground">
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters Tags */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter.id} variant="secondary" className="gap-1 pr-1">
              {filter.label}
              <button
                onClick={() => removeFilter(filter.id)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Filter Dropdown Component
interface FilterDropdownProps {
  filter: FilterDef;
  value?: string | string[];
  onChange: (value: string | string[] | null) => void;
}

function FilterDropdown({ filter, value, onChange }: FilterDropdownProps) {
  if (filter.type === 'multiselect' && filter.options) {
    const selectedValues = (value as string[]) || [];
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="size-4" />
            {filter.label}
            {selectedValues.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {selectedValues.length}
              </Badge>
            )}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {filter.options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...selectedValues, option.value]);
                } else {
                  const newValues = selectedValues.filter(v => v !== option.value);
                  onChange(newValues.length > 0 ? newValues : null);
                }
              }}
            >
              {option.label}
              {option.count !== undefined && (
                <span className="ml-auto text-muted-foreground/60">{option.count}</span>
              )}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (filter.type === 'select' && filter.options) {
    return (
      <Select value={value as string} onValueChange={(v) => onChange(v || null)}>
        <SelectTrigger className="w-auto min-w-[140px] h-9">
          <SelectValue placeholder={filter.label} />
        </SelectTrigger>
        <SelectContent>
          {filter.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return null;
}

// Sort Dropdown
interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  direction: 'asc' | 'desc';
  onChange: (value: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

export function SortDropdown({ options, value, direction, onChange, className }: SortDropdownProps) {
  const currentOption = options.find(o => o.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          {direction === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
          {currentOption?.label || 'Sort'}
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value, direction)}
            className="gap-2"
          >
            {option.value === value && <Check className="size-4" />}
            <span className={option.value !== value ? 'ml-6' : ''}>{option.label}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onChange(value, 'asc')} className="gap-2">
          <ArrowUp className="size-4" />
          Ascending
          {direction === 'asc' && <Check className="size-4 ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange(value, 'desc')} className="gap-2">
          <ArrowDown className="size-4" />
          Descending
          {direction === 'desc' && <Check className="size-4 ml-auto" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Date Range Picker
type DateRangePreset = 'today' | '7d' | '30d' | '90d' | 'month' | 'lastMonth' | 'custom';

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | null) => void;
  presets?: DateRangePreset[];
  className?: string;
}

const DATE_PRESETS: Record<DateRangePreset, { label: string; getRange: () => DateRange }> = {
  today: { label: 'Today', getRange: () => ({ from: new Date(), to: new Date() }) },
  '7d': { label: 'Last 7 days', getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  '30d': { label: 'Last 30 days', getRange: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  '90d': { label: 'Last 90 days', getRange: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
  month: { label: 'This month', getRange: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  lastMonth: { label: 'Last month', getRange: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  custom: { label: 'Custom range', getRange: () => ({ from: new Date(), to: new Date() }) },
};

export function DateRangePicker({
  value,
  onChange,
  presets = ['today', '7d', '30d', '90d', 'month'],
  className,
}: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset | null>(null);

  const handlePresetSelect = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    onChange(DATE_PRESETS[preset].getRange());
  };

  const formatRange = (range: DateRange) => {
    return `${format(range.from, 'MMM d')} - ${format(range.to, 'MMM d, yyyy')}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <Calendar className="size-4" />
          {value ? formatRange(value) : 'Select dates'}
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {presets.map((preset) => (
          <DropdownMenuItem
            key={preset}
            onClick={() => handlePresetSelect(preset)}
            className="gap-2"
          >
            {selectedPreset === preset && <Check className="size-4" />}
            <span className={selectedPreset !== preset ? 'ml-6' : ''}>
              {DATE_PRESETS[preset].label}
            </span>
          </DropdownMenuItem>
        ))}
        {value && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { onChange(null); setSelectedPreset(null); }} className="text-red-600">
              Clear
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Quick Filters (pill buttons)
interface QuickFilter {
  id: string;
  label: string;
  count?: number;
}

interface QuickFiltersProps {
  filters: QuickFilter[];
  activeId?: string;
  onChange: (id: string | null) => void;
  className?: string;
}

export function QuickFilters({ filters, activeId, onChange, className }: QuickFiltersProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        variant={!activeId ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange(null)}
        className={!activeId ? 'bg-primary hover:bg-purple-700' : ''}
      >
        All
      </Button>
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={activeId === filter.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(filter.id)}
          className={cn(
            "gap-1",
            activeId === filter.id && 'bg-primary hover:bg-purple-700'
          )}
        >
          {filter.label}
          {filter.count !== undefined && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-white/20">
              {filter.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}

// Advanced Filter Panel
interface AdvancedFiltersProps {
  children: React.ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  className?: string;
}

export function AdvancedFilters({ children, onApply, onReset, className }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={className}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <SlidersHorizontal className="size-4" />
        Advanced Filters
        <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <Card className="mt-3 p-4">
          <div className="space-y-4">
            {children}
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={onReset}>
              Reset
            </Button>
            <Button size="sm" onClick={onApply} className="bg-primary hover:bg-purple-700">
              Apply Filters
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
