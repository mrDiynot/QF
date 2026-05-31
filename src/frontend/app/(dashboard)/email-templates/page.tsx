'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from '@/components/modals';
import { Plus, Mail, Eye, Edit, Copy, Trash2, FileText, BarChart } from 'lucide-react';
import { emailsService, type CreateEmailTemplateRequest } from '@/services/api/emails.service';
import { toast } from 'sonner';

export default function EmailTemplatesPage() {
  const [activeCategory] = useState<string | undefined>(undefined);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState<CreateEmailTemplateRequest>({
    name: '',
    subject: '',
    body: '',
    category: 'general',
  });
  const queryClient = useQueryClient();

  // Fetch templates from API
  const { data: templates, isLoading } = useQuery({
    queryKey: ['email-templates', activeCategory],
    queryFn: () => emailsService.getTemplates({ category: activeCategory }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateEmailTemplateRequest) => emailsService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setShowCreateDialog(false);
      setNewTemplate({ name: '', subject: '', body: '', category: 'general' });
      toast.success('Template created successfully');
    },
    onError: () => toast.error('Failed to create template'),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => emailsService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template deleted');
    },
    onError: () => toast.error('Failed to delete template'),
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate(newTemplate);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const items = templates || [];
    const categories = [...new Set(items.map(t => t.category).filter(Boolean))];
    const activeCount = items.filter(t => t.isActive).length;
    
    return {
      total: items.length,
      categories: categories.length,
      active: activeCount,
    };
  }, [templates]);

  if (isLoading) {
    return (
      <div className="animate-fade-in pt-4">
        <div className="mx-auto max-w-[1440px] space-y-8">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pt-4">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-text-navy">Email Templates</h1>
            <p className="body-text mt-2 text-text-secondary">
              Create and manage email templates for automated campaigns
            </p>
          </div>
          <Button 
            className="gap-2 rounded-[10px] gradient-primary text-white"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="size-4" />
            New Template
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Templates', value: stats.total.toString(), icon: FileText },
            { label: 'Categories', value: stats.categories.toString(), icon: BarChart },
            { label: 'Active', value: stats.active.toString(), icon: Mail },
            { label: 'Variables', value: (templates || []).reduce((sum, t) => sum + (t.variables?.length || 0), 0).toString(), icon: Edit },
          ].map((stat, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="small-text text-text-secondary">{stat.label}</p>
                  <p className="mt-2 text-3xl font-normal text-text-navy">{stat.value}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-3">
                  <stat.icon className="size-5 text-brand-purple" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          {templates && templates.length > 0 ? templates.map((template) => (
            <Card key={template.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 items-center justify-center rounded-lg gradient-primary">
                    <Mail className="size-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="heading-3 text-text-navy">{template.name}</h3>
                      {template.category && (
                        <Badge variant="secondary">{template.category}</Badge>
                      )}
                      <Badge variant={template.isActive ? 'default' : 'outline'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="small-text text-text-secondary">{template.subject}</p>
                    <div className="flex gap-4 text-sm text-text-secondary">
                      <span>Variables: {template.variables?.length || 0}</span>
                      <span>•</span>
                      <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2 rounded-[10px]">
                    <Eye className="size-3" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 rounded-[10px]">
                    <Edit className="size-3" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 rounded-[10px]">
                    <Copy className="size-3" />
                    Duplicate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 rounded-[10px] text-red-600 hover:bg-red-50"
                    onClick={() => deleteMutation.mutate(template.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            </Card>
          )) : (
            <Card className="p-12 text-center">
              <Mail className="size-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Create your first email template for automated campaigns.
              </p>
              <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
                <Plus className="size-4" />
                Create First Template
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Create Template Dialog */}
      <Modal open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Create Email Template</ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Welcome Email"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                placeholder="e.g., Welcome to {{company_name}}!"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., onboarding, marketing, transactional"
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Email Body *</Label>
              <Textarea
                id="body"
                placeholder="Enter your email content here. Use {{variable_name}} for dynamic content."
                value={newTemplate.body}
                onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                rows={6}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Template'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}