'use client';

/**
 * AI Workflow Generation Dialog
 * Allows users to describe a workflow goal and have AI generate the complete definition
 */

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
  Clock,
  GitBranch,
  Save,
  ArrowRight,
} from 'lucide-react';
import {
  useAIWorkflowGeneration,
  useSaveGeneratedWorkflow,
  WorkflowGenerationResult,
  WorkflowStepDto,
} from '@/hooks/api/useAIWorkflowGeneration';

interface AIWorkflowGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkflowSaved?: () => void;
}

const TRIGGER_TYPES = [
  { value: 'lead_created', label: 'New Lead Created', icon: '🎯' },
  { value: 'lead_status_changed', label: 'Lead Status Changed', icon: '📊' },
  { value: 'form_submitted', label: 'Form Submitted', icon: '📝' },
  { value: 'message_received', label: 'Message Received', icon: '💬' },
  { value: 'scheduled', label: 'Scheduled Time', icon: '⏰' },
  { value: 'booking_created', label: 'Booking Created', icon: '📅' },
  { value: 'conversation_started', label: 'Conversation Started', icon: '🗣️' },
];

const CATEGORIES = [
  { value: 'lead_qualification', label: 'Lead Qualification' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'sales', label: 'Sales Conversion' },
  { value: 'communication', label: 'Communication' },
];

const STEP_ICONS: Record<string, React.ReactNode> = {
  trigger: <Zap className="size-4 text-yellow-500" />,
  action: <ArrowRight className="size-4 text-info" />,
  delay: <Clock className="size-4 text-orange-500" />,
  condition: <GitBranch className="size-4 text-primary" />,
  end: <CheckCircle2 className="size-4 text-green-500" />,
};

export function AIWorkflowGenerationDialog({
  open,
  onOpenChange,
  onWorkflowSaved,
}: AIWorkflowGenerationDialogProps) {
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [goalDescription, setGoalDescription] = useState('');
  const [triggerType, setTriggerType] = useState('lead_created');
  const [category, setCategory] = useState('');
  const [includeDelays, setIncludeDelays] = useState(true);
  const [includeBranches, setIncludeBranches] = useState(true);
  const [maxSteps, setMaxSteps] = useState(10);
  const [workflowResult, setWorkflowResult] = useState<WorkflowGenerationResult | null>(null);

  const generateMutation = useAIWorkflowGeneration();
  const saveMutation = useSaveGeneratedWorkflow();

  const isGenerating = generateMutation.isPending;
  const isSaving = saveMutation.isPending;

  const handleGenerate = async () => {
    if (!goalDescription.trim()) return;

    const result = await generateMutation.mutateAsync({
      goalDescription,
      triggerType,
      category: category || undefined,
      includeDelays,
      includeBranches,
      maxSteps,
    });

    if (result.success) {
      setWorkflowResult(result);
      setStep('preview');
    }
  };

  const handleSave = async () => {
    if (!workflowResult) return;

    await saveMutation.mutateAsync(workflowResult);
    onWorkflowSaved?.();
    handleClose();
  };

  const handleClose = () => {
    setStep('input');
    setGoalDescription('');
    setTriggerType('lead_created');
    setCategory('');
    setIncludeDelays(true);
    setIncludeBranches(true);
    setMaxSteps(10);
    setWorkflowResult(null);
    onOpenChange(false);
  };

  const renderStepCard = (workflowStep: WorkflowStepDto, index: number) => (
    <div
      key={workflowStep.id}
      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
    >
      <div className="flex items-center justify-center size-8 rounded-full bg-background border">
        {STEP_ICONS[workflowStep.type] || <Zap className="size-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Step {index + 1}</span>
          <Badge variant="outline" className="text-xs">
            {workflowStep.type}
          </Badge>
        </div>
        <p className="font-medium text-sm">{workflowStep.name}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {workflowStep.description}
        </p>
      </div>
    </div>
  );

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            AI Workflow Generator
          </ModalTitle>
          <ModalDescription>
            {step === 'input'
              ? 'Describe your workflow goal and AI will generate the complete definition.'
              : 'Review the generated workflow before saving.'}
          </ModalDescription>
        </ModalHeader>

        {step === 'input' && (
          <div className="space-y-4">
            {/* Goal Description */}
            <div className="space-y-2">
              <Label htmlFor="goal">Workflow Goal *</Label>
              <Textarea
                id="goal"
                placeholder="Describe what you want this workflow to do... e.g., 'When a new lead comes in, send them a welcome SMS, wait 1 hour, then qualify them with AI and notify the sales team if they score above 70'"
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Be specific about triggers, actions, timing, and conditions.
              </p>
            </div>

            {/* Trigger Type */}
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select value={triggerType} onValueChange={setTriggerType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category (Optional)</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detect from goal" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delays"
                  checked={includeDelays}
                  onCheckedChange={(checked) => setIncludeDelays(checked === true)}
                />
                <Label htmlFor="delays" className="text-sm font-normal">
                  Include delay steps
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="branches"
                  checked={includeBranches}
                  onCheckedChange={(checked) => setIncludeBranches(checked === true)}
                />
                <Label htmlFor="branches" className="text-sm font-normal">
                  Include conditional branches
                </Label>
              </div>
            </div>

            {/* Max Steps */}
            <div className="space-y-2">
              <Label htmlFor="maxSteps">Maximum Steps: {maxSteps}</Label>
              <Input
                id="maxSteps"
                type="range"
                min={2}
                max={20}
                value={maxSteps}
                onChange={(e) => setMaxSteps(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!goalDescription.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Generating Workflow...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 mr-2" />
                  Generate Workflow
                </>
              )}
            </Button>
          </div>
        )}

        {step === 'preview' && workflowResult && (
          <div className="space-y-4">
            {/* Success Header */}
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="size-5" />
              <span className="font-medium">Workflow Generated Successfully!</span>
            </div>

            {/* Workflow Info */}
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <h3 className="text-lg font-semibold">{workflowResult.name}</h3>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm text-muted-foreground">{workflowResult.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {TRIGGER_TYPES.find((t) => t.value === workflowResult.trigger.type)?.icon}{' '}
                    {workflowResult.trigger.type.replace(/_/g, ' ')}
                  </Badge>
                  <Badge variant="secondary">{workflowResult.category}</Badge>
                  <Badge variant="secondary">
                    <Clock className="size-3 mr-1" />
                    ~{workflowResult.estimatedTimeMinutes} min
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Steps */}
            <div className="space-y-2">
              <Label className="text-sm">
                Workflow Steps ({workflowResult.steps.length})
              </Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {workflowResult.steps.map((s, i) => renderStepCard(s, i))}
              </div>
            </div>

            {/* Token Usage */}
            <div className="text-xs text-muted-foreground">
              Tokens used: {workflowResult.tokensUsed}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('input')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Save Workflow
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {generateMutation.isError && (
          <div className="flex items-center gap-2 text-error text-sm">
            <AlertCircle className="size-4" />
            <span>Failed to generate workflow. Please try again.</span>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}

