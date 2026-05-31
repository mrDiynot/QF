/**
 * Tests for SubscriptionStatusBanner component
 * Tests all subscription status scenarios and banner display logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SubscriptionStatusBanner } from '../SubscriptionStatusBanner';
import * as subscriptionsHooks from '@/hooks/subscriptions/useSubscriptions';
import type { Subscription, SubscriptionStatus } from '@/types/api';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock subscriptions hooks
vi.mock('@/hooks/subscriptions/useSubscriptions', () => ({
  useCurrentSubscription: vi.fn(),
}));

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
  planName: string,
  trialEnd?: string
): Subscription => ({
  id: 'sub_123',
  planId: 'plan_123',
  planName,
  status,
  currentPeriodStart: new Date().toISOString(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancelAtPeriodEnd: false,
  trialEnd,
});

describe('SubscriptionStatusBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when loading', () => {
    vi.mocked(subscriptionsHooks.useCurrentSubscription).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof subscriptionsHooks.useCurrentSubscription>);

    const { container } = render(<SubscriptionStatusBanner />, {
      wrapper: createWrapper(),
    });

    expect(container.firstChild).toBeNull();
  });

  it('should not render when no subscription', () => {
    vi.mocked(subscriptionsHooks.useCurrentSubscription).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as ReturnType<typeof subscriptionsHooks.useCurrentSubscription>);

    const { container } = render(<SubscriptionStatusBanner />, {
      wrapper: createWrapper(),
    });

    expect(container.firstChild).toBeNull();
  });

  it('should show payment required banner for past_due status', () => {
    vi.mocked(subscriptionsHooks.useCurrentSubscription).mockReturnValue({
      data: createMockSubscription('past_due', 'SmartFlow'),
      isLoading: false,
      error: null,
    } as ReturnType<typeof subscriptionsHooks.useCurrentSubscription>);

    render(<SubscriptionStatusBanner />, { wrapper: createWrapper() });

    expect(screen.getByText('Payment Required')).toBeInTheDocument();
    expect(screen.getByText('Update Payment')).toBeInTheDocument();
  });

  it('should show canceled banner for canceled status', () => {
    vi.mocked(subscriptionsHooks.useCurrentSubscription).mockReturnValue({
      data: createMockSubscription('canceled', 'SmartFlow'),
      isLoading: false,
      error: null,
    } as ReturnType<typeof subscriptionsHooks.useCurrentSubscription>);

    render(<SubscriptionStatusBanner />, { wrapper: createWrapper() });

    expect(screen.getByText('Subscription Canceled')).toBeInTheDocument();
    expect(screen.getByText('Reactivate')).toBeInTheDocument();
  });

  it('should show trial ending banner when trial has 7 or fewer days', () => {
    const trialEnd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 days
    vi.mocked(subscriptionsHooks.useCurrentSubscription).mockReturnValue({
      data: createMockSubscription('trialing', 'SmartFlow', trialEnd),
      isLoading: false,
      error: null,
    } as ReturnType<typeof subscriptionsHooks.useCurrentSubscription>);

    render(<SubscriptionStatusBanner />, { wrapper: createWrapper() });

    expect(screen.getByText('Trial Ending Soon')).toBeInTheDocument();
    expect(screen.getByText('Upgrade Now')).toBeInTheDocument();
  });

  it('should show upgrade banner for free tier active users', () => {
    vi.mocked(subscriptionsHooks.useCurrentSubscription).mockReturnValue({
      data: createMockSubscription('active', 'FreeFlow'),
      isLoading: false,
      error: null,
    } as ReturnType<typeof subscriptionsHooks.useCurrentSubscription>);

    render(<SubscriptionStatusBanner />, { wrapper: createWrapper() });

    expect(screen.getByText('Unlock More Features')).toBeInTheDocument();
    expect(screen.getByText('Upgrade')).toBeInTheDocument();
  });

  it('should not render for active paid subscription', () => {
    vi.mocked(subscriptionsHooks.useCurrentSubscription).mockReturnValue({
      data: createMockSubscription('active', 'SmartFlow'),
      isLoading: false,
      error: null,
    } as ReturnType<typeof subscriptionsHooks.useCurrentSubscription>);

    const { container } = render(<SubscriptionStatusBanner />, {
      wrapper: createWrapper(),
    });

    expect(container.firstChild).toBeNull();
  });
});

