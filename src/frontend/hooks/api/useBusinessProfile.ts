/**
 * Business Profile Hook
 * Fetches business details for sidebar and settings
 */

import { useQuery } from '@tanstack/react-query';
import { businessService, type BusinessProfile } from '@/services/api/business.service';
import { queryConfig } from '@/lib/query-config';

/** Query key factory for business */
export const businessKeys = {
  all: ['business'] as const,
  profile: () => [...businessKeys.all, 'profile'] as const,
};

/**
 * Hook to fetch current business profile
 * Provides business name, industry, company size, logo, etc.
 */
export const useBusinessProfile = () => {
  return useQuery({
    queryKey: businessKeys.profile(),
    queryFn: businessService.getBusinessProfile,
    ...queryConfig.static, // Business profile rarely changes
    retry: 1,
  });
};

export type { BusinessProfile };

