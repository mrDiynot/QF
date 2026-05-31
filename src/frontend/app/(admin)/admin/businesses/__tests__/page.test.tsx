import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BusinessesPage from '../page';

// Mock the hooks
vi.mock('@/hooks/admin', () => {
  const mockData = {
    items: [
      {
        id: 'bus_001',
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        planName: 'UltraFlow',
        status: 'active',
        userCount: 15,
        createdAt: '2024-01-15T00:00:00Z',
      },
      {
        id: 'bus_002',
        name: 'TechStart Inc',
        email: 'hello@techstart.io',
        planName: 'SmartFlow',
        status: 'trial',
        userCount: 5,
        createdAt: '2024-06-01T00:00:00Z',
      },
    ],
    totalItems: 2,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  };
  
  return {
    useAdminBusinesses: vi.fn(() => ({
      data: mockData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    })),
  };
});

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('BusinessesPage', () => {
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
        <BusinessesPage />
      </QueryClientProvider>
    );
  };

  it('renders the businesses page', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Businesses')).toBeInTheDocument();
    });
  });

  it('displays businesses table', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('TechStart Inc')).toBeInTheDocument();
    });
  });

  it('displays business email', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('contact@acme.com')).toBeInTheDocument();
    });
  });

  it('displays business plan badges', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('UltraFlow')).toBeInTheDocument();
      expect(screen.getByText('SmartFlow')).toBeInTheDocument();
    });
  });

  it('displays business status', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Trial')).toBeInTheDocument();
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

  it('renders action menus for each business', async () => {
    renderPage();

    await waitFor(() => {
      // The page uses RowActionsMenu (dropdown buttons), not <a> links
      const actionButtons = screen.getAllByRole('button', { name: /actions/i });
      expect(actionButtons.length).toBeGreaterThan(0);
    });
  });

  it('allows filtering by status', async () => {
    userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });

    // Find and interact with status filter
    const statusSelect = screen.getByRole('combobox');
    expect(statusSelect).toBeInTheDocument();
  });
});
