'use client';

/**
 * AI Form Generation Dialog
 * Multi-step wizard for generating forms using AI
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { businessService } from '@/services/api/business.service';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Building2,
  MessageSquare,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIFormGeneration } from '@/hooks/api/useAIFormGeneration';
import { AIFormPreview } from './AIFormPreview';
import type {
  GenerateFormRequest,
  AIFormGenerationState,
} from '@/types/ai-forms';
import { INDUSTRY_OPTIONS, TONE_OPTIONS } from '@/types/ai-forms';

interface AIFormGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INITIAL_STATE: AIFormGenerationState = {
  step: 1,
  purpose: '',
  industry: '',
  includeBantFields: true,
  tone: 'Professional',
  maxFields: 8,
  generatedForm: null,
  auditId: null,
  isGenerating: false,
  error: null,
};

export function AIFormGenerationDialog({ open, onOpenChange }: AIFormGenerationDialogProps) {
  const router = useRouter();
  const [state, setState] = useState<AIFormGenerationState>(INITIAL_STATE);

  // Fetch business profile to pre-populate industry
  const { data: businessProfile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: businessService.getBusinessProfile,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: open, // Only fetch when dialog is open
  });

  // Pre-populate industry from business profile when dialog opens
  useEffect(() => {
    if (open && businessProfile?.industry && !state.industry) {
      setState(prev => ({ ...prev, industry: businessProfile.industry || '' }));
    }
  }, [open, businessProfile?.industry, state.industry]);

  const { mutateAsync: generateForm, isPending } = useAIFormGeneration({
    onSuccess: (result) => {
      if (result.success && result.form) {
        const form = result.form; // Extract to ensure it's defined
        setState(prev => ({
          ...prev,
          step: 3,
          generatedForm: form,
          auditId: result.auditId ?? null,
          isGenerating: false,
          error: null,
        }));
      }
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message || 'Failed to generate form',
      }));
    },
  });

  const handleClose = useCallback(() => {
    setState(INITIAL_STATE);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleNext = useCallback(async () => {
    if (state.step === 1) {
      if (!state.purpose.trim()) {
        setState(prev => ({ ...prev, error: 'Please describe your form purpose' }));
        return;
      }
      setState(prev => ({ ...prev, step: 2, error: null }));
    } else if (state.step === 2) {
      setState(prev => ({ ...prev, isGenerating: true, error: null }));
      const request: GenerateFormRequest = {
        purpose: state.purpose,
        industry: state.industry || undefined,
        tone: state.tone,
        includeBantFields: state.includeBantFields,
        maxFields: state.maxFields,
      };
      try {
        await generateForm(request);
      } catch {
        // Error handled in onError callback
      }
    }
  }, [state, generateForm]);

  const handleBack = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) as 1 | 2 | 3, error: null }));
  }, []);

  const handleUseForm = useCallback(() => {
    if (!state.generatedForm) return;
    // Store generated form in sessionStorage for FormBuilder to pick up
    sessionStorage.setItem('ai-generated-form', JSON.stringify(state.generatedForm));
    handleClose();
    router.push('/forms/builder?source=ai');
  }, [state.generatedForm, handleClose, router]);

  const updateState = useCallback((updates: Partial<AIFormGenerationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            AI Form Generator
          </ModalTitle>
          <ModalDescription>
            {state.step === 1 && 'Describe what kind of form you need'}
            {state.step === 2 && 'Customize your form generation options'}
            {state.step === 3 && 'Review your AI-generated form'}
          </ModalDescription>
        </ModalHeader>

        <ModalBody>
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                "flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                state.step === step && "bg-primary text-white",
                state.step > step && "bg-green-500 text-white",
                state.step < step && "bg-muted text-muted-foreground"
              )}>
                {state.step > step ? <CheckCircle2 className="size-4" /> : step}
              </div>
              {step < 3 && (
                <div className={cn(
                  "h-0.5 w-8 mx-1",
                  state.step > step ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Purpose */}
        {state.step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose" className="flex items-center gap-2">
                <Wand2 className="size-4 text-primary" />
                What kind of form do you need?
              </Label>
              <Textarea
                id="purpose"
                placeholder="e.g., A lead capture form for my SaaS product that collects contact info and qualifies prospects based on company size and budget..."
                value={state.purpose}
                onChange={(e) => updateState({ purpose: e.target.value, error: null })}
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Be specific about your goals. AI will generate optimized fields for lead qualification.
              </p>
            </div>
            {state.error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="size-4" />
                {state.error}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Options */}
        {state.step === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="industry" className="flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                Industry (optional)
              </Label>
              <Select value={state.industry} onValueChange={(v) => updateState({ industry: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry..." />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone" className="flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                Form Tone
              </Label>
              <Select value={state.tone} onValueChange={(v: 'Professional' | 'Friendly' | 'Casual') => updateState({ tone: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      <div>
                        <div className="font-medium">{tone.label}</div>
                        <div className="text-xs text-muted-foreground">{tone.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="bant" className="flex items-center gap-2">
                  <Target className="size-4 text-primary" />
                  Include BANT Qualification Fields
                </Label>
                <p className="text-xs text-muted-foreground">
                  Add Budget, Authority, Need, Timeline fields for lead scoring
                </p>
              </div>
              <Switch
                id="bant"
                checked={state.includeBantFields}
                onCheckedChange={(checked) => updateState({ includeBantFields: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxFields">Maximum Fields: {state.maxFields}</Label>
              <Input
                id="maxFields"
                type="range"
                min={4}
                max={15}
                value={state.maxFields}
                onChange={(e) => updateState({ maxFields: parseInt(e.target.value) })}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 6-10 fields for optimal conversion
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {state.step === 3 && state.generatedForm && (
          <AIFormPreview form={state.generatedForm} />
        )}
        </ModalBody>

        {/* Footer */}
        <ModalFooter className="flex-col sm:flex-row gap-2 pt-4">
          {state.step > 1 && !isPending && (
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="size-4" />
              Back
            </Button>
          )}
          <div className="flex-1" />
          {state.step < 3 && (
            <Button
              onClick={handleNext}
              disabled={isPending || (state.step === 1 && !state.purpose.trim())}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  {state.step === 2 ? 'Generate Form' : 'Next'}
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          )}
          {state.step === 3 && (
            <Button onClick={handleUseForm} className="gap-2">
              <Sparkles className="size-4" />
              Customize in Builder
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AIFormGenerationDialog;

