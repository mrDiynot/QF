'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect page - /settings/voice-agents is deprecated
 * All voice agent configuration is now consolidated in /ai-voice
 */
export default function VoiceAgentsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ai-voice');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-muted-foreground">Redirecting to Voice Agents...</p>
    </div>
  );
}
