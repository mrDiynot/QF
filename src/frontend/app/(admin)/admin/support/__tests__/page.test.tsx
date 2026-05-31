import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SupportPage from '../page';

// Mock the hooks
vi.mock('@/hooks/admin', () => {
  const mockTickets = {
    items: [
      {
        id: 'ticket_001',
        subject: 'Cannot access dashboard',
        businessId: 'bus_001',
        businessName: 'Acme Corp',
        status: 'Open',
        priority: 'High',
        category: 'Technical',
        assignedAdminName: null,
        createdAt: '2024-12-01T00:00:00Z',
      },
      {
        id: 'ticket_002',
        subject: 'Billing question',
        businessId: 'bus_002',
        businessName: 'TechStart',
        status: 'AwaitingResponse',
        priority: 'Medium',
        category: 'Billing',
        assignedAdminName: 'John Doe',
        createdAt: '2024-12-02T00:00:00Z',
      },
    ],
    totalItems: 2,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  };
  
  return {
    useAdminTickets: vi.fn(() => ({
      data: mockTickets,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    })),
    useTicketDashboardStats: vi.fn(() => ({
      data: {
        totalOpen: 15,
        awaitingResponse: 8,
        slaBreached: 2,
        newToday: 5,
        unassigned: 3,
        avgResponseTime: '2h',
        avgResolutionTime: '24h',
        satisfactionRate: 92,
      },
      isLoading: false,
      isError: false,
    })),
  };
});

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('SupportPage', () => {
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
        <SupportPage />
      </QueryClientProvider>
    );
  };

  it('renders the support tickets page', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Support Tickets')).toBeInTheDocument();
    });
  });

  it('displays tickets in the list', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Cannot access dashboard')).toBeInTheDocument();
      expect(screen.getByText('Billing question')).toBeInTheDocument();
    });
  });

  it('displays business names', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('TechStart')).toBeInTheDocument();
    });
  });

  it('displays stats cards', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Open Tickets')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  it('displays awaiting response count', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Awaiting Response')).toBeInTheDocument();
      // Use getAllByText to avoid conflicts with apexcharts SVG text nodes
      const matches = screen.getAllByText('8');
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it('displays SLA breached count', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('SLA Breached')).toBeInTheDocument();
      // Use getAllByText to avoid conflicts with apexcharts SVG text nodes
      const matches = screen.getAllByText('2');
      expect(matches.length).toBeGreaterThan(0);
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

  it('renders canned responses link', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/canned responses/i)).toBeInTheDocument();
    });
  });
});
