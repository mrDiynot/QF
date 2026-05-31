'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Workflow,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users,
  Zap,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';
import { PlanAssignmentManager } from '@/components/admin/PlanAssignmentManager';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  usageCount: number;
  successRate: number;
  planTier: string;
}

export default function AdminWorkflowsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('templates');

  const { data: templates = [] } = useQuery<WorkflowTemplate[]>({
    queryKey: ['admin-workflows'],
    queryFn: async () => {
      return [
        {
          id: '1',
          name: 'Lead Qualification',
          description: 'Automatically qualify leads based on BANT criteria',
          category: 'Lead Management',
          isActive: true,
          usageCount: 1250,
          successRate: 94.5,
          planTier: 'SmartFlow',
        },
        {
          id: '2',
          name: 'Follow-up Sequence',
          description: 'Multi-touch follow-up campaign for cold leads',
          category: 'Nurture',
          isActive: true,
          usageCount: 890,
          successRate: 87.2,
          planTier: 'UltraFlow',
        },
      ];
    },
  });

  const stats = {
    totalTemplates: templates.length,
    activeWorkflows: templates.filter(t => t.isActive).length,
    totalExecutions: templates.reduce((sum, t) => sum + t.usageCount, 0),
    avgSuccessRate: templates.length > 0
      ? templates.reduce((sum, t) => sum + t.successRate, 0) / templates.length
      : 0,
  };

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-navy">Workflow Management</h1>
            <p className="text-sm text-text-secondary mt-1">
              Manage workflow templates and assignments
            </p>
          </div>
          <Button>
            <Plus className="size-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Workflow className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTemplates}</div>
            <p className="text-xs text-text-secondary">Total templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Zap className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWorkflows}</div>
            <p className="text-xs text-text-secondary">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executions</CardTitle>
            <Users className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExecutions.toLocaleString()}</div>
            <p className="text-xs text-text-secondary">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="size-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-text-secondary">Average</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="assignments">Plan Assignments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="size-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {template.category}
                      </Badge>
                    </div>
                    <Badge variant={template.isActive ? 'default' : 'secondary'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-text-secondary">{template.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-text-secondary">Usage</p>
                      <p className="text-lg font-semibold">{template.usageCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Success</p>
                      <p className="text-lg font-semibold">{template.successRate}%</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="size-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="size-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <PlanAssignmentManager />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">View detailed analytics and performance metrics for all workflows.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
