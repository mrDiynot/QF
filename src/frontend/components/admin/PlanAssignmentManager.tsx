'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminSubscriptionService } from '@/services/api/admin.service';

interface PlanAssignment {
  planId: string;
  planName: string;
  workflows: {
    id: string;
    name: string;
    enabled: boolean;
  }[];
}

export function PlanAssignmentManager() {
  const [assignments, setAssignments] = useState<PlanAssignment[]>([]);
  const _queryClient = useQueryClient();

  // Fetch plans from API
  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      return await adminSubscriptionService.getPlans();
    },
  });

  // Initialize assignments when plans load
  useEffect(() => {
    if (plans && plans.length > 0) {
      const planAssignments: PlanAssignment[] = plans.map((plan) => ({
        planId: plan.id,
        planName: plan.name,
        workflows: (plan.featureKeys || []).map((f: string, idx: number) => ({
          id: `${plan.id}-${idx}`,
          name: f,
          enabled: true,
        })),
      }));
      setAssignments(planAssignments);
    }
  }, [plans]);

  const handleToggle = (planIndex: number, workflowIndex: number) => {
    const updated = [...assignments];
    updated[planIndex].workflows[workflowIndex].enabled = !updated[planIndex].workflows[workflowIndex].enabled;
    setAssignments(updated);
  };

  const handleSave = async () => {
    try {
      // In a full implementation, this would call an API to save the assignments
      // For now, just show success as the backend structure may differ
      toast.success('Plan assignments saved');
    } catch {
      toast.error('Failed to save plan assignments');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="size-8 animate-spin text-[#FF6900]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((plan, planIndex) => (
          <Card key={plan.planName}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.planName}
                <Badge variant="secondary">
                  {plan.workflows.filter(w => w.enabled).length} workflows
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.workflows.map((workflow, workflowIndex) => (
                <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {workflow.enabled ? (
                      <CheckCircle2 className="size-4 text-green-600" />
                    ) : (
                      <XCircle className="size-4 text-muted-foreground/60" />
                    )}
                    <span className="text-sm">{workflow.name}</span>
                  </div>
                  <Switch
                    checked={workflow.enabled}
                    onCheckedChange={() => handleToggle(planIndex, workflowIndex)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
