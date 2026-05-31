/**
 * Team Members API Service
 * Handles team member management operations
 */

import { apiClient } from '@/lib/axios';

export interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  profilePictureUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  joinedAt: string;
}

export interface InviteTeamMemberRequest {
  email: string;
  role: string;
  personalMessage?: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  isValid: boolean;
  invitedByName: string;
  createdAt: string;
  acceptedAt?: string;
}

export interface UpdateTeamMemberRoleRequest {
  role: string;
}

class TeamMembersService {
  private readonly baseUrl = '/team-members';

  /**
   * Get all team members for the current business
   */
  async getAllMembers(): Promise<TeamMember[]> {
    const response = await apiClient.get<TeamMember[]>(this.baseUrl);
    return response.data;
  }

  /**
   * Get a specific team member by ID
   */
  async getMemberById(id: string): Promise<TeamMember> {
    const response = await apiClient.get<TeamMember>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Invite a new team member
   */
  async inviteMember(request: InviteTeamMemberRequest): Promise<Invitation> {
    const response = await apiClient.post<Invitation>(`${this.baseUrl}/invite`, request);
    return response.data;
  }

  /**
   * Update a team member's role
   */
  async updateMemberRole(id: string, request: UpdateTeamMemberRoleRequest): Promise<TeamMember> {
    const response = await apiClient.patch<TeamMember>(
      `${this.baseUrl}/${id}/role`,
      request
    );
    return response.data;
  }

  /**
   * Remove a team member
   */
  async removeMember(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Get pending invitations
   */
  async getPendingInvitations(): Promise<Invitation[]> {
    const response = await apiClient.get<Invitation[]>(`${this.baseUrl}/invitations`);
    return response.data;
  }

  /**
   * Resend an invitation
   */
  async resendInvitation(invitationId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/invitations/${invitationId}/resend`);
  }

  /**
   * Cancel an invitation
   */
  async cancelInvitation(invitationId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/invitations/${invitationId}`);
  }
}

export const teamMembersService = new TeamMembersService();
