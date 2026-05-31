/**
 * Business API Service
 */

import { apiClient } from '@/lib/axios';
import type { BusinessSettings, UpdateBusinessSettingsRequest } from '@/types/api';

/**
 * BusinessProfile interface - mapped from BusinessSettings for sidebar display
 */
export interface BusinessProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  industry?: string;
  companySize?: string;
  logoUrl?: string;
  timezone?: string;
  currency?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const businessService = {
  /**
   * Gets business profile by fetching settings and mapping to profile format
   * The backend uses /Business/settings, not /Business/profile
   */
  getBusinessProfile: async (): Promise<BusinessProfile> => {
    const response = await apiClient.get<BusinessSettings>('/Business/settings');
    const settings = response.data;

    // Map BusinessSettings to BusinessProfile
    return {
      id: settings.id,
      name: settings.name,
      email: settings.email,
      phone: settings.phone,
      website: settings.website,
      address: settings.address,
      industry: settings.industry,
      companySize: settings.teamSize,
      logoUrl: settings.logoUrl,
      timezone: settings.timezone,
      isActive: settings.isActive,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  },

  getBusinessSettings: async () => {
    const response = await apiClient.get<BusinessSettings>('/Business/settings');
    return response.data;
  },

  updateBusinessSettings: async (data: UpdateBusinessSettingsRequest) => {
    const response = await apiClient.patch<BusinessSettings>('/Business/settings', data);
    return response.data;
  },

  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ logoUrl: string }>('/Business/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
