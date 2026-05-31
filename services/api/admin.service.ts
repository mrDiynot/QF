/**
 * Admin Portal API Service
 *
 * Provides all admin-specific API calls for the QualiFlow AI admin portal.
 * Uses a dedicated axios instance with admin JWT token from localStorage.
 */

import axios from 'axios';
import { config } from '@/lib/config';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminMfaVerifyRequest,
  AdminMfaVerifyResponse,
  AdminMfaSetupResponse,
  AdminSession,
  AdminUser,
  AdminBusinessQuery,
  AdminBusinessListItem,
  AdminBusinessDetail,
  AdminUserListItem,
  AdminUserDetail,
  AdminAuditLogQuery,
  AdminAuditLog,
  AdminDashboardMetrics,
  AdminSubscriptionQuery,
  AdminSubscription,
  AdminSubscriptionDetail,
  AdminPlan,
  AdminPagedResult,
  ChangePlanRequest,
  CancelSubscriptionRequest,
  Faq,
  FaqRequest,
  Testimonial,
  TestimonialRequest,
  CmsPage,
  CmsPageRequest,
  UpdateStatisticRequest,
  UpdateTrustedCompanyRequest,
  CmsPricingAddOn,
  CmsPricingAddOnRequest,
  PricingFeatureComparison,
  PricingFeatureComparisonRequest,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  TicketQuery,
  SupportTicket,
  TicketMessage,
  TicketDashboardStats,
  AddTicketMessageRequest,
  UpdateTicketStatusRequest,
  AssignTicketRequest,
  UpdateTicketPriorityRequest,
} from '@/types/admin';

// ============================================================================
// Types exported from this module (not in types/admin.ts)
// ============================================================================

export interface AdminUserQuery {
  search?: string;
  businessId?: string;
  role?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ExportRequest {
  format: 'csv' | 'json' | 'xlsx';
  startDate?: string;
  endDate?: string;
  filters?: Record<string, string>;
}

export class AdminApiError extends Error {
  statusCode: number;
  title: string;
  detail: string;
  errors: Record<string, string[]>;

  constructor(statusCode: number, title: string, detail: string, errors: Record<string, string[]> = {}) {
    super(detail || title);
    this.name = 'AdminApiError';
    this.statusCode = statusCode;
    this.title = title;
    this.detail = detail;
    this.errors = errors;
  }
}

// ============================================================================
// Admin API Client
// ============================================================================

const API_BASE = config.api.baseUrl;

const adminApiClient = axios.create({
  baseURL: `${config.api.baseUrl}/api/${config.api.version}`,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach admin JWT
adminApiClient.interceptors.request.use((cfg) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
  }
  return cfg;
});

// Track whether a token refresh is in progress to prevent concurrent refreshes
let isAdminRefreshing = false;
let adminRefreshPromise: Promise<boolean> | null = null;

/**
 * Check if the request URL is an auth endpoint where 401s are expected
 * (e.g., login with wrong credentials, refresh with expired token)
 */
function isAdminAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return url.includes('/admin/auth/login') ||
         url.includes('/admin/auth/refresh') ||
         url.includes('/admin/auth/logout');
}

// Response interceptor with token refresh + retry logic
adminApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401s on non-auth endpoints, client-side, and not already retried
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !originalRequest._adminRetry &&
      !isAdminAuthEndpoint(originalRequest?.url)
    ) {
      originalRequest._adminRetry = true;

      // Attempt token refresh before giving up
      try {
        if (!isAdminRefreshing) {
          isAdminRefreshing = true;
          adminRefreshPromise = (async () => {
            const refreshToken = localStorage.getItem('admin_refresh_token');
            if (!refreshToken) return false;
            const { data } = await axios.post(
              `${config.api.baseUrl}/api/${config.api.version}/admin/auth/refresh`,
              { refreshToken },
            );
            if (data?.accessToken) {
              localStorage.setItem('admin_access_token', data.accessToken);
              if (data.refreshToken) {
                localStorage.setItem('admin_refresh_token', data.refreshToken);
              }
              return true;
            }
            return false;
          })();
        }

        const refreshed = await adminRefreshPromise;
        isAdminRefreshing = false;
        adminRefreshPromise = null;

        if (refreshed) {
          // Retry the original request with the new token
          const newToken = localStorage.getItem('admin_access_token');
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return adminApiClient(originalRequest);
        }
      } catch {
        isAdminRefreshing = false;
        adminRefreshPromise = null;
      }

      // Refresh failed — clear session and redirect
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login?reason=session_expired';
    }

    const message = error.response?.data?.detail || error.response?.data?.title || error.message;
    return Promise.reject(new Error(message));
  },
);

