'use client';

/**
 * Step 3: Lead Capture Sources
 * Where will QualiFlow AI capture your leads?
 *
 * Design: Uses OptionCard in grid layout with Select All toggle
 */

import { LeadCaptureSource } from '@/types/onboarding';
import { Globe, Share2, MousePointerClick, Users, Mail, Calendar, Sparkles, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OptionCard } from './shared/OptionCard';

interface Step3LeadSourcesProps {
  value: LeadCaptureSource[];
  onChange: (value: LeadCaptureSource[]) => void;
}

interface SourceOption {
  value: LeadCaptureSource;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const sourceOptions: SourceOption[] = [
  { value: 'website', label: 'Website', description: 'Forms & popups', icon: <Globe className="w-7 h-7" /> },
  { value: 'social_media', label: 'Social Media', description: 'Instagram, FB, LinkedIn', icon: <Share2 className="w-7 h-7" /> },
  { value: 'google_ads', label: 'Google Ads', description: 'Paid campaigns', icon: <MousePointerClick className="w-7 h-7" /> },
  { value: 'referrals', label: 'Referrals', description: 'Word of mouth', icon: <Users className="w-7 h-7" /> },
  { value: 'cold_outreach', label: 'Cold Outreach', description: 'Email & phone', icon: <Mail className="w-7 h-7" /> },
  { value: 'events', label: 'Events', description: 'Trade shows', icon: <Calendar className="w-7 h-7" /> },
];

const allSources = sourceOptions.map(s => s.value);

export function Step3LeadSources({ value, onChange }: Step3LeadSourcesProps) {
  const allSelected = allSources.every(s => value.includes(s));
  const someSelected = value.length > 0 && !allSelected;

  const handleSelectAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(allSources);
    }
  };

  const toggleSource = (source: LeadCaptureSource) => {
    if (value.includes(source)) {
      onChange(value.filter(s => s !== source));
    } else {
      onChange([...value, source]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Select All */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="heading-2 text-text-navy">Where will QualiFlow AI capture your leads?</h2>
          <p className="body-text mt-2 text-gray-text">
            Select all the sources where your leads come from. This helps us optimize your capture strategy.
          </p>
        </div>

        {/* Select All Button */}
        <button
          type="button"
          onClick={handleSelectAll}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shrink-0',
            allSelected
              ? 'bg-primary/10 text-primary hover:bg-primary/20'
              : 'bg-muted/40 text-muted-foreground hover:bg-primary/5 hover:text-primary'
          )}
        >
          <div className={cn(
            'flex size-5 items-center justify-center rounded border-2 transition-all duration-300',
            allSelected
              ? 'border-primary bg-primary/50'
              : someSelected
                ? 'border-purple-400 bg-primary/10'
                : 'border-border bg-white'
          )}>
            {allSelected ? (
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            ) : someSelected ? (
              <div className="w-2 h-0.5 bg-primary/50 rounded" />
            ) : null}
          </div>
          <CheckCheck className="w-4 h-4" />
          <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sourceOptions.map((source) => (
          <OptionCard
            key={source.value}
            icon={source.icon}
            title={source.label}
            subtitle={source.description}
            selected={value.includes(source.value)}
            onClick={() => toggleSource(source.value)}
          />
        ))}
      </div>

      {/* Selection count */}
      {value.length > 0 && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {value.length} source{value.length > 1 ? 's' : ''} selected
          </div>
        </div>
      )}
    </div>
  );
}

