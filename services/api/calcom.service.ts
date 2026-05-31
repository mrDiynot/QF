/**
 * Cal.com Integration API Service
 * Handles Cal.com connection, event types, and booking settings
 */

import { apiClient } from '@/lib/axios';

// ============================================================================
// Types
// ============================================================================

export interface CalComIntegrationDto {
  id: string;
  isConnected: boolean;
  apiKeyConfigured: boolean;
  username?: string;
  email?: string;
  defaultEventTypeId?: string;
  lastSyncAt?: string;
  status: 'active' | 'inactive' | 'error';
}

export interface CalComEventTypeDto {
  id: string;
  title: string;
  slug: string;
  description?: string;
  length: number; // Duration in minutes
  locations?: string[];
  isDefault: boolean;
}

export interface CalComSettingsRequest {
  apiKey?: string;
  defaultEventTypeId?: string;
}

export interface CalComConnectionResponse {
  success: boolean;
  integration?: CalComIntegrationDto;
  eventTypes?: CalComEventTypeDto[];
  errorMessage?: string;
}

// ============================================================================
// Service
// ============================================================================

export const calcomService = {
  /**
   * Get current Cal.com integration status
   * GET /api/v1/integrations/calcom
   */
  getIntegration: async (): Promise<CalComIntegrationDto | null> => {
    try {
      const response = await apiClient.get<CalComIntegrationDto>('/integrations/calcom');
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number } };
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Connect Cal.com with API key
   * POST /api/v1/integrations/calcom/connect
   */
  connect: async (apiKey: string): Promise<CalComConnectionResponse> => {
    const response = await apiClient.post<CalComConnectionResponse>(
      '/integrations/calcom/connect',
      { apiKey }
    );
    return response.data;
  },

  /**
   * Disconnect Cal.com integration
   * DELETE /api/v1/integrations/calcom
   */
  disconnect: async (): Promise<void> => {
    await apiClient.delete('/integrations/calcom');
  },

  /**
   * Get available event types from Cal.com
   * GET /api/v1/integrations/calcom/event-types
   */
  getEventTypes: async (): Promise<CalComEventTypeDto[]> => {
    const response = await apiClient.get<CalComEventTypeDto[]>('/integrations/calcom/event-types');
    return response.data;
  },

  /**
   * Update Cal.com settings
   * PATCH /api/v1/integrations/calcom/settings
   */
  updateSettings: async (settings: CalComSettingsRequest): Promise<CalComIntegrationDto> => {
    const response = await apiClient.patch<CalComIntegrationDto>(
      '/integrations/calcom/settings',
      settings
    );
    return response.data;
  },

  /**
   * Test Cal.com connection
   * POST /api/v1/integrations/calcom/test
   */
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/integrations/calcom/test'
    );
    return response.data;
  },
};
