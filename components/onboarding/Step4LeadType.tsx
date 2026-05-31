'use client';

import Image from 'next/image';
import { LeadType } from '@/types/onboarding';
import { OptionCard } from './shared/OptionCard';

interface Step4LeadTypeProps {
  value: LeadType | '';
  onChange: (value: LeadType) => void;
}

const leadTypes = [
  { value: 'b2b' as LeadType, label: 'B2B Clients', description: 'Business to business', icon: '/icons/leads/briefcase.svg' },
  { value: 'b2c' as LeadType, label: 'B2C Consumers', description: 'Direct to consumer', icon: '/icons/team/users.svg' },
  { value: 'both' as LeadType, label: 'Both B2B & B2C', description: 'Mixed customer base', icon: '/icons/leads/target.svg' },
];

export function Step4LeadType({ value, onChange }: Step4LeadTypeProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-2 text-text-navy">What type of leads do you work with?</h2>
        <p className="body-text mt-2 text-gray-text">
          This helps us customize your qualification questions and scoring system.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {leadTypes.map((type) => (
          <OptionCard
            key={type.value}
            icon={
              <Image
                src={type.icon}
                alt={type.label}
                width={24}
                height={24}
                unoptimized
              />
            }
            title={type.label}
            subtitle={type.description}
            selected={value === type.value}
            onClick={() => onChange(type.value)}
          />
        ))}
      </div>
    </div>
  );
}