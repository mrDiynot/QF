'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CapsLockWarningProps {
  show?: boolean;
  className?: string;
}

/**
 * CapsLockWarning component
 * Displays a warning when Caps Lock is enabled during password entry
 */
export function CapsLockWarning({ show = true, className }: CapsLockWarningProps) {
  const [capsLockOn, setCapsLockOn] = useState(false);

  useEffect(() => {
    const checkCapsLock = (event: KeyboardEvent) => {
      if (event.getModifierState) {
        setCapsLockOn(event.getModifierState('CapsLock'));
      }
    };

    // Check on key press
    window.addEventListener('keydown', checkCapsLock);
    window.addEventListener('keyup', checkCapsLock);

    return () => {
      window.removeEventListener('keydown', checkCapsLock);
      window.removeEventListener('keyup', checkCapsLock);
    };
  }, []);

  if (!show || !capsLockOn) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mt-1.5",
      className
    )}>
      <AlertTriangle className="size-3.5 shrink-0" />
      <span className="font-medium">Caps Lock is on</span>
    </div>
  );
}
