'use client';

/**
 * Step 3: AI Configuration
 */

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAIConfiguration } from '@/hooks/onboarding/useOnboarding';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { toast } from 'sonner';

export function Step3AIConfiguration() {
  const { setAIConfiguration, setCurrentStep } = useOnboardingStore();
  const { mutate: saveConfig, isPending } = useAIConfiguration();
  
  const [weights, setWeights] = useState({
    budget: 25,
    authority: 25,
    need: 25,
    timeline: 25,
  });

  const total = weights.budget + weights.authority + weights.need + weights.timeline;

  const handleWeightChange = (key: keyof typeof weights, value: number[]) => {
    setWeights(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleContinue = () => {
    if (total !== 100) {
      toast.error('Total weights must equal 100%');
      return;
    }

    // Pass the weights directly - the hook will map to API format
    saveConfig(weights, {
      onSuccess: () => {
        // Map form data to store data format
        setAIConfiguration({
          persona: 'professional', // Default persona
          scoringWeights: weights,
        });
        setCurrentStep(4);
      },
    });
  };

  const handleBack = () => {
    setCurrentStep(2);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>BANT Scoring Criteria</CardTitle>
          <CardDescription>
            Adjust the weights for each qualification criterion. Total must equal 100%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <Label>Budget</Label>
              <span className="text-sm font-medium">{weights.budget}%</span>
            </div>
            <Slider
              value={[weights.budget]}
              onValueChange={(value) => handleWeightChange('budget', value)}
              max={100}
              step={5}
              disabled={isPending}
            />
            <p className="text-sm text-muted-foreground mt-1">
              How important is the lead&apos;s budget in qualification?
            </p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Authority</Label>
              <span className="text-sm font-medium">{weights.authority}%</span>
            </div>
            <Slider
              value={[weights.authority]}
              onValueChange={(value) => handleWeightChange('authority', value)}
              max={100}
              step={5}
              disabled={isPending}
            />
            <p className="text-sm text-muted-foreground mt-1">
              How important is decision-making authority?
            </p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Need</Label>
              <span className="text-sm font-medium">{weights.need}%</span>
            </div>
            <Slider
              value={[weights.need]}
              onValueChange={(value) => handleWeightChange('need', value)}
              max={100}
              step={5}
              disabled={isPending}
            />
            <p className="text-sm text-muted-foreground mt-1">
              How important is the lead&apos;s need or pain point?
            </p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Timeline</Label>
              <span className="text-sm font-medium">{weights.timeline}%</span>
            </div>
            <Slider
              value={[weights.timeline]}
              onValueChange={(value) => handleWeightChange('timeline', value)}
              max={100}
              step={5}
              disabled={isPending}
            />
            <p className="text-sm text-muted-foreground mt-1">
              How important is the lead&apos;s purchase timeline?
            </p>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Weight</span>
              <span className={`text-lg font-bold ${total === 100 ? 'text-green-600' : 'text-destructive'}`}>
                {total}%
              </span>
            </div>
            {total !== 100 && (
              <p className="text-sm text-destructive mt-1">
                Adjust the weights so the total equals 100%
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={isPending}>
          Back
        </Button>
        <Button onClick={handleContinue} disabled={isPending || total !== 100}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
}