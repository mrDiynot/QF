/**
 * React Query hooks for Search API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchService, type SearchRequest, type SearchResult } from '@/services/api/search.service';
import { queryConfig } from '@/lib/query-config';

// Query keys
export const searchKeys = {
  all: ['search'] as const,
  quick: (query: string) => [...searchKeys.all, 'quick', query] as const,
  global: (params: SearchRequest) => [...searchKeys.all, 'global', params] as const,
  suggestions: (query: string) => [...searchKeys.all, 'suggestions', query] as const,
  recent: () => [...searchKeys.all, 'recent'] as const,
};

/**
 * Quick search hook - for global search bar
 */
export function useQuickSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: searchKeys.quick(query),
    queryFn: () => searchService.quickSearch(query),
    enabled: enabled && query.length >= 2,
    ...queryConfig.standard,
  });
}

/**
 * Full search hook - for search results page
 */
export function useGlobalSearch(params: SearchRequest) {
  return useQuery({
    queryKey: searchKeys.global(params),
    queryFn: () => searchService.search(params),
    enabled: params.query.length >= 2,
    ...queryConfig.standard,
  });
}

/**
 * Search suggestions
 */
export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: searchKeys.suggestions(query),
    queryFn: () => searchService.getSuggestions(query),
    enabled: query.length >= 1,
    ...queryConfig.static, // Suggestions can be cached longer
  });
}

/**
 * Recent searches
 */
export function useRecentSearches() {
  return useQuery({
    queryKey: searchKeys.recent(),
    queryFn: () => searchService.getRecentSearches(),
    ...queryConfig.static,
  });
}

/**
 * Clear recent searches mutation
 */
export function useClearRecentSearches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => searchService.clearRecentSearches(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.recent() });
    },
  });
}

// Type exports
export type { SearchResult };
