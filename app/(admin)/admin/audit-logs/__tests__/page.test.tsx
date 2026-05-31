import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuditLogsPage from '../page';

// Mock the hooks
vi.mock('@/hooks/admin', () => {
  const mockData = {
    items: [
      {
        id: 'log_001',
        action: 'business.suspended',
        adminUserId: 'admin_001',
        adminUserEmail: 'admin@qualiflow.ai',
        entityType: 'Business',
        entityId: 'bus_001',
        success: true,
        ipAddress: '192.168.1.1',
        createdAt: '2024-12-01T10:00:00Z',
      },
      {
        id: 'log_002',
        action: 'user.created',
        adminUserId: 'admin_001',
        adminUserEmail: 'admin@qualiflow.ai',
        entityType: 'User',
        entityId: 'user_001',
        success: true,
        ipAddress: '192.168.1.1',
        createdAt: '2024-12-01T09:00:00Z',
      },
    ],
    totalItems: 2,
    page: 1,
    pageSize: 50,
    totalPages: 1,
  };
  
  return {
    useAdminAuditLogs: vi.fn(() => ({
      data: mockData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    })),
    useExportAuditLogs: vi.fn(() => ({
      mutate: vi.fn(),
      isPending: false,
    })),
  };
});

describe('AuditLogsPage', () => {
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
        <AuditLogsPage />
      </QueryClientProvider>
    );
  };

  it('renders the audit logs page', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    });
  });

  it('displays log entries', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('business.suspended')).toBeInTheDocument();
      expect(screen.getByText('user.created')).toBeInTheDocument();
    });
  });

  it('displays admin email', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('admin@qualiflow.ai').length).toBeGreaterThan(0);
    });
  });

  it('displays entity types', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Business')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  it('displays status badges', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Success').length).toBeGreaterThan(0);
    });
  });

  it('renders search input', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });

  it('renders export button', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });
  });

  it('renders refresh button', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });
  });
});
