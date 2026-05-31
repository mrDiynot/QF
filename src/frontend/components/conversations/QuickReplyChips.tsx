'use client';

/**
 * Quick Reply Chips Component
 * Displays AI-generated quick reply suggestions as clickable chips
 * Features:
 * - One-click to insert reply
 * - Keyboard shortcuts (1-5)
 * - Auto-refresh on new incoming message
 * - Confidence indicators
 */

import { useEffect, useCallback, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sparkles,
  RefreshCw,
  Loader2,
  MessageSquare,
  Calendar,
  DollarSign,
  HelpCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuickReplySuggestions, useGenerateQuickReplies } from '@/hooks/ai/useAIQuickReplies';
import type { QuickReplySuggestion, QuickReplyCategory, ConversationHistoryItem, LeadContext } from '@/types/ai-quick-replies';

interface QuickReplyChipsProps {
  /** The conversation ID */
  conversationId: string;
  /** The last customer message */
  lastCustomerMessage: string;
  /** Recent conversation history */
  conversationHistory?: ConversationHistoryItem[];
  /** Channel type */
  channelType?: string;
  /** Lead context for personalization */
  leadContext?: LeadContext;
  /** Callback when a reply is selected */
  onSelectReply: (text: string) => void;
  /** Whether to enable keyboard shortcuts */
  enableKeyboardShortcuts?: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// Category icons mapping
const CATEGORY_ICONS: Record<QuickReplyCategory, React.ReactNode> = {
  greeting: <MessageSquare className="size-3" />,
  acknowledgment: <CheckCircle className="size-3" />,
  question: <HelpCircle className="size-3" />,
  information: <MessageSquare className="size-3" />,
  scheduling: <Calendar className="size-3" />,
  pricing: <DollarSign className="size-3" />,
  closing: <CheckCircle className="size-3" />,
  followup: <ArrowRight className="size-3" />,
  objection_handling: <MessageSquare className="size-3" />,
  other: <MessageSquare className="size-3" />,
};

// Confidence color mapping
function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return 'bg-green-100 text-green-700 border-green-200';
  if (confidence >= 60) return 'bg-muted/50 text-info border-border';
  if (confidence >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-muted/40 text-foreground/80 border-border';
}

export function QuickReplyChips({
  conversationId,
  lastCustomerMessage,
  conversationHistory,
  channelType,
  leadContext,
  onSelectReply,
  enableKeyboardShortcuts = true,
  disabled = false,
  className,
}: QuickReplyChipsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch quick reply suggestions
  const {
    data: result,
    isLoading,
    isFetching,
  } = useQuickReplySuggestions({
    conversationId,
    lastCustomerMessage,
    conversationHistory,
    channelType,
    leadContext,
    enabled: !disabled && !!lastCustomerMessage.trim(),
  });

  // Manual refresh mutation
  const generateMutation = useGenerateQuickReplies();

  const suggestions = useMemo(() => result?.suggestions || [], [result?.suggestions]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enableKeyboardShortcuts || disabled || suggestions.length === 0) return;
      // Only handle if not typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      const keyNum = parseInt(event.key, 10);
      if (keyNum >= 1 && keyNum <= 5 && keyNum <= suggestions.length) {
        event.preventDefault();
        onSelectReply(suggestions[keyNum - 1].text);
      }
    },
    [enableKeyboardShortcuts, disabled, suggestions, onSelectReply]
  );

  useEffect(() => {
    if (enableKeyboardShortcuts) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enableKeyboardShortcuts, handleKeyDown]);

  // Handle refresh
  const handleRefresh = () => {
    generateMutation.mutate({
      conversationId,
      lastCustomerMessage,
      conversationHistory,
      channelType,
      leadContext,
      maxSuggestions: 5,
    });
  };

  // Don't render if no message or disabled
  if (!lastCustomerMessage.trim() || disabled) {
    return null;
  }

  const isRefreshing = isFetching || generateMutation.isPending;

  return (
    <div className={cn('border-t bg-gradient-to-r from-purple-50/50 to-blue-50/50 p-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Quick Replies</span>
          {enableKeyboardShortcuts && (
            <span className="text-[10px] text-muted-foreground/60">(Press 1-5 to select)</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground/80"
          >
            {isRefreshing ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <RefreshCw className="size-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground/80"
          >
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      {isExpanded && (
        <div className="flex flex-wrap gap-2">
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              <span>Generating suggestions...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <span className="text-xs text-muted-foreground/60">No suggestions available</span>
          ) : (
            <TooltipProvider>
              {suggestions.slice(0, 5).map((suggestion, index) => (
                <QuickReplyChip
                  key={index}
                  suggestion={suggestion}
                  index={index}
                  onClick={() => onSelectReply(suggestion.text)}
                  showKeyboardHint={enableKeyboardShortcuts}
                />
              ))}
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  );
}

// Individual chip component
interface QuickReplyChipProps {
  suggestion: QuickReplySuggestion;
  index: number;
  onClick: () => void;
  showKeyboardHint?: boolean;
}

function QuickReplyChip({ suggestion, index, onClick, showKeyboardHint }: QuickReplyChipProps) {
  const confidenceColor = getConfidenceColor(suggestion.confidence);
  const categoryIcon = CATEGORY_ICONS[suggestion.category] || CATEGORY_ICONS.other;

  // Truncate text for display
  const displayText = suggestion.text.length > 60
    ? suggestion.text.substring(0, 57) + '...'
    : suggestion.text;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            'group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs',
            'transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
            'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1',
            confidenceColor
          )}
        >
          {/* Keyboard shortcut badge */}
          {showKeyboardHint && (
            <span className="absolute -top-1.5 -left-1.5 size-4 rounded-full bg-gray-700 text-white text-[10px] flex items-center justify-center font-medium">
              {index + 1}
            </span>
          )}

          {/* Category icon */}
          <span className="opacity-60">{categoryIcon}</span>

          {/* Text */}
          <span className="font-medium">{displayText}</span>

          {/* Closing indicator */}
          {suggestion.isClosing && (
            <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px] bg-orange-50 text-orange-600 border-orange-200">
              Closing
            </Badge>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="text-sm">{suggestion.text}</p>
          {suggestion.rationale && (
            <p className="text-xs text-muted-foreground/60 italic">{suggestion.rationale}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Confidence: {suggestion.confidence}%</span>
            <span>•</span>
            <span className="capitalize">{suggestion.tone}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

