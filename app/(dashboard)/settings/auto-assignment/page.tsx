'use client';

/**
 * Auto-Assignment Rules Settings Page
 * Sprint 37 Feature - Manage lead routing rules
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Route,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  GripVertical,
  Users,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAutoAssignmentRules,
  useCreateAutoAssignmentRule,
  useUpdateAutoAssignmentRule,
  useDeleteAutoAssignmentRule,
} from '@/hooks/api/useAutoAssignment';
import type { AutoAssignmentRule } from '@/services/api/auto-assignment.service';

export default function AutoAssignmentPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    channel: '',
    minLeadScore: 0,
    maxLeadScore: 100,
    assignmentType: 'round_robin',
  });

  // API hooks
  const { data: rules, isLoading } = useAutoAssignmentRules();
  const createMutation = useCreateAutoAssignmentRule();
  const updateMutation = useUpdateAutoAssignmentRule();
  const deleteMutation = useDeleteAutoAssignmentRule();

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true,
      channel: '',
      minLeadScore: 0,
      maxLeadScore: 100,
      assignmentType: 'round_robin',
    });
    setEditingRule(null);
  };

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success('Rule created successfully');
      setCreateDialogOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to create rule');
    }
  };

  const handleUpdate = async () => {
    if (!editingRule) return;
    try {
      await updateMutation.mutateAsync({ id: editingRule, request: formData });
      toast.success('Rule updated successfully');
      setCreateDialogOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to update rule');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Rule deleted successfully');
    } catch {
      toast.error('Failed to delete rule');
    }
  };

  const openEditDialog = (rule: AutoAssignmentRule) => {
    setFormData({
      name: rule.name,
      description: rule.description || '',
      isActive: rule.isActive,
      channel: rule.channel || '',
      minLeadScore: rule.minLeadScore || 0,
      maxLeadScore: rule.maxLeadScore || 100,
      assignmentType: rule.assignmentType || 'round_robin',
    });
    setEditingRule(rule.id);
    setCreateDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Auto-Assignment Rules</h1>
          <p className="text-sm text-gray-500">
            Configure rules to automatically route leads to the right team members
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setCreateDialogOpen(true);
          }}
          className="gap-2 bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="size-4" />
          Create Rule
        </Button>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-purple-50 border-purple-100">
        <div className="flex items-start gap-3">
          <Sparkles className="size-5 text-purple-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-purple-900">How it works</p>
            <p className="text-xs text-purple-700 mt-1">
              Rules are evaluated in order of priority. When a new lead comes in, the first matching rule assigns the lead.
              Use lead score ranges and channel filters to create targeted routing.
            </p>
          </div>
        </div>
      </Card>

      {/* Rules List */}
      <div className="space-y-3">
        {rules && rules.length > 0 ? (
          rules.map((rule, index) => (
            <Card key={rule.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="cursor-grab text-gray-400 hover:text-gray-600">
                  <GripVertical className="size-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">{rule.name}</h3>
                    <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">Priority {index + 1}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{rule.description || 'No description'}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    {rule.channel && (
                      <span className="flex items-center gap-1">
                        <Route className="size-3" />
                        Channel: {rule.channel}
                      </span>
                    )}
                    <span>Score: {rule.minLeadScore || 0} - {rule.maxLeadScore || 100}</span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      {rule.assignmentType === 'round_robin' ? 'Round Robin' : 'Direct'}
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(rule)}>
                      <Edit className="size-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <Route className="size-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rules yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Create your first auto-assignment rule to start routing leads automatically.
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="size-4" />
              Create First Rule
            </Button>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Modal open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>{editingRule ? 'Edit Rule' : 'Create Rule'}</ModalTitle>
            <ModalDescription>
              {editingRule ? 'Update your auto-assignment rule settings.' : 'Set up a new rule to automatically assign leads.'}
            </ModalDescription>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., High Value Leads"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this rule"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Channel Filter</Label>
                <Select
                  value={formData.channel || 'all'}
                  onValueChange={(value) => setFormData({ ...formData, channel: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All channels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assignment Type</Label>
                <Select
                  value={formData.assignmentType}
                  onValueChange={(value) => setFormData({ ...formData, assignmentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round_robin">Round Robin</SelectItem>
                    <SelectItem value="direct">Direct Assignment</SelectItem>
                    <SelectItem value="least_busy">Least Busy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Lead Score</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.minLeadScore}
                  onChange={(e) => setFormData({ ...formData, minLeadScore: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Lead Score</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.maxLeadScore}
                  onChange={(e) => setFormData({ ...formData, maxLeadScore: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-gray-500">Enable this rule for lead routing</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={editingRule ? handleUpdate : handleCreate}
              disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
