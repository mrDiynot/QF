'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, BarChart, Eye, Edit, Trash2, ClipboardList } from 'lucide-react';
import { surveysService, type Survey, type CreateSurveyRequest } from '@/services/api/surveys.service';
import { toast } from 'sonner';
import { useSubscriptionEnforcement } from '@/hooks/useSubscriptionEnforcement';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from '@/components/modals';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function SurveysPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [newSurvey, setNewSurvey] = useState<CreateSurveyRequest>({ name: '', description: '', questions: '[]' });
  const queryClient = useQueryClient();

  // Subscription enforcement
  const { checkLimit } = useSubscriptionEnforcement();

  const { data: surveys, isLoading: surveysLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: () => surveysService.getSurveys(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['surveys', 'stats'],
    queryFn: () => surveysService.getStats(),
  });

  const createMutation = useMutation({
    mutationFn: (request: CreateSurveyRequest) => surveysService.createSurvey(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      setShowCreateDialog(false);
      setNewSurvey({ name: '', description: '', questions: '[]' });
      toast.success('Survey created successfully');
    },
    onError: () => toast.error('Failed to create survey'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => surveysService.deleteSurvey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Survey deleted');
    },
    onError: () => toast.error('Failed to delete survey'),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => surveysService.updateSurvey(id, { status: 'published' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Survey published');
    },
    onError: () => toast.error('Failed to publish survey'),
  });

  const isLoading = surveysLoading || statsLoading;

  return (
    <div className="animate-fade-in pt-4">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-text-navy">Surveys</h1>
            <p className="body-text mt-2 text-text-secondary">
              Create and manage customer surveys
            </p>
          </div>
          <Button 
            className="gap-2 rounded-[10px] gradient-primary text-white"
            onClick={() => {
              const surveyLimit = checkLimit('maxSurveys');
              if (!surveyLimit.allowed) {
                setUpgradeReason(`You've reached your survey limit (${surveyLimit.limit} surveys). Upgrade to create more.`);
                setShowUpgradeDialog(true);
                return;
              }
              setShowCreateDialog(true);
            }}
          >
            <Plus className="size-4" />
            Create Survey
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24 rounded-xl" />
            ))
          ) : (
            [
              { label: 'Total Surveys', value: stats?.totalSurveys ?? 0 },
              { label: 'Total Responses', value: stats?.totalResponses ?? 0 },
              { label: 'Published', value: stats?.publishedSurveys ?? 0 },
              { label: 'Drafts', value: stats?.draftSurveys ?? 0 },
            ].map((stat, idx) => (
              <Card key={idx} className="p-6">
                <p className="small-text text-text-secondary">{stat.label}</p>
                <p className="mt-2 text-3xl font-normal text-text-navy">{stat.value}</p>
              </Card>
            ))
          )}
        </div>

        {/* Surveys List */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-48 rounded-xl" />
            ))
          ) : surveys && surveys.length > 0 ? (
            surveys.map((survey: Survey) => (
              <Card key={survey.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="heading-3 text-text-navy">{survey.name}</h3>
                  <Badge variant={survey.status === 'published' ? 'default' : 'secondary'}>{survey.status}</Badge>
                </div>
                {survey.description && (
                  <p className="text-sm text-text-secondary mb-4 line-clamp-2">{survey.description}</p>
                )}
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Responses</span>
                    <span className="font-normal text-text-navy">{survey.responseCount}</span>
                  </div>
                  {survey.averageScore && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Avg Score</span>
                      <span className="font-normal text-success-green">{survey.averageScore.toFixed(1)}/5</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2 rounded-[10px]">
                    <BarChart className="size-3" />
                    Results
                  </Button>
                  {survey.status === 'draft' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 rounded-[10px]"
                      onClick={() => publishMutation.mutate(survey.id)}
                    >
                      <Eye className="size-3" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-2 rounded-[10px]">
                    <Edit className="size-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 rounded-[10px] text-red-500 hover:text-red-600"
                    onClick={() => deleteMutation.mutate(survey.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="col-span-full p-12 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <ClipboardList className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Surveys Yet</h3>
              <p className="text-text-secondary mb-4">Create your first customer survey</p>
              <Button 
                className="gap-2 rounded-[10px] gradient-primary text-white"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="size-4" />
                Create Survey
              </Button>
            </Card>
          )}
        </div>

        {/* Create Survey Dialog */}
        <Modal open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <ModalContent size="md">
            <ModalHeader>
              <ModalTitle>Create New Survey</ModalTitle>
            </ModalHeader>
            <ModalBody className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Survey Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Customer Satisfaction"
                  value={newSurvey.name}
                  onChange={(e) => setNewSurvey({ ...newSurvey, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the survey..."
                  value={newSurvey.description}
                  onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                className="gradient-primary text-white"
                onClick={() => createMutation.mutate(newSurvey)}
                disabled={!newSurvey.name || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Survey'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Upgrade Prompt */}
        <UpgradePrompt
          showDialog={showUpgradeDialog}
          onClose={() => setShowUpgradeDialog(false)}
          feature="Surveys"
          reason={upgradeReason}
          requiredPlan="Smart Flow"
        />
      </div>
    </div>
  );
}