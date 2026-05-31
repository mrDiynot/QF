'use client';

/**
 * AI Quick Actions Widget
 * AI-driven actions aligned with conversation-first platform
 */

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { conversationsService, workflowsService } from '@/services/api';
import {
  MessageSquare,
  AlertTriangle,
  Zap,
  Radio,
  Brain,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  color: string;
  bgColor: string;
  badge?: number;
  isLoading?: boolean;
}

export function AIQuickActionsWidget() {
  // Fetch conversation queue count
  const { data: conversationsData, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations', 'queue-count'],
    queryFn: async () => {
      const response = await conversationsService.getConversations({
        status: 'Open',
        pageSize: 100,
      });
      return response;
    },
    refetchInterval: 30000,
  });

  // Fetch workflows
  const { data: workflowsData, isLoading: isLoadingWorkflows } = useQuery({
    queryKey: ['workflows', 'available'],
    queryFn: async () => {
      return workflowsService.getWorkflows();
    },
  });

  const pendingConversations = conversationsData?.items?.filter(
    c => c.status === 'active' && c.unreadCount > 0
  ).length || 0;

  const availableWorkflows = workflowsData?.length || 10;

  const QUICK_ACTIONS: QuickAction[] = [
    {
      icon: <MessageSquare className="size-5" />,
      label: 'Conversation Queue',
      description: 'View pending conversations',
      href: '/conversations',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100 hover:bg-gray-200',
      badge: pendingConversations,
      isLoading: isLoadingConversations,
    },
    {
      icon: <AlertTriangle className="size-5" />,
      label: 'AI Escalations',
      description: 'Review AI-escalated chats',
      href: '/conversations?filter=escalated',
      color: 'text-warning',
      bgColor: 'bg-warning-bg hover:bg-warning/20',
    },
    {
      icon: <Zap className="size-5" />,
      label: 'Activate Workflow',
      description: 'Browse prebuilt workflows',
      href: '/automations',
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600',
      badge: availableWorkflows,
      isLoading: isLoadingWorkflows,
    },
    {
      icon: <Radio className="size-5" />,
      label: 'Monitor Channels',
      description: 'View channel health',
      href: '/channels',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100 hover:bg-gray-200',
    },
    {
      icon: <Brain className="size-5" />,
      label: 'AI Training',
      description: 'Improve AI responses',
      href: '/settings/ai',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100 hover:bg-gray-200',
    },
    {
      icon: <BarChart3 className="size-5" />,
      label: 'View Analytics',
      description: 'Performance metrics',
      href: '/analytics',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100 hover:bg-gray-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {QUICK_ACTIONS.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="group relative flex flex-col items-center p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
        >
          {/* Badge */}
          {action.badge !== undefined && action.badge > 0 && (
            <div className="absolute -top-2 -right-2 flex items-center justify-center size-6 rounded-full bg-error text-white text-xs font-bold shadow-md">
              {action.isLoading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                action.badge > 99 ? '99+' : action.badge
              )}
            </div>
          )}

          <div className={cn(
            "flex size-11 items-center justify-center rounded-lg mb-3 transition-colors",
            action.bgColor
          )}>
            <span className={action.color}>{action.icon}</span>
          </div>
          <span className="text-sm font-medium text-gray-900 text-center">
            {action.label}
          </span>
          <span className="text-xs text-gray-500 text-center mt-1 line-clamp-1">
            {action.description}
          </span>
        </Link>
      ))}
    </div>
  );
}
