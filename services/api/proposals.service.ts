import { apiClient } from '@/lib/axios';

export interface Proposal {
  id: string;
  leadId?: string;
  title: string;
  clientName: string;
  clientEmail?: string;
  clientCompany?: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined';
  amount: number;
  currency: string;
  content: string;
  templateId?: string;
  validUntil?: string;
  sentAt?: string;
  viewedAt?: string;
  viewCount: number;
  acceptedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  isSigned: boolean;
  signerName?: string;
  notes?: string;
  publicUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProposalStats {
  totalProposals: number;
  draftCount: number;
  sentCount: number;
  viewedCount: number;
  acceptedCount: number;
  declinedCount: number;
  totalValue: number;
  acceptedValue: number;
  acceptanceRate: number;
}

export interface CreateProposalRequest {
  leadId?: string;
  title: string;
  clientName: string;
  clientEmail?: string;
  clientCompany?: string;
  amount: number;
  currency?: string;
  content?: string;
  templateId?: string;
  validUntil?: string;
  notes?: string;
}

export interface UpdateProposalRequest {
  title?: string;
  clientName?: string;
  clientEmail?: string;
  clientCompany?: string;
  status?: string;
  amount?: number;
  currency?: string;
  content?: string;
  validUntil?: string;
  notes?: string;
}

export const proposalsService = {
  async getProposals(status?: string): Promise<Proposal[]> {
    const params = status ? { status } : undefined;
    const response = await apiClient.get<Proposal[]>('/proposals', { params });
    return response.data;
  },

  async getProposal(id: string): Promise<Proposal> {
    const response = await apiClient.get<Proposal>(`/proposals/${id}`);
    return response.data;
  },

  async getStats(): Promise<ProposalStats> {
    const response = await apiClient.get<ProposalStats>('/proposals/stats');
    return response.data;
  },

  async createProposal(request: CreateProposalRequest): Promise<Proposal> {
    const response = await apiClient.post<Proposal>('/proposals', request);
    return response.data;
  },

  async updateProposal(id: string, request: UpdateProposalRequest): Promise<Proposal> {
    const response = await apiClient.patch<Proposal>(`/proposals/${id}`, request);
    return response.data;
  },

  async sendProposal(id: string): Promise<Proposal> {
    const response = await apiClient.post<Proposal>(`/proposals/${id}/send`);
    return response.data;
  },

  async deleteProposal(id: string): Promise<void> {
    await apiClient.delete(`/proposals/${id}`);
  },
};
