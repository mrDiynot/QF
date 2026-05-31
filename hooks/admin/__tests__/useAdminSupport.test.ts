import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import {
  useAdminTickets,
  useAdminTicket,
  useAddTicketMessage,
  useUpdateTicketStatus,
  useTicketDashboardStats
} from '../useAdminSupport';
import { renderHookWithClient } from './test-utils';
import * as adminService from '@/services/api/admin.service';
import type { AdminPagedResult, SupportTicket, TicketDashboardStats, TicketStatus, TicketPriority, TicketMessage, AddTicketMessageRequest, UpdateTicketStatusRequest } from '@/types/admin';

vi.mock('@/services/api/admin.service');
vi.mock('./useAdminAnalytics', () => ({
  useAdminAnalytics: () => ({
    track: vi.fn(),
    trackAdminError: vi.fn(),
  }),
  AdminEvents: {
    ADMIN_TICKET_VIEWED: 'admin_ticket_viewed',
    ADMIN_TICKET_UPDATED: 'admin_ticket_updated',
    ADMIN_TICKET_REPLIED: 'admin_ticket_replied',
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockTicketList: AdminPagedResult<SupportTicket> = {
  items: [
    {
      id: 'ticket_001',
      ticketNumber: 'TKT-001',
      subject: 'Cannot access dashboard',
      description: 'I cannot log in to my account',
      businessId: 'bus_001',
      businessName: 'Acme Corp',
      reporterEmail: 'user@acme.com',
      reporterName: 'John Doe',
      status: 'Open',
      priority: 'High',
      category: 'TechnicalSupport',
      firstResponseDue: null,
      resolutionDue: null,
      firstResponseAt: null,
      resolvedAt: null,
      slaBreached: false,
      assignedToAdminId: null,
      assignedToAdminName: null,
      createdAt: '2024-12-01T00:00:00Z',
      updatedAt: null,
      messageCount: 0,
    },
    {
      id: 'ticket_002',
      ticketNumber: 'TKT-002',
      subject: 'Billing question',
      description: 'Question about my invoice',
      businessId: 'bus_002',
      businessName: 'TechStart',
      reporterEmail: 'user@techstart.io',
      reporterName: 'Jane Smith',
      status: 'AwaitingCustomer',
      priority: 'Medium',
      category: 'BillingInquiry',
      firstResponseDue: null,
      resolutionDue: null,
      firstResponseAt: null,
      resolvedAt: null,
      slaBreached: false,
      assignedToAdminId: null,
      assignedToAdminName: null,
      createdAt: '2024-12-02T00:00:00Z',
      updatedAt: null,
      messageCount: 0,
    },
  ],
  totalItems: 2,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const mockTicket: SupportTicket = {
  id: 'ticket_001',
  ticketNumber: 'TKT-001',
  subject: 'Cannot access dashboard',
  description: 'I cannot log in to my account',
  businessId: 'bus_001',
  businessName: 'Acme Corp',
  reporterEmail: 'user@acme.com',
  reporterName: 'John Doe',
  status: 'Open',
  priority: 'High',
  category: 'TechnicalSupport',
  firstResponseDue: null,
  resolutionDue: null,
  firstResponseAt: null,
  resolvedAt: null,
  slaBreached: false,
  assignedToAdminId: null,
  assignedToAdminName: null,
  createdAt: '2024-12-01T00:00:00Z',
  updatedAt: null,
  messageCount: 0,
};

const mockDashboardStats: TicketDashboardStats = {
  totalOpen: 15,
  newToday: 5,
  awaitingResponse: 8,
  slaBreached: 2,
  unassigned: 3,
  resolvedToday: 4,
  byPriority: { None: 0, Low: 2, Medium: 5, High: 6, Critical: 2 },
  byCategory: { None: 0, TechnicalSupport: 5, BillingInquiry: 3, FeatureRequest: 2, AccountIssue: 3, GeneralQuestion: 2 },
};

describe('useAdminTickets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch tickets list successfully', async () => {
    vi.mocked(adminService.adminSupportService.getTickets).mockResolvedValue(mockTicketList);

    const { result } = renderHookWithClient(() => useAdminTickets({}));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockTicketList);
  });

  it('should handle API errors', async () => {
    vi.mocked(adminService.adminSupportService.getTickets).mockRejectedValue(
      new Error('API unavailable')
    );

    const { result } = renderHookWithClient(() => useAdminTickets({}));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
  });

  it('should pass filter parameters', async () => {
    vi.mocked(adminService.adminSupportService.getTickets).mockResolvedValue(mockTicketList);

    renderHookWithClient(() => useAdminTickets({
      status: 'Open' as TicketStatus,
      priority: 'High' as TicketPriority,
      page: 1,
    }));

    await waitFor(() => {
      expect(adminService.adminSupportService.getTickets).toHaveBeenCalled();
    });
  });
});

describe('useAdminTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch single ticket by ID', async () => {
    vi.mocked(adminService.adminSupportService.getTicket).mockResolvedValue(mockTicket);

    const { result } = renderHookWithClient(() => useAdminTicket('ticket_001'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockTicket);
  });

  it('should not fetch when ID is empty', () => {
    const { result } = renderHookWithClient(() => useAdminTicket(''));

    expect(result.current.isLoading).toBe(false);
    expect(adminService.adminSupportService.getTicket).not.toHaveBeenCalled();
  });
});

describe('useAddTicketMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add a message to ticket', async () => {
    vi.mocked(adminService.adminSupportService.addMessage).mockResolvedValue({} as TicketMessage);

    const { result } = renderHookWithClient(() => useAddTicketMessage());

    act(() => {
      result.current.mutate({
        ticketId: 'ticket_001',
        request: { content: 'Thank you for contacting us', isInternal: false } as AddTicketMessageRequest,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminService.adminSupportService.addMessage).toHaveBeenCalledWith(
      'ticket_001',
      expect.objectContaining({ content: 'Thank you for contacting us' })
    );
  });

  it('should add internal note', async () => {
    vi.mocked(adminService.adminSupportService.addMessage).mockResolvedValue({} as TicketMessage);

    const { result } = renderHookWithClient(() => useAddTicketMessage());

    act(() => {
      result.current.mutate({
        ticketId: 'ticket_001',
        request: { content: 'Internal note for team', isInternal: true } as AddTicketMessageRequest,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminService.adminSupportService.addMessage).toHaveBeenCalledWith(
      'ticket_001',
      expect.objectContaining({ content: 'Internal note for team', isInternal: true })
    );
  });
});

describe('useUpdateTicketStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update ticket status', async () => {
    vi.mocked(adminService.adminSupportService.updateStatus).mockResolvedValue({} as SupportTicket);

    const { result } = renderHookWithClient(() => useUpdateTicketStatus());

    act(() => {
      result.current.mutate({
        ticketId: 'ticket_001',
        request: { status: 'Resolved' } as UpdateTicketStatusRequest,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminService.adminSupportService.updateStatus).toHaveBeenCalled();
  });
});

describe('useTicketDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch dashboard stats', async () => {
    vi.mocked(adminService.adminSupportService.getDashboardStats).mockResolvedValue(mockDashboardStats);

    const { result } = renderHookWithClient(() => useTicketDashboardStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockDashboardStats);
  });
});
