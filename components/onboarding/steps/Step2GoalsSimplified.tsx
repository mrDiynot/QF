'use client';

/**
 * Step 2: Goals (Simplified for dashboard-native onboarding)
 * Multi-select goals without large heading
 */

import { useEffect, useMemo } from 'react';
import { Goal } from '@/types/onboarding';
import { Target, RefreshCw, Inbox, CalendarCheck, Bell, FileText, Link2, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OptionCard } from '../shared/OptionCard';
import { Badge } from '@/components/ui/badge';
import { useFeatureAccess } from '@/hooks/subscriptions/useFeatureAccess';
import { toast } from 'sonner';

interface Step2GoalsSimplifiedProps {
  value: Goal[];
  onChange: (value: Goal[]) => void;
}

interface GoalOption {
  value: Goal;
  label: string;
  description: string;
  icon: React.ReactNode;
  featureKey?: string;
}

const goalOptions: GoalOption[] = [
  { value: 'qualify_leads', label: 'Qualify leads faster', description: 'AI-powered scoring', icon: <Target className="w-5 h-5" /> },
  { value: 'automate_followups', label: 'Automate follow-ups', description: 'Smart automation', icon: <RefreshCw className="w-5 h-5" /> },
  { value: 'capture_channels', label: 'Multiple channels', description: 'Unified inbox', icon: <Inbox className="w-5 h-5" /> },
  { value: 'book_meetings', label: 'Book more meetings', description: 'AI scheduling', icon: <CalendarCheck className="w-5 h-5" /> },
  { value: 'reduce_noshows', label: 'Reduce no-shows', description: 'Auto reminders', icon: <Bell className="w-5 h-5" />, featureKey: 'api_access' },
  { value: 'proposals', label: 'Send proposals', description: 'Quick proposals', icon: <FileText className="w-5 h-5" />, featureKey: 'api_access' },
  { value: 'crm_sync', label: 'Sync with CRM', description: 'Two-way sync', icon: <Link2 className="w-5 h-5" /> },
];

export function Step2GoalsSimplified({ value, onChange }: Step2GoalsSimplifiedProps) {
  const { hasFeatureAccess, getUpgradeMessage, hasError, error } = useFeatureAccess();

  const isGoalLocked = (featureKey?: string): boolean => {
    if (!featureKey) return false;
    if (hasError) return false;
    return !hasFeatureAccess(featureKey);
  };

  const availableGoals = useMemo(() =>
    goalOptions.filter(g => !isGoalLocked(g.featureKey)).map(g => g.value),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasError, hasFeatureAccess]
  );

  const allAvailableSelected = availableGoals.length > 0 &&
    availableGoals.every(g => value.includes(g));
  const someSelected = value.length > 0 && !allAvailableSelected;

  const handleSelectAll = () => {
    if (allAvailableSelected) {
      onChange([]);
    } else {
      onChange(availableGoals);
    }
  };

  useEffect(() => {
    if (hasError && error) {
      toast.error(error, {
        duration: 8000,
        action: { label: 'Refresh', onClick: () => window.location.reload() },
      });
    }
  }, [hasError, error]);

  const toggleGoal = (goal: GoalOption) => {
    const isLocked = isGoalLocked(goal.featureKey);
    if (isLocked) {
      toast.info(getUpgradeMessage(goal.featureKey!), {
        action: { label: 'View Plans', onClick: () => window.open('/pricing', '_blank') },
      });
      return;
    }

    if (value.includes(goal.value)) {
      onChange(value.filter(g => g !== goal.value));
    } else {
      onChange([...value, goal.value]);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header with Select All */}
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Select one or more goals
        </p>
        <button
          type="button"
          onClick={handleSelectAll}
          className={cn(
            'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300',
            allAvailableSelected
              ? 'bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20'
              : 'bg-muted/40 text-muted-foreground hover:bg-brand-purple/5 hover:text-brand-purple'
          )}
        >
          <div className={cn(
            'flex size-3.5 sm:size-4 items-center justify-center rounded border-2 transition-all duration-300',
            allAvailableSelected
              ? 'border-brand-purple bg-brand-purple/50'
              : someSelected
                ? 'border-purple-400 bg-brand-purple/10'
                : 'border-border bg-white'
          )}>
            {allAvailableSelected ? (
              <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" strokeWidth={3} />
            ) : someSelected ? (
              <div className="w-1 h-0.5 sm:w-1.5 bg-brand-purple/50 rounded" />
            ) : null}
          </div>
          <CheckCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{allAvailableSelected ? 'Deselect All' : 'Select All'}</span>
          <span className="sm:hidden">All</span>
        </button>
      </div>

      {/* Goal Grid - compact horizontal cards */}
      <div className="grid grid-cols-1 gap-2 sm:gap-2.5 max-h-[400px] overflow-y-auto pr-1">
        {goalOptions.map((goal) => {
          const isSelected = value.includes(goal.value);
          const isLocked = isGoalLocked(goal.featureKey);
          const isPrimary = value[0] === goal.value; // First selected is primary

          return (
            <OptionCard
              key={goal.value}
              icon={goal.icon}
              title={goal.label}
              subtitle={goal.description}
              selected={isSelected && !isLocked}
              variant={isLocked ? 'locked' : 'default'}
              onClick={() => toggleGoal(goal)}
              compact
              badge={isPrimary && isSelected ? (
                <Badge variant="default" className="text-[10px] px-1.5 py-0.5 bg-brand-purple text-white">
                  Primary
                </Badge>
              ) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
