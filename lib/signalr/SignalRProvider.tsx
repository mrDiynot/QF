'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useSession } from 'next-auth/react';
import { config } from '@/lib/config';
import type {
  SignalRContextValue,
  ConnectionState,
  NewMessageEvent,
  TypingIndicatorEvent,
  ReadReceiptEvent,
  MessageDeliveryEvent,
  UserConnectionEvent,
} from './types';

const SignalRContext = createContext<SignalRContextValue | null>(null);

const HUB_URL = config.signalr.conversationHubUrl;

interface SignalRProviderProps {
  children: React.ReactNode;
}

export function SignalRProvider({ children }: SignalRProviderProps) {
  const { data: session } = useSession();
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('Disconnected');

  // Event callback refs
  const newMessageCallbacks = useRef<Set<(event: NewMessageEvent) => void>>(new Set());
  const typingCallbacks = useRef<Set<(event: TypingIndicatorEvent) => void>>(new Set());
  const readReceiptCallbacks = useRef<Set<(event: ReadReceiptEvent) => void>>(new Set());
  const deliveryCallbacks = useRef<Set<(event: MessageDeliveryEvent) => void>>(new Set());
  const connectionCallbacks = useRef<Set<(event: UserConnectionEvent) => void>>(new Set());
  const unreadCallbacks = useRef<Set<(userId: string, count: number) => void>>(new Set());

  // Initialize connection when session is available
  useEffect(() => {
    if (!session?.accessToken) {
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => session.accessToken as string,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // Set up event handlers
    connection.on('NewMessage', (event: NewMessageEvent) => {
      newMessageCallbacks.current.forEach(cb => cb(event));
    });

    connection.on('TypingIndicator', (event: TypingIndicatorEvent) => {
      typingCallbacks.current.forEach(cb => cb(event));
    });

    connection.on('ReadReceipt', (event: ReadReceiptEvent) => {
      readReceiptCallbacks.current.forEach(cb => cb(event));
    });

    connection.on('MessageDelivery', (event: MessageDeliveryEvent) => {
      deliveryCallbacks.current.forEach(cb => cb(event));
    });

    connection.on('UserConnectionStatus', (event: UserConnectionEvent) => {
      connectionCallbacks.current.forEach(cb => cb(event));
    });

    connection.on('UnreadCountUpdate', (userId: string, count: number) => {
      unreadCallbacks.current.forEach(cb => cb(userId, count));
    });

    // Connection state handlers
    connection.onreconnecting(() => {
      setConnectionState('Reconnecting');
    });

    connection.onreconnected(() => {
      setConnectionState('Connected');
    });

    connection.onclose(() => {
      setConnectionState('Disconnected');
    });

    // Start connection
    const startConnection = async () => {
      try {
        setConnectionState('Connecting');
        await connection.start();
        setConnectionState('Connected');
        console.log('[SignalR] Connected to ConversationHub');
      } catch (err) {
        console.error('[SignalR] Connection failed:', err);
        setConnectionState('Disconnected');
        // Retry after 5 seconds
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, [session?.accessToken]);

  const joinConversation = useCallback(async (conversationId: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('JoinConversationAsync', conversationId);
    }
  }, []);

  const leaveConversation = useCallback(async (conversationId: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('LeaveConversationAsync', conversationId);
    }
  }, []);

  const sendTypingIndicator = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('SendTypingIndicatorAsync', conversationId, isTyping);
    }
  }, []);

  // Subscription helpers
  const onNewMessage = useCallback((callback: (event: NewMessageEvent) => void) => {
    newMessageCallbacks.current.add(callback);
    return () => { newMessageCallbacks.current.delete(callback); };
  }, []);

  const onTypingIndicator = useCallback((callback: (event: TypingIndicatorEvent) => void) => {
    typingCallbacks.current.add(callback);
    return () => { typingCallbacks.current.delete(callback); };
  }, []);

  const onReadReceipt = useCallback((callback: (event: ReadReceiptEvent) => void) => {
    readReceiptCallbacks.current.add(callback);
    return () => { readReceiptCallbacks.current.delete(callback); };
  }, []);

  const onMessageDelivery = useCallback((callback: (event: MessageDeliveryEvent) => void) => {
    deliveryCallbacks.current.add(callback);
    return () => { deliveryCallbacks.current.delete(callback); };
  }, []);

  const onUserConnectionStatus = useCallback((callback: (event: UserConnectionEvent) => void) => {
    connectionCallbacks.current.add(callback);
    return () => { connectionCallbacks.current.delete(callback); };
  }, []);

  const onUnreadCountUpdate = useCallback((callback: (userId: string, count: number) => void) => {
    unreadCallbacks.current.add(callback);
    return () => { unreadCallbacks.current.delete(callback); };
  }, []);

  const value: SignalRContextValue = {
    connectionState,
    isConnected: connectionState === 'Connected',
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    onNewMessage,
    onTypingIndicator,
    onReadReceipt,
    onMessageDelivery,
    onUserConnectionStatus,
    onUnreadCountUpdate,
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalR(): SignalRContextValue {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }
  return context;
}
