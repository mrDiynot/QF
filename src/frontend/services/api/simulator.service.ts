/**
 * Simulator API Service
 * Aggregates data from various services for the simulator dashboard
 */

import { chatWidgetsService, ChatWidget } from './chat-widgets.service';
import { formsService } from './forms.service';
import { conversationsService, messagesService } from './conversations.service';
import { leadsService } from './leads.service';
import { analyticsService } from './analytics.service';
import type { Form, Lead, Conversation, PaginatedResponse, DashboardMetrics } from '@/types/api';

export interface SimulatorStats {
  activeSessions: number;
  testLeadsCreated: number;
  messagesSent: number;
  avgResponseTime: string;
}

export interface RecentActivity {
  id: string;
  type: 'chat' | 'form' | 'sms' | 'ai' | 'webhook' | 'whatsapp' | 'voice';
  message: string;
  time: string;
  status: 'success' | 'error' | 'pending';
  timestamp: Date;
}

export interface SimulatorDashboardData {
  stats: SimulatorStats;
  recentActivity: RecentActivity[];
  chatWidgets: ChatWidget[];
  forms: Form[];
  activeConversations: number;
}

// Helper to format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

export const simulatorService = {
  /**
   * Get simulator dashboard stats
   * Uses real data from analytics, messages, conversations, and leads endpoints
   */
  getStats: async (): Promise<SimulatorStats> => {
    try {
      // Fetch data from multiple endpoints in parallel
      const [conversationsRes, leadsRes, messagesRes, analyticsRes] = await Promise.allSettled([
        conversationsService.getConversations({ pageSize: 1 }),
        leadsService.getLeads({ pageSize: 1 }),
        messagesService.getMessages({ pageSize: 1 }),
        analyticsService.getDashboardMetrics(),
      ]);

      // Extract total counts from paginated responses
      const activeSessions = conversationsRes.status === 'fulfilled'
        ? (conversationsRes.value as PaginatedResponse<Conversation>).totalItems || 0
        : 0;

      const testLeadsCreated = leadsRes.status === 'fulfilled'
        ? (leadsRes.value as PaginatedResponse<Lead>).totalItems || 0
        : 0;

      // Get actual message count from messages endpoint
      const messagesSent = messagesRes.status === 'fulfilled'
        ? (messagesRes.value as PaginatedResponse<unknown>).totalItems || 0
        : 0;

      // Get average response time from analytics (in seconds, convert to display format)
      let avgResponseTime = '—';
      if (analyticsRes.status === 'fulfilled') {
        const metrics = analyticsRes.value as DashboardMetrics;
        if (metrics.averageResponseTime !== undefined && metrics.averageResponseTime !== null) {
          // Format response time: if < 60s show as "X.Xs", else show as "Xm Xs"
          const seconds = metrics.averageResponseTime;
          if (seconds < 60) {
            avgResponseTime = `${seconds.toFixed(1)}s`;
          } else {
            const mins = Math.floor(seconds / 60);
            const secs = Math.round(seconds % 60);
            avgResponseTime = `${mins}m ${secs}s`;
          }
        }
      }

      return {
        activeSessions,
        testLeadsCreated,
        messagesSent,
        avgResponseTime,
      };
    } catch (error) {
      console.error('Error fetching simulator stats:', error);
      return {
        activeSessions: 0,
        testLeadsCreated: 0,
        messagesSent: 0,
        avgResponseTime: '—',
      };
    }
  },

  /**
   * Get recent activity for the simulator
   */
  getRecentActivity: async (): Promise<RecentActivity[]> => {
    try {
      // Fetch recent conversations and leads
      const [conversationsRes, leadsRes] = await Promise.allSettled([
        conversationsService.getConversations({ pageSize: 10 }),
        leadsService.getLeads({ pageSize: 10 }),
      ]);

      const activities: RecentActivity[] = [];

      // Add conversation activities
      if (conversationsRes.status === 'fulfilled') {
        const conversations = (conversationsRes.value as PaginatedResponse<Conversation>).items || [];
        conversations.forEach((conv) => {
          const channelType = conv.channelType?.toLowerCase() || 'chat';
          activities.push({
            id: conv.id,
            type: channelType === 'sms' ? 'sms' : channelType === 'whatsapp' ? 'whatsapp' : 'chat',
            message: `${channelType === 'sms' ? 'SMS' : channelType === 'whatsapp' ? 'WhatsApp' : 'Chat'} conversation (${conv.contactId})`,
            time: formatRelativeTime(new Date(conv.lastMessageAt || conv.createdAt)),
            status: conv.status === 'active' ? 'success' : 'pending',
            timestamp: new Date(conv.lastMessageAt || conv.createdAt),
          });
        });
      }

      // Add lead activities
      if (leadsRes.status === 'fulfilled') {
        const leads = (leadsRes.value as PaginatedResponse<Lead>).items || [];
        leads.forEach((lead) => {
          activities.push({
            id: lead.id,
            type: lead.score && lead.score >= 70 ? 'ai' : 'form',
            message: lead.score && lead.score >= 70 
              ? `Lead qualified with score ${lead.score}/100` 
              : `New lead: ${lead.firstName} ${lead.lastName}`,
            time: formatRelativeTime(new Date(lead.createdAt)),
            status: 'success',
            timestamp: new Date(lead.createdAt),
          });
        });
      }

      // Sort by timestamp (newest first) and return top 5
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  },

  /**
   * Get all chat widgets
   */
  getChatWidgets: async (): Promise<ChatWidget[]> => {
    try {
      return await chatWidgetsService.getChatWidgets();
    } catch (error) {
      console.error('Error fetching chat widgets:', error);
      return [];
    }
  },

  /**
   * Get all forms
   */
  getForms: async (): Promise<Form[]> => {
    try {
      const response = await formsService.getForms({ pageSize: 100 });
      return response.items || [];
    } catch (error) {
      console.error('Error fetching forms:', error);
      return [];
    }
  },

  /**
   * Get complete dashboard data
   *
   * OPTIMIZED: Batches all API calls into a single Promise.all to avoid
   * duplicate requests. Previously getStats() and getRecentActivity() both
   * called conversations and leads endpoints separately.
   */
  getDashboardData: async (): Promise<SimulatorDashboardData> => {
    // Batch ALL API calls together to avoid duplicate requests
    const [
      conversationsRes,
      leadsRes,
      messagesRes,
      analyticsRes,
      chatWidgets,
      formsRes,
    ] = await Promise.allSettled([
      conversationsService.getConversations({ pageSize: 10 }), // Get 10 for activity
      leadsService.getLeads({ pageSize: 10 }), // Get 10 for activity
      messagesService.getMessages({ pageSize: 1 }), // Just need count
      analyticsService.getDashboardMetrics(),
      chatWidgetsService.getChatWidgets(),
      formsService.getForms({ pageSize: 100 }),
    ]);

    // Extract stats from responses
    const activeSessions = conversationsRes.status === 'fulfilled'
      ? (conversationsRes.value as PaginatedResponse<Conversation>).totalItems || 0
      : 0;

    const testLeadsCreated = leadsRes.status === 'fulfilled'
      ? (leadsRes.value as PaginatedResponse<Lead>).totalItems || 0
      : 0;

    const messagesSent = messagesRes.status === 'fulfilled'
      ? (messagesRes.value as PaginatedResponse<unknown>).totalItems || 0
      : 0;

    // Format average response time
    let avgResponseTime = '—';
    if (analyticsRes.status === 'fulfilled') {
      const metrics = analyticsRes.value as DashboardMetrics;
      if (metrics.averageResponseTime !== undefined && metrics.averageResponseTime !== null) {
        const seconds = metrics.averageResponseTime;
        if (seconds < 60) {
          avgResponseTime = `${seconds.toFixed(1)}s`;
        } else {
          const mins = Math.floor(seconds / 60);
          const secs = Math.round(seconds % 60);
          avgResponseTime = `${mins}m ${secs}s`;
        }
      }
    }

    const stats: SimulatorStats = {
      activeSessions,
      testLeadsCreated,
      messagesSent,
      avgResponseTime,
    };

    // Build recent activity from conversations and leads
    const activities: RecentActivity[] = [];

    if (conversationsRes.status === 'fulfilled') {
      const conversations = (conversationsRes.value as PaginatedResponse<Conversation>).items || [];
      conversations.forEach((conv) => {
        const channelType = conv.channelType?.toLowerCase() || 'chat';
        activities.push({
          id: conv.id,
          type: channelType === 'sms' ? 'sms' : channelType === 'whatsapp' ? 'whatsapp' : 'chat',
          message: `${channelType === 'sms' ? 'SMS' : channelType === 'whatsapp' ? 'WhatsApp' : 'Chat'} conversation (${conv.contactId})`,
          time: formatRelativeTime(new Date(conv.lastMessageAt || conv.createdAt)),
          status: conv.status === 'active' ? 'success' : 'pending',
          timestamp: new Date(conv.lastMessageAt || conv.createdAt),
        });
      });
    }

    if (leadsRes.status === 'fulfilled') {
      const leads = (leadsRes.value as PaginatedResponse<Lead>).items || [];
      leads.forEach((lead) => {
        activities.push({
          id: lead.id,
          type: lead.score && lead.score >= 70 ? 'ai' : 'form',
          message: lead.score && lead.score >= 70
            ? `Lead qualified with score ${lead.score}/100`
            : `New lead: ${lead.firstName} ${lead.lastName}`,
          time: formatRelativeTime(new Date(lead.createdAt)),
          status: 'success',
          timestamp: new Date(lead.createdAt),
        });
      });
    }

    // Sort by timestamp (newest first) and return top 5
    const recentActivity = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);

    return {
      stats,
      recentActivity,
      chatWidgets: chatWidgets.status === 'fulfilled' ? chatWidgets.value : [],
      forms: formsRes.status === 'fulfilled'
        ? (formsRes.value as PaginatedResponse<Form>).items || []
        : [],
      activeConversations: activeSessions,
    };
  },

  /**
   * Test a chat widget by ID
   */
  testChatWidget: async (widgetId: string): Promise<ChatWidget> => {
    return chatWidgetsService.getChatWidgetById(widgetId);
  },

  /**
   * Test a form by ID
   */
  testForm: async (formId: string): Promise<Form> => {
    return formsService.getFormById(formId);
  },

  /**
   * Submit test form data
   */
  submitTestForm: async (formId: string, data: Record<string, unknown>) => {
    return formsService.submitForm(formId, data);
  },

  // ============================================================================
  // Real AI Orchestration API (triggers real backend pipelines)
  // ============================================================================

  /**
   * Simulate an SMS message through real AI orchestration pipeline
   */
  simulateSms: async (fromPhone: string, toPhone: string, message: string): Promise<SimulationResult> => {
    const { apiClient } = await import('@/lib/axios');
    const response = await apiClient.post<SimulationResult>('/simulator/simulate-sms', {
      fromPhone,
      toPhone,
      message,
    });
    return response.data;
  },

  /**
   * Simulate a WhatsApp message through real AI orchestration pipeline
   */
  simulateWhatsApp: async (fromPhone: string, toPhone: string, message: string, profileName?: string): Promise<SimulationResult> => {
    const { apiClient } = await import('@/lib/axios');
    const response = await apiClient.post<SimulationResult>('/simulator/simulate-whatsapp', {
      fromPhone,
      toPhone,
      message,
      profileName,
    });
    return response.data;
  },

  /**
   * Simulate a form submission through real AI orchestration pipeline
   */
  simulateForm: async (name: string, email: string, phone?: string, message?: string): Promise<SimulationResult> => {
    const { apiClient } = await import('@/lib/axios');
    const response = await apiClient.post<SimulationResult>('/simulator/simulate-form', {
      name,
      email,
      phone,
      message,
    });
    return response.data;
  },

  /**
   * Analyze a message with real AI (intent + sentiment)
   */
  analyzeMessage: async (message: string): Promise<AIAnalysisResult> => {
    const { apiClient } = await import('@/lib/axios');
    const response = await apiClient.post<AIAnalysisResult>('/simulator/analyze-message', {
      message,
    });
    return response.data;
  },

  /**
   * Get AI orchestration status
   */
  getAIStatus: async (): Promise<AIOrchestrationStatus> => {
    const { apiClient } = await import('@/lib/axios');
    const response = await apiClient.get<AIOrchestrationStatus>('/simulator/ai-status');
    return response.data;
  },
};

// ============================================================================
// Types for AI Orchestration
// ============================================================================

export interface SimulationResult {
  success: boolean;
  channel: string;
  leadId?: string;
  conversationId?: string;
  messageId?: string;
  isNewLead: boolean;
  isNewConversation?: boolean;
  aiJobsEnqueued?: string[];
  message?: string;
}

export interface AIAnalysisResult {
  message: string;
  intent: {
    primaryIntent: string;
    confidence: number;
  };
  sentiment: {
    sentiment: string;
    score: number;
    confidence: number;
  };
  processingTimeMs: number;
  analyzedAt: string;
  model: string;
}

export interface AIOrchestrationStatus {
  isActive: boolean;
  defaultModel: string;
  flagshipModel: string;
  fastModel: string;
  supportedChannels?: string[];
  aiCapabilities?: string[];
  orchestrationFlow?: string[];
}
