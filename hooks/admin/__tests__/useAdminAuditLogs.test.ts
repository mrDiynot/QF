import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import { useAdminAuditLogs, useExportAuditLogs } from '../useAdminAuditLogs';
import { renderHookWithClient } from './test-utils';
import * as adminService from '@/services/api/admin.service';
import type { AdminPagedResult, AdminAuditLog, AdminAuditLogQuery } from '@/types/admin';

vi.mock('@/services/api/admin.service');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockAuditLogs: AdminPagedResult<AdminAuditLog> = {
  items: [
    {
      id: 'log_001',
      action: 'business.suspended',
      adminUserId: 'admin_001',
      adminUserEmail: 'admin@qualiflow.ai',
      entityType: 'Business',
      entityId: 'bus_001',
      oldValues: null,
      newValues: null,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      requestPath: '/api/admin/businesses/bus_001/suspend',
      httpMethod: 'POST',
      statusCode: 200,
      success: true,
      errorMessage: null,
      createdAt: '2024-12-01T10:00:00Z',
    },
  ],
  totalItems: 1,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

describe('useAdminAuditLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch audit logs successfully', async () => {
    vi.mocked(adminService.adminAuditLogService.getAuditLogs).mockResolvedValue(mockAuditLogs);

    const { result } = renderHookWithClient(() => useAdminAuditLogs({}));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockAuditLogs);
  });

  it('should handle API errors', async () => {
    vi.mocked(adminService.adminAuditLogService.getAuditLogs).mockRejectedValue(
      new Error('API unavailable')
    );

    const { result } = renderHookWithClient(() => useAdminAuditLogs({}));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
  });

  it('should pass query parameters', async () => {
    vi.mocked(adminService.adminAuditLogService.getAuditLogs).mockResolvedValue(mockAuditLogs);

    renderHookWithClient(() => useAdminAuditLogs({
      entityType: 'Business',
      page: 1,
    } as AdminAuditLogQuery));

    await waitFor(() => {
      expect(adminService.adminAuditLogService.getAuditLogs).toHaveBeenCalled();
    });
  });
});

describe('useExportAuditLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export audit logs', async () => {
    const mockBlob = new Blob(['csv data'], { type: 'text/csv' });
    vi.mocked(adminService.adminAuditLogService.exportAuditLogs).mockResolvedValue(mockBlob);

    const { result } = renderHookWithClient(() => useExportAuditLogs());

    act(() => {
      result.current.mutate({});
    });

    await waitFor(() => {
      expect(adminService.adminAuditLogService.exportAuditLogs).toHaveBeenCalled();
    });
  });
});
