'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Save, Eye, ArrowLeft, Sparkles } from 'lucide-react';
import type { GeneratedFormData, GeneratedFormField } from '@/types/ai-forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FieldPalette } from '@/components/forms/FieldPalette';
import { FormFieldItem } from '@/components/forms/FormFieldItem';
import { FieldConfigPanel } from '@/components/forms/FieldConfigPanel';
import { FormPreviewWithLogic } from '@/components/forms/FormPreviewWithLogic';
import { ConditionalLogicPanel } from '@/components/forms/ConditionalLogicPanel';
import { CalculationBuilder } from '@/components/forms/CalculationBuilder';
import { PageManager } from '@/components/forms/PageManager';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_MULTI_PAGE_SETTINGS } from '@/types/multi-page-forms';
import { 
  FormBuilderState, 
  FormField, 
  FieldType, 
  FIELD_TEMPLATES,
  DEFAULT_STYLING,
  DEFAULT_SETTINGS,
  DEFAULT_THANK_YOU,
} from '@/types/form-builder';
import { formsService } from '@/services/api/forms.service';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formKeys } from '@/hooks/forms/useForms';
import type { Form } from '@/types/api';

// Template definitions matching the forms page
const TEMPLATE_FIELDS: Record<string, FormField[]> = {
  'contact': [
    { id: 'field-1', type: 'text', label: 'Full Name', placeholder: '', required: true, order: 0 },
    { id: 'field-2', type: 'email', label: 'Email Address', placeholder: '', required: true, order: 1 },
    { id: 'field-3', type: 'text', label: 'Phone Number', placeholder: '', required: false, order: 2 },
    { id: 'field-4', type: 'textarea', label: 'Message', placeholder: '', required: true, order: 3 },
  ],
  'lead-capture': [
    { id: 'field-1', type: 'text', label: 'First Name', placeholder: '', required: true, order: 0 },
    { id: 'field-2', type: 'text', label: 'Last Name', placeholder: '', required: true, order: 1 },
    { id: 'field-3', type: 'email', label: 'Work Email', placeholder: '', required: true, order: 2 },
    { id: 'field-4', type: 'text', label: 'Company Name', placeholder: '', required: true, order: 3 },
    { id: 'field-5', type: 'select', label: 'Company Size', placeholder: '', required: true, order: 4, options: ['1-10', '11-50', '51-200', '201-500', '500+'] },
    { id: 'field-6', type: 'select', label: 'Interest', placeholder: '', required: true, order: 5, options: ['Product Demo', 'Pricing Info', 'Partnership', 'Other'] },
  ],
  'appointment': [
    { id: 'field-1', type: 'text', label: 'Full Name', placeholder: '', required: true, order: 0 },
    { id: 'field-2', type: 'email', label: 'Email', placeholder: '', required: true, order: 1 },
    { id: 'field-3', type: 'text', label: 'Phone', placeholder: '', required: true, order: 2 },
    { id: 'field-4', type: 'select', label: 'Service Type', placeholder: '', required: true, order: 3, options: ['Consultation', 'Service', 'Follow-up'] },
    { id: 'field-5', type: 'date', label: 'Preferred Date', placeholder: '', required: true, order: 4 },
    { id: 'field-6', type: 'select', label: 'Preferred Time', placeholder: '', required: true, order: 5, options: ['Morning', 'Afternoon', 'Evening'] },
    { id: 'field-7', type: 'textarea', label: 'Additional Notes', placeholder: '', required: false, order: 6 },
  ],
  'quote-request': [
    { id: 'field-1', type: 'text', label: 'Full Name', placeholder: '', required: true, order: 0 },
    { id: 'field-2', type: 'email', label: 'Email', placeholder: '', required: true, order: 1 },
    { id: 'field-3', type: 'text', label: 'Phone', placeholder: '', required: true, order: 2 },
    { id: 'field-4', type: 'text', label: 'Company', placeholder: '', required: false, order: 3 },
    { id: 'field-5', type: 'select', label: 'Service Needed', placeholder: '', required: true, order: 4, options: ['Web Development', 'Mobile App', 'Consulting', 'Other'] },
    { id: 'field-6', type: 'textarea', label: 'Project Description', placeholder: '', required: true, order: 5 },
    { id: 'field-7', type: 'select', label: 'Budget Range', placeholder: '', required: true, order: 6, options: ['<$10K', '$10K-$50K', '$50K-$100K', '$100K+'] },
    { id: 'field-8', type: 'select', label: 'Timeline', placeholder: '', required: true, order: 7, options: ['ASAP', '1-3 months', '3-6 months', '6+ months'] },
  ],
};