// ============================================================================
// Generic Admin Fetch (used by pages that make direct API calls)
// ============================================================================

export async function adminFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
  });

  if (!response.ok) {
    let errorData: { title?: string; detail?: string; errors?: Record<string, string[]>; status?: number } = {};
    try { errorData = await response.json(); } catch { /* ignore */ }
    throw new AdminApiError(
      response.status,
      errorData.title || 'Request Failed',
      errorData.detail || response.statusText,
      errorData.errors || {},
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// ============================================================================
// Auth Service
// ============================================================================

export const adminAuthService = {
  login: async (request: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const { data } = await adminApiClient.post('/admin/auth/login', request);
    return data;
  },

  verifyMfa: async (request: AdminMfaVerifyRequest): Promise<AdminMfaVerifyResponse> => {
    const { data } = await adminApiClient.post('/admin/auth/verify-mfa', request);
    return data;
  },

  enableMfa: async (sessionToken: string): Promise<AdminMfaSetupResponse> => {
    const { data } = await adminApiClient.post('/admin/auth/enable-mfa', null, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    return data;
  },

  verifyMfaSetup: async (request: AdminMfaVerifyRequest): Promise<AdminMfaVerifyResponse> => {
    const { data } = await adminApiClient.post('/admin/auth/verify-mfa-setup', request);
    return data;
  },

  confirmMfaSetup: async (
    sessionToken: string,
    secret: string,
    code: string,
  ): Promise<{ session: AdminSession }> => {
    const { data } = await adminApiClient.post(
      '/admin/auth/confirm-mfa-setup',
      { secret, code },
      { headers: { Authorization: `Bearer ${sessionToken}` } },
    );
    return data;
  },

  refreshToken: async (): Promise<{ accessToken: string; refreshToken: string }> => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('admin_refresh_token') : null;
    const { data } = await adminApiClient.post('/admin/auth/refresh', { refreshToken });
    if (typeof window !== 'undefined' && data.accessToken) {
      localStorage.setItem('admin_access_token', data.accessToken);
      if (data.refreshToken) localStorage.setItem('admin_refresh_token', data.refreshToken);
    }
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await adminApiClient.post('/admin/auth/logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
      }
    }
  },

  storeSession: (session: { accessToken: string; refreshToken: string; adminUser: AdminUser }): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_access_token', session.accessToken);
      localStorage.setItem('admin_refresh_token', session.refreshToken);
      localStorage.setItem('admin_user', JSON.stringify(session.adminUser));
    }
  },

  getStoredSession: (): { accessToken: string; adminUser: AdminUser } | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('admin_access_token');
    const user = localStorage.getItem('admin_user');
    if (!token || !user) return null;
    try {
      return { accessToken: token, adminUser: JSON.parse(user) };
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('admin_access_token');
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
    await adminApiClient.post('/admin/auth/change-password', { currentPassword, newPassword, confirmNewPassword: confirmPassword });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await adminApiClient.post('/admin/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await adminApiClient.post('/admin/auth/reset-password', { token, newPassword });
  },
};

// ============================================================================
// User Service (tenant users)
// ============================================================================

export const adminUserService = {
  getUsers: async (query: AdminUserQuery) => {
    const { data } = await adminApiClient.get<AdminPagedResult<AdminUserListItem>>('/admin/business-users', { params: query });
    return data;
  },
  getUser: async (userId: string) => {
    const { data } = await adminApiClient.get<AdminUserDetail>(`/admin/business-users/${userId}`);
    return data;
  },
  getBusinessUsers: async (businessId: string) => {
    const { data } = await adminApiClient.get<AdminUserListItem[]>(`/admin/businesses/${businessId}/users`);
    return data;
  },
  suspendUser: async (userId: string, reason: string) => {
    const { data } = await adminApiClient.post(`/admin/business-users/${userId}/suspend`, { reason });
    return data;
  },
  reactivateUser: async (userId: string) => {
    const { data } = await adminApiClient.post(`/admin/business-users/${userId}/reactivate`);
    return data;
  },
  resetPassword: async (userId: string) => {
    const { data } = await adminApiClient.post(`/admin/business-users/${userId}/reset-password`);
    return data;
  },
  startImpersonation: async (request: { userId: string; reason: string }) => {
    const { data } = await adminApiClient.post<{ token: string }>(`/admin/business-users/${request.userId}/impersonate`, request);
    return data;
  },
  endImpersonation: async () => {
    const { data } = await adminApiClient.post('/admin/business-users/stop-impersonation');
    return data;
  },
};

