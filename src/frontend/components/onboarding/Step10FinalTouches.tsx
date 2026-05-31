'use client';

import { AITone } from '@/types/onboarding';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
  Check,
  Sparkles,
  Briefcase,
  Smile,
  Coffee,
  Zap,
  Lock,
  Crown,
  Clock,
  MessageSquare,
  Rocket,
  Settings,
  Info,
  Bot,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFeatureAccess, FeatureKey } from '@/hooks/subscriptions/useFeatureAccess';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Step10FinalTouchesProps {
  value: {
    aiTone: AITone | '';
    businessHours?: string;
    followUpPreference?: string;
    enableAutoResponse?: boolean;
  };
  onChange: (value: {
    aiTone: AITone | '';
    businessHours?: string;
    followUpPreference?: string;
    enableAutoResponse?: boolean;
  }) => void;
}

// Feature key mappings for Step 10 options
// These are UI preferences, NOT database features - no restrictions
// Database features: ai_email, ai_voice, ai_sms, webchat, instagram, facebook, whatsapp, 
//                   custom_branding, api_access, dedicated_support
const STEP10_FEATURE_KEYS: Record<string, FeatureKey | null> = {
  // AI Tones - All available on all plans (UI preference, not DB feature)
  professional: null,
  friendly: null,
  casual: null,
  enthusiastic: null,

  // Business Hours - All available on all plans (UI preference, not DB feature)
  '9-5': null,
  '8-6': null,
  '24-7': null,
  'custom': null,

  // Follow-up Preference - All available on all plans (UI preference, not DB feature)
  'immediate': null,
  '1-hour': null,
  'same-day': null,
  'next-day': null,
};

const tones: { value: AITone; label: string; icon: typeof Briefcase; description: string }[] = [
  { value: 'professional', label: 'Professional', icon: Briefcase, description: 'Formal & polished' },
  { value: 'friendly', label: 'Friendly', icon: Smile, description: 'Warm & approachable' },
  { value: 'casual', label: 'Casual', icon: Coffee, description: 'Relaxed & informal' },
  { value: 'enthusiastic', label: 'Enthusiastic', icon: Zap, description: 'Energetic & excited' },
];

