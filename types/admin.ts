// Admin Portal Types

// ============================================================================
// Admin User Types
// ============================================================================

export type AdminRole = 'SuperAdmin' | 'PlatformAdmin' | 'SupportAdmin' | 'BillingAdmin' | 'ContentAdmin';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: AdminRole;
  ipWhitelist: string[];
  isActive: boolean;
  mustChangePassword: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminSession {
  adminUser: AdminUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// ============================================================================
// Admin Auth Types
// ============================================================================

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  requires2FA: boolean;
  requiresMfaSetup: boolean;
  adminId?: string;
  mfaSetupToken?: string;
  requiresPasswordChange: boolean;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  };
  profile?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    twoFactorEnabled: boolean;
    lastLoginAt: string | null;
    lastLoginIp: string | null;
  };
}

export interface AdminMfaVerifyRequest {
  adminId: string;
  code: string;
}

export interface AdminForgotPasswordRequest {
  email: string;
}

export interface AdminResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AdminMfaSetupResponse {
  qrCodeUri: string;
  qrCodeImage: string;
  secret: string;
}

export interface AdminMfaVerifyResponse {
  session: AdminSession;
}

// ============================================================================
// Business Management Types
// ============================================================================

export interface AdminBusinessListItem {
  id: string;
  name: string;
  email: string; // Mapped from backend OwnerEmail
  phone: string | null; // Backend does not send this in list DTO — always null
  status: 'active' | 'suspended'; // Derived from backend IsActive boolean
  planName: string; // Mapped from backend SubscriptionTier
  userCount: number; // Mapped from backend TotalUsers
  createdAt: string;
}

export interface AdminBusinessDetail extends AdminBusinessListItem {
  industry: string | null;
  ownerId: string;
  ownerName: string;
  totalLeads: number;
  totalConversations: number;
  totalMessages: number;
  subscriptionStatus: string;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  suspensionReason: string | null;
  updatedAt: string | null;
}

export interface AdminBusinessQuery {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// ============================================================================
// User Management Types
// ============================================================================

export interface AdminUserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessId: string;
  businessName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  /** Computed full name */
  name: string;
  /** Derived status from isActive */
  status: 'active' | 'suspended';
}

export interface AdminUserDetail extends AdminUserListItem {
  phoneNumber: string | null;
  emailConfirmed: boolean;
  subscriptionTier: string;
  oauthProvider: string | null;
  lastLoginAt: string | null;
  totalLeadsCreated: number;
  totalConversationsHandled: number;
  updatedAt: string | null;
}

// ============================================================================
// Audit Log Types
// ============================================================================

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  adminUserEmail: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string;
  userAgent: string | null;
  httpMethod: string;
  requestPath: string;
  statusCode: number;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
}

