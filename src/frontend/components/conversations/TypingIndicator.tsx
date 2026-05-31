'use client';

/**
 * Typing Indicator Component
 * Shows animated dots when users are typing in a conversation
 */

import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  typingUsers?: string[];
  className?: string;
}

export function TypingIndicator({ typingUsers = [], className }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const displayText = typingUsers.length === 1
    ? `${typingUsers[0]} is typing`
    : typingUsers.length === 2
      ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
      : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`;

  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      <div className="flex gap-1">
        <span className="size-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="size-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="size-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="italic">{displayText}</span>
    </div>
  );
}

interface TypingBubbleProps {
  className?: string;
}

export function TypingBubble({ className }: TypingBubbleProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-4 py-3 rounded-2xl bg-muted/40",
      className
    )}>
      <span className="size-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="size-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="size-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
