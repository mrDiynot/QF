'use client';

import { useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';

// Plan name mapping
const planNames: Record<string, string> = {
  'free-flow': 'Free Flow',
  'smartflow': 'Smart Flow',
  'ultraflow': 'Ultra Flow',
  'enterprise': 'Enterprise',
};

export function RegisterPlanBadge() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') || 'free-flow';

  const planName = planNames[planId] || 'Free Flow';
  const displayText = `Start with ${planName}`;

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200 px-4 py-2 mb-6">
      
      <span className="text-sm font-medium text-brand-orange">{displayText}</span>
    </div>
  );
}

