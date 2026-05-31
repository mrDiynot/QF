'use client';

/**
 * Step 6: Channel Selection (Multi-Select)
 * Which channels do you want to use?
 *
 * Design: Uses shared OptionCard component for consistency with other steps
 */

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Channel } from '@/types/onboarding';
import { cn } from '@/lib/utils';
import { OptionCard } from './shared/OptionCard';
import { UpgradeBadge } from './shared/UpgradeBadge';
import { Check, Sparkles, CheckCheck } from 'lucide-react';
import { useFeatureAccess, requiresUpgrade } from '@/hooks/subscriptions/useFeatureAccess';
import { toast } from 'sonner';

interface Step6ChannelsProps {
  value: Channel[];
  onChange: (value: Channel[]) => void;
}

const channels = [
  { value: 'sms' as Channel, label: 'SMS', subtitle: 'Text messaging', icon: '/icons/channels/message-square.svg' },
  { value: 'phone' as Channel, label: 'Phone & AI Voice', subtitle: 'Voice calls', icon: '/icons/channels/phone.svg' },
  { value: 'whatsapp' as Channel, label: 'WhatsApp Business', subtitle: 'WhatsApp messaging', icon: '/icons/channels/message-square.svg' },
  { value: 'email' as Channel, label: 'Email', subtitle: 'Email campaigns', icon: '/icons/channels/mail.svg' },
  { value: 'web_chat' as Channel, label: 'Web Chat', subtitle: 'Website widget', icon: '/icons/channels/message-square.svg' },
  { value: 'web_forms' as Channel, label: 'Web Forms', subtitle: 'Lead capture forms', icon: '/icons/channels/clipboard.svg' },
  { value: 'social' as Channel, label: 'Social Messaging', subtitle: 'Instagram + Facebook', icon: '/icons/channels/send.svg' },
];

export function Step6Channels({ value, onChange }: Step6ChannelsProps) {
  const { hasFeatureAccess, getUpgradeMessage, getRequiredPlan, hasError, error } = useFeatureAccess();

  const isChannelLocked = (channelValue: string): boolean => {
    if (hasError) return false;
    const feature = requiresUpgrade(channelValue);
    return feature !== null && !hasFeatureAccess(feature);
  };

  const availableChannels = useMemo(() =>
    channels.filter(c => !isChannelLocked(c.value)).map(c => c.value),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasError, hasFeatureAccess]
  );

  const allAvailableSelected = availableChannels.length > 0 &&
    availableChannels.every(c => value.includes(c));
  const someSelected = value.length > 0 && !allAvailableSelected;

  const handleSelectAll = () => {
    if (allAvailableSelected) {
      onChange([]);
    } else {
      onChange(availableChannels);
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

  const toggleChannel = (channel: Channel) => {
    if (isChannelLocked(channel)) {
      const feature = requiresUpgrade(channel);
      if (feature) {
        toast.info(getUpgradeMessage(feature), {
          action: { label: 'View Plans', onClick: () => window.open('/pricing', '_blank') },
        });
      }
      return;
    }

    if (value.includes(channel)) {
      onChange(value.filter(c => c !== channel));
    } else {
      onChange([...value, channel]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="heading-2 text-text-navy">Which channels do you want to use?</h2>
          <p className="body-text mt-2 text-gray-text">
            Select all communication channels you&apos;d like to enable. You can add more later.
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
        {channels.map((channel) => {
          const isSelected = value.includes(channel.value);
          const isLocked = isChannelLocked(channel.value);
          const requiredPlan = isLocked ? getRequiredPlan(requiresUpgrade(channel.value) || '') : null;

          return (
            <OptionCard
              key={channel.value}
              icon={
                <Image
                  src={channel.icon}
                  alt={channel.label}
                  width={28}
                  height={28}
                  unoptimized
                  className={isLocked ? 'opacity-50' : ''}
                />
              }
              title={channel.label}
              subtitle={channel.subtitle}
              selected={isSelected && !isLocked}
              onClick={() => toggleChannel(channel.value)}
              variant={isLocked ? 'locked' : 'default'}
              badge={isLocked ? <UpgradeBadge planName={requiredPlan || undefined} /> : undefined}
              disabled={isLocked}
            />
          );
        })}
      </div>

      {/* Selection count indicator */}
      {value.length > 0 && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {value.length} channel{value.length > 1 ? 's' : ''} selected
          </div>
        </div>
      )}
    </div>
  );
}