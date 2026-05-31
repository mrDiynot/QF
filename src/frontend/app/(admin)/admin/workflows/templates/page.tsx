'use client';

/**
 * Admin Workflow Templates Page
 * Manage workflow templates available to businesses
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  AdminModal,
  AdminModalContent,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
  AdminModalTitle,
  AdminModalDescription,
} from '@/components/admin/AdminModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Workflow,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  CheckCircle,
  Users,
  Zap,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminFetch } from '@/services/api/admin.service';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  triggerType: string;
  nodeCount: number;
  isActive: boolean;
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
}


const CATEGORIES = ['All', 'Lead Nurturing', 'Sales', 'Appointments', 'Reviews', 'Marketing', 'Onboarding', 'Engagement'];
const TRIGGER_TYPES = ['new_lead', 'appointment_created', 'call_completed', 'deal_won', 'lead_inactive', 'contact_birthday', 'form_submitted'];

export default function AdminWorkflowTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<WorkflowTemplate | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // 3x3 grid
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'Lead Nurturing',
    triggerType: 'new_lead',
    isPublic: true,
  });
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-workflow-templates'],
    queryFn: async () => {
      return adminFetch<WorkflowTemplate[]>('/api/v1/admin/workflows/templates');
    },
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newTemplate) => {
      return adminFetch<WorkflowTemplate>('/api/v1/admin/workflows/templates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success('Template created');
      setCreateDialogOpen(false);
      setNewTemplate({ name: '', description: '', category: 'Lead Nurturing', triggerType: 'new_lead', isPublic: true });
      queryClient.invalidateQueries({ queryKey: ['admin-workflow-templates'] });
    },
    onError: () => {
      toast.error('Failed to create template');
    },
  });

  // Toggle template mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await adminFetch<void>(`/api/v1/admin/workflows/templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workflow-templates'] });
    },
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminFetch<void>(`/api/v1/admin/workflows/templates/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast.success('Template deleted');
      setTemplateToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['admin-workflow-templates'] });
    },
    onError: () => {
      toast.error('Failed to delete template');
    },
  });

  const handleDeleteTemplate = (template: WorkflowTemplate) => {
    setTemplateToDelete(template);
  };

  const confirmDeleteTemplate = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete.id);
    }
  };

  const handleCreate = () => {
    if (!newTemplate.name) {
      toast.error('Please enter a template name');
      return;
    }
    createMutation.mutate(newTemplate);
  };

  // Filter templates
  const filteredTemplates = templates.filter((template: WorkflowTemplate) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTemplates.length / pageSize);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const activeTemplates = templates.filter((t: WorkflowTemplate) => t.isActive);
  const totalUsage = templates.reduce((sum: number, t: WorkflowTemplate) => sum + t.usageCount, 0);

  return (
    <div className="p-8 space-y-6" data-admin-theme="dark">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground flex items-center gap-2">
            <Workflow className="size-7 text-[#FF6900]" />
            Workflow Templates
          </h1>
          <p className="text-admin-muted-foreground mt-1">
            Manage pre-built workflow templates for businesses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-admin-border">
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-[#FF6900] hover:bg-orange-600 gap-2">
            <Plus className="size-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-admin-card border-admin-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FF6900]/20">
                <Workflow className="size-5 text-[#FF6900]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-admin-foreground">{templates.length}</p>
                <p className="text-xs text-admin-muted-foreground">Total Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-admin-card border-admin-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="size-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-admin-foreground">{activeTemplates.length}</p>
                <p className="text-xs text-admin-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-admin-card border-admin-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-admin-foreground">{totalUsage}</p>
                <p className="text-xs text-admin-muted-foreground">Total Usage</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-admin-card border-admin-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Zap className="size-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-admin-foreground">{CATEGORIES.length - 1}</p>
                <p className="text-xs text-admin-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-admin-card border-admin-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-admin-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 bg-admin-background border-admin-border text-admin-foreground"
              />
            </div>
            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-48 bg-admin-background border-admin-border text-admin-foreground">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-admin-card border-admin-border">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full bg-admin-muted" />
          ))
        ) : filteredTemplates.length === 0 ? (
          <Card className="col-span-full bg-admin-card border-admin-border">
            <CardContent className="p-12 text-center">
              <Workflow className="size-12 text-admin-muted-foreground mx-auto mb-3" />
              <p className="text-admin-muted-foreground">No templates found</p>
            </CardContent>
          </Card>
        ) : (
          paginatedTemplates.map((template: WorkflowTemplate) => (
            <Card key={template.id} className={cn(
              "bg-admin-card border-admin-border hover:shadow-lg transition-shadow",
              !template.isActive && "opacity-60"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#FF6900]/20">
                      <Workflow className="size-5 text-[#FF6900]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-admin-foreground">{template.name}</h3>
                      <Badge variant="outline" className="text-xs border-admin-border text-admin-muted-foreground">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={template.isActive}
                    onCheckedChange={(checked) => toggleMutation.mutate({ id: template.id, isActive: checked })}
                  />
                </div>
                
                <p className="text-sm text-admin-muted-foreground mb-4 line-clamp-2">
                  {template.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-admin-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Zap className="size-3" />
                    {template.nodeCount} nodes
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    {template.usageCount} uses
                  </span>
                  <Badge className="text-xs bg-purple-500/20 text-purple-400">
                    {template.triggerType.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1 border-admin-border text-admin-foreground">
                    <Eye className="size-4 mr-1" />
                    Preview
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="border-admin-border">
                        <MoreVertical className="size-4 text-admin-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-admin-card border-admin-border">
                      <DropdownMenuItem className="text-admin-foreground">
                        <Edit className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-admin-foreground">
                        <Copy className="size-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-400"
                        onClick={() => handleDeleteTemplate(template)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredTemplates.length > pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-admin-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredTemplates.length)} of {filteredTemplates.length} templates
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-admin-border text-admin-foreground hover:bg-admin-muted"
            >
              Previous
            </Button>
            <span className="text-sm text-admin-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-admin-border text-admin-foreground hover:bg-admin-muted"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Template Dialog */}
      <AdminModal open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <AdminModalContent size="md">
          <AdminModalHeader>
            <AdminModalTitle>Create Workflow Template</AdminModalTitle>
            <AdminModalDescription>
              Create a new workflow template that businesses can use.
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalBody className="space-y-5">
            <div>
              <Label className="text-admin-foreground text-sm font-medium">Template Name *</Label>
              <Input
                placeholder="e.g., Lead Welcome Sequence"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
              />
            </div>
            <div>
              <Label className="text-admin-foreground text-sm font-medium">Description</Label>
              <Textarea
                placeholder="Brief description of what this workflow does"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Category</Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
                >
                  <SelectTrigger className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-admin-card border-admin-border">
                    {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-admin-foreground text-sm font-medium">Trigger Type</Label>
                <Select
                  value={newTemplate.triggerType}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, triggerType: value })}
                >
                  <SelectTrigger className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-admin-card border-admin-border">
                    {TRIGGER_TYPES.map((trigger) => (
                      <SelectItem key={trigger} value={trigger} className="capitalize">
                        {trigger.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newTemplate.isPublic}
                onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, isPublic: checked })}
              />
              <Label className="text-admin-foreground text-sm font-medium">Make publicly available to all businesses</Label>
            </div>
          </AdminModalBody>
          <AdminModalFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="border-admin-border text-admin-foreground hover:bg-admin-muted">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-[#FF6900] hover:bg-orange-600 text-white">
              {createMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Create Template
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>

      {/* Delete Confirmation Dialog */}
      <AdminModal open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <AdminModalContent size="sm">
          <AdminModalHeader>
            <AdminModalTitle>Delete Workflow Template</AdminModalTitle>
            <AdminModalDescription>
              Are you sure you want to delete &quot;{templateToDelete?.name}&quot;? This template is used by {templateToDelete?.usageCount || 0} businesses. This action cannot be undone.
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalFooter>
            <Button
              variant="outline"
              onClick={() => setTemplateToDelete(null)}
              disabled={deleteMutation.isPending}
              className="border-admin-border text-admin-foreground hover:bg-admin-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteTemplate}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>
    </div>
  );
}
