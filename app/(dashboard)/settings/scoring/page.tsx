'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect page - /settings/scoring is deprecated
 * All scoring and AI configuration is now consolidated in /settings/ai-training
 */
export default function ScoringRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/ai-training');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-muted-foreground">Redirecting to AI Training settings...</p>
    </div>
  );
}
