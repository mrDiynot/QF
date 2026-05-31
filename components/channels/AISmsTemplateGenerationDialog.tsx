'use client';

/**
 * AI SMS Template Generation Dialog
 * Multi-step wizard for generating SMS templates using AI
 */

import { useState, useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/modals';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAISmsTemplateGeneration } from '@/hooks/api/useAISmsTemplateGeneration';
import { smsTemplatesService } from '@/services/api/sms-templates.service';
import type {
  GenerateSmsTemplateRequest,
  AISmsTemplateGenerationState,
  GeneratedSmsTemplate,
} from '@/types/ai-sms-templates';
import { INDUSTRY_OPTIONS, TONE_OPTIONS, SMS_TEMPLATE_CATEGORIES } from '@/types/ai-sms-templates';

interface AISmsTemplateGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSelect?: (template: GeneratedSmsTemplate) => void;
  onTemplateSaved?: () => void;
}

const INITIAL_STATE: AISmsTemplateGenerationState = {
  step: 1,
  purpose: '',
  industry: '',
  tone: 'Professional',
  category: 'General',
  variationCount: 3,
  businessContext: '',
  includeVariables: true,
  generatedTemplates: [],
  auditId: null,
  isGenerating: false,
  error: null,
};

export function AISmsTemplateGenerationDialog({
  open,
  onOpenChange,
  onTemplateSelect,
  onTemplateSaved,
}: AISmsTemplateGenerationDialogProps) {
  const [state, setState] = useState<AISmsTemplateGenerationState>(INITIAL_STATE);
  const [savedTemplateIds, setSavedTemplateIds] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  const { mutateAsync: generateTemplates, isPending } = useAISmsTemplateGeneration({
    onSuccess: (result) => {
      if (result.success && result.templates.length > 0) {
        setState(prev => ({
          ...prev,
          step: 3,
          generatedTemplates: result.templates,
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
        error: error.message || 'Failed to generate templates',
      }));
    },
  });

  // Mutation to save template to library
  const saveTemplateMutation = useMutation({
    mutationFn: async (template: GeneratedSmsTemplate) => {
      return await smsTemplatesService.createTemplate({
        name: template.name,
        content: template.content,
        category: template.category,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] });
      toast.success('Template saved to library!');
      onTemplateSaved?.();
    },
    onError: () => {
      toast.error('Failed to save template');
    },
  });

  const handleClose = useCallback(() => {
    setState(INITIAL_STATE);
    setSavedTemplateIds(new Set());
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSaveToLibrary = (template: GeneratedSmsTemplate, index: number) => {
    saveTemplateMutation.mutate(template, {
      onSuccess: () => {
        setSavedTemplateIds(prev => new Set(prev).add(index));
      },
    });
  };

  const handleNextStep = useCallback(async () => {
    if (state.step === 1) {
      if (!state.purpose.trim()) {
        toast.error('Please describe the purpose of your SMS templates');
        return;
      }
      setState(prev => ({ ...prev, step: 2 }));
    } else if (state.step === 2) {
      setState(prev => ({ ...prev, isGenerating: true, error: null }));
      const request: GenerateSmsTemplateRequest = {
        purpose: state.purpose,
        industry: state.industry || undefined,
        tone: state.tone,
        category: state.category,
        variationCount: state.variationCount,
        businessContext: state.businessContext || undefined,
        includeVariables: state.includeVariables,
      };
      await generateTemplates(request);
    }
  }, [state, generateTemplates]);

  const handlePrevStep = useCallback(() => {
    setState(prev => ({ ...prev, step: (prev.step - 1) as 1 | 2 | 3 }));
  }, []);

  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Template copied to clipboard');
  };

  const handleSelectTemplate = (template: GeneratedSmsTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
      handleClose();
    }
  };

  const canProceed = state.step === 1 ? state.purpose.trim().length > 0 : true;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="xl">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            AI SMS Template Generator
          </ModalTitle>
          <ModalDescription>
            {state.step === 1 && 'Describe the purpose of your SMS templates'}
            {state.step === 2 && 'Customize your template generation options'}
            {state.step === 3 && 'Review and select your generated templates'}
          </ModalDescription>
        </ModalHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  state.step >= step
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {state.step > step ? <CheckCircle2 className="size-4" /> : step}
              </div>
              {step < 3 && (
                <div className={cn('w-12 h-1 mx-1', state.step > step ? 'bg-primary' : 'bg-muted')} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Purpose */}
        {state.step === 1 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">What are these SMS templates for?</Label>
              <Textarea
                id="purpose"
                placeholder="e.g., Appointment reminders for a dental clinic, Follow-up messages after a sales call, Welcome messages for new customers..."
                value={state.purpose}
                onChange={(e) => setState(prev => ({ ...prev, purpose: e.target.value }))}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Be specific about your use case for better results
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry (optional)</Label>
              <Select
                value={state.industry}
                onValueChange={(value) => setState(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: Options */}
        {state.step === 2 && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select
                  value={state.tone}
                  onValueChange={(value: 'Professional' | 'Friendly' | 'Casual') =>
                    setState(prev => ({ ...prev, tone: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={state.category}
                  onValueChange={(value) => setState(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SMS_TEMPLATE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variationCount">Number of variations</Label>
              <Select
                value={state.variationCount.toString()}
                onValueChange={(value) => setState(prev => ({ ...prev, variationCount: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} template{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessContext">Additional context (optional)</Label>
              <Textarea
                id="businessContext"
                placeholder="e.g., Our business name is 'Smile Dental', we specialize in family dentistry..."
                value={state.businessContext}
                onChange={(e) => setState(prev => ({ ...prev, businessContext: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="includeVariables">Include variable placeholders</Label>
                <p className="text-xs text-muted-foreground">
                  Add placeholders like {'{{name}}'}, {'{{date}}'}, {'{{time}}'}
                </p>
              </div>
              <Switch
                id="includeVariables"
                checked={state.includeVariables}
                onCheckedChange={(checked) => setState(prev => ({ ...prev, includeVariables: checked }))}
              />
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {state.step === 3 && (
          <div className="space-y-4 py-4">
            {state.generatedTemplates.length > 0 ? (
              <div className="space-y-3">
                {state.generatedTemplates.map((template, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant="secondary" className="mt-1">
                            {template.category}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyTemplate(template.content)}
                            title="Copy to clipboard"
                          >
                            <Copy className="size-4" />
                          </Button>
                          {onTemplateSelect && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectTemplate(template)}
                              title="Use this template"
                            >
                              <Plus className="size-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted/20 dark:bg-gray-800 p-3 rounded-md">
                        {template.content}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{template.characterCount} chars</span>
                          <span>{template.segmentCount} SMS segment{template.segmentCount > 1 ? 's' : ''}</span>
                          {template.variables.length > 0 && (
                            <span>Variables: {template.variables.join(', ')}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={savedTemplateIds.has(index) ? 'secondary' : 'default'}
                          onClick={() => handleSaveToLibrary(template, index)}
                          disabled={savedTemplateIds.has(index) || saveTemplateMutation.isPending}
                        >
                          {savedTemplateIds.has(index) ? (
                            <>
                              <CheckCircle2 className="size-4 mr-1" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Plus className="size-4 mr-1" />
                              Save to Library
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="size-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No templates generated</p>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md">
            <AlertCircle className="size-4" />
            <span className="text-sm">{state.error}</span>
          </div>
        )}

        <ModalFooter className="flex justify-between">
          <div>
            {state.step > 1 && state.step < 3 && (
              <Button variant="outline" onClick={handlePrevStep}>
                <ArrowLeft className="size-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              {state.step === 3 ? 'Close' : 'Cancel'}
            </Button>
            {state.step < 3 && (
              <Button onClick={handleNextStep} disabled={!canProceed || isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : state.step === 2 ? (
                  <>
                    <Sparkles className="size-4 mr-2" />
                    Generate Templates
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="size-4 ml-2" />
                  </>
                )}
              </Button>
            )}
            {state.step === 3 && (
              <Button onClick={() => setState(prev => ({ ...prev, step: 1, generatedTemplates: [] }))}>
                Generate More
              </Button>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

