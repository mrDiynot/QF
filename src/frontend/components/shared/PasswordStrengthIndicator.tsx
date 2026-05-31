'use client';

import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  show?: boolean;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function PasswordStrengthIndicator({ password, show = true }: PasswordStrengthIndicatorProps) {
  const requirements = useMemo<PasswordRequirement[]>(() => [
    {
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      label: 'Contains uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Contains lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Contains number',
      met: /\d/.test(password),
    },
    {
      label: 'Contains special character',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;
    if (metCount === 0) return { label: '', color: '', width: '0%' };
    if (metCount <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (metCount <= 4) return { label: 'Medium', color: 'bg-yellow-500', width: '66%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  }, [requirements]);

  if (!show || !password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 font-medium">Password strength</span>
          {strength.label && (
            <span className={cn(
              "font-semibold",
              strength.label === 'Weak' && 'text-red-600',
              strength.label === 'Medium' && 'text-yellow-600',
              strength.label === 'Strong' && 'text-green-600'
            )}>
              {strength.label}
            </span>
          )}
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300", strength.color)}
            style={{ width: strength.width }}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-1.5">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="size-3.5 text-green-600 shrink-0" />
            ) : (
              <X className="size-3.5 text-gray-400 shrink-0" />
            )}
            <span className={cn(
              "transition-colors",
              req.met ? 'text-green-600 font-medium' : 'text-gray-500'
            )}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
