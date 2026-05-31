'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalTitle, ModalFooter } from '@/components/modals';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Copy, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { smsTemplatesService } from '@/services/api/sms-templates.service';
import { AISmsTemplateGenerationDialog } from './AISmsTemplateGenerationDialog';
import type { GeneratedSmsTemplate } from '@/types/ai-sms-templates';

interface SMSTemplateDisplay {
  id: string;
  name: string;
  content: string;
  category: string;
  usageCount: number;
  createdAt: Date;
}

export function SMSTemplates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SMSTemplateDisplay | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'General',
  });
  const queryClient = useQueryClient();

  // Fetch templates from API
  const { data: templates = [] } = useQuery<SMSTemplateDisplay[]>({
    queryKey: ['sms-templates', searchQuery],
    queryFn: async () => {
      const apiTemplates = await smsTemplatesService.getTemplates(undefined, searchQuery || undefined);
      return apiTemplates.map(t => ({
        id: t.id,
        name: t.name,
        content: t.content,
        category: t.category,
        usageCount: t.usageCount,
        createdAt: new Date(t.createdAt),
      }));
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await smsTemplatesService.createTemplate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] });
      toast.success('Template created successfully');
      handleCloseDialog();
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async (data: { id: string } & typeof formData) => {
      return await smsTemplatesService.updateTemplate(data.id, {
        name: data.name,
        content: data.content,
        category: data.category,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] });
      toast.success('Template updated successfully');
      handleCloseDialog();
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      await smsTemplatesService.deleteTemplate(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] });
      toast.success('Template deleted successfully');
    },
  });

  const handleOpenDialog = (template?: SMSTemplateDisplay) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        content: template.content,
        category: template.category,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        content: '',
        category: 'General',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      content: '',
      category: 'General',
    });
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, ...formData });
    } else {
      createTemplateMutation.mutate(formData);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Template copied to clipboard');
  };

  const handleAITemplateSelect = (template: GeneratedSmsTemplate) => {
    // Pre-fill the form with the AI-generated template
    setFormData({
      name: template.name,
      content: template.content,
      category: template.category,
    });
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SMS Templates</h2>
          <p className="text-sm text-text-secondary mt-1">
            Create and manage reusable SMS message templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAiDialogOpen(true)}>
            <Sparkles className="size-4 mr-2 text-primary" />
            Generate with AI
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="size-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="secondary" className="mt-2">
                    {template.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(template.content)}
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(template)}
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTemplateMutation.mutate(template.id)}
                  >
                    <Trash2 className="size-4 text-error" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary line-clamp-3">
                {template.content}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-xs text-text-secondary">
                  Used {template.usageCount} times
                </span>
                <span className="text-xs text-text-secondary">
                  {template.content.length} chars
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-text-secondary">No templates found</p>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Modal open={dialogOpen} onOpenChange={setDialogOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </ModalTitle>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="e.g., Welcome Message"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Welcome, Follow-up"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message Content</Label>
              <Textarea
                id="content"
                placeholder="Type your message... Use {name}, {date}, {time} for variables"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[150px] resize-none"
                maxLength={1600}
              />
              <p className="text-xs text-text-secondary">
                {formData.content.length} / 1600 characters
              </p>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
            >
              {editingTemplate ? 'Update' : 'Create'} Template
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AI SMS Template Generation Dialog */}
      <AISmsTemplateGenerationDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onTemplateSelect={handleAITemplateSelect}
      />
    </div>
  );
}
