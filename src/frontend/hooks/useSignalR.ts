'use client';

/**
 * Base SignalR Hook
 * Provides utilities for subscribing to SignalR hub events
 */

import { useEffect, useCallback, useRef } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { useSignalRContext } from '@/contexts/SignalRContext';

type EventHandler<T = unknown> = (data: T) => void;

interface UseSignalROptions {
  autoConnect?: boolean;
}

/**
 * Base hook for SignalR operations
 */
export function useSignalR(options: UseSignalROptions = {}) {
  // Changed: autoConnect now defaults to false to prevent connection before authentication
  const { autoConnect = false } = options;
  const { conversationHub, isConnected, connectionState, error, connect, disconnect } = useSignalRContext();

  useEffect(() => {
    if (autoConnect && !isConnected) {
      console.log('[useSignalR] autoConnect is enabled, attempting to connect...');
      connect();
    }
  }, [autoConnect, isConnected, connect]);

  return {
    hub: conversationHub,
    isConnected,
    connectionState,
    error,
    connect,
    disconnect,
  };
}

/**
 * Hook for subscribing to a SignalR hub event
 */
export function useSignalREvent<T = unknown>(
  eventName: string,
  handler: EventHandler<T>,
  hub?: HubConnection | null
) {
  const { conversationHub } = useSignalRContext();
  const activeHub = hub || conversationHub;
  const handlerRef = useRef(handler);

  // Keep handler ref updated
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!activeHub) return;

    const wrappedHandler = (data: T) => {
      handlerRef.current(data);
    };

    activeHub.on(eventName, wrappedHandler);

    return () => {
      activeHub.off(eventName, wrappedHandler);
    };
  }, [activeHub, eventName]);
}

/**
 * Hook for invoking SignalR hub methods
 */
export function useSignalRInvoke() {
  const { conversationHub, isConnected } = useSignalRContext();

  const invoke = useCallback(
    async <T = void>(methodName: string, ...args: unknown[]): Promise<T> => {
      if (!conversationHub || !isConnected) {
        throw new Error('SignalR hub is not connected');
      }

      return conversationHub.invoke<T>(methodName, ...args);
    },
    [conversationHub, isConnected]
  );

  const send = useCallback(
    async (methodName: string, ...args: unknown[]): Promise<void> => {
      if (!conversationHub || !isConnected) {
        throw new Error('SignalR hub is not connected');
      }

      return conversationHub.send(methodName, ...args);
    },
    [conversationHub, isConnected]
  );

  return { invoke, send, isConnected };
}
