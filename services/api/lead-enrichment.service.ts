import { apiClient } from '@/lib/axios';

// ============================================================================
// Lead Enrichment Types
// ============================================================================

export interface EnrichedLeadData {
  companyName?: string;
  companySize?: string;
  industry?: string;
  companyLinkedIn?: string;
  personLinkedIn?: string;
  jobTitle?: string;
  location?: string;
  companyWebsite?: string;
  companyRevenue?: string;
  technologyStack?: string[];
  socialProfiles?: Record<string, string>;
}

export interface EnrichmentResult {
  leadId: string;
  enrichedAt: string;
  source: string;
  data: EnrichedLeadData;
  confidenceScore: number;
}

export interface BulkEnrichmentRequest {
  leadIds: string[];
}

export interface BulkEnrichmentResult {
  totalRequested: number;
  enrichedCount: number;
  failedCount: number;
  results: EnrichmentResult[];
}

export interface CompanyInfo {
  domain: string;
  name: string;
  industry?: string;
  size?: string;
  employeeCount?: string;
  location?: string;
  website?: string;
  description?: string;
  founded?: number;
  linkedIn?: string;
  revenue?: string;
  technologies?: string[];
}

export interface PersonInfo {
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  linkedIn?: string;
  twitter?: string;
  bio?: string;
}

// ============================================================================
// Lead Enrichment Service
// ============================================================================

export const leadEnrichmentService = {
  enrichLead: async (leadId: string): Promise<EnrichmentResult> => {
    const { data } = await apiClient.post<EnrichmentResult>(`/leads/enrich/${leadId}`);
    return data;
  },

  bulkEnrichLeads: async (request: BulkEnrichmentRequest): Promise<BulkEnrichmentResult> => {
    const { data } = await apiClient.post<BulkEnrichmentResult>('/leads/enrich/bulk', request);
    return data;
  },

  lookupCompany: async (domain: string): Promise<CompanyInfo> => {
    const { data } = await apiClient.get<CompanyInfo>(`/leads/enrich/company?domain=${encodeURIComponent(domain)}`);
    return data;
  },

  lookupPerson: async (email: string): Promise<PersonInfo> => {
    const { data } = await apiClient.get<PersonInfo>(`/leads/enrich/person?email=${encodeURIComponent(email)}`);
    return data;
  },
};

export default leadEnrichmentService;
