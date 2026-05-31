import { apiClient } from '@/lib/axios';

/**
 * API key interface (without the actual key value)
 */
export interface ApiKey {
  id: string;
  name: string;
  maskedKey: string;
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Create API key request interface
 */
export interface CreateApiKeyRequest {
  name: string;
  expiresInDays?: number;
}

/**
 * Generate API key response interface (includes plain text key - only shown once)
 */
export interface GenerateApiKeyResponse {
  id: string;
  name: string;
  apiKey: string; // Plain text key - only returned once!
  expiresAt?: string;
  createdAt: string;
}

/**
 * API keys service for managing programmatic access to Qualiflow AI API
 */
export const apiKeysService = {
  /**
   * Generate a new API key
   * WARNING: The plain text API key is only returned once. Store it securely!
   */
  generate: async (request: CreateApiKeyRequest): Promise<GenerateApiKeyResponse> => {
    const response = await apiClient.post<GenerateApiKeyResponse>('/api-keys', request);
    return response.data;
  },

  /**
   * Get all API keys for the current business
   * Returns masked keys for security (e.g., "qf_live_****...****1234")
   */
  getAll: async (): Promise<ApiKey[]> => {
    const response = await apiClient.get<ApiKey[]>('/api-keys');
    return response.data;
  },

  /**
   * Delete an API key by ID
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api-keys/${id}`);
  },
};