export function Step10FinalTouches({ value, onChange }: Step10FinalTouchesProps) {
  const { hasFeatureAccess, getRequiredPlan, hasError } = useFeatureAccess();

  // Check if an option is locked based on subscription
  // If there's an error loading features, don't lock anything - let user proceed
  const isOptionLocked = (optionValue: string): boolean => {
    if (hasError) return false;
    const featureKey = STEP10_FEATURE_KEYS[optionValue];
    if (!featureKey) return false;
    return !hasFeatureAccess(featureKey);
  };

  // Get required plan for a locked option
  const getOptionRequiredPlan = (optionValue: string): string => {
    const featureKey = STEP10_FEATURE_KEYS[optionValue];
    if (!featureKey) return '';
    return getRequiredPlan(featureKey);
  };

  // Handle locked option click
  const handleLockedClick = (optionValue: string, optionLabel: string) => {
    const requiredPlan = getOptionRequiredPlan(optionValue);
    toast.info(`${optionLabel} requires ${requiredPlan}`, {
      description: 'Upgrade your plan to access this feature.',
      action: {
        label: 'View Plans',
        onClick: () => window.open('/settings/billing', '_blank'),
      },
    });
  };
  return (
    <div className="space-y-8">
      {/* Header with celebration icon */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 mb-4 shadow-lg shadow-purple-200/50">
          <Rocket className="w-8 h-8 text-primary" />
        </div>
        <h2 className="heading-2 text-text-navy">Final touches</h2>
        <p className="body-text mt-2 text-gray-text max-w-md mx-auto">
          Let&apos;s personalize how Qualiflow AI communicates with your leads.
        </p>
      </div>

      {/* AI Tone & Personality Section */}
      <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 rounded-2xl p-6 border border-primary/10/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md shadow-purple-300/50">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <Label className="text-base font-semibold text-[#364153]">
              AI Tone & Personality
            </Label>
            <p className="text-xs text-muted-foreground">How your AI assistant sounds to leads</p>
          </div>
        </div>
          <div className="grid grid-cols-2 gap-3">
            {tones.map((tone) => {
              const isSelected = value.aiTone === tone.value;
              const isLocked = isOptionLocked(tone.value);
              const Icon = tone.icon;
              const requiredPlan = isLocked ? getOptionRequiredPlan(tone.value) : '';

              return (
                <button
                  key={tone.value}
                  onClick={() => {
                    if (isLocked) {
                      handleLockedClick(tone.value, tone.label);
                    } else {
                      onChange({ ...value, aiTone: tone.value });
                    }
                  }}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl border-2 px-4 py-4 text-left transition-all duration-300 ease-out overflow-hidden',
                    isLocked
                      ? 'border-border bg-muted/20 opacity-70 cursor-not-allowed'
                      : isSelected
                        ? 'border-primary bg-gradient-to-br from-purple-50 via-white to-pink-50 shadow-lg shadow-purple-300/40 ring-2 ring-purple-400/50 ring-offset-1 scale-[1.02]'
                        : 'border-border bg-white hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50/80 hover:to-pink-50/50 hover:shadow-md hover:-translate-y-0.5'
                  )}
                >
                  {/* Animated gradient background on selection */}
                  {isSelected && !isLocked && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 animate-pulse" />
                  )}

                  {/* Upgrade badge for locked options */}
                  {isLocked && (
                    <div className="absolute -top-2 -right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30 z-20 border border-white/20">
                      <Crown className="w-3 h-3 text-amber-300" />
                      <span className="text-[10px] font-bold text-white tracking-wide">{requiredPlan}</span>
                    </div>
                  )}

                  {/* Checkmark */}
                  {!isLocked && (
                    <div className={cn(
                      'absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-md transition-all duration-300 ease-out z-20',
                      isSelected
                        ? 'scale-100 opacity-100 rotate-0'
                        : 'scale-0 opacity-0 rotate-180'
                    )}>
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}

                  {/* Icon */}
                  <div className={cn(
                    'flex size-10 items-center justify-center rounded-lg transition-all duration-300 z-10',
                    isLocked
                      ? 'bg-muted/40'
                      : isSelected
                        ? 'bg-gradient-to-br from-purple-200 to-pink-200 scale-110'
                        : 'bg-muted/40 group-hover:bg-gradient-to-br group-hover:from-purple-100 group-hover:to-pink-100'
                  )}>
                    {isLocked ? (
                      <Lock className="w-5 h-5 text-muted-foreground/60" />
                    ) : (
                      <Icon className={cn(
                        'w-5 h-5 transition-colors duration-300',
                        isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                      )} />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 relative z-10">
                    <div className={cn(
                      'text-sm font-semibold transition-all duration-300',
                      isLocked ? 'text-muted-foreground/60' : isSelected ? 'text-primary' : 'text-foreground/80 group-hover:text-primary'
                    )}>
                      {tone.label}
                    </div>
                    <div className={cn(
                      'text-xs transition-colors duration-300',
                      isLocked ? 'text-muted-foreground/60' : isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                    )}>
                      {tone.description}
                    </div>
                  </div>

                  {/* Sparkle on selection (only if not locked) */}
                  {isSelected && !isLocked && (
                    <Sparkles className="w-4 h-4 text-primary animate-pulse z-10" />
                  )}
                </button>
              );
            })}
          </div>
      </div>

      {/* Settings Section - Business Hours & Follow-up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Hours */}
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <Label htmlFor="business-hours" className="text-sm font-semibold text-[#364153]">
              Business Hours
            </Label>
          </div>
          <Select
            value={value.businessHours}
            onValueChange={(val) => {
              if (isOptionLocked(val)) {
                handleLockedClick(val, val === '24-7' ? '24/7 Availability' : val);
                return;
              }
              onChange({ ...value, businessHours: val });
            }}
          >
            <SelectTrigger id="business-hours" className="h-12 rounded-xl border-[0.75px] border-[#D1D5DC] bg-muted/20/50 hover:bg-white transition-colors">
              <SelectValue placeholder="Select business hours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9-5">9 AM - 5 PM</SelectItem>
              <SelectItem value="8-6">8 AM - 6 PM</SelectItem>
              <SelectItem value="24-7" disabled={isOptionLocked('24-7')}>
                <span className="flex items-center gap-2">
                  24/7 Availability
                  {isOptionLocked('24-7') && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-violet-100 to-purple-100 text-primary border border-primary/20">
                      <Crown className="w-3 h-3 text-amber-500" />
                      {getOptionRequiredPlan('24-7')}
                    </span>
                  )}
                </span>
              </SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Follow-up Preference */}
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <Label htmlFor="followup" className="text-sm font-semibold text-[#364153]">
              Follow-up Speed
            </Label>
          </div>
          <Select
            value={value.followUpPreference}
            onValueChange={(val) => {
              if (isOptionLocked(val)) {
                handleLockedClick(val, val === 'immediate' ? 'Immediate Response' : val);
                return;
              }
              onChange({ ...value, followUpPreference: val });
            }}
          >
            <SelectTrigger id="followup" className="h-12 rounded-xl border-[0.75px] border-[#D1D5DC] bg-muted/20/50 hover:bg-white transition-colors">
              <SelectValue placeholder="Select follow-up speed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate" disabled={isOptionLocked('immediate')}>
                <span className="flex items-center gap-2">
                  Immediate Response
                  {isOptionLocked('immediate') && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-violet-100 to-purple-100 text-primary border border-primary/20">
                      <Crown className="w-3 h-3 text-amber-500" />
                      {getOptionRequiredPlan('immediate')}
                    </span>
                  )}
                </span>
              </SelectItem>
              <SelectItem value="1-hour">Within 1 hour</SelectItem>
              <SelectItem value="same-day">Same day</SelectItem>
              <SelectItem value="next-day">Next business day</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Auto-Response Toggle */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50/30 rounded-2xl p-6 border border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md shadow-blue-300/50">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <Label className="text-base font-semibold text-[#364153]">
                Enable AI Auto-Response
              </Label>
              <p className="text-xs text-muted-foreground">
                Let AI automatically respond to incoming messages
              </p>
            </div>
          </div>
          <Switch
            checked={value.enableAutoResponse ?? false}
            onCheckedChange={(checked) => onChange({ ...value, enableAutoResponse: checked })}
          />
        </div>
        {value.enableAutoResponse && (
          <div className="mt-4 rounded-lg bg-muted/50/50 p-3 text-sm text-info flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              AI will respond to leads 24/7 using your selected tone and knowledge base. 
              You can change this anytime in Settings → AI Training.
            </span>
          </div>
        )}
      </div>

      {/* Channel Activation Notice */}
      <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-border/60">
        <Info className="h-4 w-4 text-info" />
        <AlertDescription className="text-info">
          <span className="font-medium">Next step:</span> After completing setup, you&apos;ll need to activate your channels
          (SMS, Voice, WhatsApp, etc.) in <span className="font-medium">Settings → Channels</span> to start receiving leads.
        </AlertDescription>
      </Alert>

      {/* What's Next Summary */}
      <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-primary">You&apos;re almost ready!</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-sm text-primary">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>AI configured to your style</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Lead qualification enabled</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Channels ready to activate</span>
          </div>
        </div>
      </div>
    </div>
  );
}