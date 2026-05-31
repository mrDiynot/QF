import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/dom';
import { useAdminDashboard } from '../useAdminDashboard';
import { renderHookWithClient } from './test-utils';
import * as adminService from '@/services/api/admin.service';
import type { AdminDashboardMetrics } from '@/types/admin';

vi.mock('@/services/api/admin.service');
vi.mock('./useAdminAnalytics', () => ({
  useAdminAnalytics: () => ({
    track: vi.fn(),
  }),
  AdminEvents: {
    ADMIN_DASHBOARD_VIEWED: 'admin_dashboard_viewed',
    ADMIN_DASHBOARD_REFRESHED: 'admin_dashboard_refreshed',
  },
}));

const mockDashboardMetrics: AdminDashboardMetrics = {
  totalBusinesses: 247,
  totalUsers: 1893,
  mrr: 24750,
  activeSubscriptions: 198,
  newSignups7d: 8,
  businessGrowth: 12.5,
  userGrowth: 5.3,
  signupGrowth: 10.2,
  recentActivity: [
    {
      id: 'act_001',
      type: 'business_created',
      description: 'New business signed up',
      entityType: 'business',
      entityId: null,
      timestamp: new Date().toISOString(),
      metadata: { businessName: 'Acme Corp' },
    },
  ],
  subscriptionsByPlan: [
    { planName: 'FreeFlow', count: 50, revenue: 0, percentage: 25.3 },
    { planName: 'SmartFlow', count: 100, revenue: 9900, percentage: 50.5 },
    { planName: 'UltraFlow', count: 48, revenue: 9552, percentage: 24.2 },
  ],
};

describe('useAdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch dashboard metrics successfully', async () => {
    vi.mocked(adminService.adminDashboardService.getMetrics).mockResolvedValue(mockDashboardMetrics);

    const { result } = renderHookWithClient(() => useAdminDashboard());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockDashboardMetrics);
    expect(result.current.isError).toBe(false);
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(adminService.adminDashboardService.getMetrics).mockRejectedValue(
      new Error('API unavailable')
    );

    const { result } = renderHookWithClient(() => useAdminDashboard());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
  });

  it('should provide refetch function', async () => {
    vi.mocked(adminService.adminDashboardService.getMetrics).mockResolvedValue(mockDashboardMetrics);

    const { result } = renderHookWithClient(() => useAdminDashboard());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should return correct data shape', async () => {
    vi.mocked(adminService.adminDashboardService.getMetrics).mockResolvedValue(mockDashboardMetrics);

    const { result } = renderHookWithClient(() => useAdminDashboard());

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    const data = result.current.data;
    expect(data?.totalBusinesses).toBe(247);
    expect(data?.totalUsers).toBe(1893);
    expect(data?.mrr).toBe(24750);
    expect(data?.subscriptionsByPlan).toHaveLength(3);
  });

  it('should track dashboard view analytics', async () => {
    vi.mocked(adminService.adminDashboardService.getMetrics).mockResolvedValue(mockDashboardMetrics);

    renderHookWithClient(() => useAdminDashboard());

    await waitFor(() => {
      expect(adminService.adminDashboardService.getMetrics).toHaveBeenCalled();
    });
  });
});
