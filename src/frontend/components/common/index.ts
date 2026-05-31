/**
 * Common Components
 * Re-exports all common/shared UI components
 */

export {
  EmptyState,
  EmptyLeads,
  EmptyConversations,
  EmptyForms,
  EmptyProposals,
  EmptyCalls,
  EmptyAppointments,
  EmptyEmails,
  EmptyAutomations,
  EmptyAnalytics,
  EmptyNotifications,
  EmptySearch,
  EmptyIntegrations,
  EmptyFiles,
  LoadingState,
} from './EmptyState';

export {
  StatusBadge,
  LeadStatusBadge,
  ConversationStatusBadge,
  ProposalStatusBadge,
  AutomationStatusBadge,
  UserStatusBadge,
  RoleBadge,
  PriorityBadge,
  OnlineIndicator,
  DotStatus,
} from './StatusBadges';

export {
  StatCard,
  ProgressStat,
  ComparisonStat,
  MiniStat as MiniStatCard,
  StatRow,
  StatGrid,
  CircleStat,
} from './StatCards';

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonStatCard,
  SkeletonTableRow,
  SkeletonTable,
  SkeletonListItem,
  SkeletonList,
  SkeletonForm,
  SkeletonChart,
  SkeletonDashboard,
  SkeletonConversation,
  SkeletonProfile,
  SkeletonCalendar,
} from './Skeletons';
