/**
 * Singleton SignalR Notification Hub Manager
 * Ensures only one connection exists across all components
 */

import * as signalR from '@microsoft/signalr';
import { config } from '@/lib/config';

type ConnectionStateCallback = (connected: boolean) => void;
type NotificationCallback = (data: unknown) => void;

class NotificationHubManager {
  private connection: signalR.HubConnection | null = null;
  private connectionPromise: Promise<void> | null = null;
  private subscribers = new Set<string>();
  private stateCallbacks = new Map<string, ConnectionStateCallback>();
  private eventCallbacks = new Map<string, Map<string, NotificationCallback>>();
  private accessToken: string | null = null;
  private disconnectTimeout: NodeJS.Timeout | null = null;

  async connect(token: string, subscriberId: string): Promise<void> {
    this.accessToken = token;
    this.subscribers.add(subscriberId);

    // Cancel any pending disconnect
    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = null;
    }

    // If already connected, just return
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      this.notifyStateChange(subscriberId, true);
      return;
    }

    // If connection is in progress, wait for it
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Create new connection
    this.connectionPromise = this.createConnection();
    return this.connectionPromise;
  }

  private async createConnection(): Promise<void> {
    // Cancel any pending disconnect before creating new connection
    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = null;
    }

    if (this.connection) {
      await this.connection.stop().catch(() => {});
    }

    console.log('[NotificationHubManager] Creating new connection');

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(config.signalr.notificationHubUrl, {
        accessTokenFactory: () => this.accessToken || '',
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Set up event handlers
    this.connection.onreconnecting(() => {
      console.log('[NotificationHubManager] Reconnecting...');
      this.notifyAllStateChange(false);
    });

    this.connection.onreconnected(() => {
      console.log('[NotificationHubManager] Reconnected');
      this.notifyAllStateChange(true);
    });

    this.connection.onclose(() => {
      console.log('[NotificationHubManager] Connection closed');
      this.notifyAllStateChange(false);
      this.connectionPromise = null;
    });

    try {
      await this.connection.start();
      console.log('[NotificationHubManager] ✅ Connected successfully');
      this.notifyAllStateChange(true);
    } catch (error) {
      console.error('[NotificationHubManager] ❌ Connection failed:', error);
      this.connectionPromise = null;
      throw error;
    }
  }

  disconnect(subscriberId: string): void {
    this.subscribers.delete(subscriberId);
    this.stateCallbacks.delete(subscriberId);
    this.eventCallbacks.delete(subscriberId);

    // Debounce disconnect to prevent race conditions
    // Only disconnect if no more subscribers after a delay
    if (this.subscribers.size === 0) {
      console.log('[NotificationHubManager] No more subscribers, scheduling disconnect');
      
      // Clear any existing disconnect timeout
      if (this.disconnectTimeout) {
        clearTimeout(this.disconnectTimeout);
      }
      
      // Schedule disconnect after 1 second to allow for quick reconnects
      this.disconnectTimeout = setTimeout(() => {
        // Double-check we still have no subscribers
        if (this.subscribers.size === 0 && this.connection) {
          console.log('[NotificationHubManager] Disconnecting after timeout');
          this.connection.stop().catch(() => {});
          this.connection = null;
          this.connectionPromise = null;
          this.disconnectTimeout = null;
        }
      }, 1000);
    }
  }

  onStateChange(subscriberId: string, callback: ConnectionStateCallback): void {
    this.stateCallbacks.set(subscriberId, callback);
  }

  on(subscriberId: string, eventName: string, callback: NotificationCallback): void {
    if (!this.eventCallbacks.has(subscriberId)) {
      this.eventCallbacks.set(subscriberId, new Map());
    }
    
    const subscriberEvents = this.eventCallbacks.get(subscriberId)!;
    subscriberEvents.set(eventName, callback);

    // Register with SignalR connection
    if (this.connection) {
      this.connection.off(eventName); // Remove any existing handler
      this.connection.on(eventName, (data: unknown) => {
        // Notify all subscribers
        this.eventCallbacks.forEach((events) => {
          const handler = events.get(eventName);
          if (handler) {
            handler(data);
          }
        });
      });
    }
  }

  async invoke(method: string, ...args: unknown[]): Promise<unknown> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return this.connection.invoke(method, ...args);
    }
    throw new Error('Not connected to SignalR hub');
  }

  private notifyStateChange(subscriberId: string, connected: boolean): void {
    const callback = this.stateCallbacks.get(subscriberId);
    if (callback) {
      callback(connected);
    }
  }

  private notifyAllStateChange(connected: boolean): void {
    this.stateCallbacks.forEach((callback) => callback(connected));
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }
}

// Export singleton instance
export const notificationHubManager = new NotificationHubManager();
