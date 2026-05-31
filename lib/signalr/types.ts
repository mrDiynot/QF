/**
 * SignalR Event Types
 * Matches the backend DTOs in QualiFlow.Application.Features.RealTime.DTOs
 */

export interface NewMessageEvent {
  messageId: string;
  conversationId: string;
  content: string;
  direction: 'Inbound' | 'Outbound';
  senderEmail?: string;
  sentAt: string;
}

export interface TypingIndicatorEvent {
  conversationId: string;
  userEmail?: string;
  isTyping: boolean;
  timestamp: string;
}

export interface ReadReceiptEvent {
  conversationId: string;
  messageId: string;
  readByUserId: string;
  readAt: string;
}

export interface MessageDeliveryEvent {
  messageId: string;
  conversationId: string;
  status: 'Sent' | 'Delivered' | 'Failed';
  deliveredAt?: string;
  errorMessage?: string;
}

export interface UserConnectionEvent {
  userId: string;
  userEmail: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface UnreadCountUpdate {
  userId: string;
  totalUnreadCount: number;
}

export type ConnectionState = 'Disconnected' | 'Connecting' | 'Connected' | 'Reconnecting';

export interface SignalRContextValue {
  connectionState: ConnectionState;
  isConnected: boolean;
  joinConversation: (conversationId: string) => Promise<void>;
  leaveConversation: (conversationId: string) => Promise<void>;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => Promise<void>;
  onNewMessage: (callback: (event: NewMessageEvent) => void) => () => void;
  onTypingIndicator: (callback: (event: TypingIndicatorEvent) => void) => () => void;
  onReadReceipt: (callback: (event: ReadReceiptEvent) => void) => () => void;
  onMessageDelivery: (callback: (event: MessageDeliveryEvent) => void) => () => void;
  onUserConnectionStatus: (callback: (event: UserConnectionEvent) => void) => () => void;
  onUnreadCountUpdate: (callback: (userId: string, count: number) => void) => () => void;
}
