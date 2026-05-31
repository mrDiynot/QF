import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminThemeProvider } from '@/contexts/AdminThemeContext';
import AdminDashboardPage from '../page';

// Mock the hooks - mock individual files since the page imports from specific paths
vi.mock('@/hooks/admin/useAdminSession', () => ({
  useAdminSession: vi.fn(() => ({
    isLoading: false,
    isAuthenticated: true,
    adminUser: {
      id: 'admin_001',
      email: 'admin@qualiflow.ai',
      fullName: 'Super Admin',
      role: 'SuperAdmin',
    },
  })),
}));

vi.mock('@/hooks/admin/useAdminDashboard', () => ({
  useAdminDashboard: vi.fn(() => ({
    data: {
      totalBusinesses: 247,
      totalUsers: 1893,
      mrr: 24750,
      businessGrowth: 12.5,
      userGrowth: 5.3,
      recentActivity: [],
      subscriptionsByPlan: [],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    isRefetching: false,
  })),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock AdminThemeContext
vi.mock('@/contexts/AdminThemeContext', () => ({
  AdminThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-admin-theme="dark">{children}</div>,
  useAdminTheme: () => ({ theme: 'dark', setTheme: vi.fn(), toggleTheme: vi.fn() }),
}));

// Mock chart components to avoid rendering issues in tests
vi.mock('@/components/admin/blocks', () => ({
  WelcomeBlock: ({ title }: { title: string }) => <div>{title}</div>,
  StatCard: ({ title, value }: { title: string; value: string | number }) => <div><span>{title}</span><span>{value}</span></div>,
  QuickActionsCard: ({ actions }: { actions: { label: string }[] }) => <div>{actions?.map((a: { label: string }) => <span key={a.label}>{a.label}</span>)}</div>,
  SubscriptionBreakdownCard: () => <div>Subscription Breakdown</div>,
  RevenueReportChart: () => <div data-testid="revenue-chart">Revenue Chart</div>,
  OverviewChart: () => <div data-testid="overview-chart">Overview Chart</div>,
  GeoDistributionChart: () => <div data-testid="geo-chart">Geo Chart</div>,
}));

describe('AdminDashboardPage', () => {
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
        <AdminThemeProvider>
          <AdminDashboardPage />
        </AdminThemeProvider>
      </QueryClientProvider>
    );
  };

  it('renders the dashboard page', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Dashboard Analytics')).toBeInTheDocument();
    });
  });

  it('displays personalized welcome message', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Welcome Admin/)).toBeInTheDocument();
    });
  });

  it('displays stat cards with metrics', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Total Businesses')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Monthly MRR')).toBeInTheDocument();
    });
  });

  it('displays business count', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('247')).toBeInTheDocument();
    });
  });

  it('renders quick actions section', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('View Businesses')).toBeInTheDocument();
      expect(screen.getByText('Support Tickets')).toBeInTheDocument();
    });
  });

  it('renders refresh button', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });
  });

  it('renders chart components', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
      expect(screen.getByTestId('overview-chart')).toBeInTheDocument();
      expect(screen.getByTestId('geo-chart')).toBeInTheDocument();
    });
  });

  it('displays recent activity section', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Recent Activity').length).toBeGreaterThan(0);
    });
  });
});
