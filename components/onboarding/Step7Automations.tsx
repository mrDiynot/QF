'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Automation } from '@/types/onboarding';
import { cn } from '@/lib/utils';
import { UpgradeBadge } from './shared/UpgradeBadge';
import { Check, Sparkles, Lock, CheckCheck } from 'lucide-react';
import { useFeatureAccess, requiresUpgrade } from '@/hooks/subscriptions/useFeatureAccess';
import { toast } from 'sonner';

interface Step7AutomationsProps {
  value: Automation[];
  onChange: (value: Automation[]) => void;
}

/**
 * All 10 pre-built AI automations (matching database prebuilt_journeys table)
 *
 * Feature restrictions by plan:
 * - FreeFlow: lead_qualification, review_survey (basic features)
 * - SmartFlow: + missed_call, no_show_recovery, cold_lead_revival, retention, proposal_creation, abandoned_form
 * - UltraFlow: + proposal_sending, post_purchase (advanced automation)
 */
const automations = [
  { value: 'lead_qualification' as Automation, label: 'New Lead Qualification → Booking', description: 'AI responds instantly, qualifies, scores, and books appointments', icon: '/icons/automation/target.svg' },
  { value: 'missed_call' as Automation, label: 'Missed Call Recovery', description: 'AI sends SMS, email, and can place outbound call to recover leads', icon: '/icons/automation/phone-missed.svg' },
  { value: 'no_show_recovery' as Automation, label: 'No-Show Recovery', description: 'Automatically re-engage customers who miss appointments', icon: '/icons/automation/refresh-cw.svg' },
  { value: 'review_survey' as Automation, label: 'Review + Survey Flow', description: 'Send thank-you messages, review requests, and surveys after appointments', icon: '/icons/automation/star.svg' },
  { value: 'cold_lead_revival' as Automation, label: 'Cold Lead Revival', description: 'Reactivate leads who stopped responding with smart timing', icon: '/icons/automation/zap.svg' },
  { value: 'retention_reengagement' as Automation, label: 'Retention & Re-Engagement', description: 'Target inactive customers with incentives to bring them back', icon: '/icons/automation/users.svg' },
  { value: 'proposal_creation' as Automation, label: 'Proposal Creation + Assignment', description: 'AI creates proposals, assigns reviewers, tracks review stages', icon: '/icons/automation/file-text.svg' },
  { value: 'proposal_sending' as Automation, label: 'Proposal Sending + Acceptance', description: 'Send proposals, track views, accepts/declines, trigger next actions', icon: '/icons/automation/send.svg' },
  { value: 'abandoned_form' as Automation, label: 'Abandoned Form Recovery', description: 'Follow up instantly when someone starts but doesn\'t submit a form', icon: '/icons/automation/check-circle.svg' },
  { value: 'post_purchase' as Automation, label: 'Post-Purchase Flow', description: 'Onboarding messages, upsell opportunities, retention touchpoints', icon: '/icons/automation/trophy.svg' },
];

