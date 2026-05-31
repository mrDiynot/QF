'use client';

/**
 * Step 1: Business Type (Simplified for dashboard-native onboarding)
 * No hero section - just the business type cards
 */

import { BusinessType } from '@/types/onboarding';
import { EnhancedBusinessTypeCard } from '../EnhancedBusinessTypeCard';
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

interface Step1BusinessTypeSimplifiedProps {
  value: BusinessType | '';
  onChange: (value: BusinessType) => void;
}

const businessTypes: Array<{
  value: BusinessType;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
}> = [
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

export function Step1BusinessTypeSimplified({ value, onChange }: Step1BusinessTypeSimplifiedProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
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
  );
}
