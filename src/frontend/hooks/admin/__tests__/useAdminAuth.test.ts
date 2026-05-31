import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import { useAdminLogin, useVerifyMfa, useAdminLogout } from '../useAdminAuth';
import { renderHookWithClient, mockAdminUser } from './test-utils';
import * as adminService from '@/services/api/admin.service';
import type { AdminLoginResponse, AdminMfaVerifyResponse } from '@/types/admin';

vi.mock('@/services/api/admin.service');
vi.mock('./useAdminAnalytics', () => ({
  useAdminAnalytics: () => ({
    track: vi.fn(),
    identifyAdmin: vi.fn(),
    trackAdminError: vi.fn(),
    resetAdminIdentity: vi.fn(),
  }),
  AdminEvents: {
    ADMIN_LOGIN_ATTEMPTED: 'admin_login_attempted',
    ADMIN_LOGIN_SUCCESS: 'admin_login_success',
    ADMIN_LOGIN_FAILED: 'admin_login_failed',
    ADMIN_MFA_VERIFIED: 'admin_mfa_verified',
    ADMIN_LOGOUT: 'admin_logout',
  },
}));

describe('useAdminLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have idle state initially', () => {
    const { result } = renderHookWithClient(() => useAdminLogin());

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('should call login service on mutate', async () => {
    const mockResponse: AdminLoginResponse = {
      requires2FA: false,
      requiresPasswordChange: false,
      requiresMfaSetup: false,
      tokens: {
        accessToken: 'test_token',
        refreshToken: 'refresh_token',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
      profile: {
        id: mockAdminUser.id,
        email: mockAdminUser.email,
        firstName: mockAdminUser.firstName,
        lastName: mockAdminUser.lastName,
        fullName: mockAdminUser.fullName,
        role: mockAdminUser.role,
        twoFactorEnabled: mockAdminUser.twoFactorEnabled,
        lastLoginAt: mockAdminUser.lastLoginAt,
        lastLoginIp: mockAdminUser.lastLoginIp,
      },
    };

    vi.mocked(adminService.adminAuthService.login).mockResolvedValue(mockResponse);

    const { result } = renderHookWithClient(() => useAdminLogin());

    act(() => {
      result.current.mutate({
        email: 'admin@qualiflow.ai',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminService.adminAuthService.login).toHaveBeenCalledWith({
      email: 'admin@qualiflow.ai',
      password: 'password123',
    });
  });

  it('should handle login failure', async () => {
    vi.mocked(adminService.adminAuthService.login).mockRejectedValue(
      new Error('Invalid credentials')
    );

    const { result } = renderHookWithClient(() => useAdminLogin());

    act(() => {
      result.current.mutate({
        email: 'admin@qualiflow.ai',
        password: 'wrongpassword',
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('should store mustChangePassword=true when login response requires password change', async () => {
    const mockResponse: AdminLoginResponse = {
      requires2FA: false,
      requiresPasswordChange: true,
      requiresMfaSetup: false,
      tokens: {
        accessToken: 'test_token',
        refreshToken: 'refresh_token',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
      profile: {
        id: mockAdminUser.id,
        email: mockAdminUser.email,
        firstName: mockAdminUser.firstName,
        lastName: mockAdminUser.lastName,
        fullName: mockAdminUser.fullName,
        role: mockAdminUser.role,
        twoFactorEnabled: mockAdminUser.twoFactorEnabled,
        lastLoginAt: mockAdminUser.lastLoginAt,
        lastLoginIp: mockAdminUser.lastLoginIp,
      },
    };

    vi.mocked(adminService.adminAuthService.login).mockResolvedValue(mockResponse);
    const storeSessionSpy = vi.spyOn(adminService.adminAuthService, 'storeSession');

    const { result } = renderHookWithClient(() => useAdminLogin());

    act(() => {
      result.current.mutate({
        email: 'admin@qualiflow.ai',
        password: 'temppassword',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(storeSessionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUser: expect.objectContaining({
          mustChangePassword: true,
        }),
      })
    );
  });

  it('should store mustChangePassword=false when login response does not require password change', async () => {
    const mockResponse: AdminLoginResponse = {
      requires2FA: false,
      requiresPasswordChange: false,
      requiresMfaSetup: false,
      tokens: {
        accessToken: 'test_token',
        refreshToken: 'refresh_token',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
      profile: {
        id: mockAdminUser.id,
        email: mockAdminUser.email,
        firstName: mockAdminUser.firstName,
        lastName: mockAdminUser.lastName,
        fullName: mockAdminUser.fullName,
        role: mockAdminUser.role,
        twoFactorEnabled: mockAdminUser.twoFactorEnabled,
        lastLoginAt: mockAdminUser.lastLoginAt,
        lastLoginIp: mockAdminUser.lastLoginIp,
      },
    };

    vi.mocked(adminService.adminAuthService.login).mockResolvedValue(mockResponse);
    const storeSessionSpy = vi.spyOn(adminService.adminAuthService, 'storeSession');

    const { result } = renderHookWithClient(() => useAdminLogin());

    act(() => {
      result.current.mutate({
        email: 'admin@qualiflow.ai',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(storeSessionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUser: expect.objectContaining({
          mustChangePassword: false,
        }),
      })
    );
  });

  it('should indicate when MFA is required', async () => {
    const mockResponse: AdminLoginResponse = {
      requires2FA: true,
      requiresPasswordChange: false,
      requiresMfaSetup: false,
      adminId: 'admin_001',
    };

    vi.mocked(adminService.adminAuthService.login).mockResolvedValue(mockResponse);

    const { result } = renderHookWithClient(() => useAdminLogin());

    act(() => {
      result.current.mutate({
        email: 'admin@qualiflow.ai',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.requires2FA).toBe(true);
  });
});

describe('useVerifyMfa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should verify MFA code successfully', async () => {
    const mockResponse: AdminMfaVerifyResponse = {
      session: {
        accessToken: 'test_token',
        refreshToken: 'refresh_token',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        adminUser: mockAdminUser,
      },
    };

    vi.mocked(adminService.adminAuthService.verifyMfa).mockResolvedValue(mockResponse);

    const { result } = renderHookWithClient(() => useVerifyMfa());

    act(() => {
      result.current.mutate({
        adminId: 'admin-id-123',
        code: '123456',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminService.adminAuthService.verifyMfa).toHaveBeenCalledWith({
      adminId: 'admin-id-123',
      code: '123456',
    });
  });

  it('should handle invalid MFA code', async () => {
    vi.mocked(adminService.adminAuthService.verifyMfa).mockRejectedValue(
      new Error('Invalid MFA code')
    );

    const { result } = renderHookWithClient(() => useVerifyMfa());

    act(() => {
      result.current.mutate({
        adminId: 'admin-id-123',
        code: '000000',
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useAdminLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  it('should call logout service', async () => {
    vi.mocked(adminService.adminAuthService.logout).mockResolvedValue(undefined);

    const { result } = renderHookWithClient(() => useAdminLogout());

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(adminService.adminAuthService.logout).toHaveBeenCalled();
    });
  });
});
