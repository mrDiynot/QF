import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SubscriptionsPage from '../page';

// Mock the hooks - need to mock all hooks used by the page
vi.mock('@/hooks/admin', () => {
  const mockData = {
    items: [
      {
        id: 'sub_001',
        businessId: 'bus_001',
        businessName: 'Acme Corporation',
        businessEmail: 'contact@acme.com',
        planName: 'UltraFlow',
        status: 'active',
        monthlyPrice: 199,
        mrr: 199,
        currentPeriodEnd: '2025-01-15T00:00:00Z',
        createdAt: '2024-01-15T00:00:00Z',
      },
      {
        id: 'sub_002',
        businessId: 'bus_002',
        businessName: 'TechStart Inc',
        businessEmail: 'hello@techstart.io',
        planName: 'SmartFlow',
        status: 'trialing',
        monthlyPrice: 0,
        mrr: 0,
        trialEndsAt: '2025-01-01T00:00:00Z',
        createdAt: '2024-12-15T00:00:00Z',
      },
    ],
    totalItems: 2,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  };
  
  return {
    useAdminSubscriptions: vi.fn(() => ({
      data: mockData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    })),
    useAdminSubscriptionMetrics: vi.fn(() => ({
      data: {
        totalSubscriptions: 198,
        activeSubscriptions: 198,
        trialingSubscriptions: 15,
        cancelledSubscriptions: 3,
        pastDueSubscriptions: 0,
        totalMRR: 24750,
        mrr: 24750,
        arr: 297000,
        churnRate: 2.3,
        averageRevenuePerUser: 125,
        canceledThisMonth: 3,
        byPlan: [
          { planId: '1', planName: 'FreeFlow', count: 50, mrr: 0, percentage: 25 },
          { planId: '2', planName: 'SmartFlow', count: 80, mrr: 7920, percentage: 40 },
          { planId: '3', planName: 'UltraFlow', count: 50, mrr: 9950, percentage: 25 },
          { planId: '4', planName: 'Enterprise', count: 18, mrr: 6880, percentage: 10 },
        ],
      },
      isLoading: false,
      isError: false,
    })),
    useCancelSubscription: vi.fn(() => ({
      mutate: vi.fn(),
      isPending: false,
    })),
    useExtendTrial: vi.fn(() => ({
      mutate: vi.fn(),
      isPending: false,
    })),
  };
});

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('SubscriptionsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SubscriptionsPage />
      </QueryClientProvider>
    );
  };

  it('renders the subscriptions page', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Subscriptions')).toBeInTheDocument();
    });
  });

  it('displays subscription metrics', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Monthly Recurring Revenue')).toBeInTheDocument();
      expect(screen.getByText('Active Subscriptions')).toBeInTheDocument();
    });
  });

  it('displays MRR value', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('$24,750')).toBeInTheDocument();
    });
  });

  it('displays active subscriptions count', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('198')).toBeInTheDocument();
    });
  });

  it('displays subscription list', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('TechStart Inc')).toBeInTheDocument();
    });
  });

  it('displays plan names', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('UltraFlow').length).toBeGreaterThan(0);
      expect(screen.getAllByText('SmartFlow').length).toBeGreaterThan(0);
    });
  });

  it('displays subscription status', async () => {
    renderPage();

    await waitFor(() => {
      // Status badges render with these labels based on status values
      expect(screen.getAllByText(/Active|Trial/i).length).toBeGreaterThan(0);
    });
  });

  it('renders search input', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });

  it('renders refresh button', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });
  });
});
