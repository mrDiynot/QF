'use client';

/**
 * Step 2: Goals (Multi-Select)
 * Users can select multiple goals. Some goals require Ultra Flow tier.
 *
 * Design: Uses OptionCard in grid layout with Select All toggle
 */

import { useEffect, useMemo } from 'react';
import { Goal } from '@/types/onboarding';
import { Target, RefreshCw, Inbox, CalendarCheck, Bell, FileText, Link2, Sparkles, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OptionCard } from './shared/OptionCard';
import { UpgradeBadge } from './shared/UpgradeBadge';
import { useFeatureAccess } from '@/hooks/subscriptions/useFeatureAccess';
import { toast } from 'sonner';

interface Step2GoalsProps {
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
  { value: 'qualify_leads', label: 'Qualify leads faster', description: 'AI-powered scoring', icon: <Target className="w-7 h-7" /> },
  { value: 'automate_followups', label: 'Automate follow-ups', description: 'Smart automation', icon: <RefreshCw className="w-7 h-7" /> },
  { value: 'capture_channels', label: 'Multiple channels', description: 'Unified inbox', icon: <Inbox className="w-7 h-7" /> },
  { value: 'book_meetings', label: 'Book more meetings', description: 'AI scheduling', icon: <CalendarCheck className="w-7 h-7" /> },
  { value: 'reduce_noshows', label: 'Reduce no-shows', description: 'Auto reminders', icon: <Bell className="w-7 h-7" />, featureKey: 'api_access' },
  { value: 'proposals', label: 'Send proposals', description: 'Quick proposals', icon: <FileText className="w-7 h-7" />, featureKey: 'api_access' },
  { value: 'crm_sync', label: 'Sync with CRM', description: 'Two-way sync', icon: <Link2 className="w-7 h-7" /> },
];

export function Step2Goals({ value, onChange }: Step2GoalsProps) {
  const { hasFeatureAccess, getUpgradeMessage, hasError, error } = useFeatureAccess();

  const isGoalLocked = (featureKey?: string): boolean => {
    if (!featureKey) return false;
    if (hasError) return false;
    return !hasFeatureAccess(featureKey);
  };

  // Calculate available (unlocked) goals for Select All
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
    <div className="space-y-6">
      {/* Header with Select All */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="heading-2 text-text-navy">What are your main goals?</h2>
          <p className="body-text mt-2 text-gray-text">
            Select all that apply. We&apos;ll customize your setup based on your priorities.
          </p>
        </div>

        {/* Select All Button */}
        <button
          type="button"
          onClick={handleSelectAll}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shrink-0',
            allAvailableSelected
              ? 'bg-primary/10 text-primary hover:bg-primary/20'
              : 'bg-muted/40 text-muted-foreground hover:bg-primary/5 hover:text-primary'
          )}
        >
          <div className={cn(
            'flex size-5 items-center justify-center rounded border-2 transition-all duration-300',
            allAvailableSelected
              ? 'border-primary bg-primary/50'
              : someSelected
                ? 'border-purple-400 bg-primary/10'
                : 'border-border bg-white'
          )}>
            {allAvailableSelected ? (
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            ) : someSelected ? (
              <div className="w-2 h-0.5 bg-primary/50 rounded" />
            ) : null}
          </div>
          <CheckCheck className="w-4 h-4" />
          <span>{allAvailableSelected ? 'Deselect All' : 'Select All'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {goalOptions.map((goal) => {
          const isLocked = isGoalLocked(goal.featureKey);
          const isSelected = value.includes(goal.value);
          return (
            <OptionCard
              key={goal.value}
              icon={goal.icon}
              title={goal.label}
              subtitle={goal.description}
              selected={isSelected && !isLocked}
              onClick={() => toggleGoal(goal)}
              variant={isLocked ? 'locked' : 'default'}
              badge={isLocked ? <UpgradeBadge planName="Ultra Flow" /> : undefined}
              disabled={isLocked}
            />
          );
        })}
      </div>

      {/* Selection count */}
      {value.length > 0 && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {value.length} goal{value.length > 1 ? 's' : ''} selected
          </div>
        </div>
      )}
    </div>
  );
}

