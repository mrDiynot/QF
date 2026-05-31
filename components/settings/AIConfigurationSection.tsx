'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Save, Loader2, Briefcase, Smile, Coffee, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIConfiguration, ScoringWeights } from '@/types/ai-config';

interface AIConfigurationSectionProps {
  config?: AIConfiguration;
  onSave: (config: Partial<AIConfiguration>) => void;
  isSaving?: boolean;
}

const PERSONA_OPTIONS = [
  { value: 'professional', label: 'Professional', icon: Briefcase, description: 'Formal & polished' },
  { value: 'friendly', label: 'Friendly', icon: Smile, description: 'Warm & approachable' },
  { value: 'casual', label: 'Casual', icon: Coffee, description: 'Relaxed & informal' },
  { value: 'formal', label: 'Formal', icon: MessageSquare, description: 'Highly structured' },
] as const;

export function AIConfigurationSection({ config, onSave, isSaving }: AIConfigurationSectionProps) {
  const [persona, setPersona] = useState(config?.persona || 'professional');
  const [threshold, setThreshold] = useState(config?.qualificationThreshold || 70);
  const [greetingMessage, setGreetingMessage] = useState(config?.greetingMessage || 'Hi! How can we help you today?');
  const [weights, setWeights] = useState<ScoringWeights>(
    config?.scoringWeights || { budget: 25, timeline: 25, authority: 25, need: 25 }
  );

  const totalWeight = weights.budget + weights.timeline + weights.authority + weights.need;

  const handleWeightChange = (key: keyof ScoringWeights, value: number[]) => {
    setWeights(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleSave = () => {
    onSave({
      persona: persona as AIConfiguration['persona'],
      qualificationThreshold: threshold,
      greetingMessage,
      scoringWeights: weights,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Sparkles className="size-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-text-navy">AI Configuration</h2>
            <p className="text-sm text-text-secondary">Customize how AI qualifies and interacts with leads</p>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          className="gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:opacity-90"
          disabled={isSaving || totalWeight !== 100}
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* AI Persona */}
      <Card>
        <CardHeader>
          <CardTitle>AI Persona & Tone</CardTitle>
          <CardDescription>Choose how the AI communicates with your leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {PERSONA_OPTIONS.map((option) => {
              const isSelected = persona === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setPersona(option.value)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border-2 px-4 py-4 text-left transition-all',
                    isSelected
                      ? 'border-primary bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                      : 'border-border bg-white hover:border-purple-400 hover:shadow-md'
                  )}
                >
                  <div className={cn(
                    'flex size-10 items-center justify-center rounded-lg',
                    isSelected ? 'bg-gradient-to-br from-purple-200 to-pink-200' : 'bg-muted/40'
                  )}>
                    <Icon className={cn('size-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <div className="flex-1">
                    <div className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-foreground/80')}>
                      {option.label}
                    </div>
                    <div className="text-xs text-text-secondary">{option.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Qualification Threshold */}
      <Card>
        <CardHeader>
          <CardTitle>Qualification Threshold</CardTitle>
          <CardDescription>Minimum score required for a lead to be marked as qualified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Threshold Score</Label>
            <span className="text-2xl font-bold text-primary">{threshold}%</span>
          </div>
          <Slider
            value={[threshold]}
            onValueChange={(value) => setThreshold(value[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
          <p className="text-sm text-text-secondary">
            Leads scoring {threshold}% or higher will be automatically marked as qualified
          </p>
        </CardContent>
      </Card>

      {/* Greeting Message */}
      <Card>
        <CardHeader>
          <CardTitle>Greeting Message</CardTitle>
          <CardDescription>The first message leads receive when they start a conversation</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={greetingMessage}
            onChange={(e) => setGreetingMessage(e.target.value)}
            placeholder="Hi! How can we help you today?"
            rows={3}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Scoring Weights (BANT) */}
      <Card>
        <CardHeader>
          <CardTitle>BANT Scoring Criteria</CardTitle>
          <CardDescription>Adjust the weights for each qualification criterion. Total must equal 100%.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget */}
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
            />
            <p className="text-sm text-text-secondary mt-1">
              How important is the lead&apos;s budget in qualification?
            </p>
          </div>

          {/* Authority */}
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
            />
            <p className="text-sm text-text-secondary mt-1">
              How important is decision-making authority?
            </p>
          </div>

          {/* Need */}
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
            />
            <p className="text-sm text-text-secondary mt-1">
              How important is the lead&apos;s need or pain point?
            </p>
          </div>

          {/* Timeline */}
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
            />
            <p className="text-sm text-text-secondary mt-1">
              How important is the lead&apos;s purchase timeline?
            </p>
          </div>

          {/* Total Weight Indicator */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Weight</span>
              <span className={`text-lg font-bold ${totalWeight === 100 ? 'text-green-600' : 'text-destructive'}`}>
                {totalWeight}%
              </span>
            </div>
            {totalWeight !== 100 && (
              <p className="text-sm text-destructive mt-1">
                Adjust the weights so the total equals 100%
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

