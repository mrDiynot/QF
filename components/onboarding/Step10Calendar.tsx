'use client';

/**
 * Step 10: Calendar Integration
 * Connect your calendar for automatic appointment booking
 * Per Figma: Google Calendar, Outlook/Office 365, QualiFlow AI Calendar
 *
 * Design: Uses shared OptionCard component for consistency
 */

import { CalendarProvider } from '@/types/onboarding';
import { Info, Calendar } from 'lucide-react';
import { OptionCard } from './shared/OptionCard';
import { RecommendedBadge } from './shared/RecommendedBadge';

interface Step10CalendarProps {
  value: CalendarProvider | '';
  onChange: (value: CalendarProvider) => void;
}

interface CalendarOption {
  value: CalendarProvider;
  label: string;
  description: string;
  emoji: string;
  recommended?: boolean;
}

const calendarOptions: CalendarOption[] = [
  { value: 'google', label: 'Google Calendar', description: 'Connect Google', emoji: '📅' },
  { value: 'outlook', label: 'Outlook / Office 365', description: 'Connect Microsoft', emoji: '📆' },
  { value: 'qualiflow', label: 'QualiFlow AI Calendar', description: 'Built-in (optional)', emoji: '✨', recommended: true },
];

export function Step10Calendar({ value, onChange }: Step10CalendarProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-2 text-text-navy">Connect your calendar</h2>
        <p className="body-text mt-2 text-gray-text">
          QualiFlow AI reads your availability and books appointments automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {calendarOptions.map((option) => (
          <OptionCard
            key={option.value}
            emoji={option.emoji}
            title={option.label}
            subtitle={option.description}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
            variant={option.recommended ? 'recommended' : 'default'}
            badge={option.recommended ? <RecommendedBadge /> : undefined}
          />
        ))}
      </div>

      {/* Privacy Note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border">
        <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <p className="text-sm text-info">
          We never modify or delete events — we only read availability.
        </p>
      </div>

      {/* Selected indicator */}
      {value && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-primary text-sm font-medium">
            <Calendar className="w-4 h-4" />
            {calendarOptions.find(o => o.value === value)?.label} selected
          </div>
        </div>
      )}
    </div>
  );
}

