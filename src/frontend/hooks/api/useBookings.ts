/**
 * React Query hooks for Bookings API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  bookingsService,
  type Booking,
  type BookingStats,
  type CreateBookingRequest,
  type UpdateBookingRequest,
} from '@/services/api/bookings.service';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

// Query keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (params?: { startDate?: string; endDate?: string; status?: string }) =>
    [...bookingKeys.lists(), params] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  stats: () => [...bookingKeys.all, 'stats'] as const,
};

/**
 * Fetch bookings with optional filters
 */
export function useBookings(params?: {
  startDate?: Date;
  endDate?: Date;
  status?: string;
}) {
  const queryParams = params
    ? {
        startDate: params.startDate?.toISOString(),
        endDate: params.endDate?.toISOString(),
        status: params.status,
      }
    : undefined;

  return useQuery({
    queryKey: bookingKeys.list(queryParams),
    queryFn: () => bookingsService.getBookings(queryParams),
    ...queryConfig.realtime, // Bookings can change frequently (cancellations, etc.)
  });
}

/**
 * Fetch a specific booking by ID
 */
export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingsService.getBooking(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

/**
 * Fetch booking statistics
 */
export function useBookingStats() {
  return useQuery({
    queryKey: bookingKeys.stats(),
    queryFn: () => bookingsService.getStats(),
    ...queryConfig.dashboard,
  });
}

/**
 * Create a new booking
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateBookingRequest) =>
      bookingsService.createBooking(request),
    onSuccess: () => {
      invalidateListQueries(queryClient, bookingKeys.all, [['analytics']]);
    },
  });
}

/**
 * Update a booking
 */
export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateBookingRequest }) =>
      bookingsService.updateBooking(id, request),
    onSuccess: (data) => {
      invalidateListQueries(queryClient, bookingKeys.all);
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id), refetchType: 'all' });
    },
  });
}

/**
 * Cancel a booking
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingsService.cancelBooking(id, reason),
    onSuccess: (data) => {
      invalidateListQueries(queryClient, bookingKeys.all, [['analytics']]);
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id), refetchType: 'all' });
    },
  });
}

/**
 * Complete a booking
 */
export function useCompleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingsService.completeBooking(id),
    onSuccess: (data) => {
      invalidateListQueries(queryClient, bookingKeys.all, [['analytics']]);
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id), refetchType: 'all' });
    },
  });
}

/**
 * Delete a booking
 */
export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingsService.deleteBooking(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, bookingKeys.all, [['analytics']]);
    },
  });
}

// Type exports
export type { Booking, BookingStats };
