'use client';

/**
 * SignalR Context Provider
 * Manages SignalR hub connections for real-time communication
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { config } from '@/lib/config';

interface SignalRContextType {
  conversationHub: signalR.HubConnection | null;
  connectionState: signalR.HubConnectionState;
  isConnected: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const SignalRContext = createContext<SignalRContextType | null>(null);

interface SignalRProviderProps {
  children: React.ReactNode;
  accessToken?: string;
}

export function SignalRProvider({ children, accessToken }: SignalRProviderProps) {
  const [conversationHub, setConversationHub] = useState<signalR.HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<signalR.HubConnectionState>(
    signalR.HubConnectionState.Disconnected
  );
  const [error, setError] = useState<Error | null>(null);
  const reconnectAttempts = useRef(0);
  const isConnecting = useRef(false);

  const isConnected = connectionState === signalR.HubConnectionState.Connected;

  // Create hub connection
  const createConnection = useCallback(() => {
    const hubUrl = config.signalr.conversationHubUrl;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => accessToken || '',
        withCredentials: true,
        skipNegotiation: false,
        // Support both WebSocket and LongPolling transports
        // WebSocket preferred, fallback to LongPolling if WebSocket fails
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount >= config.signalr.maxReconnectAttempts) {
            return null; // Stop reconnecting
          }
          return Math.min(
            config.signalr.reconnectDelay * Math.pow(2, retryContext.previousRetryCount),
            30000
          );
        },
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Connection state change handlers
    connection.onreconnecting((error) => {
      setConnectionState(signalR.HubConnectionState.Reconnecting);
      setError(error || null);
    });

    connection.onreconnected(() => {
      setConnectionState(signalR.HubConnectionState.Connected);
      setError(null);
      reconnectAttempts.current = 0;
    });

    connection.onclose((error) => {
      setConnectionState(signalR.HubConnectionState.Disconnected);
      if (error) setError(error);
    });

    return connection;
  }, [accessToken]);

  // Connect to hub
  const connect = useCallback(async () => {
    if (isConnecting.current) return;

    if (!accessToken || typeof accessToken !== 'string' || !accessToken.trim()) {
      setError(new Error('No access token available for SignalR connection'));
      return;
    }

    isConnecting.current = true;
    setError(null);

    try {
      let connection = conversationHub;

      if (!connection || connection.state === signalR.HubConnectionState.Disconnected) {
        connection = createConnection();
        setConversationHub(connection);
      }

      if (connection.state === signalR.HubConnectionState.Disconnected) {
        setConnectionState(signalR.HubConnectionState.Connecting);
        await connection.start();
        setConnectionState(signalR.HubConnectionState.Connected);
        reconnectAttempts.current = 0;
      }
    } catch (err) {
      console.error('[SignalR] Connection failed:', err instanceof Error ? err.message : err);

      setError(err instanceof Error ? err : new Error('Connection failed'));
      setConnectionState(signalR.HubConnectionState.Disconnected);

      // Retry connection
      if (reconnectAttempts.current < config.signalr.maxReconnectAttempts) {
        reconnectAttempts.current++;
        setTimeout(() => {
          isConnecting.current = false;
          connect();
        }, config.signalr.reconnectDelay);
      }
    } finally {
      isConnecting.current = false;
    }
  }, [accessToken, conversationHub, createConnection]);

  // Disconnect from hub
  const disconnect = useCallback(async () => {
    if (conversationHub) {
      try {
        await conversationHub.stop();
      } catch {
        // Disconnect errors are non-critical
      }
      setConnectionState(signalR.HubConnectionState.Disconnected);
    }
  }, [conversationHub]);

  // Wait for explicit connect() call — no auto-connect
  useEffect(() => {
    // Token state tracked internally; no action on change
  }, [accessToken]);

  const value: SignalRContextType = {
    conversationHub,
    connectionState,
    isConnected,
    error,
    connect,
    disconnect,
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalRContext() {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalRContext must be used within a SignalRProvider');
  }
  return context;
}
