import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (value: string) => void;
}

export function SearchBar({
  placeholder = 'Search...',
  className,
  onSearch,
}: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-text-muted" />
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-10"
        onChange={(e) => onSearch?.(e.target.value)}
      />
    </div>
  );
}