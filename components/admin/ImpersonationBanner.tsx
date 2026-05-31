'use client';

import { AlertTriangle, X, User, Building2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImpersonation } from '@/hooks/admin/useImpersonation';

export function ImpersonationBanner() {
  const { isImpersonating, session, endImpersonation } = useImpersonation();

  if (!isImpersonating || !session) {
    return null;
  }

  const formatDuration = () => {
    const start = new Date(session.startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins}m`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-black">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" />
              <span>Impersonation Mode</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>{session.userEmail}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                <span>{session.businessName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDuration()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-75">
              Reason: {session.reason}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={endImpersonation}
              className="bg-black/20 border-black/30 text-black hover:bg-black/30"
            >
              <X className="h-4 w-4 mr-1" />
              End Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

