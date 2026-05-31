import { apiClient } from '@/lib/axios';

/**
 * Webhook status enum
 */
export enum WebhookStatus {
  Active = 0,
  Inactive = 1,
  Disabled = 2,
}

/**
 * Webhook delivery status enum
 */
export enum WebhookDeliveryStatus {
  Pending = 0,
  Success = 1,
  Failed = 2,
  Retrying = 3,
}

/**
 * Webhook response interface
 */
export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: WebhookStatus;
  description?: string;
  consecutiveFailures: number;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Create webhook request interface
 */
export interface CreateWebhookRequest {
  url: string;
  events: string[];
  description?: string;
}

/**
 * Update webhook request interface
 */
export interface UpdateWebhookRequest {
  url?: string;
  events?: string[];
  status?: WebhookStatus;
  description?: string;
}

/**
 * Webhook delivery response interface
 */
export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  status: WebhookDeliveryStatus;
  attempts: number;
  nextRetryAt?: string;
  responseCode?: number;
  errorMessage?: string;
  durationMs?: number;
  completedAt?: string;
  createdAt: string;
}

/**
 * Webhooks service for managing webhook subscriptions
 */
export const webhooksService = {
  /**
   * Get all webhooks for the current business
   */
  getAll: async (): Promise<Webhook[]> => {
    const response = await apiClient.get<Webhook[]>('/webhooks');
    return response.data;
  },

  /**
   * Get a webhook by ID
   */
  getById: async (id: string): Promise<Webhook> => {
    const response = await apiClient.get<Webhook>(`/webhooks/${id}`);
    return response.data;
  },

  /**
   * Create a new webhook
   */
  create: async (request: CreateWebhookRequest): Promise<Webhook> => {
    const response = await apiClient.post<Webhook>('/webhooks', request);
    return response.data;
  },

  /**
   * Update an existing webhook
   */
  update: async (id: string, request: UpdateWebhookRequest): Promise<Webhook> => {
    const response = await apiClient.put<Webhook>(`/webhooks/${id}`, request);
    return response.data;
  },

  /**
   * Delete a webhook
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/webhooks/${id}`);
  },

  /**
   * Test a webhook by sending a test payload
   */
  test: async (id: string): Promise<WebhookDelivery> => {
    const response = await apiClient.post<WebhookDelivery>(`/webhooks/${id}/test`);
    return response.data;
  },

  /**
   * Get webhook deliveries/logs
   */
  getDeliveries: async (webhookId?: string, limit = 50): Promise<WebhookDelivery[]> => {
    const params = new URLSearchParams();
    if (webhookId) params.append('webhookId', webhookId);
    params.append('limit', limit.toString());
    const response = await apiClient.get<WebhookDelivery[]>(`/webhooks/deliveries?${params}`);
    return response.data;
  },

  /**
   * Get recent webhook activity (for simulator)
   */
  getRecentActivity: async (limit = 20): Promise<WebhookDelivery[]> => {
    const response = await apiClient.get<WebhookDelivery[]>(`/webhooks/deliveries?limit=${limit}`);
    return response.data;
  },
};