// ============================================================================
// Business Service
// ============================================================================

export const adminBusinessService = {
  getBusinesses: async (query: AdminBusinessQuery) => {
    const { data } = await adminApiClient.get<AdminPagedResult<AdminBusinessListItem>>('/admin/businesses', { params: query });
    return data;
  },
  getBusiness: async (id: string) => {
    const { data } = await adminApiClient.get<AdminBusinessDetail>(`/admin/businesses/${id}`);
    return data;
  },
  suspendBusiness: async (businessId: string, reason: string) => {
    const { data } = await adminApiClient.post(`/admin/businesses/${businessId}/suspend`, { reason });
    return data;
  },
  reactivateBusiness: async (businessId: string) => {
    const { data } = await adminApiClient.post(`/admin/businesses/${businessId}/reactivate`);
    return data;
  },
  getBusinessActivity: async (businessId: string) => {
    const { data } = await adminApiClient.get(`/admin/businesses/${businessId}/activity`);
    return data;
  },
};

// ============================================================================
// CMS Service
// ============================================================================

export const adminCmsService = {
  // FAQs
  getFaqs: async () => { const { data } = await adminApiClient.get<Faq[]>('/admin/cms/faqs'); return data; },
  getFaq: async (id: string) => { const { data } = await adminApiClient.get<Faq>(`/admin/cms/faqs/${id}`); return data; },
  createFaq: async (request: FaqRequest) => { const { data } = await adminApiClient.post<Faq>('/admin/cms/faqs', request); return data; },
  updateFaq: async (id: string, request: FaqRequest) => { const { data } = await adminApiClient.put<Faq>(`/admin/cms/faqs/${id}`, request); return data; },
  deleteFaq: async (id: string) => { await adminApiClient.delete(`/admin/cms/faqs/${id}`); },
  // Testimonials
  getTestimonials: async () => { const { data } = await adminApiClient.get<Testimonial[]>('/admin/cms/testimonials'); return data; },
  getTestimonial: async (id: string) => { const { data } = await adminApiClient.get<Testimonial>(`/admin/cms/testimonials/${id}`); return data; },
  createTestimonial: async (request: TestimonialRequest) => { const { data } = await adminApiClient.post<Testimonial>('/admin/cms/testimonials', request); return data; },
  updateTestimonial: async (id: string, request: TestimonialRequest) => { const { data } = await adminApiClient.put<Testimonial>(`/admin/cms/testimonials/${id}`, request); return data; },
  deleteTestimonial: async (id: string) => { await adminApiClient.delete(`/admin/cms/testimonials/${id}`); },
  // Pages
  getPages: async () => { const { data } = await adminApiClient.get<CmsPage[]>('/admin/cms/pages'); return data; },
  getPage: async (id: string) => { const { data } = await adminApiClient.get<CmsPage>(`/admin/cms/pages/${id}`); return data; },
  createPage: async (request: CmsPageRequest) => { const { data } = await adminApiClient.post<CmsPage>('/admin/cms/pages', request); return data; },
  updatePage: async (id: string, request: CmsPageRequest) => { const { data } = await adminApiClient.put<CmsPage>(`/admin/cms/pages/${id}`, request); return data; },
  deletePage: async (id: string) => { await adminApiClient.delete(`/admin/cms/pages/${id}`); },
  // Statistics
  getStatistics: async () => { const { data } = await adminApiClient.get('/admin/cms/statistics'); return data; },
  updateStatistic: async (id: string, request: UpdateStatisticRequest) => { const { data } = await adminApiClient.put(`/admin/cms/statistics/${id}`, request); return data; },
  // Trusted Companies
  getTrustedCompanies: async () => { const { data } = await adminApiClient.get('/admin/cms/trusted-companies'); return data; },
  updateTrustedCompany: async (id: string, request: UpdateTrustedCompanyRequest) => { const { data } = await adminApiClient.put(`/admin/cms/trusted-companies/${id}`, request); return data; },
  // Pricing Add-Ons
  getPricingAddOns: async () => { const { data } = await adminApiClient.get<CmsPricingAddOn[]>('/admin/cms/pricing-addons'); return data; },
  updatePricingAddOn: async (id: string, request: CmsPricingAddOnRequest) => { const { data } = await adminApiClient.put(`/admin/cms/pricing-addons/${id}`, request); return data; },
  // Feature Comparisons
  getFeatureComparisons: async () => { const { data } = await adminApiClient.get<PricingFeatureComparison[]>('/admin/cms/feature-comparisons'); return data; },
  updateFeatureComparison: async (id: string, request: PricingFeatureComparisonRequest) => { const { data } = await adminApiClient.put(`/admin/cms/feature-comparisons/${id}`, request); return data; },
  // Blog Posts
  getBlogPosts: async () => { const { data } = await adminApiClient.get('/admin/cms/blogs'); return data; },
  getBlogPost: async (id: string) => { const { data } = await adminApiClient.get(`/admin/cms/blogs/${id}`); return data; },
  createBlogPost: async (request: CreateBlogPostRequest) => { const { data } = await adminApiClient.post('/admin/cms/blogs', request); return data; },
  updateBlogPost: async (id: string, request: UpdateBlogPostRequest) => { const { data } = await adminApiClient.put(`/admin/cms/blogs/${id}`, request); return data; },
  deleteBlogPost: async (id: string) => { await adminApiClient.delete(`/admin/cms/blogs/${id}`); },
  // Image Upload
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await adminApiClient.post<{ url: string; fileName: string; contentType: string; sizeBytes: number }>('/admin/cms/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};


// ============================================================================
// Subscription Service
// ============================================================================

export const adminSubscriptionService = {
  getSubscriptions: async (query: AdminSubscriptionQuery) => {
    const { data } = await adminApiClient.get<AdminPagedResult<AdminSubscription>>('/admin/subscriptions', { params: query });
    return data;
  },
  getSubscription: async (id: string) => {
    const { data } = await adminApiClient.get<AdminSubscriptionDetail>(`/admin/subscriptions/${id}`);
    return data;
  },
  getMetrics: async () => {
    const { data } = await adminApiClient.get('/admin/subscriptions/metrics');
    return data;
  },
  getPlans: async () => {
    const { data } = await adminApiClient.get<AdminPlan[]>('/admin/subscriptions/plans');
    return data;
  },
  changePlan: async (subscriptionId: string, request: ChangePlanRequest) => {
    const { data } = await adminApiClient.post(`/admin/subscriptions/${subscriptionId}/change-plan`, request);
    return data;
  },
  cancelSubscription: async (subscriptionId: string, request: CancelSubscriptionRequest) => {
    const { data } = await adminApiClient.post(`/admin/subscriptions/${subscriptionId}/cancel`, request);
    return data;
  },
  reactivateSubscription: async (subscriptionId: string) => {
    const { data } = await adminApiClient.post(`/admin/subscriptions/${subscriptionId}/reactivate`);
    return data;
  },
  extendTrial: async (subscriptionId: string, days: number) => {
    const { data } = await adminApiClient.post(`/admin/subscriptions/${subscriptionId}/extend-trial`, { days });
    return data;
  },
  applyCredit: async (subscriptionId: string, amount: number, reason: string) => {
    const { data } = await adminApiClient.post(`/admin/subscriptions/${subscriptionId}/apply-credit`, { amount, reason });
    return data;
  },
};

// ============================================================================
// Dashboard Service
// ============================================================================

export const adminDashboardService = {
  getMetrics: async (): Promise<AdminDashboardMetrics> => {
    const { data } = await adminApiClient.get<AdminDashboardMetrics>('/admin/dashboard/metrics');
    return data;
  },
};

// ============================================================================
// Audit Log Service
// ============================================================================

export const adminAuditLogService = {
  getAuditLogs: async (query: AdminAuditLogQuery) => {
    const { data } = await adminApiClient.get<AdminPagedResult<AdminAuditLog>>('/admin/audit-logs', { params: query });
    return data;
  },
  getAuditLog: async (id: string) => {
    const { data } = await adminApiClient.get<AdminAuditLog>(`/admin/audit-logs/${id}`);
    return data;
  },
  getEntityAuditLogs: async (entityType: string, entityId: string) => {
    const { data } = await adminApiClient.get<AdminAuditLog[]>(`/admin/audit-logs/entity/${entityType}/${entityId}`);
    return data;
  },
  exportAuditLogs: async (query: AdminAuditLogQuery): Promise<Blob> => {
    const { data } = await adminApiClient.get('/admin/audit-logs/export', {
      params: query,
      responseType: 'blob',
    });
    return data;
  },
};

// ============================================================================
// Coming Soon Service
// ============================================================================

export const adminComingSoonService = {
  getOverview: async (startDate?: string, endDate?: string) => {
    const { data } = await adminApiClient.get('/admin/coming-soon-analytics/overview', { params: { startDate, endDate } });
    return data;
  },
  getChatSessions: async (page: number, pageSize: number, startDate?: string, endDate?: string) => {
    const { data } = await adminApiClient.get('/admin/coming-soon-analytics/sessions', { params: { page, pageSize, startDate, endDate } });
    return data;
  },
  getWaitlistEntries: async (page: number, pageSize: number, startDate?: string, endDate?: string) => {
    const { data } = await adminApiClient.get('/admin/coming-soon-analytics/waitlist/entries', { params: { page, pageSize, startDate, endDate } });
    return data;
  },
  getAIUsage: async (startDate?: string, endDate?: string) => {
    const { data } = await adminApiClient.get('/admin/coming-soon-analytics/ai-usage', { params: { startDate, endDate } });
    return data;
  },
  getIntentDistribution: async (startDate?: string, endDate?: string) => {
    const { data } = await adminApiClient.get('/admin/coming-soon-analytics/intents', { params: { startDate, endDate } });
    return data;
  },
  getConversionFunnel: async (startDate?: string, endDate?: string) => {
    const { data } = await adminApiClient.get('/admin/coming-soon-analytics/funnel', { params: { startDate, endDate } });
    return data;
  },
};

// ============================================================================
// Billing Service
// ============================================================================

export const adminBillingService = {
  getMetrics: async () => {
    const { data } = await adminApiClient.get('/admin/billing/metrics');
    return data;
  },
  getMrrHistory: async (months: number) => {
    const { data } = await adminApiClient.get('/admin/billing/mrr-history', { params: { months } });
    return data;
  },
};

// ============================================================================
// System Health Service
// ============================================================================

export const adminSystemHealthService = {
  getHealth: async () => {
    const { data } = await adminApiClient.get('/admin/system/health');
    return data;
  },
  getJobs: async () => {
    const { data } = await adminApiClient.get('/admin/system/jobs');
    return data;
  },
  getExternalUsage: async () => {
    const { data } = await adminApiClient.get('/admin/system/external-usage');
    return data;
  },
  verifySeedData: async () => {
    const { data } = await adminApiClient.post('/admin/system/verify-seed-data');
    return data;
  },
};

// ============================================================================
// Admin User Management Service
// ============================================================================

export const adminAdminUserService = {
  getAdminUsers: async (query?: AdminUserQuery) => {
    const { data } = await adminApiClient.get('/admin/users', { params: query });
    return data;
  },
  getAdminUser: async (id: string) => {
    const { data } = await adminApiClient.get(`/admin/users/${id}`);
    return data;
  },
  createAdminUser: async (request: { email: string; firstName: string; lastName: string; role: string; ipWhitelist?: string[] }) => {
    const { data } = await adminApiClient.post('/admin/users', request);
    return data;
  },
  updateAdminUserRole: async (id: string, role: string) => {
    const { data } = await adminApiClient.patch(`/admin/users/${id}/role`, { role });
    return data;
  },
  updateAdminUserIpWhitelist: async (id: string, ipWhitelist: string[]) => {
    const { data } = await adminApiClient.patch(`/admin/users/${id}/ip-whitelist`, { ipWhitelist });
    return data;
  },
  deactivateAdminUser: async (id: string) => {
    const { data } = await adminApiClient.post(`/admin/users/${id}/deactivate`);
    return data;
  },
  reactivateAdminUser: async (id: string) => {
    const { data } = await adminApiClient.post(`/admin/users/${id}/reactivate`);
    return data;
  },
  resetAdminPassword: async (id: string) => {
    const { data } = await adminApiClient.post(`/admin/users/${id}/reset-password`);
    return data;
  },
};

// ============================================================================
// Support Service
// ============================================================================

export const adminSupportService = {
  getTickets: async (query: TicketQuery) => {
    const { data } = await adminApiClient.get<AdminPagedResult<SupportTicket>>('/admin/support/tickets', { params: query });
    return data;
  },
  getTicket: async (id: string) => {
    const { data } = await adminApiClient.get<SupportTicket>(`/admin/support/tickets/${id}`);
    return data;
  },
  getTicketMessages: async (ticketId: string, includeInternal = true) => {
    const { data } = await adminApiClient.get<TicketMessage[]>(`/admin/support/tickets/${ticketId}/messages`, { params: { includeInternal } });
    return data;
  },
  addMessage: async (ticketId: string, request: AddTicketMessageRequest) => {
    const { data } = await adminApiClient.post(`/admin/support/tickets/${ticketId}/messages`, request);
    return data;
  },
  updateStatus: async (ticketId: string, request: UpdateTicketStatusRequest) => {
    const { data } = await adminApiClient.patch(`/admin/support/tickets/${ticketId}/status`, request);
    return data;
  },
  assignTicket: async (ticketId: string, request: AssignTicketRequest) => {
    const { data } = await adminApiClient.post(`/admin/support/tickets/${ticketId}/assign`, request);
    return data;
  },
  updatePriority: async (ticketId: string, request: UpdateTicketPriorityRequest) => {
    const { data } = await adminApiClient.patch(`/admin/support/tickets/${ticketId}/priority`, request);
    return data;
  },
  getDashboardStats: async () => {
    const { data } = await adminApiClient.get<TicketDashboardStats>('/admin/support/dashboard');
    return data;
  },
  getMyAssignedTickets: async (query: TicketQuery) => {
    const { data } = await adminApiClient.get<AdminPagedResult<SupportTicket>>('/admin/support/my-tickets', { params: query });
    return data;
  },
  checkSlaBreaches: async () => {
    const { data } = await adminApiClient.post('/admin/support/check-sla');
    return data;
  },
};

// ============================================================================
// AI Usage Service
// ============================================================================

export const adminAIUsageService = {
  getPlatformSummary: async (from?: string, to?: string) => {
    const { data } = await adminApiClient.get('/admin/ai-usage/platform-summary', { params: { from, to } });
    return data;
  },
  getBusinessUsage: async (businessId: string, from?: string, to?: string) => {
    const { data } = await adminApiClient.get(`/admin/ai-usage/business/${businessId}`, { params: { from, to } });
    return data;
  },
  getTopBusinesses: async (from?: string, to?: string, limit = 10) => {
    const { data } = await adminApiClient.get('/admin/ai-usage/top-businesses', { params: { from, to, limit } });
    return data;
  },
};

// ============================================================================
// Export Service
// ============================================================================

export const adminExportService = {
  getOptions: async () => {
    const { data } = await adminApiClient.get('/admin/exports/options');
    return data;
  },
  exportBusinesses: async (request: ExportRequest): Promise<Blob> => {
    const { data } = await adminApiClient.post('/admin/exports/businesses', request, { responseType: 'blob' });
    return data;
  },
  exportUsers: async (request: ExportRequest): Promise<Blob> => {
    const { data } = await adminApiClient.post('/admin/exports/users', request, { responseType: 'blob' });
    return data;
  },
  exportSubscriptions: async (request: ExportRequest): Promise<Blob> => {
    const { data } = await adminApiClient.post('/admin/exports/subscriptions', request, { responseType: 'blob' });
    return data;
  },
  exportAIUsage: async (request: ExportRequest): Promise<Blob> => {
    const { data } = await adminApiClient.post('/admin/exports/ai-usage', request, { responseType: 'blob' });
    return data;
  },
};