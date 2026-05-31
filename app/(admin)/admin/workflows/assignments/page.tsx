'use client';

/**
 * Admin Workflow Plan Assignments Page
 * Manage which workflows are assigned to which subscription plans
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GitBranch,
  Workflow,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/services/api/admin.service';

interface WorkflowAssignment {
  id: string;
  workflowTemplateId: string;
  workflowTemplateName: string;
  planTier: string;
  maxInstances: number | null;
  isActive: boolean;
  createdAt: string;
}

const PLAN_TIERS = ['FreeFlow', 'SmartFlow', 'UltraFlow', 'Enterprise'];

export default function WorkflowAssignmentsPage() {
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Fetch workflow assignments
  const { data: assignments = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['admin-workflow-assignments'],
    queryFn: async () => {
      try {
        return await adminFetch<WorkflowAssignment[]>('/api/v1/admin/workflows/assignments');
      } catch {
        // Return empty array if endpoint doesn't exist yet
        return [];
      }
    },
  });

  // Filter assignments by plan
  const filteredAssignments = planFilter === 'all' 
    ? assignments 
    : assignments.filter((a: WorkflowAssignment) => a.planTier === planFilter);

  // Group by plan tier for summary
  const assignmentsByPlan = PLAN_TIERS.reduce((acc, plan) => {
    acc[plan] = assignments.filter((a: WorkflowAssignment) => a.planTier === plan).length;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64 bg-admin-muted" />
          <Skeleton className="h-10 w-24 bg-admin-muted" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 bg-admin-muted" />
          ))}
        </div>
        <Skeleton className="h-96 bg-admin-muted" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground flex items-center gap-2">
            <GitBranch className="size-7 text-[#FF6900]" />
            Workflow Plan Assignments
          </h1>
          <p className="text-admin-muted-foreground mt-1">
            Manage which workflow templates are available for each subscription plan
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="border-admin-border text-admin-foreground hover:bg-admin-muted"
        >
          <RefreshCw className={`size-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-400">Failed to load workflow assignments. The API endpoint may not be available yet.</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {PLAN_TIERS.map((plan) => (
          <Card key={plan} className="bg-admin-card border-admin-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  plan === 'FreeFlow' ? 'bg-gray-100' :
                  plan === 'SmartFlow' ? 'bg-blue-500/20' :
                  plan === 'UltraFlow' ? 'bg-purple-500/20' :
                  'bg-amber-500/20'
                }`}>
                  <Workflow className={`size-5 ${
                    plan === 'FreeFlow' ? 'text-gray-500' :
                    plan === 'SmartFlow' ? 'text-blue-400' :
                    plan === 'UltraFlow' ? 'text-purple-400' :
                    'text-amber-400'
                  }`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-admin-foreground">{assignmentsByPlan[plan] || 0}</p>
                  <p className="text-xs text-admin-muted-foreground">{plan} Workflows</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <Card className="bg-admin-card border-admin-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-48 bg-admin-background border-admin-border text-admin-foreground">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent className="bg-admin-card border-admin-border">
                <SelectItem value="all">All Plans</SelectItem>
                {PLAN_TIERS.map((plan) => (
                  <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader>
          <CardTitle className="text-admin-foreground">Plan Assignments</CardTitle>
          <CardDescription className="text-admin-muted-foreground">
            Workflow templates assigned to subscription plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <Workflow className="size-12 text-admin-muted-foreground mx-auto mb-3" />
              <p className="text-admin-muted-foreground">
                {assignments.length === 0 
                  ? 'No workflow assignments found. Workflow assignments are created when plans are configured.'
                  : 'No assignments match the selected filter.'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-admin-border hover:bg-transparent">
                  <TableHead className="text-admin-muted-foreground">Workflow Template</TableHead>
                  <TableHead className="text-admin-muted-foreground">Plan Tier</TableHead>
                  <TableHead className="text-admin-muted-foreground">Max Instances</TableHead>
                  <TableHead className="text-admin-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment: WorkflowAssignment) => (
                  <TableRow key={assignment.id} className="border-admin-border hover:bg-admin-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Workflow className="size-4 text-[#FF6900]" />
                        <span className="font-medium text-admin-foreground">
                          {assignment.workflowTemplateName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${
                        assignment.planTier === 'FreeFlow' ? 'bg-gray-100 text-gray-500' :
                        assignment.planTier === 'SmartFlow' ? 'bg-blue-500/20 text-blue-400' :
                        assignment.planTier === 'UltraFlow' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {assignment.planTier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-admin-foreground">
                      {assignment.maxInstances === null ? 'Unlimited' : assignment.maxInstances}
                    </TableCell>
                    <TableCell>
                      {assignment.isActive ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="size-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500 border-gray-200">
                          <XCircle className="size-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
