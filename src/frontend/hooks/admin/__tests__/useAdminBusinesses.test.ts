import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { useAdminBusinesses, useAdminBusiness, useSuspendBusiness, useReactivateBusiness } from '../useAdminBusinesses';
import { renderHookWithClient } from './test-utils';
import * as adminService from '@/services/api/admin.service';
import type { AdminPagedResult, AdminBusinessListItem, AdminBusinessDetail } from '@/types/admin';

vi.mock('@/services/api/admin.service');
vi.mock('./useAdminAnalytics', () => ({
  useAdminAnalytics: () => ({
    track: vi.fn(),
  }),
  AdminEvents: {
    ADMIN_BUSINESS_VIEWED: 'admin_business_viewed',
    ADMIN_BUSINESS_SUSPENDED: 'admin_business_suspended',
    ADMIN_BUSINESS_REACTIVATED: 'admin_business_reactivated',
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockBusinessList: AdminPagedResult<AdminBusinessListItem> = {
  items: [
    {
      id: 'bus_001',
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phone: '+1234567890',
      planName: 'UltraFlow',
      status: 'active',
      userCount: 15,
      createdAt: '2024-01-15T00:00:00Z',
    },
    {
      id: 'bus_002',
      name: 'TechStart Inc',
      email: 'hello@techstart.io',
      phone: null,
      planName: 'SmartFlow',
      status: 'active',
      userCount: 5,
      createdAt: '2024-06-01T00:00:00Z',
    },
  ],
  totalItems: 2,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const mockBusiness: AdminBusinessDetail = {
  id: 'bus_001',
  name: 'Acme Corporation',
  email: 'contact@acme.com',
  phone: '+1234567890',
  industry: 'Technology',
  planName: 'UltraFlow',
  status: 'active',
  userCount: 15,
  createdAt: '2024-01-15T00:00:00Z',
  ownerId: 'user_001',
  ownerName: 'John Doe',
  totalLeads: 150,
  totalConversations: 500,
  totalMessages: 1200,
  subscriptionStatus: 'active',
  subscriptionStartDate: '2024-01-15T00:00:00Z',
  subscriptionEndDate: '2025-01-15T00:00:00Z',
  suspensionReason: null,
  updatedAt: null,
};

describe('useAdminBusinesses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch businesses list successfully', async () => {
    vi.mocked(adminService.adminBusinessService.getBusinesses).mockResolvedValue(mockBusinessList);

    const { result } = renderHookWithClient(() => useAdminBusinesses({}));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockBusinessList);
    expect(result.current.isError).toBe(false);
  });

  it('should handle API errors', async () => {
    vi.mocked(adminService.adminBusinessService.getBusinesses).mockRejectedValue(
      new Error('API unavailable')
    );

    const { result } = renderHookWithClient(() => useAdminBusinesses({}));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
  });

  it('should pass filter parameters to service', async () => {
    vi.mocked(adminService.adminBusinessService.getBusinesses).mockResolvedValue(mockBusinessList);

    renderHookWithClient(() => useAdminBusinesses({
      search: 'acme',
      status: 'active',
      page: 1,
      pageSize: 20,
    }));

    await waitFor(() => {
      expect(adminService.adminBusinessService.getBusinesses).toHaveBeenCalledWith({
        search: 'acme',
        status: 'active',
        page: 1,
        pageSize: 20,
      });
    });
  });
});

describe('useAdminBusiness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch single business by ID', async () => {
    vi.mocked(adminService.adminBusinessService.getBusiness).mockResolvedValue(mockBusiness);

    const { result } = renderHookWithClient(() => useAdminBusiness('bus_001'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockBusiness);
    expect(adminService.adminBusinessService.getBusiness).toHaveBeenCalledWith('bus_001');
  });

  it('should not fetch when ID is undefined', () => {
    const { result } = renderHookWithClient(() => useAdminBusiness(undefined as unknown as string));

    expect(result.current.isLoading).toBe(false);
    expect(adminService.adminBusinessService.getBusiness).not.toHaveBeenCalled();
  });
});

describe('useSuspendBusiness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should suspend a business', async () => {
    vi.mocked(adminService.adminBusinessService.suspendBusiness).mockResolvedValue(undefined);

    const { result } = renderHookWithClient(() => useSuspendBusiness());

    act(() => {
      result.current.mutate({ businessId: 'bus_001', reason: 'Payment overdue' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminService.adminBusinessService.suspendBusiness).toHaveBeenCalledWith('bus_001', 'Payment overdue');
  });
});

describe('useReactivateBusiness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reactivate a business', async () => {
    vi.mocked(adminService.adminBusinessService.reactivateBusiness).mockResolvedValue(undefined);

    const { result } = renderHookWithClient(() => useReactivateBusiness());

    act(() => {
      result.current.mutate('bus_001');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminService.adminBusinessService.reactivateBusiness).toHaveBeenCalledWith('bus_001');
  });
});
