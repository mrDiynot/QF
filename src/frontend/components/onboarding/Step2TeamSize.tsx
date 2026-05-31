'use client';

import { Users } from 'lucide-react';
import { OptionCard } from './shared/OptionCard';

interface Step2TeamSizeProps {
  value: string;
  onChange: (value: string) => void;
}

const teamSizes = [
  { id: 'solo', label: 'Just Me', description: 'Solo entrepreneur' },
  { id: 'small', label: '2-5 People', description: 'Small team' },
  { id: 'growing', label: '6-20 People', description: 'Growing business' },
  { id: 'midsize', label: '21-50 People', description: 'Mid-size company' },
  { id: 'enterprise', label: '50+ People', description: 'Enterprise' },
];

export function Step2TeamSize({ value, onChange }: Step2TeamSizeProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-2 text-text-navy">How many team members do you have?</h2>
        <p className="body-text mt-2 text-gray-text">
          We&apos;ll configure user roles and permissions based on your team size.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {teamSizes.map((size) => (
          <OptionCard
            key={size.id}
            icon={<Users className="size-6" />}
            title={size.label}
            subtitle={size.description}
            selected={value === size.id}
            onClick={() => onChange(size.id)}
          />
        ))}
      </div>
    </div>
  );
}