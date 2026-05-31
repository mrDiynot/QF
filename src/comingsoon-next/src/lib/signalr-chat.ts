import * as signalR from '@microsoft/signalr';
import { ChatMessageDto } from './chat-api';

// Use relative URL so Next.js proxy handles it (avoids CORS in browser).
const isServer = typeof window === 'undefined';
const HUB_BASE_URL = isServer
  ? (process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.qualiflow.ai')
  : '';

export class ChatSignalRService {
  private connection: signalR.HubConnection | null = null;
  private sessionToken: string | null = null;

  async connect(sessionToken: string): Promise<void> {
    this.sessionToken = sessionToken;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_BASE_URL}/hubs/public-chat`, {
        skipNegotiation: false,
        // LongPolling is HTTP-based and goes through the Next.js proxy safely.
        // WebSockets bypass the proxy and cause CORS in local dev.
        transport: signalR.HttpTransportType.LongPolling,
      })
      // No automatic reconnect — prevents repeated failed connection spam.
      // The chat widget already falls back to HTTP polling when SignalR is unavailable.
      .configureLogging({ log: () => {} }) // null logger — suppress all SignalR console output
      .build();

    try {
      await this.connection.start();
      console.log('[SignalR] Connected to chat hub');

      // Join the session group
      const joined = await this.connection.invoke('JoinSessionAsync', sessionToken);
      if (joined) {
        console.log('[SignalR] Joined session:', sessionToken);
      } else {
        console.error('[SignalR] Failed to join session');
      }
    } catch (error) {
      console.error('[SignalR] Connection error:', error);
      throw error;
    }
  }

  onAIResponse(callback: (message: ChatMessageDto) => void): void {
    if (!this.connection) return;

    this.connection.on('ReceiveAIResponse', (message: ChatMessageDto) => {
      console.log('[SignalR] Received AI response:', message);
      callback(message);
    });
  }

  onMessage(callback: (message: ChatMessageDto) => void): void {
    if (!this.connection) return;

    this.connection.on('ReceiveMessage', (message: ChatMessageDto) => {
      console.log('[SignalR] Received message:', message);
      callback(message);
    });
  }

  onTypingIndicator(callback: (sessionId: string, isTyping: boolean) => void): void {
    if (!this.connection) return;

    this.connection.on('TypingIndicator', (sessionId: string, isTyping: boolean) => {
      callback(sessionId, isTyping);
    });
  }

  onAIStreamToken(callback: (messageId: string, token: string, isComplete: boolean) => void): void {
    if (!this.connection) return;

    this.connection.on('ReceiveAIStreamToken', (messageId: string, token: string, isComplete: boolean) => {
      callback(messageId, token, isComplete);
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('[SignalR] Disconnected');
      } catch (error) {
        console.error('[SignalR] Disconnect error:', error);
      }
      this.connection = null;
    }
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}
