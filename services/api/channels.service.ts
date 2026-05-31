/**
 * Channels API Service
 * Handles all communication channel-related API calls
 */

import { apiClient } from '@/lib/axios';
import type { Channel, CreateChannelRequest } from '@/types/api';

/**
 * Request DTO for updating a channel
 */
export interface UpdateChannelRequest {
  name?: string;
  isActive?: boolean;
  phoneNumber?: string;
  webhookUrl?: string;
  /** Configuration can be passed as string or object (will be stringified) */
  configuration?: string | Record<string, unknown>;
}

/**
 * Pending channel from onboarding that hasn't been activated yet
 */
export interface PendingChannel {
  channelType: string;
  displayName: string;
  description: string;
  iconName: string;
  requiresPhoneNumber: boolean;
  requiresOAuthConnection: boolean;
  minimumPlan: string;
  isAvailableOnCurrentPlan: boolean;
  isActivated: boolean;
}

/**
 * Request to activate a channel from onboarding
 */
export interface ActivateChannelRequest {
  channelType: string;
  displayName?: string;
  phoneNumberOption?: 'new' | 'existing' | 'skip';
  existingPhoneNumber?: string;
}

/**
 * Response from channel activation
 */
export interface ActivateChannelResponse {
  success: boolean;
  channel?: Channel;
  provisionedPhoneNumber?: string;
  errorMessage?: string;
  nextSteps?: string[];
  /** Whether OAuth connection is required (for social channels) */
  requiresOAuth?: boolean;
  /** OAuth URL to redirect to for Meta connection */
  oAuthUrl?: string;
}

export const channelsService = {
  /**
   * Get all channels
   * GET /api/v1/channels
   */
  getChannels: async (): Promise<Channel[]> => {
    const response = await apiClient.get<Channel[]>('/channels');
    return response.data;
  },

  /**
   * Get a single channel by ID
   * GET /api/v1/channels/{id}
   */
  getChannelById: async (id: string): Promise<Channel> => {
    const response = await apiClient.get<Channel>(`/channels/${id}`);
    return response.data;
  },

  /**
   * Create a new channel
   * POST /api/v1/channels
   */
  createChannel: async (data: CreateChannelRequest): Promise<Channel> => {
    // Convert configuration object to JSON string if needed
    const payload = {
      ...data,
      configuration: data.configuration
        ? (typeof data.configuration === 'string' ? data.configuration : JSON.stringify(data.configuration))
        : undefined,
    };
    const response = await apiClient.post<Channel>('/channels', payload);
    return response.data;
  },

  /**
   * Update a channel
   * PUT /api/v1/channels/{id}
   */
  updateChannel: async (id: string, data: UpdateChannelRequest): Promise<Channel> => {
    // Convert configuration object to JSON string if needed
    const payload = {
      ...data,
      configuration: data.configuration
        ? (typeof data.configuration === 'string' ? data.configuration : JSON.stringify(data.configuration))
        : undefined,
    };
    const response = await apiClient.put<Channel>(`/channels/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a channel
   * DELETE /api/v1/channels/{id}
   */
  deleteChannel: async (id: string): Promise<void> => {
    await apiClient.delete(`/channels/${id}`);
  },

  /**
   * Get channels by type
   * GET /api/v1/channels/type/{type}
   */
  getChannelsByType: async (type: string): Promise<Channel[]> => {
    const response = await apiClient.get<Channel[]>(`/channels/type/${type}`);
    return response.data;
  },

  /**
   * Get active channels
   * GET /api/v1/channels/active
   */
  getActiveChannels: async (): Promise<Channel[]> => {
    const response = await apiClient.get<Channel[]>('/channels/active');
    return response.data;
  },

  /**
   * Verify a channel
   * POST /api/v1/channels/{id}/verify
   */
  verifyChannel: async (id: string): Promise<Channel> => {
    const response = await apiClient.post<Channel>(`/channels/${id}/verify`);
    return response.data;
  },

  /**
   * Get pending channels from onboarding that haven't been activated yet
   * GET /api/v1/channels/pending
   */
  getPendingChannels: async (): Promise<PendingChannel[]> => {
    const response = await apiClient.get<PendingChannel[]>('/channels/pending');
    return response.data;
  },

  /**
   * Activate a channel from onboarding preferences
   * POST /api/v1/channels/activate
   */
  activateChannel: async (request: ActivateChannelRequest): Promise<ActivateChannelResponse> => {
    const response = await apiClient.post<ActivateChannelResponse>('/channels/activate', request);
    return response.data;
  },

  // ============================================================================
  // Meta OAuth Methods (Facebook/Instagram)
  // ============================================================================

  /**
   * Get the Meta OAuth authorization URL
   * GET /api/v1/meta/oauth/authorize
   */
  getMetaAuthUrl: async (): Promise<{ authorizationUrl: string }> => {
    const response = await apiClient.get<{ authorizationUrl: string }>('/meta/oauth/authorize');
    return response.data;
  },

  /**
   * Get connected Meta pages for the current business
   * GET /api/v1/meta/oauth/pages
   */
  getMetaPages: async (): Promise<MetaPage[]> => {
    const response = await apiClient.get<MetaPage[]>('/meta/oauth/pages');
    return response.data;
  },

  /**
   * Disconnect a Meta channel
   * POST /api/v1/meta/oauth/disconnect
   */
  disconnectMetaChannel: async (channelId: string): Promise<void> => {
    await apiClient.post('/meta/oauth/disconnect', { channelId });
  },

  /**
   * Get Meta connection status for the current business
   * GET /api/v1/meta/oauth/status
   */
  getMetaConnectionStatus: async (): Promise<MetaConnectionStatus> => {
    const response = await apiClient.get<MetaConnectionStatus>('/meta/oauth/status');
    return response.data;
  },
};

/**
 * Meta Page information
 */
export interface MetaPage {
  id: string;
  name: string;
  category?: string;
  accessToken?: string;
  instagramBusinessAccountId?: string;
  instagramUsername?: string;
  isConnected: boolean;
  channelId?: string;
}

/**
 * Meta connection status
 */
export interface MetaConnectionStatus {
  isConnected: boolean;
  connectedPages: MetaPage[];
  lastVerifiedAt?: string;
  tokenExpiresAt?: string;
}