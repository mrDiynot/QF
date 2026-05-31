/**
 * Application configuration
 * Centralized configuration for API endpoints, feature flags, and environment variables
 * 
 * IMPORTANT: This is the SINGLE SOURCE OF TRUTH for all API endpoints.
 * Do NOT hardcode URLs elsewhere - always import from this config.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export const config = {
  // Legacy property for backwards compatibility
  apiBaseUrl: `${API_BASE_URL}/api/${API_VERSION}`,
  api: {
    baseUrl: API_BASE_URL,
    version: API_VERSION,
    timeout: 30000, // 30 seconds
  },
  auth: {
    accessTokenExpiry: 15 * 60 * 1000, // 15 minutes in milliseconds
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    tokenRefreshThreshold: 2 * 60 * 1000, // Refresh 2 minutes before expiry
  },
  signalr: {
    baseUrl: API_BASE_URL,
    conversationHubUrl: `${API_BASE_URL}/hubs/conversation`,
    notificationHubUrl: `${API_BASE_URL}/hubs/notifications`,
    publicChatHubUrl: `${API_BASE_URL}/hubs/public-chat`,
    reconnectDelay: 5000, // 5 seconds
    maxReconnectAttempts: 5,
  },
  features: {
    enableOAuth: process.env.NEXT_PUBLIC_ENABLE_OAUTH === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
  validation: {
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: true,
    },
    email: {
      maxLength: 255,
    },
  },
} as const;

/**
 * Get full API URL with version
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = config.api.baseUrl.replace(/\/$/, '');
  const version = config.api.version;
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${baseUrl}/api/${version}/${cleanEndpoint}`;
};

/**
 * Check if running in production
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = process.env.NODE_ENV === 'development';