/**
 * Activity API Service
 * Handles recent activity and audit log retrieval
 */

import { apiClient } from '@/lib/axios';

export interface ActivityItem {
  id: string;
  userId?: string;
  username?: string;
  entityType?: string;
  entityId?: string;
  action: string;
  oldValues?: string;
  newValues?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ActivityParams {
  limit?: number;
}

export interface ActivityByEntityParams extends ActivityParams {
  entityType: string;
}

export interface ActivityByUserParams extends ActivityParams {
  userId: string;
}

class ActivityService {
  private readonly baseUrl = '/activity';

  /**
   * Get recent activity for the current business
   */
  async getRecentActivity(params: ActivityParams = {}): Promise<ActivityItem[]> {
    const { limit = 10 } = params;
    const response = await apiClient.get<ActivityItem[]>(`${this.baseUrl}/recent`, {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Get activity by entity type
   */
  async getActivityByEntityType(params: ActivityByEntityParams): Promise<ActivityItem[]> {
    const { entityType, limit = 10 } = params;
    const response = await apiClient.get<ActivityItem[]>(
      `${this.baseUrl}/by-entity/${entityType}`,
      { params: { limit } }
    );
    return response.data;
  }

  /**
   * Get activity by user
   */
  async getActivityByUser(params: ActivityByUserParams): Promise<ActivityItem[]> {
    const { userId, limit = 10 } = params;
    const response = await apiClient.get<ActivityItem[]>(
      `${this.baseUrl}/by-user/${userId}`,
      { params: { limit } }
    );
    return response.data;
  }
}

export const activityService = new ActivityService();
