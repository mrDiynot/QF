'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalTitle, ModalFooter } from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface WorkflowTemplate {
  id?: string;
  name: string;
  description: string;
  category: string;
  planTier: string;
  isActive: boolean;
}

interface WorkflowTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: WorkflowTemplate;
  onSave: (template: WorkflowTemplate) => void;
}

export function WorkflowTemplateDialog({ open, onOpenChange, template, onSave }: WorkflowTemplateDialogProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'Lead Management',
    planTier: template?.planTier || 'SmartFlow',
    isActive: template?.isActive ?? true,
  });

  const handleSave = () => {
    onSave({
      ...template,
      ...formData,
    });
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>
          <ModalTitle>{template ? 'Edit Workflow Template' : 'New Workflow Template'}</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              placeholder="e.g., Lead Qualification"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this workflow does..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead Management">Lead Management</SelectItem>
                  <SelectItem value="Nurture">Nurture</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Onboarding">Onboarding</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planTier">Plan Tier</Label>
              <Select value={formData.planTier} onValueChange={(value) => setFormData({ ...formData, planTier: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FreeFlow">FreeFlow</SelectItem>
                  <SelectItem value="SmartFlow">SmartFlow</SelectItem>
                  <SelectItem value="UltraFlow">UltraFlow</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Active Status</Label>
              <p className="text-sm text-text-secondary">Enable or disable this template</p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {template ? 'Update' : 'Create'} Template
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
