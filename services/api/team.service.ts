/**
 * Team Members API Service
 * Handles all team member and invitation-related API calls
 */

import { apiClient } from '@/lib/axios';

// Team Member Types
export type BusinessRole = 'Owner' | 'Admin' | 'Manager' | 'Viewer';

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: BusinessRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface TeamMemberListResponse {
  items: TeamMember[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface UpdateTeamMemberRoleRequest {
  role: BusinessRole;
}

// Invitation Types
export type InvitationStatus = 'Pending' | 'Accepted' | 'Expired' | 'Cancelled';

export interface Invitation {
  id: string;
  email: string;
  role: BusinessRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  invitedByName: string;
}

export interface InvitationListResponse {
  items: Invitation[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface InviteTeamMemberRequest {
  email: string;
  role: BusinessRole;
  personalMessage?: string;
}

export interface InviteTeamMemberResponse {
  invitationId: string;
  email: string;
  role: BusinessRole;
  expiresAt: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const teamService = {
  // ============================================================================
  // Team Members
  // ============================================================================

  /**
   * Get all team members for the current business
   * GET /api/v1/team-members
   */
  getTeamMembers: async (params?: {
    pageNumber?: number;
    pageSize?: number;
  }): Promise<TeamMemberListResponse> => {
    const response = await apiClient.get<TeamMember[] | TeamMemberListResponse>('/team-members', { params });
    
    // Backend returns plain array, not paginated response
    // Convert to paginated format for frontend compatibility
    if (Array.isArray(response.data)) {
      const items = response.data;
      return {
        items,
        totalCount: items.length,
        pageNumber: 1,
        pageSize: items.length,
        totalPages: 1,
      };
    }
    
    return response.data;
  },

  /**
   * Get a single team member by ID
   * GET /api/v1/team-members/{id}
   */
  getTeamMemberById: async (id: string): Promise<TeamMember> => {
    const response = await apiClient.get<TeamMember>(`/team-members/${id}`);
    return response.data;
  },

  /**
   * Update a team member's role
   * PATCH /api/v1/team-members/{id}/role
   */
  updateTeamMemberRole: async (id: string, data: UpdateTeamMemberRoleRequest): Promise<TeamMember> => {
    const response = await apiClient.patch<TeamMember>(`/team-members/${id}/role`, data);
    return response.data;
  },

  /**
   * Deactivate a team member
   * POST /api/v1/team-members/{id}/deactivate
   */
  deactivateTeamMember: async (id: string): Promise<void> => {
    await apiClient.post(`/team-members/${id}/deactivate`);
  },

  /**
   * Reactivate a team member
   * POST /api/v1/team-members/{id}/reactivate
   */
  reactivateTeamMember: async (id: string): Promise<void> => {
    await apiClient.post(`/team-members/${id}/reactivate`);
  },

  /**
   * Remove a team member from the business
   * DELETE /api/v1/team-members/{id}
   */
  removeTeamMember: async (id: string): Promise<void> => {
    await apiClient.delete(`/team-members/${id}`);
  },

  // ============================================================================
  // Invitations
  // ============================================================================

  /**
   * Invite a new team member
   * POST /api/v1/team-members/invitations
   */
  inviteTeamMember: async (data: InviteTeamMemberRequest): Promise<InviteTeamMemberResponse> => {
    const response = await apiClient.post<InviteTeamMemberResponse>('/team-members/invitations', data);
    return response.data;
  },

  /**
   * Get all pending invitations
   * GET /api/v1/team-members/invitations
   */
  getInvitations: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    status?: InvitationStatus;
  }): Promise<InvitationListResponse> => {
    const response = await apiClient.get<Invitation[] | InvitationListResponse>('/team-members/invitations', { params });
    
    // Backend returns plain array, not paginated response
    // Convert to paginated format for frontend compatibility
    if (Array.isArray(response.data)) {
      const items = response.data;
      return {
        items,
        totalCount: items.length,
        pageNumber: 1,
        pageSize: items.length,
        totalPages: 1,
      };
    }
    
    return response.data;
  },

  /**
   * Resend an invitation
   * POST /api/v1/team-members/invitations/{id}/resend
   */
  resendInvitation: async (id: string): Promise<void> => {
    await apiClient.post(`/team-members/invitations/${id}/resend`);
  },

  /**
   * Cancel an invitation
   * DELETE /api/v1/team-members/invitations/{id}
   */
  cancelInvitation: async (id: string): Promise<void> => {
    await apiClient.delete(`/team-members/invitations/${id}`);
  },

  // ============================================================================
  // Audit Logs
  // ============================================================================

  /**
   * Get audit logs for the current business
   * GET /api/v1/audit-logs
   */
  getAuditLogs: async (params?: {
    entityType?: string;
    entityId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<AuditLogListResponse> => {
    const response = await apiClient.get<AuditLogListResponse>('/audit-logs', { params });
    return response.data;
  },

  /**
   * Get audit logs for a specific entity
   * GET /api/v1/audit-logs/entity/{entityType}/{entityId}
   */
  getEntityAuditLogs: async (entityType: string, entityId: string): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>(`/audit-logs/entity/${entityType}/${entityId}`);
    return response.data;
  },

  /**
   * Export audit logs as CSV
   * GET /api/v1/audit-logs/export
   */
  exportAuditLogs: async (params?: {
    entityType?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> => {
    const response = await apiClient.get('/audit-logs/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

