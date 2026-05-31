'use client';

/**
 * Step 1: Business Type
 * Per Figma: 9 business categories in a 3x3 grid
 */

import { BusinessType } from '@/types/onboarding';
import { OptionCard } from './shared/OptionCard';
import { Building2, Home, Scale, Stethoscope, GraduationCap, Landmark, Megaphone, Code, MoreHorizontal } from 'lucide-react';

interface Step1IndustryProps {
  value: BusinessType | '';
  onChange: (value: BusinessType) => void;
}

// QualiFlow AI's core industries appear first (proprietary features & templates)
const businessTypes: Array<{
  value: BusinessType;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
}> = [
  // Core QualiFlow AI Industries (with specialized features)
  { value: 'real_estate', label: 'Real Estate', subtitle: 'Agents & brokers', icon: <Building2 className="w-7 h-7" /> },
  { value: 'home_services', label: 'Home Services', subtitle: 'HVAC, plumbing, etc.', icon: <Home className="w-7 h-7" /> },
  { value: 'legal', label: 'Legal', subtitle: 'Law firms & attorneys', icon: <Scale className="w-7 h-7" /> },
  { value: 'healthcare', label: 'Healthcare', subtitle: 'Clinics & practices', icon: <Stethoscope className="w-7 h-7" /> },
  
  // Additional Supported Industries
  { value: 'coaching', label: 'Coaching', subtitle: 'Coaches & consultants', icon: <GraduationCap className="w-7 h-7" /> },
  { value: 'finance', label: 'Finance', subtitle: 'Financial services', icon: <Landmark className="w-7 h-7" /> },
  { value: 'agency', label: 'Agency', subtitle: 'Marketing & creative', icon: <Megaphone className="w-7 h-7" /> },
  { value: 'saas', label: 'SaaS', subtitle: 'Software companies', icon: <Code className="w-7 h-7" /> },
  { value: 'other', label: 'Other', subtitle: 'Something else', icon: <MoreHorizontal className="w-7 h-7" /> },
];

export function Step1Industry({ value, onChange }: Step1IndustryProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-2 text-foreground">What type of business are you?</h2>
        <p className="body-text mt-2 text-muted-foreground">
          This helps us recommend the right templates and automations for your business.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {businessTypes.map((type) => (
          <OptionCard
            key={type.value}
            icon={type.icon}
            title={type.label}
            subtitle={type.subtitle}
            selected={value === type.value}
            onClick={() => onChange(type.value)}
          />
        ))}
      </div>
    </div>
  );
}