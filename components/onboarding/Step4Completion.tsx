'use client';

/**
 * Step 4: Completion Screen
 */

import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCompleteOnboarding } from '@/hooks/onboarding/useOnboarding';

export function Step4Completion() {
  const { mutate: complete, isPending } = useCompleteOnboarding();

  const handleComplete = () => {
    complete();
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 p-6">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold">Setup Complete!</h2>
        <p className="mt-2 text-lg text-muted-foreground">
          Your Qualiflow AI workspace is ready to use
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">What&apos;s next?</h3>
          <ul className="space-y-3 text-left">
            <li className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Invite your team</p>
                <p className="text-sm text-muted-foreground">
                  Add team members and assign roles
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Create your first form</p>
                <p className="text-sm text-muted-foreground">
                  Design a lead capture form for your website
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Test a conversation</p>
                <p className="text-sm text-muted-foreground">
                  Try out the AI-powered chat to see it in action
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Connect your CRM</p>
                <p className="text-sm text-muted-foreground">
                  Integrate with your existing tools
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Button size="lg" onClick={handleComplete} disabled={isPending} className="w-full max-w-md">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Completing setup...
          </>
        ) : (
          'Go to Dashboard'
        )}
      </Button>
    </div>
  );
}