'use client';

/**
 * Utility Components
 * Tooltips, popovers, copy buttons, and helper components
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HelpCircle,
  Info,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Lightbulb,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Info Tooltip
interface InfoTooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function InfoTooltip({ content, side = 'top', className }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className={cn("inline-flex text-muted-foreground/60 hover:text-muted-foreground", className)}>
            <HelpCircle className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Label with Tooltip
interface LabelWithTooltipProps {
  label: string;
  tooltip: string;
  required?: boolean;
  className?: string;
}

export function LabelWithTooltip({ label, tooltip, required, className }: LabelWithTooltipProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="text-sm font-medium text-foreground/80">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <InfoTooltip content={tooltip} />
    </div>
  );
}

// Copy to Clipboard Button
interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'icon';
  className?: string;
}

export function CopyButton({ text, label, variant = 'ghost', size = 'icon', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, [text]);

  if (size === 'icon') {
    return (
      <Button variant={variant} size="icon" onClick={handleCopy} className={cn("size-8", className)}>
        {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
      </Button>
    );
  }

  return (
    <Button variant={variant} size={size} onClick={handleCopy} className={cn("gap-2", className)}>
      {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
      {label || (copied ? 'Copied!' : 'Copy')}
    </Button>
  );
}

// Copyable Text
interface CopyableTextProps {
  text: string;
  displayText?: string;
  truncate?: boolean;
  className?: string;
}

export function CopyableText({ text, displayText, truncate = false, className }: CopyableTextProps) {
  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      <code className={cn(
        "text-sm bg-muted/40 px-2 py-1 rounded font-mono",
        truncate && "truncate max-w-[200px]"
      )}>
        {displayText || text}
      </code>
      <CopyButton text={text} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

// External Link
interface ExternalLinkButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function ExternalLinkButton({ href, children, className }: ExternalLinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-primary hover:text-primary/80 hover:underline",
        className
      )}
    >
      {children}
      <ExternalLink className="size-3" />
    </a>
  );
}

// Alert/Info Box
type AlertVariant = 'info' | 'warning' | 'error' | 'success' | 'tip';

interface AlertBoxProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const ALERT_CONFIG: Record<AlertVariant, { icon: React.ReactNode; colors: string }> = {
  info: { icon: <Info className="size-5" />, colors: 'bg-info/10 border-info/20 text-info' },
  warning: { icon: <AlertCircle className="size-5" />, colors: 'bg-warning/10 border-warning/20 text-warning' },
  error: { icon: <AlertCircle className="size-5" />, colors: 'bg-error/10 border-error/20 text-error' },
  success: { icon: <Check className="size-5" />, colors: 'bg-success/10 border-success/20 text-success' },
  tip: { icon: <Lightbulb className="size-5" />, colors: 'bg-muted/50 border-border text-foreground' },
};

export function AlertBox({ variant = 'info', title, children, dismissible, onDismiss, className }: AlertBoxProps) {
  const config = ALERT_CONFIG[variant];

  return (
    <div className={cn("flex gap-3 p-4 rounded-lg border", config.colors, className)}>
      <div className="flex-shrink-0">{config.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium mb-1">{title}</p>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {dismissible && (
        <button onClick={onDismiss} className="flex-shrink-0 opacity-60 hover:opacity-100">
          <span className="sr-only">Dismiss</span>×
        </button>
      )}
    </div>
  );
}

// Password Toggle Input
interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PasswordInput({ value, onChange, placeholder = 'Enter password', className }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

// Truncated Text with Expand
interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export function TruncatedText({ text, maxLength = 100, className }: TruncatedTextProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;

  if (!shouldTruncate) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {expanded ? text : `${text.slice(0, maxLength)}...`}
      <button
        onClick={() => setExpanded(!expanded)}
        className="ml-1 text-primary hover:text-primary text-sm"
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
    </span>
  );
}

// Key-Value Display
interface KeyValueProps {
  label: string;
  value: React.ReactNode;
  copyable?: boolean;
  className?: string;
}

export function KeyValue({ label, value, copyable, className }: KeyValueProps) {
  return (
    <div className={cn("flex items-start justify-between py-2", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground text-right">{value}</span>
        {copyable && typeof value === 'string' && (
          <CopyButton text={value} className="size-6" />
        )}
      </div>
    </div>
  );
}

// Status Dot with Label
interface StatusDotProps {
  status: 'active' | 'inactive' | 'pending' | 'error';
  label?: string;
  className?: string;
}

const STATUS_DOT_COLORS = {
  active: 'bg-green-500',
  inactive: 'bg-gray-400',
  pending: 'bg-amber-500',
  error: 'bg-red-500',
};

export function StatusDot({ status, label, className }: StatusDotProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("size-2 rounded-full", STATUS_DOT_COLORS[status])} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

// Count Badge
interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: 'default' | 'destructive' | 'outline';
  className?: string;
}

export function CountBadge({ count, max = 99, variant = 'default', className }: CountBadgeProps) {
  if (count === 0) return null;
  
  const display = count > max ? `${max}+` : count;
  
  return (
    <Badge variant={variant} className={cn("h-5 min-w-[20px] px-1.5 justify-center", className)}>
      {display}
    </Badge>
  );
}

// Highlight Text (for search results)
interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
}

export function HighlightText({ text, highlight, className }: HighlightTextProps) {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

// Keyboard Shortcut Display
interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd className={cn(
      "inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded border bg-muted/40 text-muted-foreground font-mono text-xs",
      className
    )}>
      {children}
    </kbd>
  );
}

// Shortcut Hint
interface ShortcutHintProps {
  keys: string[];
  label?: string;
  className?: string;
}

export function ShortcutHint({ keys, label, className }: ShortcutHintProps) {
  return (
    <div className={cn("flex items-center gap-2 text-muted-foreground text-sm", className)}>
      {label && <span>{label}</span>}
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <span key={index} className="flex items-center">
            {index > 0 && <span className="mx-0.5">+</span>}
            <Kbd>{key}</Kbd>
          </span>
        ))}
      </div>
    </div>
  );
}
