/**
 * Invitations API Service
 */

import { apiClient } from '@/lib/axios';

export interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  invitedBy: string;
  invitedByName: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface CreateInvitationRequest {
  email: string;
  role: string;
  message?: string;
}

export const invitationsService = {
  getInvitations: async () => {
    const response = await apiClient.get<TeamInvitation[]>('/Invitations');
    return response.data;
  },

  createInvitation: async (data: CreateInvitationRequest) => {
    const response = await apiClient.post<TeamInvitation>('/Invitations', data);
    return response.data;
  },

  resendInvitation: async (id: string) => {
    const response = await apiClient.post<TeamInvitation>(`/Invitations/${id}/resend`);
    return response.data;
  },

  revokeInvitation: async (id: string) => {
    await apiClient.delete(`/Invitations/${id}`);
  },

  acceptInvitation: async (token: string) => {
    const response = await apiClient.post<{ success: boolean }>('/Invitations/accept', { token });
    return response.data;
  },
};
