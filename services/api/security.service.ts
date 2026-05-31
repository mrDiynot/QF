/**
 * Security Settings API Service
 * Handles password change, session management, and security settings
 */

import { apiClient } from '@/lib/axios';

// Security Settings Types
export interface SecuritySettings {
  email: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  connectedOAuthProviders: string[];
  isOAuthUser: boolean;
  hasPassword: boolean;
  passwordLastChangedAt: string | null;
  lastLoginAt: string | null;
  activeSessionCount: number;
  accountCreatedAt: string;
}

export interface ActiveSession {
  sessionId: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceType: string;
  browser: string;
  operatingSystem: string;
  location: string | null;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  isCurrentSession: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// 2FA Types
export interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUri: string;
  qrCodeImage: string;
}

export interface EnableTwoFactorRequest {
  code: string;
}

export interface DisableTwoFactorRequest {
  code: string;
  password: string;
}

export interface VerifyTwoFactorRequest {
  userId: string;
  code: string;
}

export interface RecoveryCodesResponse {
  recoveryCodes: string[];
  message: string;
}

export interface TwoFactorRequiredResponse {
  requires2FA: boolean;
  userId: string;
  message: string;
}

// Security Service
export const securityService = {
  /**
   * Get current user's security settings
   */
  async getSecuritySettings(): Promise<SecuritySettings> {
    const response = await apiClient.get<SecuritySettings>('/auth/security');
    return response.data;
  },

  /**
   * Change the current user's password
   */
  async changePassword(request: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', request);
    return response.data;
  },

  /**
   * Get all active sessions for the current user
   */
  async getActiveSessions(): Promise<ActiveSession[]> {
    const response = await apiClient.get<ActiveSession[]>('/auth/sessions');
    return response.data;
  },

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Revoke all sessions (logout everywhere)
   */
  async revokeAllSessions(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/sessions/revoke-all');
    return response.data;
  },

  // ============================================================================
  // TWO-FACTOR AUTHENTICATION
  // ============================================================================

  /**
   * Initiate 2FA setup - returns QR code and secret
   */
  async setup2FA(): Promise<TwoFactorSetupResponse> {
    const response = await apiClient.post<TwoFactorSetupResponse>('/auth/2fa/setup');
    return response.data;
  },

  /**
   * Enable 2FA after verifying code from authenticator app
   */
  async enable2FA(request: EnableTwoFactorRequest): Promise<RecoveryCodesResponse> {
    const response = await apiClient.post<RecoveryCodesResponse>('/auth/2fa/enable', request);
    return response.data;
  },

  /**
   * Disable 2FA
   */
  async disable2FA(request: DisableTwoFactorRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/2fa/disable', request);
    return response.data;
  },

  /**
   * Verify 2FA code during login
   */
  async verify2FA(request: VerifyTwoFactorRequest): Promise<unknown> {
    const response = await apiClient.post('/auth/2fa/verify', request);
    return response.data;
  },

  /**
   * Generate new recovery codes
   */
  async generateRecoveryCodes(): Promise<RecoveryCodesResponse> {
    const response = await apiClient.post<RecoveryCodesResponse>('/auth/2fa/recovery-codes');
    return response.data;
  },
};

export default securityService;

