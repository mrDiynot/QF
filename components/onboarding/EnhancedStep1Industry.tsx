'use client';

/**
 * Enhanced Step 1: Business Type
 * Competitive redesign with modern aesthetics
 * Features: AI-themed design, smooth animations, gradient accents
 */

import { BusinessType } from '@/types/onboarding';
import { EnhancedBusinessTypeCard } from './EnhancedBusinessTypeCard';
import { OnboardingHero } from './OnboardingHero';
import { 
  Building2, 
  Home, 
  Scale, 
  Stethoscope, 
  GraduationCap, 
  Landmark, 
  Megaphone, 
  Code, 
  MoreHorizontal 
} from 'lucide-react';

interface EnhancedStep1IndustryProps {
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
  { 
    value: 'real_estate', 
    label: 'Real Estate', 
    subtitle: 'Agents & brokers', 
    icon: <Building2 className="size-7" strokeWidth={1.5} /> 
  },
  { 
    value: 'home_services', 
    label: 'Home Services', 
    subtitle: 'HVAC, plumbing, etc.', 
    icon: <Home className="size-7" strokeWidth={1.5} /> 
  },
  { 
    value: 'legal', 
    label: 'Legal', 
    subtitle: 'Law firms & attorneys', 
    icon: <Scale className="size-7" strokeWidth={1.5} /> 
  },
  { 
    value: 'healthcare', 
    label: 'Healthcare', 
    subtitle: 'Clinics & practices', 
    icon: <Stethoscope className="size-7" strokeWidth={1.5} /> 
  },
  
  // Additional Supported Industries
  { 
    value: 'coaching', 
    label: 'Coaching', 
    subtitle: 'Coaches & consultants', 
    icon: <GraduationCap className="size-7" strokeWidth={1.5} /> 
  },
  { 
    value: 'finance', 
    label: 'Finance', 
    subtitle: 'Financial services', 
    icon: <Landmark className="size-7" strokeWidth={1.5} /> 
  },
  { 
    value: 'agency', 
    label: 'Agency', 
    subtitle: 'Marketing & creative', 
    icon: <Megaphone className="size-7" strokeWidth={1.5} /> 
  },
  { 
    value: 'saas', 
    label: 'SaaS', 
    subtitle: 'Software companies', 
    icon: <Code className="size-7" strokeWidth={1.5} /> 
  },
  { 
    value: 'other', 
    label: 'Other', 
    subtitle: 'Something else', 
    icon: <MoreHorizontal className="size-7" strokeWidth={1.5} /> 
  },
];

export function EnhancedStep1Industry({ value, onChange }: EnhancedStep1IndustryProps) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <OnboardingHero
        title="What type of business are you?"
        subtitle="We'll customize your AI-powered workspace based on your industry and specific needs."
      />

      {/* Business Type Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {businessTypes.map((type, index) => (
          <EnhancedBusinessTypeCard
            key={type.value}
            icon={type.icon}
            title={type.label}
            subtitle={type.subtitle}
            selected={value === type.value}
            onClick={() => onChange(type.value)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
