/**
 * Tests for useOnboardingCheckout hook
 * Covers all subscription scenarios for post-onboarding payment flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOnboardingCheckout } from '../useOnboardingCheckout';
import * as subscriptionsHooks from '@/hooks/subscriptions/useSubscriptions';
import type { Subscription, SubscriptionStatus } from '@/types/api';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

// Mock subscriptions hooks
vi.mock('@/hooks/subscriptions/useSubscriptions', () => ({
  useCurrentSubscription: vi.fn(),
}));

// Mock subscriptions service
vi.mock('@/services/api/subscriptions.service', () => ({
  subscriptionsService: {
    createCheckoutSession: vi.fn(),
    verifyCheckoutSession: vi.fn(),
  },
}));

// Mock axios
vi.mock('@/lib/axios', () => ({
  apiClient: {
    post: vi.fn(),
  },
  handleApiError: vi.fn((error) => error.message || 'Unknown error'),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  }),
  get length() {
    return Object.keys(mockLocalStorage.store).length;
  },
  key: vi.fn((index: number) => Object.keys(mockLocalStorage.store)[index] || null),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
};

const createMockSubscription = (
  status: SubscriptionStatus,
  planName: string
): Subscription => ({
  id: 'sub_123',
  planId: 'plan_123',
  planName,
  status,
  currentPeriodStart: new Date().toISOString(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancelAtPeriodEnd: false,
});

describe('useOnboardingCheckout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage mock
    mockLocalStorage.store = {};
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  describe('Subscription Scenarios', () => {
    it('should require checkout when user has no subscription', () => {
      vi.mocked(subscriptionsHooks.useCurrentSubscription).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as ReturnType<typeof subscriptionsHooks.useCurrentSubscription>);

      const { result } = renderHook(() => useOnboardingCheckout(), {
        wrapper: createWrapper(),
      });

      expect(result.current.requiresCheckout).toBe(true);
      // When no subscription exists, we don't have plan info so isFreeTier is false
      expect(result.current.isFreeTier).toBe(false);
      expect(result.current.isOnTrial).toBe(false);
    });

    it('should require checkout when user is on free tier', () => {
      vi.mocked(subscriptionsHooks.useCurrentSubscription).mockReturnValue({
        data: createMockSubscription('active', 'FreeFlow'),
        isLoading: false,
        error: null,
      } as ReturnType<typeof subscriptionsHooks.useCurrentSubscription>);

      const { result } = renderHook(() => useOnboardingCheckout(), {
        wrapper: createWrapper(),
      });

      expect(result.current.requiresCheckout).toBe(true);
      expect(result.current.isFreeTier).toBe(true);
    });

    it('should NOT require checkout when user has active paid subscription', () => {
      vi.mocked(subscriptionsHooks.useCurrentSubscription).mockReturnValue({
        data: createMockSubscription('active', 'SmartFlow'),
        isLoading: false,
        error: null,
      } as ReturnType<typeof subscriptionsHooks.useCurrentSubscription>);

      const { result } = renderHook(() => useOnboardingCheckout(), {
        wrapper: createWrapper(),
      });

      expect(result.current.requiresCheckout).toBe(false);
      expect(result.current.isFreeTier).toBe(false);
      expect(result.current.isOnTrial).toBe(false);
    });

    it('should NOT require checkout when user is on trial', () => {
      vi.mocked(subscriptionsHooks.useCurrentSubscription).mockReturnValue({
        data: createMockSubscription('trialing', 'SmartFlow'),
        isLoading: false,
        error: null,
      } as ReturnType<typeof subscriptionsHooks.useCurrentSubscription>);

      const { result } = renderHook(() => useOnboardingCheckout(), {
        wrapper: createWrapper(),
      });

      expect(result.current.requiresCheckout).toBe(false);
      expect(result.current.isOnTrial).toBe(true);
    });

    it('should require checkout when subscription is past_due', () => {
      vi.mocked(subscriptionsHooks.useCurrentSubscription).mockReturnValue({
        data: createMockSubscription('past_due', 'SmartFlow'),
        isLoading: false,
        error: null,
      } as ReturnType<typeof subscriptionsHooks.useCurrentSubscription>);

      const { result } = renderHook(() => useOnboardingCheckout(), {
        wrapper: createWrapper(),
      });

      expect(result.current.requiresCheckout).toBe(true);
    });

    it('should require checkout when subscription is canceled', () => {
      vi.mocked(subscriptionsHooks.useCurrentSubscription).mockReturnValue({
        data: createMockSubscription('canceled', 'SmartFlow'),
        isLoading: false,
        error: null,
      } as ReturnType<typeof subscriptionsHooks.useCurrentSubscription>);

      const { result } = renderHook(() => useOnboardingCheckout(), {
        wrapper: createWrapper(),
      });

      expect(result.current.requiresCheckout).toBe(true);
    });
  });
});

