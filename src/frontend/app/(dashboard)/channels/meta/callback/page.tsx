'use client';

/**
 * Meta OAuth Callback Page
 * Handles the redirect from Facebook OAuth and notifies the original tab
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

// Channel name for cross-tab communication
const META_OAUTH_CHANNEL = 'meta-oauth-result';

export default function MetaOAuthCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get('success') === 'true';
    const error = searchParams.get('error');
    const channelType = searchParams.get('channelType');

    if (success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMessage(error || 'Failed to connect Facebook account');
    }

    // Notify the original tab about the OAuth result
    try {
      // Method 1: BroadcastChannel (modern browsers)
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel(META_OAUTH_CHANNEL);
        channel.postMessage({ success, error, channelType });
        channel.close();
      }

      // Method 2: localStorage event (fallback for older browsers)
      localStorage.setItem(META_OAUTH_CHANNEL, JSON.stringify({
        success,
        error,
        channelType,
        timestamp: Date.now(),
      }));
      // Clean up after a short delay
      setTimeout(() => localStorage.removeItem(META_OAUTH_CHANNEL), 1000);
    } catch {
      // Ignore errors in cross-tab communication
    }

    // Auto-close this tab after a delay if successful
    if (success) {
      setTimeout(() => {
        window.close();
      }, 2000);
    }
  }, [searchParams]);

  const handleClose = () => {
    window.close();
  };

  const handleReturnToApp = () => {
    window.location.href = '/dashboard/channels/social';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {status === 'loading' && (
              <>
                <div className="flex justify-center">
                  <Loader2 className="size-12 text-purple-600 animate-spin" />
                </div>
                <h2 className="text-xl font-semibold">Processing...</h2>
                <p className="text-gray-500">Completing Facebook connection</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex justify-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle2 className="size-12 text-green-600" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-green-700">Connected Successfully!</h2>
                <p className="text-gray-500">
                  Your Facebook account has been connected. This window will close automatically.
                </p>
                <div className="flex gap-3 justify-center pt-4">
                  <Button variant="outline" onClick={handleClose}>
                    Close Window
                  </Button>
                  <Button onClick={handleReturnToApp}>
                    Return to App
                  </Button>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex justify-center">
                  <div className="p-3 bg-red-100 rounded-full">
                    <XCircle className="size-12 text-red-600" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-red-700">Connection Failed</h2>
                <p className="text-gray-500">
                  {errorMessage}
                </p>
                <div className="flex gap-3 justify-center pt-4">
                  <Button variant="outline" onClick={handleClose}>
                    Close Window
                  </Button>
                  <Button onClick={handleReturnToApp}>
                    Try Again
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

