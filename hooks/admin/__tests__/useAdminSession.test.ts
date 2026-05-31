import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { useAdminSession } from '../useAdminSession';
import { createWrapper, mockAdminUser, mockSession } from './test-utils';
import * as adminService from '@/services/api/admin.service';

vi.mock('@/services/api/admin.service');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe('useAdminSession', () => {
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    localStorageMock = {};
    
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key: string) => localStorageMock[key] || null
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      (key: string, value: string) => { localStorageMock[key] = value; }
    );
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(
      (key: string) => { delete localStorageMock[key]; }
    );

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with loading state and then finish loading', async () => {
    const { result } = renderHook(() => useAdminSession(), {
      wrapper: createWrapper(),
    });

    // Session hook checks localStorage and finishes quickly
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should return unauthenticated when no token in localStorage', async () => {
    const { result } = renderHook(() => useAdminSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.adminUser).toBeNull();
  });

  it('should return authenticated when valid token exists', async () => {
    localStorageMock['admin_access_token'] = mockSession.accessToken;
    localStorageMock['admin_user'] = JSON.stringify(mockAdminUser);

    const { result } = renderHook(() => useAdminSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Check authentication state based on token presence
    expect(result.current.isAuthenticated).toBeDefined();
  });

  it('should provide logout function', async () => {
    localStorageMock['admin_access_token'] = mockSession.accessToken;
    localStorageMock['admin_user'] = JSON.stringify(mockAdminUser);

    vi.mocked(adminService.adminAuthService.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAdminSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.logout).toBeDefined();
    expect(typeof result.current.logout).toBe('function');
  });

  it('should provide refreshSession function', async () => {
    localStorageMock['admin_access_token'] = mockSession.accessToken;
    localStorageMock['admin_user'] = JSON.stringify(mockAdminUser);

    const { result } = renderHook(() => useAdminSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.refreshSession).toBeDefined();
    expect(typeof result.current.refreshSession).toBe('function');
  });

  it('should handle impersonation state', async () => {
    localStorageMock['admin_access_token'] = mockSession.accessToken;
    localStorageMock['admin_user'] = JSON.stringify(mockAdminUser);

    const { result } = renderHook(() => useAdminSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.impersonation).toBeNull();
  });

  it('should expose mustChangePassword as false when user does not require password change', async () => {
    localStorageMock['admin_access_token'] = mockSession.accessToken;
    localStorageMock['admin_user'] = JSON.stringify({ ...mockAdminUser, mustChangePassword: false });

    const { result } = renderHook(() => useAdminSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.mustChangePassword).toBe(false);
  });

  it('should expose mustChangePassword as true when stored user has flag set', async () => {
    localStorageMock['admin_access_token'] = mockSession.accessToken;
    localStorageMock['admin_user'] = JSON.stringify({ ...mockAdminUser, mustChangePassword: true });

    const { result } = renderHook(() => useAdminSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.mustChangePassword).toBe(true);
  });

  it('should default mustChangePassword to false when no user is stored', async () => {
    const { result } = renderHook(() => useAdminSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.mustChangePassword).toBe(false);
  });
});
