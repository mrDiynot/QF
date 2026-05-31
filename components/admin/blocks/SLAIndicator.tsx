'use client';

import { cn } from '@/lib/utils';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow, isPast, differenceInMinutes } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SLAIndicatorProps {
  firstResponseDue: string | null;
  resolutionDue: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  slaBreached: boolean;
  status: string;
  compact?: boolean;
}

type SLAStatus = 'breached' | 'at_risk' | 'on_track' | 'completed' | 'paused';

function getSLAStatus(
  dueDate: string | null,
  completedAt: string | null,
  status: string
): { status: SLAStatus; timeLeft: string | null } {
  // If paused (awaiting customer), SLA is paused
  if (status === 'AwaitingCustomer') {
    return { status: 'paused', timeLeft: 'Paused' };
  }

  // If already completed
  if (completedAt) {
    return { status: 'completed', timeLeft: null };
  }

  // If no due date
  if (!dueDate) {
    return { status: 'on_track', timeLeft: null };
  }

  const due = new Date(dueDate);
  const now = new Date();
  const minutesLeft = differenceInMinutes(due, now);

  // Breached
  if (isPast(due)) {
    return { 
      status: 'breached', 
      timeLeft: `${formatDistanceToNow(due)} overdue` 
    };
  }

  // At risk (less than 1 hour left)
  if (minutesLeft <= 60) {
    return { 
      status: 'at_risk', 
      timeLeft: `${minutesLeft}m left` 
    };
  }

  // On track
  return { 
    status: 'on_track', 
    timeLeft: formatDistanceToNow(due, { addSuffix: false }) + ' left'
  };
}

