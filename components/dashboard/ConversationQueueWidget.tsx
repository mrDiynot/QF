'use client';

/**
 * Conversation Queue Widget
 * Displays conversations that need attention
 */

import { useQuery } from '@tanstack/react-query';
import { conversationsService } from '@/services/api';
import { 
  MessageSquare,
  AlertTriangle,
  Clock,
  User,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function ConversationQueueWidget() {
  // Fetch active conversations that need attention
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', 'needs-attention'],
    queryFn: async () => {
      const response = await conversationsService.getConversations({
        status: 'Open',
        pageSize: 5,
      });
      return response.items || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="size-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
        <p className="text-xs text-muted-foreground/60 mt-1">No conversations need attention right now</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => {
        const needsAttention = conversation.status === 'active' && conversation.unreadCount > 0;
        // Safely parse date - fallback to 'just now' if invalid
        let timeAgo = 'just now';
        try {
          const date = conversation.lastMessageAt ? new Date(conversation.lastMessageAt) : null;
          if (date && !isNaN(date.getTime())) {
            timeAgo = formatDistanceToNow(date, { addSuffix: true });
          }
        } catch {
          // Keep default 'just now' on error
        }

        return (
          <Link
            key={conversation.id}
            href={`/conversations/${conversation.id}`}
            className="block group"
          >
            <div className={cn(
              "flex items-start gap-4 p-4 rounded-2xl border transition-all",
              needsAttention
                ? "bg-orange-50/50 border-orange-200 hover:border-orange-300 hover:shadow-md"
                : "bg-white border-border/50 hover:border-border hover:shadow-md"
            )}>
              {/* Avatar/Icon */}
              <div className={cn(
                "flex size-12 items-center justify-center rounded-xl flex-shrink-0",
                needsAttention 
                  ? "bg-orange-100 text-orange-600"
                  : "bg-muted/40 text-muted-foreground"
              )}>
                <User className="size-6" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-foreground truncate">
                    {conversation.contactId ? `Contact ${conversation.contactId.substring(0, 8)}` : `Conversation ${conversation.id?.substring(0, 8) || 'Unknown'}`}
                  </h4>
                  {needsAttention && (
                    <AlertTriangle className="size-4 text-orange-500 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {conversation.channelType || 'Chat'}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center size-5 rounded-full bg-orange-500 text-white text-xs font-bold">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                    <Clock className="size-3" />
                    <span>{timeAgo}</span>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}

      {/* View All Link */}
      <Link
        href="/conversations"
        className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-primary hover:text-indigo-700 transition-colors"
      >
        View all conversations
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