export function Step7Automations({ value, onChange }: Step7AutomationsProps) {
  const { hasFeatureAccess, getUpgradeMessage, hasError, error } = useFeatureAccess();

  const isAutomationLocked = (automationValue: string): boolean => {
    if (hasError) return false;
    const feature = requiresUpgrade(automationValue);
    return feature !== null && !hasFeatureAccess(feature);
  };

  // Calculate available (unlocked) automations for Select All functionality
  const availableAutomations = useMemo(() =>
    automations.filter(a => !isAutomationLocked(a.value)).map(a => a.value),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasError, hasFeatureAccess]
  );

  const allAvailableSelected = availableAutomations.length > 0 &&
    availableAutomations.every(a => value.includes(a));
  const someSelected = value.length > 0 && !allAvailableSelected;

  const handleSelectAll = () => {
    if (allAvailableSelected) {
      // Deselect all
      onChange([]);
    } else {
      // Select all available (unlocked) automations
      onChange(availableAutomations);
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

  const toggleAutomation = (automation: Automation) => {
    // Check if feature is locked
    if (isAutomationLocked(automation)) {
      const feature = requiresUpgrade(automation);
      if (feature) {
        toast.info(getUpgradeMessage(feature), {
          action: {
            label: 'View Plans',
            onClick: () => window.open('/pricing', '_blank'),
          },
        });
      }
      return;
    }

    if (value.includes(automation)) {
      onChange(value.filter(a => a !== automation));
    } else {
      onChange([...value, automation]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="heading-2 text-text-navy">Which automations do you want to enable?</h2>
          <p className="body-text mt-2 text-gray-text">
            Select the AI-powered workflows you&apos;d like to activate. You can add more later.
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
              : someSelected
                ? 'bg-muted/40 text-muted-foreground hover:bg-primary/5 hover:text-primary'
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
        {automations.map((automation) => {
          const isSelected = value.includes(automation.value);
          const isLocked = isAutomationLocked(automation.value);
          return (
            <button
              key={automation.value}
              onClick={() => toggleAutomation(automation.value)}
              disabled={isLocked && isSelected}
              className={cn(
                'group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all duration-300 ease-out overflow-hidden min-h-[160px]',
                isLocked
                  ? 'border-border bg-muted/20 cursor-not-allowed opacity-75'
                  : isSelected
                    ? 'border-primary bg-gradient-to-br from-purple-50 via-white to-pink-50 shadow-xl shadow-purple-300/40 ring-2 ring-purple-400/50 ring-offset-2 scale-[1.02]'
                    : 'border-border bg-white hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50/80 hover:to-pink-50/50 hover:shadow-lg hover:shadow-purple-200/50 hover:-translate-y-1'
              )}
            >
              {/* Locked overlay */}
              {isLocked && (
                <div className="absolute inset-0 bg-muted/40/60 backdrop-blur-[1px] z-30 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Lock className="w-6 h-6 text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground font-medium">Upgrade to unlock</span>
                  </div>
                </div>
              )}

              {/* Animated gradient background on selection */}
              {isSelected && !isLocked && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 animate-pulse" />
              )}

              {/* Checkmark for multi-select */}
              <div className={cn(
                'absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg transition-all duration-300 ease-out z-20',
                isSelected && !isLocked
                  ? 'scale-100 opacity-100 rotate-0'
                  : 'scale-0 opacity-0 rotate-180'
              )}>
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>

              {/* Sparkle effect on selected */}
              {isSelected && !isLocked && (
                <div className="absolute top-2 left-2 text-primary animate-bounce z-10">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              {isLocked && (
                <div className="absolute right-4 top-4 z-40">
                  <UpgradeBadge />
                </div>
              )}

              {/* Icon */}
              <div className={cn(
                'relative flex size-14 items-center justify-center rounded-xl transition-all duration-300 ease-out z-10',
                isLocked
                  ? 'bg-muted'
                  : isSelected
                    ? 'bg-gradient-to-br from-purple-200 to-pink-200 shadow-md scale-110'
                    : 'bg-muted/40 group-hover:bg-gradient-to-br group-hover:from-purple-100 group-hover:to-pink-100 group-hover:scale-105'
              )}>
                <Image
                  src={automation.icon}
                  alt={automation.label}
                  width={28}
                  height={28}
                  unoptimized
                  className={isLocked ? 'opacity-50' : ''}
                />
              </div>

              {/* Text */}
              <div className="text-center relative z-10 flex-1 flex flex-col justify-center">
                <div className={cn(
                  'text-sm font-semibold transition-all duration-300 leading-tight',
                  isLocked
                    ? 'text-muted-foreground/60'
                    : isSelected
                      ? 'text-primary tracking-wide'
                      : 'text-foreground/80 group-hover:text-primary'
                )}>
                  {automation.label}
                </div>
                <div className={cn(
                  'text-xs font-medium mt-1 transition-colors duration-300 line-clamp-2',
                  isLocked ? 'text-muted-foreground/60' : isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                )}>
                  {automation.description}
                </div>
              </div>

              {/* Bottom highlight bar on selection */}
              <div className={cn(
                'absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out',
                isSelected && !isLocked ? 'w-16 opacity-100' : 'w-0 opacity-0'
              )} />
            </button>
          );
        })}
      </div>

      {/* Selection count indicator */}
      {value.length > 0 && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-4 h-4" />
            {value.length} automation{value.length > 1 ? 's' : ''} enabled
          </div>
        </div>
      )}
    </div>
  );
}