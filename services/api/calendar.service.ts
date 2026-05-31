/**
 * Google Calendar Integration API Service
 * Handles OAuth flow and calendar operations
 * Sprint 36 Feature
 */

import { apiClient } from '@/lib/axios';

// ============================================================================
// Types
// ============================================================================

export interface CalendarIntegrationDto {
  id: string;
  provider: string;
  externalEmail: string;
  selectedCalendarId?: string;
  isSyncEnabled: boolean;
  syncBookingsToCalendar: boolean;
  blockBusyTimes: boolean;
  lastSyncAt?: string;
  status: string;
}

export interface CalendarDto {
  id: string;
  name: string;
  isPrimary: boolean;
  accessRole: string;
}

export interface UpdateCalendarSettingsRequest {
  selectedCalendarId?: string;
  isSyncEnabled?: boolean;
  syncBookingsToCalendar?: boolean;
  blockBusyTimes?: boolean;
}

export interface BusyTimeSlot {
  start: string;
  end: string;
}

export interface CreateCalendarEventRequest {
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees?: string[];
  location?: string;
}

// ============================================================================
// Service
// ============================================================================

export const calendarService = {
  /**
   * Get current Google Calendar integration
   * GET /api/v1/calendar-integrations/google
   */
  getGoogleIntegration: async (): Promise<CalendarIntegrationDto | null> => {
    try {
      const response = await apiClient.get<CalendarIntegrationDto>('/calendar-integrations/google');
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number } };
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Initiate Google Calendar OAuth flow
   * POST /api/v1/calendar-integrations/google/connect
   */
  initiateGoogleOAuth: async (redirectUri: string): Promise<{ authorizationUrl: string }> => {
    const response = await apiClient.post<{ authorizationUrl: string }>(
      '/calendar-integrations/google/connect',
      null,
      { params: { redirectUri } }
    );
    return response.data;
  },

  /**
   * Handle Google OAuth callback
   * POST /api/v1/calendar-integrations/google/callback
   */
  handleGoogleCallback: async (code: string, redirectUri: string): Promise<CalendarIntegrationDto> => {
    const response = await apiClient.post<CalendarIntegrationDto>(
      '/calendar-integrations/google/callback',
      null,
      { params: { code, redirectUri } }
    );
    return response.data;
  },

  /**
   * Disconnect Google Calendar
   * DELETE /api/v1/calendar-integrations/google
   */
  disconnectGoogle: async (): Promise<void> => {
    await apiClient.delete('/calendar-integrations/google');
  },

  /**
   * Get available calendars from Google
   * GET /api/v1/calendar-integrations/google/calendars
   */
  getGoogleCalendars: async (): Promise<CalendarDto[]> => {
    const response = await apiClient.get<CalendarDto[]>('/calendar-integrations/google/calendars');
    return response.data;
  },

  /**
   * Update Google Calendar sync settings
   * PUT /api/v1/calendar-integrations/google/settings
   */
  updateGoogleSettings: async (settings: UpdateCalendarSettingsRequest): Promise<CalendarIntegrationDto> => {
    const response = await apiClient.put<CalendarIntegrationDto>(
      '/calendar-integrations/google/settings',
      settings
    );
    return response.data;
  },

  /**
   * Get busy times from Google Calendar
   * GET /api/v1/calendar-integrations/google/busy-times
   */
  getBusyTimes: async (startTime: string, endTime: string): Promise<BusyTimeSlot[]> => {
    const response = await apiClient.get<BusyTimeSlot[]>('/calendar-integrations/google/busy-times', {
      params: { startTime, endTime },
    });
    return response.data;
  },

  /**
   * Create an event on Google Calendar
   * POST /api/v1/calendar-integrations/google/events
   */
  createEvent: async (request: CreateCalendarEventRequest): Promise<{ eventId: string }> => {
    const response = await apiClient.post<{ eventId: string }>(
      '/calendar-integrations/google/events',
      request
    );
    return response.data;
  },

  /**
   * Open OAuth popup for Google Calendar connection
   */
  openOAuthPopup: (authorizationUrl: string): Promise<{ code: string }> => {
    return new Promise((resolve, reject) => {
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        authorizationUrl,
        'Google Calendar OAuth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
      );

      if (!popup) {
        reject(new Error('Failed to open popup window. Please allow popups for this site.'));
        return;
      }

      const pollTimer = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollTimer);
          reject(new Error('OAuth popup was closed before completion'));
        }
      }, 500);

      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data.type === 'google-calendar-callback') {
          clearInterval(pollTimer);
          window.removeEventListener('message', messageHandler);
          popup.close();

          if (event.data.error) {
            reject(new Error(event.data.errorDescription || event.data.error));
          } else {
            resolve({ code: event.data.code });
          }
        }
      };

      window.addEventListener('message', messageHandler);
    });
  },
};

export default calendarService;
