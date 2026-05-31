'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  width?: string;
}

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  actions?: React.ReactNode;
  className?: string;
  showCard?: boolean;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  actions,
  className,
  showCard = true,
}: FilterBarProps) {
  const content = (
    <div className={cn('flex flex-col md:flex-row gap-4', className)}>
      {onSearchChange && (
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-admin-muted-foreground hover:text-admin-foreground"
              onClick={() => onSearchChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      {filters.map((filter) => (
        <Select key={filter.key} value={filter.value} onValueChange={filter.onChange}>
          <SelectTrigger 
            className={cn(
              'bg-admin-background border-admin-border text-admin-foreground',
              filter.width || 'w-[180px]'
            )}
          >
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent className="bg-admin-card border-admin-border">
            {filter.options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-admin-foreground focus:bg-admin-muted focus:text-admin-foreground"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {actions}
    </div>
  );

  if (showCard) {
    return (
      <Card className="shadow-base bg-admin-card border-admin-border">
        <CardContent className="pt-6">
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
}
