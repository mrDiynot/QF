'use client';

/**
 * Tab & Panel Components
 * Tab panels, vertical tabs, scrollable tabs
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tab Data
interface TabData {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  closable?: boolean;
}

// Basic Tab Panel
interface TabPanelProps {
  tabs: TabData[];
  activeTab: string;
  onChange: (tabId: string) => void;
  onClose?: (tabId: string) => void;
  children: React.ReactNode;
  variant?: 'default' | 'pills' | 'underline' | 'boxed';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TabPanel({
  tabs,
  activeTab,
  onChange,
  onClose,
  children,
  variant = 'default',
  size = 'md',
  className,
}: TabPanelProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2.5',
  };

  const variantClasses = {
    default: {
      container: 'border-b',
      tab: 'border-b-2 border-transparent -mb-px',
      active: 'border-primary text-primary',
      inactive: 'text-muted-foreground hover:text-foreground/80 hover:border-border',
    },
    pills: {
      container: 'bg-muted/40 p-1 rounded-lg',
      tab: 'rounded-md',
      active: 'bg-white shadow text-foreground',
      inactive: 'text-muted-foreground hover:text-foreground/80',
    },
    underline: {
      container: '',
      tab: 'border-b-2 border-transparent',
      active: 'border-primary text-primary',
      inactive: 'text-muted-foreground hover:text-foreground/80',
    },
    boxed: {
      container: 'border rounded-t-lg bg-muted/20 p-1',
      tab: 'rounded-md',
      active: 'bg-white shadow text-foreground',
      inactive: 'text-muted-foreground hover:text-foreground/80 hover:bg-muted/40',
    },
  };

  const styles = variantClasses[variant];

  return (
    <div className={className}>
      <div className={cn("flex gap-1", styles.container)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "flex items-center gap-2 font-medium transition-all",
              sizeClasses[size],
              styles.tab,
              activeTab === tab.id ? styles.active : styles.inactive,
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {tab.badge}
              </Badge>
            )}
            {tab.closable && onClose && (
              <button
                onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="size-3" />
              </button>
            )}
          </button>
        ))}
      </div>
      <div className={cn(
        "mt-4",
        variant === 'boxed' && "border border-t-0 rounded-b-lg p-4 bg-white"
      )}>
        {children}
      </div>
    </div>
  );
}

// Vertical Tabs
interface VerticalTabsProps {
  tabs: TabData[];
  activeTab: string;
  onChange: (tabId: string) => void;
  children: React.ReactNode;
  tabWidth?: string;
  className?: string;
}

export function VerticalTabs({
  tabs,
  activeTab,
  onChange,
  children,
  tabWidth = '200px',
  className,
}: VerticalTabsProps) {
  return (
    <div className={cn("flex", className)}>
      <div className="border-r pr-4" style={{ width: tabWidth }}>
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/40",
                tab.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {tab.icon}
              <span className="flex-1 truncate">{tab.label}</span>
              {tab.badge !== undefined && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {tab.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 pl-6">
        {children}
      </div>
    </div>
  );
}

// Scrollable Tabs
interface ScrollableTabsProps {
  tabs: TabData[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function ScrollableTabs({
  tabs,
  activeTab,
  onChange,
  className,
}: ScrollableTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tabs]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 size-8 bg-white shadow"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="size-4" />
        </Button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto scrollbar-hide border-b"
        onScroll={checkScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border-b-2 -mb-px whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground/80",
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {tab.badge}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 size-8 bg-white shadow"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="size-4" />
        </Button>
      )}
    </div>
  );
}

// Icon Tabs
interface IconTabsProps {
  tabs: Array<{ id: string; icon: React.ReactNode; label?: string; badge?: number }>;
  activeTab: string;
  onChange: (tabId: string) => void;
  showLabels?: boolean;
  className?: string;
}

export function IconTabs({
  tabs,
  activeTab,
  onChange,
  showLabels = false,
  className,
}: IconTabsProps) {
  return (
    <div className={cn("flex items-center gap-1 p-1 bg-muted/40 rounded-lg", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors",
            activeTab === tab.id
              ? "bg-white shadow text-primary"
              : "text-muted-foreground hover:text-foreground/80"
          )}
        >
          <span className="relative">
            {tab.icon}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 size-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {tab.badge > 9 ? '9+' : tab.badge}
              </span>
            )}
          </span>
          {showLabels && tab.label && (
            <span className="text-xs">{tab.label}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// Browser-style Tabs (with add button)
interface BrowserTabsProps {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  activeTab: string;
  onChange: (tabId: string) => void;
  onClose?: (tabId: string) => void;
  onAdd?: () => void;
  className?: string;
}

export function BrowserTabs({
  tabs,
  activeTab,
  onChange,
  onClose,
  onAdd,
  className,
}: BrowserTabsProps) {
  return (
    <div className={cn("flex items-end gap-1 bg-muted px-2 pt-2", className)}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "group flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer max-w-[200px]",
            activeTab === tab.id
              ? "bg-white"
              : "bg-muted/40 hover:bg-muted/20"
          )}
        >
          {tab.icon}
          <span className="flex-1 truncate text-sm">{tab.label}</span>
          {onClose && (
            <button
              onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
              className="opacity-0 group-hover:opacity-100 rounded-full hover:bg-muted p-0.5"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      ))}
      {onAdd && (
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full mb-1"
          onClick={onAdd}
        >
          <Plus className="size-4" />
        </Button>
      )}
    </div>
  );
}

// Segmented Control
interface SegmentedControlProps {
  options: Array<{ value: string; label: string; icon?: React.ReactNode }>;
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  size = 'md',
  className,
}: SegmentedControlProps) {
  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  return (
    <div className={cn(
      "inline-flex items-center p-1 bg-muted/40 rounded-lg",
      sizeClasses[size],
      className
    )}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex items-center justify-center gap-2 px-4 h-full rounded-md transition-all",
            value === option.value
              ? "bg-white shadow text-foreground"
              : "text-muted-foreground hover:text-foreground/80"
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Step Tabs (numbered)
interface StepTabsProps {
  steps: Array<{ id: string; label: string }>;
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function StepTabs({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepTabsProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && index <= currentStep;

        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-2",
                isClickable && "cursor-pointer"
              )}
            >
              <span className={cn(
                "flex size-8 items-center justify-center rounded-full text-sm font-medium",
                isComplete && "bg-green-500 text-white",
                isCurrent && "bg-primary text-white",
                !isComplete && !isCurrent && "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </span>
              <span className={cn(
                "text-sm",
                isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-12 h-0.5 mx-3",
                isComplete ? "bg-green-500" : "bg-muted"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Tab Content (with animation)
interface TabContentProps {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
}

export function TabContent({ children, isActive, className }: TabContentProps) {
  if (!isActive) return null;

  return (
    <div className={cn("animate-in fade-in-50 duration-200", className)}>
      {children}
    </div>
  );
}
