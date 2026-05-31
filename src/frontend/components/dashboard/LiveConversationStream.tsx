'use client';

import { MessageSquare, Bot, User, Clock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useConversations } from '@/hooks/api/useConversations';

interface ConversationDisplay {
  id: string;
  contactName: string;
  lastMessage: string;
  timestamp: Date;
  channel: 'sms' | 'whatsapp' | 'instagram' | 'facebook' | 'chat' | 'voice' | 'email';
  status: 'ai' | 'human' | 'waiting';
  unreadCount: number;
}

// Backend conversation item type
interface ConversationItem {
  id: string;
  leadId?: string;
  lead?: { name?: string; email?: string };
  lastMessage?: { content?: string; sentAt?: string };
  channel?: string;
  channelType?: string;
  isAIHandling?: boolean;
  assignedAgentId?: string;
  unreadCount?: number;
  lastMessageAt?: string;
  contactId?: string;
}

// Map backend channel names to display format
function normalizeChannel(channel: string): ConversationDisplay['channel'] {
  const channelMap: Record<string, ConversationDisplay['channel']> = {
    'sms': 'sms',
    'voice': 'voice',
    'whatsapp': 'whatsapp',
    'instagram': 'instagram',
    'facebook': 'facebook',
    'email': 'email',
    'chat_widget': 'chat',
    'webchat': 'chat',
    'chat': 'chat',
  };
  return channelMap[channel?.toLowerCase()] || 'chat';
}

// Determine conversation status based on backend data
function determineStatus(conversation: { isAIHandling?: boolean; assignedAgentId?: string }): ConversationDisplay['status'] {
  if (conversation.isAIHandling) return 'ai';
  if (conversation.assignedAgentId) return 'human';
  return 'waiting';
}

export function LiveConversationStream() {
  // Fetch real conversation data from API (paginated endpoint with items array)
  const { data: conversationData, isLoading, error } = useConversations({ pageSize: 5 });

  // Transform API data to display format
  // The API returns { items: [...], totalCount, ... }
  const rawItems = conversationData?.items || [];
  const conversations: ConversationDisplay[] = rawItems
    .slice(0, 5) // Show only 5 most recent
    .map((conv: ConversationItem) => ({
      id: conv.id,
      contactName: conv.lead?.name || conv.lead?.email || 'Unknown Contact',
      lastMessage: conv.lastMessage?.content || 'No messages yet',
      timestamp: new Date(conv.lastMessage?.sentAt || conv.lastMessageAt || Date.now()),
      channel: normalizeChannel(conv.channel || conv.channelType || 'chat'),
      status: determineStatus(conv),
      unreadCount: conv.unreadCount || 0,
    }));

  const getChannelColor = (_channel: string) => {
    // All channels use neutral gray - channel type is informational, not status
    return 'bg-gray-100 text-gray-600';
  };

  const getStatusInfo = (status: ConversationDisplay['status']) => {
    if (status === 'ai') {
      return {
        icon: <Bot className="size-3" />,
        label: 'AI',
        color: 'bg-gray-100 text-gray-600',
      };
    }
    if (status === 'human') {
      return {
        icon: <User className="size-3" />,
        label: 'Human',
        color: 'bg-gray-100 text-gray-600',
      };
    }
    return {
      icon: <Clock className="size-3" />,
      label: 'Waiting',
      color: 'bg-warning-bg text-warning',
    };
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="size-12 mx-auto text-amber-400 mb-3" />
        <p className="text-sm text-muted-foreground">Unable to load conversations</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Data will refresh automatically</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className={cn(
              "size-2 rounded-full",
              conversations.length > 0 ? "bg-brand-orange animate-pulse" : "bg-gray-300"
            )} />
          </div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {conversations.length > 0 ? 'Live Updates' : 'No Activity'}
          </span>
        </div>
        <Link
          href="/conversations"
          className="flex items-center gap-1 text-xs font-semibold text-brand-orange hover:opacity-80 hover:gap-2 transition-all"
        >
          View All
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Conversation List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {conversations.map((conv, index) => {
            const statusInfo = getStatusInfo(conv.status);
            
            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Link
                  href={`/conversations?id=${conv.id}`}
                  className={cn(
                    'block p-3 rounded-xl border border-gray-200',
                    'hover:border-gray-300 hover:bg-gray-50',
                    'transition-all duration-200',
                    'group'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Name and badges */}
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {conv.contactName}
                        </p>
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', statusInfo.color)}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      {/* Message preview */}
                      <p className="text-xs text-gray-600 truncate mb-1">
                        {conv.lastMessage}
                      </p>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-2">
                        <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium capitalize', getChannelColor(conv.channel))}>
                          {conv.channel}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(conv.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Unread badge */}
                    {conv.unreadCount > 0 && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center size-6 rounded-full bg-error text-xs font-bold text-white">
                          {conv.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {conversations.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="size-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No active conversations</p>
        </div>
      )}
    </div>
  );
}
