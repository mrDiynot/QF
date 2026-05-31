'use client';

/**
 * Conversation Hub Hook
 * Provides real-time messaging functionality via SignalR
 */

import { useCallback, useState } from 'react';
import { useSignalR, useSignalREvent, useSignalRInvoke } from './useSignalR';
import type { Message, Conversation } from '@/types/api';

// SignalR event types from backend ConversationHub
interface NewMessageEvent {
  conversationId: string;
  message: Message;
}

interface MessageReadEvent {
  conversationId: string;
  messageId: string;
  readAt: string;
  readByUserId: string;
}

interface TypingIndicatorEvent {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface ConversationUpdatedEvent {
  conversation: Conversation;
}

interface UserPresenceEvent {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface UseConversationHubOptions {
  onNewMessage?: (event: NewMessageEvent) => void;
  onMessageRead?: (event: MessageReadEvent) => void;
  onTypingIndicator?: (event: TypingIndicatorEvent) => void;
  onConversationUpdated?: (event: ConversationUpdatedEvent) => void;
  onUserPresence?: (event: UserPresenceEvent) => void;
}

/**
 * Hook for real-time conversation functionality
 */
export function useConversationHub(options: UseConversationHubOptions = {}) {
  const {
    onNewMessage,
    onMessageRead,
    onTypingIndicator,
    onConversationUpdated,
    onUserPresence,
  } = options;

  const { isConnected, connectionState, error } = useSignalR({ autoConnect: true });
  const { invoke, send } = useSignalRInvoke();
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());

  // Subscribe to SignalR events
  useSignalREvent<NewMessageEvent>('ReceiveMessage', (event) => {
    onNewMessage?.(event);
  });

  useSignalREvent<MessageReadEvent>('MessageRead', (event) => {
    onMessageRead?.(event);
  });

  useSignalREvent<TypingIndicatorEvent>('UserTyping', (event) => {
    // Update local typing state
    setTypingUsers((prev) => {
      const newMap = new Map(prev);
      const conversationTyping = newMap.get(event.conversationId) || new Set();

      if (event.isTyping) {
        conversationTyping.add(event.userId);
      } else {
        conversationTyping.delete(event.userId);
      }

      if (conversationTyping.size > 0) {
        newMap.set(event.conversationId, conversationTyping);
      } else {
        newMap.delete(event.conversationId);
      }

      return newMap;
    });

    onTypingIndicator?.(event);
  });

  useSignalREvent<ConversationUpdatedEvent>('ConversationUpdated', (event) => {
    onConversationUpdated?.(event);
  });

  useSignalREvent<UserPresenceEvent>('UserPresence', (event) => {
    onUserPresence?.(event);
  });

  // Join a conversation room
  const joinConversation = useCallback(
    async (conversationId: string) => {
      if (!isConnected) return;
      await invoke('JoinConversationAsync', conversationId);
    },
    [invoke, isConnected]
  );

  // Leave a conversation room
  const leaveConversation = useCallback(
    async (conversationId: string) => {
      if (!isConnected) return;
      await invoke('LeaveConversationAsync', conversationId);
    },
    [invoke, isConnected]
  );

  // Send a message
  const sendMessage = useCallback(
    async (conversationId: string, content: string, messageType: string = 'text') => {
      if (!isConnected) throw new Error('Not connected to SignalR');
      return invoke<Message>('SendMessage', conversationId, content, messageType);
    },
    [invoke, isConnected]
  );

  // Mark message as read
  const markAsRead = useCallback(
    async (conversationId: string, messageId: string) => {
      if (!isConnected) return;
      await send('MarkAsRead', conversationId, messageId);
    },
    [send, isConnected]
  );

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    async (conversationId: string, isTyping: boolean) => {
      if (!isConnected) return;
      await send('SendTypingIndicatorAsync', conversationId, isTyping);
    },
    [send, isConnected]
  );

  // Get typing users for a conversation
  const getTypingUsers = useCallback(
    (conversationId: string): string[] => {
      const users = typingUsers.get(conversationId);
      return users ? Array.from(users) : [];
    },
    [typingUsers]
  );

  return {
    // Connection state
    isConnected,
    connectionState,
    error,

    // Room management
    joinConversation,
    leaveConversation,

    // Messaging
    sendMessage,
    markAsRead,

    // Typing indicators
    sendTypingIndicator,
    getTypingUsers,
    typingUsers,
  };
}
