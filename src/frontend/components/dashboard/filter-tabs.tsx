import { cn } from '@/lib/utils';

interface FilterTab {
  label: string;
  value: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterTabs({ tabs, activeTab, onChange, className }: FilterTabsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-normal transition-colors',
            activeTab === tab.value
              ? 'bg-brand-purple text-white'
              : 'border border-border bg-white text-text-secondary hover:bg-muted/20'
          )}
        >
          {tab.label}
          {tab.count !== undefined && ` (${tab.count})`}
        </button>
      ))}
    </div>
  );
}