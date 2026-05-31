'use client';

/**
 * Journey Builder Page
 * Visual workflow creator for customer journey automation
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from '@/components/modals';
import {
  ArrowLeft,
  Plus,
  Zap,
  Play,
  Clock,
  GitBranch,
  CheckCircle2,
  Trash2,
  Save,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  UserCheck,
  Bell,
  Tag,
  FileText,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { workflowsService } from '@/services/api/workflows.service';

type StepType = 'trigger' | 'action' | 'condition' | 'delay';

interface WorkflowStep {
  id: string;
  type: StepType;
  name: string;
  description: string;
  config: Record<string, unknown>;
}

const TRIGGER_OPTIONS = [
  { id: 'new_lead', name: 'New Lead Created', icon: UserCheck, description: 'When a new lead is captured' },
  { id: 'form_submitted', name: 'Form Submitted', icon: FileText, description: 'When a form is completed' },
  { id: 'message_received', name: 'Message Received', icon: MessageSquare, description: 'When a message comes in' },
  { id: 'booking_created', name: 'Booking Created', icon: Calendar, description: 'When a booking is made' },
  { id: 'lead_qualified', name: 'Lead Qualified', icon: Tag, description: 'When lead score reaches threshold' },
];

const ACTION_OPTIONS = [
  { id: 'send_email', name: 'Send Email', icon: Mail, description: 'Send an email to the lead' },
  { id: 'send_sms', name: 'Send SMS', icon: MessageSquare, description: 'Send a text message' },
  { id: 'make_call', name: 'Make Call', icon: Phone, description: 'Initiate a phone call' },
  { id: 'update_lead', name: 'Update Lead', icon: UserCheck, description: 'Update lead properties' },
  { id: 'add_tag', name: 'Add Tag', icon: Tag, description: 'Add a tag to the lead' },
  { id: 'notify_team', name: 'Notify Team', icon: Bell, description: 'Send team notification' },
  { id: 'create_task', name: 'Create Task', icon: FileText, description: 'Create a follow-up task' },
  { id: 'schedule_booking', name: 'Schedule Booking', icon: Calendar, description: 'Send booking link' },
];

const stepTypeConfig: Record<StepType, { 
  icon: typeof Zap; 
  color: string; 
  bgColor: string;
  borderColor: string;
  label: string;
}> = {
  trigger: {
    icon: Zap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    label: 'Trigger',
  },
  action: {
    icon: Play,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Action',
  },
  condition: {
    icon: GitBranch,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'Condition',
  },
  delay: {
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Delay',
  },
};

export default function JourneyBuilderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [showAddStep, setShowAddStep] = useState(false);
  const [addStepType, setAddStepType] = useState<StepType | null>(null);

  // Save workflow mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!workflowName.trim()) {
        throw new Error('Workflow name is required');
      }
      if (steps.length === 0) {
        throw new Error('Add at least one step to your workflow');
      }
      
      const triggerStep = steps.find(s => s.type === 'trigger');
      if (!triggerStep) {
        throw new Error('A trigger is required to create a workflow');
      }
      
      const actionSteps = steps.filter(s => s.type !== 'trigger');
      
      // Map trigger IDs to valid trigger types
      const triggerTypeMap: Record<string, 'lead_created' | 'lead_status_changed' | 'form_submitted' | 'message_received' | 'scheduled'> = {
        'new_lead': 'lead_created',
        'form_submitted': 'form_submitted',
        'message_received': 'message_received',
        'booking_created': 'scheduled',
        'lead_qualified': 'lead_status_changed',
      };
      
      // Map action IDs to valid action types
      const actionTypeMap: Record<string, 'send_email' | 'send_sms' | 'create_task' | 'update_lead' | 'notify' | 'webhook' | 'delay'> = {
        'send_email': 'send_email',
        'send_sms': 'send_sms',
        'make_call': 'webhook',
        'update_lead': 'update_lead',
        'add_tag': 'update_lead',
        'notify_team': 'notify',
        'create_task': 'create_task',
        'schedule_booking': 'webhook',
      };
      
      return workflowsService.createWorkflow({
        name: workflowName,
        description: workflowDescription,
        trigger: { 
          type: triggerTypeMap[triggerStep.config.triggerId as string] || 'lead_created',
        },
        actions: actionSteps.map((a, index) => ({ 
          type: a.type === 'delay' ? 'delay' : (actionTypeMap[a.config.actionId as string] || 'notify'),
          config: a.config,
          order: index,
        })),
      });
    },
    onSuccess: () => {
      toast.success('Journey created successfully!');
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      router.push('/journeys');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create journey');
    },
  });

  const addStep = useCallback((type: StepType, option: { id: string; name: string; description: string }) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type,
      name: option.name,
      description: option.description,
      config: type === 'trigger' ? { triggerId: option.id } : { actionId: option.id },
    };
    setSteps(prev => [...prev, newStep]);
    setShowAddStep(false);
    setAddStepType(null);
  }, []);

  const addDelay = useCallback((duration: number, unit: 'minutes' | 'hours' | 'days') => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: 'delay',
      name: `Wait ${duration} ${unit}`,
      description: `Pause workflow for ${duration} ${unit}`,
      config: { duration, unit },
    };
    setSteps(prev => [...prev, newStep]);
    setShowAddStep(false);
    setAddStepType(null);
  }, []);

  const removeStep = useCallback((stepId: string) => {
    setSteps(prev => prev.filter(s => s.id !== stepId));
  }, []);

  const hasTrigger = steps.some(s => s.type === 'trigger');

  return (
    <div className="animate-fade-in pt-4">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/journeys')}>
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-text-navy">Create Customer Journey</h1>
              <p className="text-sm text-text-secondary">Design your automated workflow</p>
            </div>
          </div>
          <Button 
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !workflowName || steps.length === 0}
            className="gap-2"
          >
            {saveMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save Journey
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Workflow Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Journey Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Lead Qualification Flow"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this journey does..."
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Add Step Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Add Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!hasTrigger && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                    onClick={() => { setAddStepType('trigger'); setShowAddStep(true); }}
                  >
                    <Zap className="size-4" />
                    Add Trigger
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => { setAddStepType('action'); setShowAddStep(true); }}
                  disabled={!hasTrigger}
                >
                  <Play className="size-4" />
                  Add Action
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                  onClick={() => { setAddStepType('delay'); setShowAddStep(true); }}
                  disabled={!hasTrigger}
                >
                  <Clock className="size-4" />
                  Add Delay
                </Button>
                {!hasTrigger && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Start by adding a trigger to begin your journey
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Visual Builder */}
          <div className="lg:col-span-2">
            <Card className="min-h-[500px]">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Workflow Steps</CardTitle>
                  <Badge variant="secondary">{steps.length} steps</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {steps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-gray-100 mb-4">
                      <Zap className="size-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">No steps yet</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Start by adding a trigger to begin your customer journey
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => { setAddStepType('trigger'); setShowAddStep(true); }}
                      className="gap-2"
                    >
                      <Plus className="size-4" />
                      Add Trigger
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {steps.map((step, index) => {
                        const config = stepTypeConfig[step.type];
                        const Icon = config.icon;
                        
                        return (
                          <div key={step.id} className="relative">
                            {/* Connector Line */}
                            {index > 0 && (
                              <div className="absolute left-6 -top-3 w-0.5 h-3 bg-gray-200" />
                            )}
                            {index < steps.length - 1 && (
                              <div className="absolute left-6 -bottom-3 w-0.5 h-3 bg-gray-200" />
                            )}
                            
                            {/* Step Card */}
                            <div className={cn(
                              "flex items-start gap-3 p-4 rounded-lg border-2",
                              config.bgColor,
                              config.borderColor,
                            )}>
                              <div className={cn(
                                "flex items-center justify-center size-10 rounded-lg",
                                config.bgColor,
                                config.borderColor,
                                "border"
                              )}>
                                <Icon className={cn("size-5", config.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={cn("text-xs", config.color)}>
                                    {config.label}
                                  </Badge>
                                  <span className="font-medium text-gray-900">{step.name}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-red-500"
                                onClick={() => removeStep(step.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* End Node */}
                      {steps.length > 0 && (
                        <div className="relative">
                          <div className="absolute left-6 -top-3 w-0.5 h-3 bg-gray-200" />
                          <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-green-200 bg-green-50">
                            <div className="flex items-center justify-center size-10 rounded-lg bg-green-100 border border-green-200">
                              <CheckCircle2 className="size-5 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-green-700">Journey Complete</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Step Dialog */}
      <Modal open={showAddStep} onOpenChange={setShowAddStep}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>
              {addStepType === 'trigger' && 'Choose a Trigger'}
              {addStepType === 'action' && 'Choose an Action'}
              {addStepType === 'delay' && 'Set Delay Duration'}
            </ModalTitle>
            <ModalDescription>
              {addStepType === 'trigger' && 'Select what starts this workflow'}
              {addStepType === 'action' && 'Select what action to perform'}
              {addStepType === 'delay' && 'How long should the workflow wait?'}
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            {addStepType === 'trigger' && (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {TRIGGER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    className="w-full flex items-start gap-3 p-3 rounded-lg border hover:bg-amber-50 hover:border-amber-200 transition-colors text-left"
                    onClick={() => addStep('trigger', option)}
                  >
                    <div className="p-2 rounded-lg bg-amber-100">
                      <option.icon className="size-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{option.name}</p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {addStepType === 'action' && (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {ACTION_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    className="w-full flex items-start gap-3 p-3 rounded-lg border hover:bg-blue-50 hover:border-blue-200 transition-colors text-left"
                    onClick={() => addStep('action', option)}
                  >
                    <div className="p-2 rounded-lg bg-blue-100">
                      <option.icon className="size-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{option.name}</p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {addStepType === 'delay' && (
              <DelaySelector onAdd={addDelay} onCancel={() => setShowAddStep(false)} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}

function DelaySelector({ 
  onAdd, 
  onCancel 
}: { 
  onAdd: (duration: number, unit: 'minutes' | 'hours' | 'days') => void;
  onCancel: () => void;
}) {
  const [duration, setDuration] = useState(1);
  const [unit, setUnit] = useState<'minutes' | 'hours' | 'days'>('hours');

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <Label>Duration</Label>
          <Input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="flex-1">
          <Label>Unit</Label>
          <Select value={unit} onValueChange={(v) => setUnit(v as typeof unit)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="days">Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onAdd(duration, unit)}>Add Delay</Button>
      </ModalFooter>
    </div>
  );
}
