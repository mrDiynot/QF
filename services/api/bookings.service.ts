import { apiClient } from '@/lib/axios';

export interface Booking {
  id: string;
  leadId: string;
  leadName?: string;
  leadEmail?: string;
  conversationId?: string;
  assignedToUserId?: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'noshow';
  meetingType?: 'video' | 'phone' | 'in_person';
  meetingUrl?: string;
  timezone: string;
  confirmationSentAt?: string;
  reminderSentAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingStats {
  totalBookings: number;
  todayCount: number;
  thisWeekCount: number;
  upcomingCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
}

export interface CreateBookingRequest {
  leadId: string;
  conversationId?: string;
  assignedToUserId?: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration?: number;
  meetingUrl?: string;
  timezone?: string;
  notes?: string;
}

export interface UpdateBookingRequest {
  title?: string;
  description?: string;
  scheduledAt?: string;
  duration?: number;
  status?: string;
  assignedToUserId?: string;
  meetingUrl?: string;
  notes?: string;
}

export const bookingsService = {
  async getBookings(params?: { startDate?: string; endDate?: string; status?: string }): Promise<Booking[]> {
    try {
      const response = await apiClient.get<Booking[]>('/bookings', { params });
      return response.data || [];
    } catch (error) {
      console.error('[Bookings] Failed to get bookings:', error);
      return [];
    }
  },

  async getBooking(id: string): Promise<Booking | null> {
    try {
      const response = await apiClient.get<Booking>(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error('[Bookings] Failed to get booking:', error);
      return null;
    }
  },

  async getStats(): Promise<BookingStats> {
    try {
      const response = await apiClient.get<BookingStats>('/bookings/stats');
      return response.data || {
        totalBookings: 0,
        todayCount: 0,
        thisWeekCount: 0,
        upcomingCount: 0,
        completedCount: 0,
        cancelledCount: 0,
        noShowCount: 0,
      };
    } catch (error) {
      console.error('[Bookings] Failed to get stats:', error);
      return {
        totalBookings: 0,
        todayCount: 0,
        thisWeekCount: 0,
        upcomingCount: 0,
        completedCount: 0,
        cancelledCount: 0,
        noShowCount: 0,
      };
    }
  },

  async createBooking(request: CreateBookingRequest): Promise<Booking> {
    const response = await apiClient.post<Booking>('/bookings', request);
    return response.data;
  },

  async updateBooking(id: string, request: UpdateBookingRequest): Promise<Booking> {
    const response = await apiClient.patch<Booking>(`/bookings/${id}`, request);
    return response.data;
  },

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const response = await apiClient.post<Booking>(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  async completeBooking(id: string): Promise<Booking> {
    const response = await apiClient.post<Booking>(`/bookings/${id}/complete`);
    return response.data;
  },

  async deleteBooking(id: string): Promise<void> {
    await apiClient.delete(`/bookings/${id}`);
  },
};