export function SLAIndicator({
  firstResponseDue,
  resolutionDue,
  firstResponseAt,
  resolvedAt,
  slaBreached,
  status,
  compact = false,
}: SLAIndicatorProps) {
  const responseStatus = getSLAStatus(firstResponseDue, firstResponseAt, status);
  const resolutionStatus = getSLAStatus(resolutionDue, resolvedAt, status);

  // Overall SLA status (worst of response and resolution)
  const overallBreached = slaBreached || responseStatus.status === 'breached' || resolutionStatus.status === 'breached';
  const overallAtRisk = !overallBreached && (responseStatus.status === 'at_risk' || resolutionStatus.status === 'at_risk');

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
              overallBreached && 'bg-red-500/20 text-red-400',
              overallAtRisk && 'bg-amber-500/20 text-amber-400',
              !overallBreached && !overallAtRisk && responseStatus.status === 'completed' && resolutionStatus.status === 'completed' && 'bg-emerald-500/20 text-emerald-400',
              !overallBreached && !overallAtRisk && !(responseStatus.status === 'completed' && resolutionStatus.status === 'completed') && 'bg-muted/300/20 text-blue-400',
            )}>
              {overallBreached && <XCircle className="h-3 w-3" />}
              {overallAtRisk && <AlertTriangle className="h-3 w-3" />}
              {!overallBreached && !overallAtRisk && responseStatus.status === 'completed' && resolutionStatus.status === 'completed' && <CheckCircle className="h-3 w-3" />}
              {!overallBreached && !overallAtRisk && !(responseStatus.status === 'completed' && resolutionStatus.status === 'completed') && <Clock className="h-3 w-3" />}
              <span>
                {overallBreached && 'SLA Breached'}
                {overallAtRisk && 'At Risk'}
                {!overallBreached && !overallAtRisk && responseStatus.status === 'completed' && resolutionStatus.status === 'completed' && 'SLA Met'}
                {!overallBreached && !overallAtRisk && !(responseStatus.status === 'completed' && resolutionStatus.status === 'completed') && 'On Track'}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-admin-card border-admin-border">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-admin-muted-foreground">First Response:</span>
                <span className={cn(
                  responseStatus.status === 'breached' && 'text-red-400',
                  responseStatus.status === 'at_risk' && 'text-amber-400',
                  responseStatus.status === 'completed' && 'text-emerald-400',
                  responseStatus.status === 'on_track' && 'text-blue-400',
                  responseStatus.status === 'paused' && 'text-gray-500',
                )}>
                  {responseStatus.status === 'completed' ? 'Done' : responseStatus.timeLeft || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-admin-muted-foreground">Resolution:</span>
                <span className={cn(
                  resolutionStatus.status === 'breached' && 'text-red-400',
                  resolutionStatus.status === 'at_risk' && 'text-amber-400',
                  resolutionStatus.status === 'completed' && 'text-emerald-400',
                  resolutionStatus.status === 'on_track' && 'text-blue-400',
                  resolutionStatus.status === 'paused' && 'text-gray-500',
                )}>
                  {resolutionStatus.status === 'completed' ? 'Done' : resolutionStatus.timeLeft || 'N/A'}
                </span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-3">
      {/* First Response SLA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-1.5 rounded-lg',
            responseStatus.status === 'breached' && 'bg-red-500/20',
            responseStatus.status === 'at_risk' && 'bg-amber-500/20',
            responseStatus.status === 'completed' && 'bg-emerald-500/20',
            responseStatus.status === 'on_track' && 'bg-muted/300/20',
            responseStatus.status === 'paused' && 'bg-gray-100',
          )}>
            {responseStatus.status === 'breached' && <XCircle className="h-4 w-4 text-red-400" />}
            {responseStatus.status === 'at_risk' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
            {responseStatus.status === 'completed' && <CheckCircle className="h-4 w-4 text-emerald-400" />}
            {responseStatus.status === 'on_track' && <Clock className="h-4 w-4 text-blue-400" />}
            {responseStatus.status === 'paused' && <Clock className="h-4 w-4 text-gray-500" />}
          </div>
          <div>
            <p className="text-sm font-medium text-admin-foreground">First Response</p>
            <p className="text-xs text-admin-muted-foreground">
              {responseStatus.status === 'completed' 
                ? 'Responded' 
                : responseStatus.timeLeft || 'No deadline set'}
            </p>
          </div>
        </div>
        <span className={cn(
          'text-xs font-medium px-2 py-0.5 rounded',
          responseStatus.status === 'breached' && 'bg-red-500/20 text-red-400',
          responseStatus.status === 'at_risk' && 'bg-amber-500/20 text-amber-400',
          responseStatus.status === 'completed' && 'bg-emerald-500/20 text-emerald-400',
          responseStatus.status === 'on_track' && 'bg-muted/300/20 text-blue-400',
          responseStatus.status === 'paused' && 'bg-gray-100 text-gray-500',
        )}>
          {responseStatus.status === 'breached' && 'Breached'}
          {responseStatus.status === 'at_risk' && 'At Risk'}
          {responseStatus.status === 'completed' && 'Met'}
          {responseStatus.status === 'on_track' && 'On Track'}
          {responseStatus.status === 'paused' && 'Paused'}
        </span>
      </div>

      {/* Resolution SLA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-1.5 rounded-lg',
            resolutionStatus.status === 'breached' && 'bg-red-500/20',
            resolutionStatus.status === 'at_risk' && 'bg-amber-500/20',
            resolutionStatus.status === 'completed' && 'bg-emerald-500/20',
            resolutionStatus.status === 'on_track' && 'bg-muted/300/20',
            resolutionStatus.status === 'paused' && 'bg-gray-100',
          )}>
            {resolutionStatus.status === 'breached' && <XCircle className="h-4 w-4 text-red-400" />}
            {resolutionStatus.status === 'at_risk' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
            {resolutionStatus.status === 'completed' && <CheckCircle className="h-4 w-4 text-emerald-400" />}
            {resolutionStatus.status === 'on_track' && <Clock className="h-4 w-4 text-blue-400" />}
            {resolutionStatus.status === 'paused' && <Clock className="h-4 w-4 text-gray-500" />}
          </div>
          <div>
            <p className="text-sm font-medium text-admin-foreground">Resolution</p>
            <p className="text-xs text-admin-muted-foreground">
              {resolutionStatus.status === 'completed' 
                ? 'Resolved' 
                : resolutionStatus.timeLeft || 'No deadline set'}
            </p>
          </div>
        </div>
        <span className={cn(
          'text-xs font-medium px-2 py-0.5 rounded',
          resolutionStatus.status === 'breached' && 'bg-red-500/20 text-red-400',
          resolutionStatus.status === 'at_risk' && 'bg-amber-500/20 text-amber-400',
          resolutionStatus.status === 'completed' && 'bg-emerald-500/20 text-emerald-400',
          resolutionStatus.status === 'on_track' && 'bg-muted/300/20 text-blue-400',
          resolutionStatus.status === 'paused' && 'bg-gray-100 text-gray-500',
        )}>
          {resolutionStatus.status === 'breached' && 'Breached'}
          {resolutionStatus.status === 'at_risk' && 'At Risk'}
          {resolutionStatus.status === 'completed' && 'Met'}
          {resolutionStatus.status === 'on_track' && 'On Track'}
          {resolutionStatus.status === 'paused' && 'Paused'}
        </span>
      </div>
    </div>
  );
}
