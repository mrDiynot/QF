'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminAuthService } from '@/services/api/admin.service';
import { useAdminAnalytics, AdminEvents } from './useAdminAnalytics';
import type { AdminLoginRequest, AdminMfaVerifyRequest, AdminRole } from '@/types/admin';

/** Return the correct post-login landing page based on admin role. */
const getLandingPage = (role?: string) => {
  if (role === 'ContentAdmin') return '/admin/cms';
  return '/admin';
};

export function useAdminLogin() {
  useRouter(); // Reserved for navigation
  const queryClient = useQueryClient();
  const { track, identifyAdmin } = useAdminAnalytics();

  return useMutation({
    mutationFn: (request: AdminLoginRequest) => {
      track(AdminEvents.ADMIN_LOGIN_ATTEMPTED, { email: request.email });
      return adminAuthService.login(request);
    },
    onSuccess: (data) => {
      if (data.tokens && data.profile) {
        const mustChangePassword = !!data.requiresPasswordChange;
        // Store tokens and profile (including mustChangePassword flag for refresh survival)
        adminAuthService.storeSession({
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
          adminUser: {
            id: data.profile.id,
            email: data.profile.email,
            firstName: data.profile.firstName,
            lastName: data.profile.lastName,
            fullName: data.profile.fullName,
            role: data.profile.role as AdminRole,
            ipWhitelist: [],
            isActive: true,
            mustChangePassword,
            twoFactorEnabled: data.profile.twoFactorEnabled,
            lastLoginAt: data.profile.lastLoginAt,
            lastLoginIp: data.profile.lastLoginIp,
            createdAt: new Date().toISOString(),
            updatedAt: null,
          },
        });
        identifyAdmin({
          id: data.profile.id,
          email: data.profile.email,
          firstName: data.profile.firstName,
          lastName: data.profile.lastName,
          fullName: data.profile.fullName,
          role: data.profile.role as AdminRole,
          ipWhitelist: [],
          isActive: true,
          mustChangePassword,
          twoFactorEnabled: data.profile.twoFactorEnabled,
          lastLoginAt: data.profile.lastLoginAt,
          lastLoginIp: data.profile.lastLoginIp,
          createdAt: new Date().toISOString(),
          updatedAt: null,
        });
        track(AdminEvents.ADMIN_LOGIN_SUCCESS, {
          admin_role: data.profile.role,
          requires_mfa: false,
        });
        queryClient.invalidateQueries({ queryKey: ['admin'] });
        // Note: redirect is handled in the login page component with window.location.href
      } else if (data.requires2FA) {
        track(AdminEvents.ADMIN_LOGIN_SUCCESS, { requires_mfa: true });
      }
    },
    onError: (error) => {
      track(AdminEvents.ADMIN_LOGIN_FAILED, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });
}

export function useVerifyMfa() {
  const queryClient = useQueryClient();
  const { track, identifyAdmin } = useAdminAnalytics();

  return useMutation({
    mutationFn: (request: AdminMfaVerifyRequest) => adminAuthService.verifyMfa(request),
    onSuccess: (data) => {
      adminAuthService.storeSession(data.session);
      identifyAdmin(data.session.adminUser);
      track(AdminEvents.ADMIN_MFA_VERIFIED, {
        admin_role: data.session.adminUser.role,
      });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      // Use window.location.href to force a full page reload
      // This ensures useAdminSession re-checks localStorage with the new session
      window.location.href = getLandingPage(data.session.adminUser.role);
    },
  });
}

export function useEnableMfa() {
  const { track } = useAdminAnalytics();

  return useMutation({
    mutationFn: ({ sessionToken }: { sessionToken: string }) => {
      track(AdminEvents.ADMIN_MFA_SETUP_STARTED);
      return adminAuthService.enableMfa(sessionToken);
    },
  });
}

export function useVerifyMfaSetup() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { track, identifyAdmin } = useAdminAnalytics();

  return useMutation({
    mutationFn: (request: AdminMfaVerifyRequest) => adminAuthService.verifyMfaSetup(request),
    onSuccess: (data) => {
      adminAuthService.storeSession(data.session);
      identifyAdmin(data.session.adminUser);
      track(AdminEvents.ADMIN_MFA_SETUP_COMPLETED, {
        admin_role: data.session.adminUser.role,
      });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      router.push(getLandingPage(data.session.adminUser.role));
    },
  });
}

export function useConfirmMfaSetup() {
  const _router = useRouter();
  const queryClient = useQueryClient();
  const { track, identifyAdmin } = useAdminAnalytics();

  return useMutation({
    mutationFn: ({ sessionToken, secret, code }: { sessionToken: string; secret: string; code: string }) => 
      adminAuthService.confirmMfaSetup(sessionToken, secret, code),
    onSuccess: (data) => {
      // Store session after successful MFA setup
      if (data.session) {
        adminAuthService.storeSession(data.session);
        identifyAdmin(data.session.adminUser);
      }
      track(AdminEvents.ADMIN_MFA_SETUP_COMPLETED);
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      // Use window.location.href to force a full page reload
      // This ensures useAdminSession re-checks localStorage with the new session
      window.location.href = getLandingPage(data.session?.adminUser?.role);
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  const { track, resetAdminIdentity } = useAdminAnalytics();

  return useMutation({
    mutationFn: async () => {
      track(AdminEvents.ADMIN_LOGOUT);
      await adminAuthService.logout();
    },
    onSuccess: () => {
      resetAdminIdentity();
      queryClient.clear();
      // Use hard redirect to ensure clean state
      window.location.href = '/admin/login';
    },
    onError: () => {
      // Even on error, clear everything and redirect
      resetAdminIdentity();
      queryClient.clear();
      window.location.href = '/admin/login';
    },
  });
}

