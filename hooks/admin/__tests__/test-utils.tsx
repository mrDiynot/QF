import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, RenderHookOptions } from '@testing-library/react';

/**
 * Creates a fresh QueryClient for testing with appropriate defaults
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Wrapper component that provides QueryClient context for testing hooks
 */
export function createWrapper(queryClient?: QueryClient) {
  const client = queryClient || createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    );
  };
}

/**
 * Custom renderHook that includes QueryClient provider
 */
export function renderHookWithClient<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'> & { queryClient?: QueryClient }
) {
  const { queryClient, ...renderOptions } = options || {};
  const client = queryClient || createTestQueryClient();
  
  return {
    ...renderHook(hook, {
      wrapper: createWrapper(client),
      ...renderOptions,
    }),
    queryClient: client,
  };
}

/**
 * Mock admin user for testing
 */
export const mockAdminUser = {
  id: 'admin_001',
  email: 'admin@qualiflow.ai',
  firstName: 'Super',
  lastName: 'Admin',
  fullName: 'Super Admin',
  role: 'SuperAdmin' as const,
  ipWhitelist: [],
  isActive: true,
  mustChangePassword: false,
  twoFactorEnabled: true,
  lastLoginAt: '2025-01-01T00:00:00Z',
  lastLoginIp: '192.168.1.1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: null,
};

/**
 * Mock session data for testing
 */
export const mockSession = {
  accessToken: 'mock_access_token',
  refreshToken: 'mock_refresh_token',
  adminUser: mockAdminUser,
};

/**
 * Mock localStorage for testing
 */
export function setupLocalStorageMock(initialData: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initialData };
  
  const localStorageMock = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(key => delete store[key]); },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] || null,
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return localStorageMock;
}

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000,
  interval = 50
): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error('Condition not met within timeout');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}
