/**
 * Centralized Auth Event System
 * 
 * Provides a pub/sub mechanism for auth-related events across the application.
 * This allows axios interceptors, React Query, and other parts of the app to
 * trigger logout without tight coupling to NextAuth or React components.
 * 
 * Industry Best Practice: Event-driven architecture for auth state management
 */

type AuthEventType = 
  | 'SESSION_EXPIRED'      // Access token expired and couldn't be refreshed
  | 'UNAUTHORIZED'         // 401 response from API (not during auth flow)
  | 'TOKEN_REFRESH_FAILED' // Explicit refresh attempt failed
  | 'FORCE_LOGOUT'         // Manual logout trigger
  | 'SESSION_REFRESHED';   // Token was successfully refreshed

interface AuthEvent {
  type: AuthEventType;
  reason?: string;
  redirectUrl?: string;
  timestamp: number;
}

type AuthEventListener = (event: AuthEvent) => void;

class AuthEventEmitter {
  private listeners: Set<AuthEventListener> = new Set();
  private lastEvent: AuthEvent | null = null;
  private debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Prevent multiple rapid logout triggers
  private readonly DEBOUNCE_MS = 500;

  /**
   * Subscribe to auth events
   */
  subscribe(listener: AuthEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit an auth event to all subscribers
   * Debounced to prevent rapid-fire events during error cascades
   */
  emit(type: AuthEventType, options?: { reason?: string; redirectUrl?: string }): void {
    // Clear any pending debounced event
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    const event: AuthEvent = {
      type,
      reason: options?.reason,
      redirectUrl: options?.redirectUrl,
      timestamp: Date.now(),
    };

    // Debounce logout-related events to prevent cascading
    const logoutEvents: AuthEventType[] = ['SESSION_EXPIRED', 'UNAUTHORIZED', 'TOKEN_REFRESH_FAILED', 'FORCE_LOGOUT'];
    
    if (logoutEvents.includes(type)) {
      // Check if we recently emitted a similar event
      if (this.lastEvent && 
          logoutEvents.includes(this.lastEvent.type) &&
          Date.now() - this.lastEvent.timestamp < this.DEBOUNCE_MS) {
        console.log('[AuthEvents] Debouncing duplicate logout event:', type);
        return;
      }

      this.debounceTimeout = setTimeout(() => {
        this.lastEvent = event;
        this.notifyListeners(event);
      }, 100); // Small delay to batch rapid events
    } else {
      // Non-logout events emit immediately
      this.lastEvent = event;
      this.notifyListeners(event);
    }
  }

  private notifyListeners(event: AuthEvent): void {
    console.log('[AuthEvents] Emitting:', event.type, event.reason || '');
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[AuthEvents] Listener error:', error);
      }
    });
  }

  /**
   * Get the last emitted event (useful for checking state)
   */
  getLastEvent(): AuthEvent | null {
    return this.lastEvent;
  }

  /**
   * Clear event history (useful after successful login)
   */
  clear(): void {
    this.lastEvent = null;
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
  }
}

// Singleton instance
export const authEvents = new AuthEventEmitter();

/**
 * Helper function to trigger session expired event
 */
export function triggerSessionExpired(reason?: string, redirectUrl?: string): void {
  authEvents.emit('SESSION_EXPIRED', { reason, redirectUrl });
}

/**
 * Helper function to trigger unauthorized event
 */
export function triggerUnauthorized(reason?: string): void {
  authEvents.emit('UNAUTHORIZED', { reason });
}

/**
 * Helper function to trigger token refresh failed event
 */
export function triggerTokenRefreshFailed(reason?: string): void {
  authEvents.emit('TOKEN_REFRESH_FAILED', { reason });
}

/**
 * Helper function to trigger force logout
 */
export function triggerForceLogout(reason?: string): void {
  authEvents.emit('FORCE_LOGOUT', { reason });
}

/**
 * Helper function to notify successful session refresh
 */
export function triggerSessionRefreshed(): void {
  authEvents.emit('SESSION_REFRESHED');
}

export type { AuthEvent, AuthEventType };

