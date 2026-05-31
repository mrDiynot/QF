'use client';

/**
 * Workflow Execution Monitor Component
 * Real-time monitoring of workflow executions with logs and status
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Zap,
  Mail,
  MessageSquare,
  Phone,
  Tag,
  Users,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { workflowsService, type WorkflowExecution, type WorkflowLog } from '@/services/api/workflows.service';

interface WorkflowExecutionMonitorProps {
  workflowId: string;
  className?: string;
}

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted/40', label: 'Pending' },
  running: { icon: Loader2, color: 'text-info', bgColor: 'bg-muted/50', label: 'Running' },
  completed: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-100', label: 'Failed' },
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  send_email: <Mail className="size-3.5" />,
  send_sms: <MessageSquare className="size-3.5" />,
  make_call: <Phone className="size-3.5" />,
  add_tag: <Tag className="size-3.5" />,
  update_lead: <Users className="size-3.5" />,
  delay: <Clock className="size-3.5" />,
  webhook: <Zap className="size-3.5" />,
};

function ExecutionCard({ execution }: { execution: WorkflowExecution }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[execution.status];
  const StatusIcon = status.icon;
  const isRunning = execution.status === 'running';

  const completedSteps = execution.logs.filter(l => l.status === 'success').length;
  const totalSteps = execution.logs.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={cn("flex size-9 items-center justify-center rounded-lg", status.bgColor)}>
            <StatusIcon className={cn("size-4", status.color, isRunning && "animate-spin")} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Execution #{execution.id.slice(0, 8)}</span>
              <Badge variant="outline" className={cn("text-xs", status.color)}>
                {status.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Started {formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })}
              {execution.triggeredBy && ` • Triggered by ${execution.triggeredBy}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isRunning && (
            <div className="w-24">
              <Progress value={progress} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-0.5 text-right">
                {completedSteps}/{totalSteps} steps
              </p>
            </div>
          )}
          {expanded ? (
            <ChevronDown className="size-4 text-muted-foreground/60" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground/60" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t bg-muted/20/50 p-4">
          <div className="space-y-2">
            {execution.logs.length > 0 ? (
              execution.logs.map((log, idx) => (
                <LogEntry key={idx} log={log} isLast={idx === execution.logs.length - 1} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No execution logs yet</p>
            )}
          </div>

          {execution.errorMessage && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700">Execution Failed</p>
                  <p className="text-xs text-red-600 mt-1">{execution.errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {execution.completedAt && (
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
              Completed {format(new Date(execution.completedAt), 'MMM d, yyyy h:mm a')}
              <span className="mx-2">•</span>
              Duration: {formatDuration(execution.startedAt, execution.completedAt)}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function LogEntry({ log, isLast }: { log: WorkflowLog; isLast: boolean }) {
  const isSuccess = log.status === 'success';
  const isFailed = log.status === 'failed';
  const isSkipped = log.status === 'skipped';

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className={cn(
          "flex size-6 items-center justify-center rounded-full",
          isSuccess && "bg-green-100 text-green-600",
          isFailed && "bg-red-100 text-red-600",
          isSkipped && "bg-muted/40 text-muted-foreground/60"
        )}>
          {ACTION_ICONS[log.actionType] || <Zap className="size-3.5" />}
        </div>
        {!isLast && <div className="w-px h-6 bg-muted mt-1" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{formatActionType(log.actionType)}</span>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-1.5",
              isSuccess && "text-green-600 border-green-200",
              isFailed && "text-red-600 border-red-200",
              isSkipped && "text-muted-foreground/60 border-border"
            )}
          >
            {log.status}
          </Badge>
        </div>
        {log.message && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.message}</p>
        )}
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
          {format(new Date(log.timestamp), 'h:mm:ss a')}
        </p>
      </div>
    </div>
  );
}

function formatActionType(type: string): string {
  const map: Record<string, string> = {
    send_email: 'Send Email',
    send_sms: 'Send SMS',
    make_call: 'AI Call',
    add_tag: 'Add Tag',
    update_lead: 'Update Lead',
    delay: 'Wait',
    webhook: 'Webhook',
    notify: 'Notification',
    create_task: 'Create Task',
  };
  return map[type] || type;
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.round((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

export function WorkflowExecutionMonitor({ workflowId, className }: WorkflowExecutionMonitorProps) {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['workflow-executions', workflowId],
    queryFn: () => workflowsService.getExecutions(workflowId, { pageSize: 10 }),
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const executions = data?.items || [];

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Recent Executions</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-8 gap-1.5"
        >
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {executions.length > 0 ? (
        <div className="space-y-3">
          {executions.map((execution) => (
            <ExecutionCard key={execution.id} execution={execution} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted/40">
              <Play className="size-5 text-muted-foreground/60" />
            </div>
            <div>
              <p className="font-medium text-foreground">No executions yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                This workflow hasn&apos;t been triggered. Activate it to start capturing leads.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// Compact execution stats for workflow cards
export function WorkflowExecutionStats({ workflowId }: { workflowId: string }) {
  const { data } = useQuery({
    queryKey: ['workflow-executions', workflowId, 'stats'],
    queryFn: async () => {
      const result = await workflowsService.getExecutions(workflowId, { pageSize: 100 });
      const items = result.items || [];
      const completed = items.filter(e => e.status === 'completed').length;
      const failed = items.filter(e => e.status === 'failed').length;
      const running = items.filter(e => e.status === 'running').length;
      return { total: items.length, completed, failed, running };
    },
    staleTime: 30000,
  });

  if (!data) return null;

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="flex items-center gap-1 text-green-600">
        <CheckCircle className="size-3" />
        {data.completed}
      </span>
      {data.failed > 0 && (
        <span className="flex items-center gap-1 text-red-600">
          <XCircle className="size-3" />
          {data.failed}
        </span>
      )}
      {data.running > 0 && (
        <span className="flex items-center gap-1 text-info">
          <Loader2 className="size-3 animate-spin" />
          {data.running}
        </span>
      )}
    </div>
  );
}