const TEMPLATE_NAMES: Record<string, string> = {
  'contact': 'Contact Form',
  'lead-capture': 'Lead Capture',
  'appointment': 'Appointment Request',
  'quote-request': 'Quote Request',
};

// Helper function to convert AI-generated fields to FormBuilder fields
function convertAIFieldsToFormFields(aiFields: GeneratedFormField[]): FormField[] {
  return aiFields.map((field, index) => ({
    id: `field-${Date.now()}-${index}`,
    type: field.type as FieldType,
    label: field.label,
    placeholder: field.placeholder || '',
    required: field.required,
    options: field.options,
    order: index,
    helpText: field.helpText,
    validation: field.validation ? [
      ...(field.validation.minLength ? [{ type: 'minLength' as const, value: field.validation.minLength }] : []),
      ...(field.validation.maxLength ? [{ type: 'maxLength' as const, value: field.validation.maxLength }] : []),
      ...(field.validation.pattern ? [{ type: 'pattern' as const, value: field.validation.pattern }] : []),
    ] : [],
  }));
}

export default function FormBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get('id');
  const templateId = searchParams.get('template');
  const source = searchParams.get('source'); // 'ai' if from AI generation
  const queryClient = useQueryClient();
  const [isFromAI, setIsFromAI] = useState(false);

  // Load existing form if editing
  const { data: existingForm } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formId ? formsService.getFormById(formId) : null,
    enabled: !!formId,
  });

  // Get template fields if creating from template
  const templateFields = templateId && TEMPLATE_FIELDS[templateId] ? TEMPLATE_FIELDS[templateId] : [];
  const templateName = templateId && TEMPLATE_NAMES[templateId] ? TEMPLATE_NAMES[templateId] : 'Untitled Form';

  const [formState, setFormState] = useState<FormBuilderState>({
    name: existingForm?.name || templateName,
    description: existingForm?.description || '',
    fields: existingForm?.fields ? (typeof existingForm.fields === 'string' ? JSON.parse(existingForm.fields) : existingForm.fields) : templateFields,
    styling: existingForm?.styling ? (typeof existingForm.styling === 'string' ? JSON.parse(existingForm.styling) : existingForm.styling) : DEFAULT_STYLING,
    settings: {
      ...DEFAULT_SETTINGS,
      emailNotifications: (existingForm as { notifyOnSubmission?: boolean })?.notifyOnSubmission || false,
      notificationEmail: (existingForm as { notificationEmails?: string })?.notificationEmails || '',
    },
    thankYouPage: {
      ...DEFAULT_THANK_YOU,
      message: (existingForm as { thankYouMessage?: string })?.thankYouMessage || DEFAULT_THANK_YOU.message,
      redirectUrl: (existingForm as { redirectUrl?: string })?.redirectUrl || DEFAULT_THANK_YOU.redirectUrl,
    },
    conditionalRules: [],
    calculations: [],
    status: existingForm?.status || 'draft',
  });

  // Load AI-generated form from sessionStorage if source=ai
  useEffect(() => {
    if (source === 'ai') {
      try {
        const aiFormData = sessionStorage.getItem('ai-generated-form');
        if (aiFormData) {
          const parsed: GeneratedFormData = JSON.parse(aiFormData);
          const convertedFields = convertAIFieldsToFormFields(parsed.fields);

          setFormState(prev => ({
            ...prev,
            name: parsed.name || 'AI Generated Form',
            description: parsed.description || '',
            fields: convertedFields,
            styling: {
              ...DEFAULT_STYLING,
              primaryColor: parsed.styling?.primaryColor || DEFAULT_STYLING.primaryColor,
              layout: parsed.styling?.layout || DEFAULT_STYLING.layout,
            },
            settings: {
              ...prev.settings,
              submitButtonText: parsed.submitButtonText || 'Submit',
            },
            thankYouPage: {
              ...prev.thankYouPage,
              message: parsed.successMessage || DEFAULT_THANK_YOU.message,
            },
          }));

          setIsFromAI(true);
          // Clear sessionStorage after loading
          sessionStorage.removeItem('ai-generated-form');
          toast.success('AI-generated form loaded! Customize it below.');
        }
      } catch (error) {
        console.error('Failed to load AI-generated form:', error);
        toast.error('Failed to load AI-generated form');
      }
    }
  }, [source]);

  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Track if we're publishing
  const [isPublishing, setIsPublishing] = useState(false);

  // Save form mutation
  const saveMutation = useMutation({
    mutationFn: async (publish: boolean = false) => {
      setIsPublishing(publish);
      const payload = {
        name: formState.name,
        description: formState.description,
        fields: typeof formState.fields === 'string' ? formState.fields : JSON.stringify(formState.fields),
        styling: typeof formState.styling === 'string' ? formState.styling : JSON.stringify(formState.styling),
        thankYouMessage: formState.thankYouPage.message,
        redirectUrl: formState.thankYouPage.redirectUrl,
        notifyOnSubmission: formState.settings.emailNotifications,
        notificationEmails: formState.settings.notificationEmail,
      };

      if (formId) {
        // Update existing form
        const updated = await formsService.updateForm(formId, payload);
        if (publish) {
          return await formsService.publishForm(formId);
        }
        return updated;
      } else {
        // Create new form
        const created = await formsService.createForm(payload);
        // If publishing, also publish the newly created form
        if (publish && created?.id) {
          return await formsService.publishForm(created.id);
        }
        return created;
      }
    },
    onSuccess: (data) => {
      // Add the new/updated form to cache
      queryClient.setQueriesData<{ items?: Form[]; totalCount?: number }>(
        { queryKey: formKeys.lists() },
        (oldData) => {
          if (!oldData?.items) {
            // No existing data, create new structure with the form
            return { items: [data], totalCount: 1 };
          }
          // Check if form already exists in cache
          const existingIndex = oldData.items.findIndex(f => f.id === data.id);
          if (existingIndex >= 0) {
            // Update existing form
            const newItems = [...oldData.items];
            newItems[existingIndex] = data;
            return { ...oldData, items: newItems };
          } else {
            // Add new form to the beginning
            return {
              ...oldData,
              items: [data, ...oldData.items],
              totalCount: (oldData.totalCount || oldData.items.length) + 1,
            };
          }
        }
      );
      
      if (isPublishing) {
        toast.success('Form published successfully!');
        // Redirect to forms page
        router.push('/forms');
      } else if (!formId) {
        toast.success('Form created successfully');
        router.push(`/forms/builder?id=${data.id}`);
      } else {
        toast.success('Form updated successfully');
      }
    },
    onError: () => {
      toast.error('Failed to save form');
    },
  });

  const handleAddField = useCallback((fieldType: FieldType) => {
    const template = FIELD_TEMPLATES[fieldType];
    const newField: FormField = {
      ...template,
      id: `field-${Date.now()}`,
      order: formState.fields.length,
    };
    setFormState(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  }, [formState.fields.length]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFormState(prev => {
        const oldIndex = prev.fields.findIndex(f => f.id === active.id);
        const newIndex = prev.fields.findIndex(f => f.id === over.id);
        const reordered = arrayMove(prev.fields, oldIndex, newIndex);
        return {
          ...prev,
          fields: reordered.map((f, idx) => ({ ...f, order: idx })),
        };
      });
    }
  };

  const handleEditField = (field: FormField) => {
    setSelectedField(field);
  };

  const handleSaveField = (updatedField: FormField) => {
    setFormState(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === updatedField.id ? updatedField : f),
    }));
  };

  const handleDeleteField = (fieldId: string) => {
    setFormState(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId),
    }));
  };

  const handleDuplicateField = (field: FormField) => {
    const duplicated: FormField = {
      ...field,
      id: `field-${Date.now()}`,
      order: formState.fields.length,
      label: `${field.label} (Copy)`,
    };
    setFormState(prev => ({
      ...prev,
      fields: [...prev.fields, duplicated],
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/forms')}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Input
                value={formState.name}
                onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                className="text-xl font-semibold border-none shadow-none px-0 focus-visible:ring-0"
                placeholder="Form Name"
              />
              {isFromAI && (
                <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                  <Sparkles className="size-3" />
                  AI Generated
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="size-4" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveMutation.mutate(false)}
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              <Save className="size-4" />
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => saveMutation.mutate(true)}
              disabled={saveMutation.isPending}
              className="gap-2 gradient-primary text-white"
            >
              Publish Form
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar - Field Palette */}
        <div className="w-80 border-r border-border bg-white p-6 overflow-y-auto" style={{ height: 'calc(100vh - 73px)' }}>
          <FieldPalette onFieldSelect={handleAddField} />
        </div>

        {/* Center - Form Builder */}
        <div className="flex-1 p-8 overflow-y-auto" style={{ height: 'calc(100vh - 73px)' }}>
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Form Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formState.description}
                  onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a description for your form..."
                  rows={2}
                />
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-navy">Form Fields</h3>
              {formState.fields.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                  <p className="text-text-secondary">
                    Add fields from the left panel to start building your form
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={formState.fields.map(f => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {formState.fields.map((field) => (
                        <FormFieldItem
                          key={field.id}
                          field={field}
                          onEdit={handleEditField}
                          onDelete={handleDeleteField}
                          onDuplicate={handleDuplicateField}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="fields" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="fields">Fields</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="logic">Logic</TabsTrigger>
                <TabsTrigger value="calc">Calculations</TabsTrigger>
                <TabsTrigger value="styling">Styling</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="fields" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-navy">Form Fields</h3>
                  {formState.fields.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                      <p className="text-text-secondary">
                        Add fields from the left panel to start building your form
                      </p>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={formState.fields.map(f => f.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {formState.fields.map((field) => (
                            <FormFieldItem
                              key={field.id}
                              field={field}
                              onEdit={handleEditField}
                              onDelete={handleDeleteField}
                              onDuplicate={handleDuplicateField}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="pages" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Multi-Page Form</Label>
                    <Switch
                      checked={formState.multiPageSettings?.enabled || false}
                      onCheckedChange={(enabled) => setFormState(prev => ({
                        ...prev,
                        multiPageSettings: { ...DEFAULT_MULTI_PAGE_SETTINGS, ...prev.multiPageSettings, enabled }
                      }))}
                    />
                  </div>
                  {formState.multiPageSettings?.enabled && (
                    <PageManager
                      pages={formState.multiPageSettings.pages}
                      fields={formState.fields}
                      onPagesChange={(pages) => setFormState(prev => ({
                        ...prev,
                        multiPageSettings: { ...prev.multiPageSettings!, pages }
                      }))}
                    />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="logic" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Conditional Logic</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Advanced conditional logic features coming soon.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="calc" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Calculations</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Advanced calculation features coming soon.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="styling" className="mt-6">
                <FormPreviewWithLogic 
                  fields={formState.fields} 
                  styling={formState.styling}
                  conditionalRules={formState.conditionalRules}
                  calculations={formState.calculations}
                />
              </TabsContent>
              <TabsContent value="logic" className="mt-6">
                <ConditionalLogicPanel
                  fields={formState.fields}
                  rules={formState.conditionalRules || []}
                  onRulesChange={(rules) => setFormState(prev => ({ ...prev, conditionalRules: rules }))}
                />
              </TabsContent>
              <TabsContent value="calc" className="mt-6">
                <CalculationBuilder
                  fields={formState.fields}
                  calculations={formState.calculations || []}
                  onCalculationsChange={(calculations) => setFormState(prev => ({ ...prev, calculations }))}
                />
              </TabsContent>
              <TabsContent value="settings" className="mt-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-navy">Form Settings</h3>
                  <div className="space-y-2">
                    <Label>Thank You Message</Label>
                    <Textarea
                      value={formState.thankYouPage.message}
                      onChange={(e) => setFormState(prev => ({
                        ...prev,
                        thankYouPage: { ...prev.thankYouPage, message: e.target.value }
                      }))}
                      placeholder="Thank you for your submission!"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Redirect URL (Optional)</Label>
                    <Input
                      value={formState.thankYouPage.redirectUrl || ''}
                      onChange={(e) => setFormState(prev => ({
                        ...prev,
                        thankYouPage: { ...prev.thankYouPage, redirectUrl: e.target.value }
                      }))}
                      placeholder="https://example.com/thank-you"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right - Preview */}
        {showPreview && (
          <div className="w-[600px] border-l border-border bg-gray-50 p-8 overflow-y-auto" style={{ height: 'calc(100vh - 73px)' }}>
            <h3 className="text-lg font-semibold text-text-navy mb-6">Live Preview</h3>
            <FormPreviewWithLogic 
              fields={formState.fields} 
              styling={formState.styling}
              conditionalRules={formState.conditionalRules}
              calculations={formState.calculations}
            />
          </div>
        )}

        {/* Field Config Panel */}
        {selectedField && (
          <FieldConfigPanel
            field={selectedField}
            allFields={formState.fields}
            onSave={handleSaveField}
            onClose={() => setSelectedField(null)}
          />
        )}
      </div>
    </div>
  );
}
