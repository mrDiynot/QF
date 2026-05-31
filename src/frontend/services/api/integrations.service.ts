import { apiClient } from '@/lib/axios';

/**
 * OAuth initiate request interface
 */
export interface InitiateOAuthRequest {
  returnUrl?: string;
}

/**
 * OAuth initiate response interface
 */
export interface OAuthInitiateResponse {
  authorizationUrl: string;
  state: string;
  provider: string;
}

/**
 * OAuth callback request interface
 */
export interface OAuthCallbackRequest {
  code: string;
  state: string;
  error?: string;
  errorDescription?: string;
}

/**
 * CRM OAuth callback response interface
 */
export interface CRMOAuthCallbackResponse {
  success: boolean;
  crmProviderId: string;
  providerType: string;
  externalAccountId?: string;
  externalAccountUrl?: string;
  errorMessage?: string;
  returnUrl?: string;
}

/**
 * CRM provider type enum
 */
export enum CRMProviderType {
  HubSpot = 'HubSpot',
  Salesforce = 'Salesforce',
}

/**
 * Integrations service for managing CRM OAuth connections
 */
export const integrationsService = {
  /**
   * Initiate HubSpot OAuth flow
   * Opens HubSpot authorization page in a popup window
   */
  initiateHubSpot: async (returnUrl?: string): Promise<OAuthInitiateResponse> => {
    const response = await apiClient.post<OAuthInitiateResponse>('/crm/hubspot/initiate', {
      returnUrl,
    });
    return response.data;
  },

  /**
   * Handle HubSpot OAuth callback
   * Exchanges authorization code for tokens
   */
  handleHubSpotCallback: async (request: OAuthCallbackRequest): Promise<CRMOAuthCallbackResponse> => {
    const response = await apiClient.post<CRMOAuthCallbackResponse>('/crm/hubspot/callback', request);
    return response.data;
  },

  /**
   * Initiate Salesforce OAuth flow
   * Opens Salesforce authorization page in a popup window
   */
  initiateSalesforce: async (returnUrl?: string): Promise<OAuthInitiateResponse> => {
    const response = await apiClient.post<OAuthInitiateResponse>('/crm/salesforce/initiate', {
      returnUrl,
    });
    return response.data;
  },

  /**
   * Handle Salesforce OAuth callback
   * Exchanges authorization code for tokens
   */
  handleSalesforceCallback: async (request: OAuthCallbackRequest): Promise<CRMOAuthCallbackResponse> => {
    const response = await apiClient.post<CRMOAuthCallbackResponse>('/crm/salesforce/callback', request);
    return response.data;
  },

  /**
   * Open OAuth popup window
   * Returns a promise that resolves when OAuth completes
   */
  openOAuthPopup: (authorizationUrl: string, provider: string): Promise<OAuthCallbackRequest> => {
    return new Promise((resolve, reject) => {
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        authorizationUrl,
        `${provider} OAuth`,
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
      );

      if (!popup) {
        reject(new Error('Failed to open popup window. Please allow popups for this site.'));
        return;
      }

      // Poll for popup closure or message
      const pollTimer = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollTimer);
          reject(new Error('OAuth popup was closed before completion'));
        }
      }, 500);

      // Listen for OAuth callback message from popup
      const messageHandler = (event: MessageEvent) => {
        // Verify origin for security
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data.type === 'oauth-callback') {
          clearInterval(pollTimer);
          window.removeEventListener('message', messageHandler);
          popup.close();

          if (event.data.error) {
            reject(new Error(event.data.errorDescription || event.data.error));
          } else {
            resolve({
              code: event.data.code,
              state: event.data.state,
            });
          }
        }
      };

      window.addEventListener('message', messageHandler);
    });
  },

  /**
   * Get all connected integrations
   */
  getIntegrations: async (): Promise<CRMIntegrationStatus[]> => {
    const response = await apiClient.get<CRMIntegrationStatus[]>('/crm/integrations');
    return response.data;
  },

  /**
   * Disconnect a CRM integration
   */
  disconnectIntegration: async (providerId: string): Promise<void> => {
    await apiClient.delete(`/crm/${providerId}/disconnect`);
  },

  /**
   * Trigger manual sync for an integration
   */
  syncIntegration: async (providerId: string): Promise<SyncResult> => {
    const response = await apiClient.post<SyncResult>(`/crm/${providerId}/sync`);
    return response.data;
  },

  /**
   * Get sync status for an integration
   */
  getSyncStatus: async (providerId: string): Promise<SyncStatus> => {
    const response = await apiClient.get<SyncStatus>(`/crm/${providerId}/sync-status`);
    return response.data;
  },
};

export interface CRMIntegrationStatus {
  id: string;
  providerType: string;
  isConnected: boolean;
  externalAccountId?: string;
  lastSyncAt?: string;
  syncStatus?: 'idle' | 'syncing' | 'error';
}

export interface SyncResult {
  success: boolean;
  syncedLeads: number;
  syncedContacts: number;
  errors?: string[];
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'error';
  lastSyncAt?: string;
  nextSyncAt?: string;
  errorMessage?: string;
}

