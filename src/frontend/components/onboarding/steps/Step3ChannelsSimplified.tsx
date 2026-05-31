'use client';

/**
 * Step 3: Communication Channels (Simplified for 3-step onboarding)
 * Quick channel selection with AI recommendations pre-selected
 */

import { Channel } from '@/types/onboarding';
import { MessageSquare, Phone, Mail, Globe, MessageCircle, Share2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Step3ChannelsSimplifiedProps {
  value: Channel[];
  onChange: (value: Channel[]) => void;
  recommendedChannels?: Channel[];
  isLoadingRecommendations?: boolean;
}

const channelOptions = [
  { 
    value: 'sms' as Channel, 
    label: 'SMS', 
    subtitle: 'Text messaging', 
    icon: MessageSquare,
    recommended: true,
  },
  { 
    value: 'phone' as Channel, 
    label: 'Phone', 
    subtitle: 'Voice calls', 
    icon: Phone,
    recommended: true,
  },
  { 
    value: 'web_chat' as Channel, 
    label: 'Web Chat', 
    subtitle: 'Website widget', 
    icon: Globe,
    recommended: true,
  },
  { 
    value: 'email' as Channel, 
    label: 'Email', 
    subtitle: 'Email campaigns', 
    icon: Mail,
    recommended: false,
  },
  { 
    value: 'whatsapp' as Channel, 
    label: 'WhatsApp', 
    subtitle: 'WhatsApp Business', 
    icon: MessageCircle,
    recommended: false,
  },
  {
    value: 'social' as Channel,
    label: 'Social',
    subtitle: 'Instagram + Facebook',
    icon: Share2,
    recommended: false,
  },
  {
    value: 'web_forms' as Channel,
    label: 'Web Forms',
    subtitle: 'Lead capture forms',
    icon: FileText,
    recommended: false,
  },
];

export function Step3ChannelsSimplified({ 
  value, 
  onChange,
  recommendedChannels 
}: Step3ChannelsSimplifiedProps) {
  const toggleChannel = (channel: Channel) => {
    if (value.includes(channel)) {
      onChange(value.filter(c => c !== channel));
    } else {
      onChange([...value, channel]);
    }
  };

  const isRecommended = (channel: Channel) => {
    return recommendedChannels?.includes(channel) ?? channelOptions.find(c => c.value === channel)?.recommended;
  };

  // Group channels
  const recommended = channelOptions.filter(c => isRecommended(c.value));
  const other = channelOptions.filter(c => !isRecommended(c.value));

  const renderChannelCard = (channel: typeof channelOptions[0]) => {
    const Icon = channel.icon;
    const isSelected = value.includes(channel.value);
    const recommended = isRecommended(channel.value);

    return (
      <button
        key={channel.value}
        type="button"
        onClick={() => toggleChannel(channel.value)}
        className={cn(
          'relative flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200',
          'hover:shadow-md hover:-translate-y-0.5',
          isSelected
            ? 'border-brand-orange bg-brand-orange/5 shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300'
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            'flex size-9 sm:size-10 items-center justify-center rounded-lg shrink-0',
            isSelected ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-600'
          )}
        >
          <Icon className="size-4 sm:size-5" />
        </div>

        {/* Label */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <p className="text-xs sm:text-sm font-semibold text-gray-900">{channel.label}</p>
            {recommended && (
              <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-3.5 sm:h-4 bg-purple-100 text-purple-700">
                AI Pick
              </Badge>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{channel.subtitle}</p>
        </div>

        {/* Checkmark */}
        {isSelected && (
          <div className="size-4 sm:size-5 rounded-full bg-brand-orange flex items-center justify-center shrink-0">
            <svg className="size-2.5 sm:size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Recommended Section */}
      {recommended.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Recommended for you</h4>
            <Badge variant="secondary" className="text-[9px] sm:text-xs px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-200">
              AI Selected
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {recommended.map(renderChannelCard)}
          </div>
        </div>
      )}

      {/* Other Channels */}
      {other.length > 0 && (
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2.5 sm:mb-3">Other channels</h4>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {other.map(renderChannelCard)}
          </div>
        </div>
      )}
    </div>
  );
}
