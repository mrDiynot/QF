/**
 * Authentication types
 * Type definitions for authentication, authorization, and user management
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessId: string;
  role: UserRole;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type UserRole = 'Owner' | 'Admin' | 'Manager' | 'Viewer';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  isNewUser?: boolean;
}

/**
 * Response when email OTP verification is required.
 * Returned with HTTP 202 Accepted status.
 */
export interface LoginOtpRequiredResponse {
  requiresEmailOtp: boolean;
  maskedEmail: string;
  resendCooldownSeconds: number;
  otpExpirationSeconds: number;
  message: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  otpCode: string;
}

export interface ResendEmailOtpRequest {
  email: string;
}

export interface ResendEmailOtpResponse {
  success: boolean;
  resendCooldownSeconds: number;
  message: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface OAuthLoginRequest {
  provider: 'google' | 'microsoft';
  idToken?: string;
  accessToken?: string;
}

export interface VerifyEmailRequest {
  userId: string;
  token: string;
}

export interface ResendVerificationEmailRequest {
  email: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_LEADS: 'manage_leads',
  VIEW_CONVERSATIONS: 'view_conversations',
  SEND_MESSAGES: 'send_messages',
  MANAGE_CRM: 'manage_crm',
  MANAGE_CHANNELS: 'manage_channels',
  MANAGE_USERS: 'manage_users',
  MANAGE_BUSINESS: 'manage_business',
  MANAGE_BILLING: 'manage_billing',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  DELETE_BUSINESS: 'delete_business',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  Owner: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_LEADS,
    PERMISSIONS.VIEW_CONVERSATIONS,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.MANAGE_CRM,
    PERMISSIONS.MANAGE_CHANNELS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_BUSINESS,
    PERMISSIONS.MANAGE_BILLING,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.DELETE_BUSINESS,
  ],
  Admin: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_LEADS,
    PERMISSIONS.VIEW_CONVERSATIONS,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.MANAGE_CRM,
    PERMISSIONS.MANAGE_CHANNELS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_BUSINESS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
  Manager: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_LEADS,
    PERMISSIONS.VIEW_CONVERSATIONS,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.MANAGE_CRM,
  ],
  Viewer: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CONVERSATIONS,
  ],
};