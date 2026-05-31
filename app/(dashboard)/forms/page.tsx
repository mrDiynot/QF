'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Copy, Eye, Edit, Trash2, BarChart, FileText,
  Calendar, Mail, User, CheckSquare, Loader2, AlertCircle, ChevronDown, ChevronRight, Upload, Sparkles
} from 'lucide-react';
import { useForms, useDeleteForm, usePublishForm } from '@/hooks/forms/useForms';
import { formatDistanceToNow } from 'date-fns';
import { FormAnalyticsDashboard } from '@/components/forms/FormAnalyticsDashboard';
import { QRCodeDialog } from '@/components/forms/QRCodeDialog';
import { EmbedCodeDialog } from '@/components/forms/EmbedCodeDialog';
import { FormPreview } from '@/components/forms/FormPreview';
import { AIFormGenerationDialog } from '@/components/forms/AIFormGenerationDialog';
import { useSubscriptionEnforcement } from '@/hooks/useSubscriptionEnforcement';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalTitle,
  ConfirmModal,
} from '@/components/modals';
import { toast } from 'sonner';
import type { Form } from '@/types/api';

export default function FormsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');
  const [expandedFormId, setExpandedFormId] = useState<string | null>(null);
  const [qrCodeForm, setQrCodeForm] = useState<{ id: string; slug: string } | null>(null);
  const [embedCodeForm, setEmbedCodeForm] = useState<{ id: string; slug: string } | null>(null);
  const [previewForm, setPreviewForm] = useState<Form | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<{ id: string; name: string; submissions: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAIGenerationDialog, setShowAIGenerationDialog] = useState(false);

  // Subscription enforcement
  const { checkLimit, subscription } = useSubscriptionEnforcement();

  const { data: formsData, isLoading, error } = useForms({
    pageNumber: 1,
    pageSize: 50,
  });

  const deleteFormMutation = useDeleteForm();
  const publishFormMutation = usePublishForm();

  const handleCreateForm = () => {
    const formLimit = checkLimit('maxForms');
    if (!formLimit.allowed) {
      setUpgradeReason(`You've reached your form limit (${formLimit.limit} forms). Upgrade to create more forms.`);
      setShowUpgradeDialog(true);
      return;
    }
    router.push('/forms/builder');
  };

  const handleAIGenerate = () => {
    const formLimit = checkLimit('maxForms');
    if (!formLimit.allowed) {
      setUpgradeReason(`You've reached your form limit (${formLimit.limit} forms). Upgrade to create more forms.`);
      setShowUpgradeDialog(true);
      return;
    }
    // Check AI limit
    const aiLimit = checkLimit('maxAiInteractionsPerMonth');
    if (!aiLimit.allowed) {
      setUpgradeReason(`You've reached your AI generation limit. Upgrade to generate more forms with AI.`);
      setShowUpgradeDialog(true);
      return;
    }
    setShowAIGenerationDialog(true);
  };

  // Calculate stats from real data
  const stats = useMemo(() => {
    const forms = formsData?.items || [];
    const totalSubmissions = forms.reduce((sum, f) => sum + (f.submissionCount || 0), 0);

    return [
      { label: 'Total Forms', value: forms.length.toString(), icon: FileText },
      { label: 'Total Submissions', value: totalSubmissions.toLocaleString(), icon: CheckSquare },
      { label: 'Published', value: forms.filter(f => f.status?.toLowerCase() === 'published').length.toString(), icon: BarChart },
      { label: 'Drafts', value: forms.filter(f => f.status?.toLowerCase() === 'draft').length.toString(), icon: Calendar },
    ];
  }, [formsData]);

  // Transform and filter forms
  // Note: Backend returns status as capitalized (e.g., "Published", "Draft")
  // We normalize to lowercase for consistent comparison
  const filteredForms = useMemo(() => {
    const forms = formsData?.items || [];
    return forms
      .filter(form => {
        if (activeTab === 'all') return true;
        const normalizedStatus = form.status?.toLowerCase();
        return normalizedStatus === activeTab;
      })
      .map(form => {
        // Parse fields if it's a JSON string
        let fieldCount = 0;
        try {
          const fields = typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields;
          fieldCount = Array.isArray(fields) ? fields.length : 0;
        } catch {
          fieldCount = 0;
        }
        return {
          id: form.id,
          name: form.name,
          status: form.status?.toLowerCase() as 'published' | 'draft',
          submissions: form.submissionCount || 0,
          fields: fieldCount,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
          slug: form.slug,
        };
      });
  }, [formsData, activeTab]);

  // Count by status for tabs
  const tabCounts = useMemo(() => {
    const forms = formsData?.items || [];
    return {
      all: forms.length,
      published: forms.filter(f => f.status?.toLowerCase() === 'published').length,
      draft: forms.filter(f => f.status?.toLowerCase() === 'draft').length,
    };
  }, [formsData]);

  const templates = [
    { id: 'contact', name: 'Contact Form', icon: Mail, fields: 5, description: 'Basic contact information' },
    { id: 'lead-capture', name: 'Lead Capture', icon: User, fields: 7, description: 'Detailed lead qualification' },
    { id: 'appointment', name: 'Appointment Booking', icon: Calendar, fields: 6, description: 'Schedule meetings' },
    { id: 'quote-request', name: 'Quote Request', icon: FileText, fields: 9, description: 'Service pricing inquiry' },
  ];

  const handleTemplateClick = (templateId: string) => {
    const formLimit = checkLimit('maxForms');
    if (!formLimit.allowed) {
      setUpgradeReason(`You've reached your form limit (${formLimit.limit} forms). Upgrade to create more forms.`);
      setShowUpgradeDialog(true);
      return;
    }
    router.push(`/forms/builder?template=${templateId}`);
  };

  const handleDeleteClick = (form: { id: string; name: string; submissions: number }) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!formToDelete) return;
    
    setIsDeleting(true);
    try {
      // Check if form has submissions (in use)
      if (formToDelete.submissions > 0) {
        toast.error(
          `Cannot delete "${formToDelete.name}" - it has ${formToDelete.submissions} submission(s). Archive it instead.`,
          { duration: 5000 }
        );
        setDeleteDialogOpen(false);
        setFormToDelete(null);
        setIsDeleting(false);
        return;
      }

      await deleteFormMutation.mutateAsync(formToDelete.id);
      toast.success(`Form "${formToDelete.name}" deleted successfully`);
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    } catch {
      toast.error('Failed to delete form. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublish = (id: string) => {
    publishFormMutation.mutate(id);
  };

  return (
    <div className="animate-fade-in pt-4">
      <div className="mx-auto max-w-[1440px] space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-text-navy">Forms</h1>
            <p className="body-text mt-2 text-text-secondary">
              Create and manage lead capture forms
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2 rounded-[10px] border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={handleAIGenerate}
            >
              <Sparkles className="size-4" />
              AI Generate
            </Button>
            <Button
              className="gap-2 rounded-[10px] gradient-primary text-white"
              onClick={handleCreateForm}
            >
              <Plus className="size-4" />
              Create Form
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="small-text text-text-secondary">{stat.label}</p>
                  <p className="text-3xl font-normal text-text-navy">{stat.value}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-3">
                  <stat.icon className="size-6 text-brand-purple" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {(['all', 'published', 'draft'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-t-lg px-4 py-2 text-sm font-normal capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-brand-purple text-brand-purple'
                  : 'text-text-secondary hover:text-text-navy'
              }`}
            >
              {tab} ({tabCounts[tab]})
            </button>
          ))}
        </div>

        {/* Forms List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="flex items-center justify-center p-12">
              <Loader2 className="size-8 animate-spin text-brand-purple" />
            </Card>
          ) : error ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <AlertCircle className="size-8 text-error mb-2" />
              <p className="text-sm text-error">Failed to load forms</p>
            </Card>
          ) : filteredForms.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <FileText className="size-8 text-text-muted mb-2" />
              <p className="text-sm text-text-secondary">No forms found</p>
              <p className="text-xs text-text-muted mt-1">Create your first form to get started</p>
            </Card>
          ) : (
            filteredForms.map((form) => (
              <Card key={form.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex size-12 items-center justify-center rounded-lg gradient-primary">
                        <FileText className="size-6 text-white" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="heading-3 text-text-navy">{form.name}</h3>
                          <span className={`tiny-text rounded-full px-2 py-1 ${
                            form.status === 'published'
                              ? 'bg-green-50 text-green-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {form.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="flex gap-6 text-sm text-text-secondary">
                          <span>{form.fields} fields</span>
                          <span>•</span>
                          <span>{form.submissions} submissions</span>
                          <span>•</span>
                          <span>Created {formatDistanceToNow(new Date(form.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-[10px]"
                        onClick={() => setExpandedFormId(expandedFormId === form.id ? null : form.id)}
                      >
                        <BarChart className="size-3" />
                        Analytics
                        {expandedFormId === form.id ? (
                          <ChevronDown className="size-3" />
                        ) : (
                          <ChevronRight className="size-3" />
                        )}
                      </Button>
                      {form.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 rounded-[10px] text-green-600 hover:bg-green-50"
                          onClick={() => handlePublish(form.id)}
                          disabled={publishFormMutation.isPending}
                        >
                          <Upload className="size-3" />
                          Publish
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-[10px]"
                        onClick={() => setEmbedCodeForm({ id: form.id, slug: form.slug || form.id })}
                      >
                        <Copy className="size-3" />
                        Embed
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-[10px]"
                        onClick={() => {
                          const fullForm = formsData?.items?.find(f => f.id === form.id);
                          if (fullForm) setPreviewForm(fullForm);
                        }}
                      >
                        <Eye className="size-3" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-[10px]"
                        onClick={() => router.push(`/forms/builder?id=${form.id}`)}
                      >
                        <Edit className="size-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-[10px] text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteClick({ id: form.id, name: form.name, submissions: form.submissions })}
                        disabled={deleteFormMutation.isPending || isDeleting}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                {expandedFormId === form.id && (
                  <div className="border-t bg-gray-50/50 p-6">
                    <FormAnalyticsDashboard formId={form.id} />
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Templates */}
        <Card className="p-6">
          <h2 className="heading-2 mb-6 text-text-navy">Form Templates</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((template, idx) => (
              <div
                key={idx}
                onClick={() => handleTemplateClick(template.id)}
                className="cursor-pointer rounded-xl border border-border bg-white p-4 transition-all hover:border-brand-purple hover:shadow-md"
              >
                <div className="mb-3 flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                  <template.icon className="size-6 text-brand-purple" />
                </div>
                <h3 className="heading-3 mb-1 text-text-navy">{template.name}</h3>
                <p className="small-text mb-2 text-text-secondary">{template.description}</p>
                <p className="tiny-text text-text-muted">{template.fields} fields • Click to use</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* QR Code Dialog */}
      {qrCodeForm && (
        <QRCodeDialog
          open={!!qrCodeForm}
          onOpenChange={(open) => !open && setQrCodeForm(null)}
          formSlug={qrCodeForm.slug}
        />
      )}

      {/* Embed Code Dialog */}
      {embedCodeForm && (
        <EmbedCodeDialog
          open={!!embedCodeForm}
          onOpenChange={(open) => !open && setEmbedCodeForm(null)}
          formId={embedCodeForm.id}
          formSlug={embedCodeForm.slug}
        />
      )}

      {/* Preview Dialog */}
      {previewForm && (
        <Modal open={!!previewForm} onOpenChange={(open) => !open && setPreviewForm(null)}>
          <ModalContent size="xl">
            <ModalHeader>
              <ModalTitle>Form Preview: {previewForm.name}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <FormPreview
                fields={typeof previewForm.fields === 'string' ? JSON.parse(previewForm.fields) : previewForm.fields}
                styling={typeof previewForm.styling === 'string' ? JSON.parse(previewForm.styling || '{}') : (previewForm.styling || {})}
                formName={previewForm.name}
              />
            </ModalBody>
            <div className="mt-4 flex justify-end px-6 pb-6">
              <Button variant="outline" onClick={() => setPreviewForm(null)}>
                Close
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Upgrade Dialog */}
      <UpgradePrompt
        showDialog={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        reason={upgradeReason}
        currentPlan={subscription?.planName}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Form"
        description={
          <div className="space-y-3">
            <div>
              Are you sure you want to delete <strong>&quot;{formToDelete?.name}&quot;</strong>?
            </div>
            {formToDelete?.submissions && formToDelete.submissions > 0 ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 text-sm">
                <strong>Warning:</strong> This form has {formToDelete.submissions} submission(s).
                Deleting it will remove all associated data permanently.
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                This action cannot be undone. The form and all its settings will be permanently removed.
              </div>
            )}
          </div>
        }
        variant="danger"
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Form'}
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      {/* AI Form Generation Dialog */}
      <AIFormGenerationDialog
        open={showAIGenerationDialog}
        onOpenChange={setShowAIGenerationDialog}
      />
    </div>
  );
}