export interface AdminAuditLogQuery {
  adminUserId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface AdminDashboardMetrics {
  totalBusinesses: number;
  totalUsers: number;
  activeSubscriptions: number;
  mrr: number;
  newSignups7d: number;
  businessGrowth: number;
  userGrowth: number;
  signupGrowth: number;
  subscriptionsByPlan: SubscriptionPlanMetric[];
  recentActivity: AdminActivityItem[];
}

export interface SubscriptionPlanMetric {
  planName: string;
  count: number;
  revenue: number; // Backend sends "revenue", not "mrr"
  percentage: number;
}

export interface AdminActivityItem {
  id: string;
  type: string;
  description: string;
  entityType: string;
  entityId: string | null;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Impersonation Types
// ============================================================================

export interface ImpersonationSession {
  isActive: boolean;
  targetUser: {
    id: string;
    email: string;
    fullName: string;
    businessName: string;
  } | null;
  startedAt: string | null;
  reason: string | null;
}

export interface StartImpersonationRequest {
  userId: string;
  reason: string;
}

// ============================================================================
// Paginated Response
// ============================================================================

export interface AdminPagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ============================================================================
// Support Ticket Types
// ============================================================================

export type TicketCategory =
  | 'None'
  | 'TechnicalSupport'
  | 'BillingInquiry'
  | 'FeatureRequest'
  | 'AccountIssue'
  | 'GeneralQuestion';

export type TicketPriority = 'None' | 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketStatus =
  | 'None'
  | 'New'
  | 'Open'
  | 'AwaitingCustomer'
  | 'AwaitingInternal'
  | 'InProgress'
  | 'OnHold'
  | 'Resolved'
  | 'Closed';

export type TicketMessageType = 'None' | 'Reply' | 'InternalNote' | 'StatusChange' | 'System';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  businessId: string | null;
  businessName: string | null;
  reporterEmail: string;
  reporterName: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  firstResponseDue: string | null;
  resolutionDue: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  slaBreached: boolean;
  assignedToAdminId: string | null;
  assignedToAdminName: string | null;
  createdAt: string;
  updatedAt: string | null;
  messageCount: number;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  content: string;
  isInternal: boolean;
  senderName: string;
  senderEmail: string;
  type: TicketMessageType;
  isSentByAdmin: boolean;
  createdAt: string;
  attachments: TicketAttachment[];
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface TicketQuery {
  page?: number;
  pageSize?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedToAdminId?: string;
  businessId?: string;
  slaBreached?: boolean;
  searchTerm?: string;
  unassigned?: boolean;
}

export interface CreateTicketRequest {
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  reporterEmail?: string;
  reporterName?: string;
}

export interface AddTicketMessageRequest {
  content: string;
  isInternal?: boolean;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
  note?: string;
}

export interface AssignTicketRequest {
  adminId: string;
}

export interface UpdateTicketPriorityRequest {
  priority: TicketPriority;
  reason?: string;
}

export interface TicketDashboardStats {
  totalOpen: number;
  newToday: number;
  awaitingResponse: number;
  slaBreached: number;
  unassigned: number;
  resolvedToday: number;
  byPriority: Record<TicketPriority, number>;
  byCategory: Record<TicketCategory, number>;
}

// Helper type for ticket with messages
export interface SupportTicketDetail extends SupportTicket {
  messages: TicketMessage[];
}

// ============================================================================
// CMS Types
// ============================================================================

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
  showOnLandingPage: boolean;
  showInHelpCenter: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface FaqRequest {
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
  showOnLandingPage: boolean;
  showInHelpCenter: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  companyName: string | null;
  avatarPath: string | null;
  companyLogoPath: string | null;
  rating: number;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface TestimonialRequest {
  quote: string;
  authorName: string;
  authorRole: string;
  companyName?: string;
  avatarPath?: string;
  companyLogoPath?: string;
  rating: number;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  displayOrder: number;
  section: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CmsPageRequest {
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  displayOrder: number;
  section: string;
}

export interface LandingPageStatistic {
  id: string;
  value: string;
  label: string;
  displayOrder: number;
  isActive: boolean;
}

export interface UpdateStatisticRequest {
  value: string;
  label: string;
  displayOrder: number;
  isActive: boolean;
}

export interface TrustedCompany {
  id: string;
  name: string;
  logoPath: string | null;
  websiteLink: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface UpdateTrustedCompanyRequest {
  name: string;
  logoPath?: string;
  websiteLink?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CmsPricingAddOn {
  id: string;
  title: string;
  price: string;
  unit: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CmsPricingAddOnRequest {
  title: string;
  price: string;
  unit: string;
  displayOrder: number;
  isActive: boolean;
}

export interface PricingFeatureComparison {
  id: string;
  category: string;
  featureName: string;
  freeFlowValue: string;
  smartFlowValue: string;
  ultraFlowValue: string;
  enterpriseValue: string;
  displayOrder: number;
  isActive: boolean;
}

export interface PricingFeatureComparisonRequest {
  category: string;
  featureName: string;
  freeFlowValue: string;
  smartFlowValue: string;
  ultraFlowValue: string;
  enterpriseValue: string;
  displayOrder: number;
  isActive: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImagePath: string | null;
  authorName: string;
  authorAvatarPath: string | null;
  category: string | null;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  isFeatured: boolean;
  readingTimeMinutes: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImagePath: string | null;
  authorName: string;
  authorAvatarPath: string | null;
  category: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  isFeatured: boolean;
  readingTimeMinutes: number;
  createdAt: string;
}

export interface CreateBlogPostRequest {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featuredImagePath?: string;
  authorName: string;
  authorAvatarPath?: string;
  category?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  isFeatured: boolean;
}

export interface UpdateBlogPostRequest {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImagePath?: string;
  authorName?: string;
  authorAvatarPath?: string;
  category?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
}

// ============================================================================
// Subscription Management Types
// ============================================================================

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused' | 'incomplete';

export interface AdminSubscription {
  id: string;
  businessId: string;
  businessName: string;
  businessEmail: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialEndsAt: string | null;
  monthlyPrice: number;
  mrr: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminSubscriptionDetail extends AdminSubscription {
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  paymentMethod: {
    type: string;
    last4: string | null;
    brand: string | null;
    expiryMonth: number | null;
    expiryYear: number | null;
  } | null;
  billingHistory: BillingHistoryItem[];
  usageSummary: {
    aiInteractions: number;
    aiInteractionsLimit: number;
    voiceMinutes: number;
    voiceMinutesLimit: number;
    smsCount: number;
    smsLimit: number;
    storageUsedMb: number;
    storageLimitMb: number;
  };
}

export interface BillingHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  invoiceUrl: string | null;
  createdAt: string;
}

export interface AdminSubscriptionQuery {
  search?: string;
  status?: SubscriptionStatus;
  planId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface AdminPlan {
  id: string;
  name: string; // Lowercase identifier (e.g., "smartflow")
  displayName: string; // Display name (e.g., "Smart Flow")
  description: string | null;
  priceMonthly: number;
  priceQuarterly: number | null;
  priceYearly: number | null;
  discountQuarterly: number;
  discountAnnual: number;
  onboardingPrice: number | null;
  onboardingRequired: boolean;
  stripePriceIdMonthly: string | null;
  stripePriceIdQuarterly: string | null;
  stripePriceIdYearly: string | null;
  allowsTrial: boolean;
  trialDays: number;
  isActive: boolean;
  isPublic: boolean;
  version: number;
  sortOrder: number;
  limits: Record<string, string>; // Backend sends Dictionary<string,string>
  featureKeys: string[];
  createdAt: string;
  updatedAt: string | null;
}

// Backend SubscriptionStatsDto — all fields now provided by backend
export interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  cancelledSubscriptions: number;
  pastDueSubscriptions: number;
  totalMRR: number;
  mrr: number;
  arr: number;
  churnRate: number;
  averageRevenuePerUser: number;
  canceledThisMonth: number;
  byPlan: {
    planId: string;
    planName: string;
    count: number;
    mrr: number;
    percentage: number;
  }[];
  revenueByMonth?: {
    month: string;
    mrr: number;
    newMrr: number;
    churnedMrr: number;
  }[];
}

export interface ChangePlanRequest {
  newPlanId: string;
  immediateChange?: boolean;
  prorateBilling?: boolean;
}

export interface CancelSubscriptionRequest {
  reason: string;
  feedback?: string;
  cancelImmediately?: boolean;
}

