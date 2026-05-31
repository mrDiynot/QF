'use client';

/**
 * Accordion & Collapse Components
 * Accordions, collapsible sections, FAQ lists
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Accordion Item
interface AccordionItemData {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItemData[];
  defaultOpen?: string[];
  allowMultiple?: boolean;
  variant?: 'default' | 'bordered' | 'separated';
  iconPosition?: 'left' | 'right';
  className?: string;
}

export function Accordion({
  items,
  defaultOpen = [],
  allowMultiple = false,
  variant = 'default',
  iconPosition = 'right',
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const variantClasses = {
    default: 'divide-y border rounded-lg',
    bordered: 'space-y-0 border rounded-lg divide-y',
    separated: 'space-y-2',
  };

  return (
    <div className={cn(variantClasses[variant], className)}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);

        return (
          <div
            key={item.id}
            className={cn(
              variant === 'separated' && 'border rounded-lg overflow-hidden'
            )}
          >
            <button
              onClick={() => !item.disabled && toggleItem(item.id)}
              disabled={item.disabled}
              className={cn(
                "w-full flex items-center gap-3 p-4 text-left transition-colors",
                !item.disabled && "hover:bg-muted/20",
                item.disabled && "opacity-50 cursor-not-allowed",
                isOpen && "bg-muted/20"
              )}
            >
              {iconPosition === 'left' && (
                <ChevronRight className={cn(
                  "size-4 text-muted-foreground/60 transition-transform flex-shrink-0",
                  isOpen && "rotate-90"
                )} />
              )}
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span className="flex-1 font-medium text-foreground">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="flex-shrink-0">{item.badge}</Badge>
              )}
              {iconPosition === 'right' && (
                <ChevronDown className={cn(
                  "size-4 text-muted-foreground/60 transition-transform flex-shrink-0",
                  isOpen && "rotate-180"
                )} />
              )}
            </button>
            {isOpen && (
              <div className="px-4 pb-4 text-sm text-muted-foreground">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Collapsible Section
interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'card' | 'minimal';
  className?: string;
}

export function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
  headerActions,
  icon,
  variant = 'default',
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const Wrapper = variant === 'card' ? Card : 'div';

  return (
    <Wrapper className={cn(
      variant === 'card' && 'overflow-hidden',
      variant === 'default' && 'border rounded-lg',
      className
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 p-4 text-left",
          variant !== 'minimal' && "hover:bg-muted/20",
          variant === 'minimal' && "px-0"
        )}
      >
        <ChevronRight className={cn(
          "size-4 text-muted-foreground/60 transition-transform flex-shrink-0",
          isOpen && "rotate-90"
        )} />
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-1 font-semibold text-foreground">{title}</span>
        {headerActions && (
          <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
            {headerActions}
          </div>
        )}
      </button>
      {isOpen && (
        <div className={cn(
          "px-4 pb-4",
          variant === 'minimal' && "px-0"
        )}>
          {children}
        </div>
      )}
    </Wrapper>
  );
}

// FAQ Item
interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function FAQItem({ question, answer, isOpen = false, onToggle, className }: FAQItemProps) {
  return (
    <div className={cn("border-b last:border-b-0", className)}>
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 py-4 text-left hover:bg-muted/20 transition-colors"
      >
        <span className={cn(
          "flex size-6 items-center justify-center rounded-full flex-shrink-0 mt-0.5 transition-colors",
          isOpen ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground"
        )}>
          {isOpen ? <Minus className="size-3" /> : <Plus className="size-3" />}
        </span>
        <span className="flex-1 font-medium text-foreground">{question}</span>
      </button>
      {isOpen && (
        <div className="pl-9 pb-4 text-sm text-muted-foreground">
          {answer}
        </div>
      )}
    </div>
  );
}

// FAQ List
interface FAQData {
  id: string;
  question: string;
  answer: React.ReactNode;
  category?: string;
}

interface FAQListProps {
  items: FAQData[];
  allowMultiple?: boolean;
  showCategories?: boolean;
  className?: string;
}

export function FAQList({
  items,
  allowMultiple = false,
  showCategories = false,
  className,
}: FAQListProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const categories = showCategories
    ? [...new Set(items.map((item) => item.category).filter(Boolean))]
    : null;

  if (showCategories && categories && categories.length > 0) {
    return (
      <div className={cn("space-y-8", className)}>
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-foreground mb-4">{category}</h3>
            <Card className="divide-y">
              {items
                .filter((item) => item.category === category)
                .map((item) => (
                  <FAQItem
                    key={item.id}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openItems.has(item.id)}
                    onToggle={() => toggleItem(item.id)}
                  />
                ))}
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className={cn("divide-y", className)}>
      {items.map((item) => (
        <FAQItem
          key={item.id}
          question={item.question}
          answer={item.answer}
          isOpen={openItems.has(item.id)}
          onToggle={() => toggleItem(item.id)}
        />
      ))}
    </Card>
  );
}

// Expandable Text
interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  className?: string;
}

export function ExpandableText({ text, maxLines = 3, className }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={className}>
      <p
        className={cn(
          "text-sm text-muted-foreground",
          !expanded && `line-clamp-${maxLines}`
        )}
        style={!expanded ? { WebkitLineClamp: maxLines, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' } : undefined}
      >
        {text}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-primary hover:text-primary mt-1"
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
}

// Details Summary (native-like)
interface DetailsSummaryProps {
  summary: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function DetailsSummary({ summary, children, defaultOpen = false, className }: DetailsSummaryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border rounded-lg", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/20"
      >
        <ChevronRight className={cn(
          "size-4 text-muted-foreground/60 transition-transform",
          isOpen && "rotate-90"
        )} />
        <span className="text-sm font-medium text-foreground/80">{summary}</span>
      </button>
      {isOpen && (
        <div className="p-3 pt-0 text-sm text-muted-foreground border-t">
          {children}
        </div>
      )}
    </div>
  );
}

// Nested Accordion
interface NestedAccordionItem {
  id: string;
  title: string;
  content?: React.ReactNode;
  children?: NestedAccordionItem[];
}

interface NestedAccordionProps {
  items: NestedAccordionItem[];
  className?: string;
}

export function NestedAccordion({ items, className }: NestedAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderItem = (item: NestedAccordionItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.has(item.id);

    return (
      <div key={item.id} style={{ marginLeft: depth * 16 }}>
        <button
          onClick={() => toggleItem(item.id)}
          className="w-full flex items-center gap-2 py-2 text-left hover:bg-muted/20 rounded"
        >
          {hasChildren ? (
            <ChevronRight className={cn(
              "size-4 text-muted-foreground/60 transition-transform",
              isOpen && "rotate-90"
            )} />
          ) : (
            <span className="size-4" />
          )}
          <span className="text-sm font-medium text-foreground">{item.title}</span>
        </button>
        {isOpen && (
          <>
            {item.content && (
              <div className="pl-6 py-2 text-sm text-muted-foreground">
                {item.content}
              </div>
            )}
            {hasChildren && item.children!.map((child) => renderItem(child, depth + 1))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className={cn("border rounded-lg p-2", className)}>
      {items.map((item) => renderItem(item))}
    </div>
  );
}

// Help Section
interface HelpSectionProps {
  title?: string;
  items: Array<{ question: string; answer: string }>;
  contactLink?: string;
  className?: string;
}

export function HelpSection({
  title = "Frequently Asked Questions",
  items,
  contactLink,
  className,
}: HelpSectionProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="size-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <FAQList
        items={items.map((item, index) => ({
          id: String(index),
          question: item.question,
          answer: item.answer,
        }))}
      />
      {contactLink && (
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Can&apos;t find what you&apos;re looking for?{' '}
          <a href={contactLink} className="text-primary hover:underline">
            Contact support
          </a>
        </p>
      )}
    </div>
  );
}
