'use client';

/**
 * Form Tester Page
 * Test public forms and lead capture workflows
 */

import { useState, useEffect } from 'react';
import {
  FileText,
  Wand2,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Code,
  User,
  Building2,
  Loader2,
} from 'lucide-react';
import { formsService } from '@/services/api/forms.service';
import { useSimulatorTheme } from '../SimulatorThemeContext';
import type { Form } from '@/types/api';
import { handleApiError, getErrorDetails } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Removed static test forms - now fetched from API

const testDataPresets = {
  standard: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Inc.',
    message: 'I am interested in learning more about your services.',
  },
  enterprise: {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@enterprise.com',
    phone: '+1 (555) 987-6543',
    company: 'Enterprise Corp.',
    message: 'We are evaluating solutions for our team of 500+ employees.',
  },
  minimal: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@test.com',
    phone: '',
    company: '',
    message: '',
  },
  invalid: {
    firstName: '',
    lastName: '',
    email: 'invalid-email',
    phone: 'abc',
    company: '',
    message: '',
  },
};

// Recent submissions tracked in state instead

export default function FormTesterPage() {
  useSimulatorTheme(); // Theme context for styling
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [isLoadingForms, setIsLoadingForms] = useState(true);
  const [testData, setTestData] = useState(testDataPresets.standard);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    leadId?: string;
    submissionId?: string;
  } | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<Array<{
    id: string;
    form: string;
    email: string;
    time: string;
    status: 'success' | 'error';
    leadId?: string;
    error?: string;
  }>>([]);

  // Fetch forms on mount
  useEffect(() => {
    const fetchForms = async () => {
      setIsLoadingForms(true);
      try {
        const response = await formsService.getForms({ pageSize: 50 });
        const formsList = response.items || [];
        setForms(formsList);
        if (formsList.length > 0) {
          setSelectedForm(formsList[0]);
        }
      } catch (error) {
        console.error('Error fetching forms:', error);
      } finally {
        setIsLoadingForms(false);
      }
    };
    fetchForms();
  }, []);

  const handleAutoFill = (preset: keyof typeof testDataPresets) => {
    setTestData(testDataPresets[preset]);
  };

  const handleSubmit = async () => {
    if (!selectedForm) return;

    setIsSubmitting(true);
    setLastResult(null);

    try {
      // Build submission data using actual form field IDs
      // The form fields may be stored as JSON string or array
      const fields = typeof selectedForm.fields === 'string'
        ? JSON.parse(selectedForm.fields)
        : selectedForm.fields || [];

      // Map test data to form field IDs
      const submissionData: Record<string, unknown> = {};

      for (const field of fields) {
        const fieldId = field.id || field.name;
        const fieldType = (field.type || '').toLowerCase();
        const fieldLabel = (field.label || '').toLowerCase();
        const fieldName = (field.name || '').toLowerCase();

        // Match test data to form fields based on type/label/name
        if (fieldType === 'email' || fieldLabel.includes('email') || fieldName.includes('email')) {
          submissionData[fieldId] = testData.email;
        } else if (fieldType === 'phone' || fieldType === 'tel' || fieldLabel.includes('phone') || fieldName.includes('phone')) {
          submissionData[fieldId] = testData.phone;
        } else if (fieldLabel.includes('first') || fieldName.includes('first')) {
          submissionData[fieldId] = testData.firstName;
        } else if (fieldLabel.includes('last') || fieldName.includes('last')) {
          submissionData[fieldId] = testData.lastName;
        } else if (fieldLabel.includes('name') || fieldName.includes('name')) {
          submissionData[fieldId] = `${testData.firstName} ${testData.lastName}`;
        } else if (fieldLabel.includes('company') || fieldLabel.includes('business') || fieldName.includes('company')) {
          submissionData[fieldId] = testData.company;
        } else if (fieldType === 'textarea' || fieldLabel.includes('message') || fieldName.includes('message')) {
          submissionData[fieldId] = testData.message;
        } else if (fieldType === 'select' || fieldType === 'radio') {
          // For select/radio fields, pick the first available option
          const options = field.options as string[] | undefined;
          if (options && options.length > 0) {
            // Try to pick a sensible option based on field label
            if (fieldLabel.includes('size') || fieldLabel.includes('employees')) {
              // Company size - pick a mid-range option
              submissionData[fieldId] = options.length > 2 ? options[2] : options[0];
            } else if (fieldLabel.includes('interest') || fieldLabel.includes('reason')) {
              // Interest/reason - pick first option (usually most common)
              submissionData[fieldId] = options[0];
            } else {
              // Default to first option
              submissionData[fieldId] = options[0];
            }
          }
        } else if (fieldType === 'checkbox') {
          // For checkbox fields, check if it's required and set to true or first option
          const options = field.options as string[] | undefined;
          if (options && options.length > 0) {
            submissionData[fieldId] = [options[0]]; // Select first option
          } else {
            submissionData[fieldId] = true; // Boolean checkbox
          }
        } else if (fieldType === 'number') {
          submissionData[fieldId] = '100'; // Default number value
        } else if (fieldType === 'date') {
          submissionData[fieldId] = new Date().toISOString().split('T')[0]; // Today's date
        } else if (fieldType === 'url') {
          submissionData[fieldId] = 'https://example.com';
        } else if (fieldType === 'text') {
          // Default text field - use first name as fallback
          submissionData[fieldId] = testData.firstName;
        }
      }

      // Submit to the real forms endpoint
      const result = await formsService.submitForm(selectedForm.id, submissionData);
      
      setLastResult({
        success: true,
        message: 'Form submitted successfully!',
        leadId: (result as { leadId?: string }).leadId,
        submissionId: result.id,
      });

      // Add to recent submissions
      setRecentSubmissions(prev => [{
        id: result.id,
        form: selectedForm.name,
        email: testData.email,
        time: 'Just now',
        status: 'success',
        leadId: (result as { leadId?: string }).leadId,
      }, ...prev.slice(0, 4)]);
    } catch (error: unknown) {
      // Get user-friendly error message and log technical details
      const userMessage = handleApiError(error);
      const errorDetails = getErrorDetails(error);

      console.error('[FormSimulator] Submission failed:', errorDetails);

      setLastResult({
        success: false,
        message: userMessage,
      });

      // Add to recent submissions
      setRecentSubmissions(prev => [{
        id: Date.now().toString(),
        form: selectedForm.name,
        email: testData.email,
        time: 'Just now',
        status: 'error',
        error: userMessage,
      }, ...prev.slice(0, 4)]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">Form Tester</h1>
                <p className="text-xs text-slate-400">Test lead capture forms and submissions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLoadingForms ? (
                <Badge variant="outline" className="border-slate-500/50 text-slate-400 gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading...
                </Badge>
              ) : forms.length > 0 ? (
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {forms.length} Form{forms.length > 1 ? 's' : ''} Available
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-500/50 text-amber-400 gap-1.5">
                  <AlertCircle className="w-3 h-3" />
                  No Forms Configured
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Form Selection & Config */}
        <aside className="w-80 shrink-0 border-r border-slate-800 bg-slate-900/30 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Form Selection */}
            <div>
              <Label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">
                Select Form
              </Label>
              {forms.length > 0 ? (
                <div className="space-y-2">
                  {forms.map((form) => (
                    <button
                      key={form.id}
                      onClick={() => setSelectedForm(form)}
                      className={cn(
                        'w-full p-3 rounded-lg text-left transition-all border',
                        selectedForm?.id === form.id
                          ? 'bg-emerald-500/20 border-emerald-500/50'
                          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{form.name}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {form.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">/{form.slug}</p>
                    </button>
                  ))}
                </div>
              ) : !isLoadingForms ? (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <p className="text-sm font-medium text-amber-400">No Forms</p>
                  <p className="text-xs mt-1 text-amber-400/70">
                    Create a form in Forms settings to test here.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                </div>
              )}
            </div>

            <Separator className="bg-slate-800" />

            {/* Auto-Fill Presets */}
            <div>
              <Label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">
                Auto-Fill Test Data
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 justify-start"
                  onClick={() => handleAutoFill('standard')}
                >
                  <Wand2 className="w-3.5 h-3.5 mr-2" />
                  Standard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 justify-start"
                  onClick={() => handleAutoFill('enterprise')}
                >
                  <Building2 className="w-3.5 h-3.5 mr-2" />
                  Enterprise
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 justify-start"
                  onClick={() => handleAutoFill('minimal')}
                >
                  <User className="w-3.5 h-3.5 mr-2" />
                  Minimal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 justify-start text-amber-400 hover:text-amber-300"
                  onClick={() => handleAutoFill('invalid')}
                >
                  <AlertCircle className="w-3.5 h-3.5 mr-2" />
                  Invalid
                </Button>
              </div>
            </div>

            <Separator className="bg-slate-800" />

            {/* Recent Submissions */}
            <div>
              <Label className="text-xs text-slate-400 uppercase tracking-wider mb-3 block">
                Recent Submissions
              </Label>
              <div className="space-y-2">
                {recentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{sub.form}</span>
                      {sub.status === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{sub.email}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-500">{sub.time}</span>
                      {sub.leadId && (
                        <span className="text-[10px] font-mono text-slate-500">{sub.leadId}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Form Preview & Test */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          <Tabs defaultValue="test" className="flex-1 flex flex-col">
            <div className="shrink-0 border-b border-slate-800 px-4">
              <TabsList className="h-12 bg-transparent p-0">
                <TabsTrigger
                  value="test"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent px-4"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Test Form
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent px-4"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger
                  value="api"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent px-4"
                >
                  <Code className="w-4 h-4 mr-2" />
                  API Response
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="test" className="flex-1 p-6 overflow-auto m-0">
              <div className="max-w-xl mx-auto">
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      {selectedForm?.name || 'Select a Form'}
                    </CardTitle>
                    <CardDescription>
                      {selectedForm ? `Testing form at /api/v1/public/forms/${selectedForm.slug}` : 'Select a form from the sidebar'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">First Name *</Label>
                        <Input
                          value={testData.firstName}
                          onChange={(e) => setTestData({ ...testData, firstName: e.target.value })}
                          className="mt-1.5 bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Last Name *</Label>
                        <Input
                          value={testData.lastName}
                          onChange={(e) => setTestData({ ...testData, lastName: e.target.value })}
                          className="mt-1.5 bg-slate-800 border-slate-700"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Email *</Label>
                      <Input
                        type="email"
                        value={testData.email}
                        onChange={(e) => setTestData({ ...testData, email: e.target.value })}
                        className="mt-1.5 bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Phone</Label>
                      <Input
                        value={testData.phone}
                        onChange={(e) => setTestData({ ...testData, phone: e.target.value })}
                        className="mt-1.5 bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Company</Label>
                      <Input
                        value={testData.company}
                        onChange={(e) => setTestData({ ...testData, company: e.target.value })}
                        className="mt-1.5 bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Message</Label>
                      <Textarea
                        value={testData.message}
                        onChange={(e) => setTestData({ ...testData, message: e.target.value })}
                        className="mt-1.5 bg-slate-800 border-slate-700 resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Result */}
                    {lastResult && (
                      <div className={cn(
                        'p-4 rounded-lg border',
                        lastResult.success
                          ? 'bg-emerald-500/10 border-emerald-500/50'
                          : 'bg-red-500/10 border-red-500/50'
                      )}>
                        <div className="flex items-center gap-2 mb-1">
                          {lastResult.success ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className={cn(
                            'font-medium text-sm',
                            lastResult.success ? 'text-emerald-400' : 'text-red-400'
                          )}>
                            {lastResult.success ? 'Success' : 'Error'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{lastResult.message}</p>
                        {lastResult.leadId && (
                          <p className="text-xs font-mono text-slate-500 mt-1">
                            Lead ID: {lastResult.leadId}
                          </p>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Test Form
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 p-6 overflow-auto m-0">
              <div className="max-w-2xl mx-auto">
                <p className="text-sm text-slate-400 mb-4">
                  Preview how the form appears when embedded on a website.
                </p>
                <div className="bg-white rounded-xl p-8 text-slate-900">
                  <h2 className="text-2xl font-bold mb-2">{selectedForm?.name || 'Form Preview'}</h2>
                  <p className="text-slate-600 mb-6">Fill out the form below and we&apos;ll get back to you shortly.</p>
                  {/* Simplified form preview */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input className="w-full px-4 py-2 border rounded-lg" placeholder="First Name" />
                      <input className="w-full px-4 py-2 border rounded-lg" placeholder="Last Name" />
                    </div>
                    <input className="w-full px-4 py-2 border rounded-lg" placeholder="Email" />
                    <input className="w-full px-4 py-2 border rounded-lg" placeholder="Phone" />
                    <textarea className="w-full px-4 py-2 border rounded-lg resize-none" rows={3} placeholder="Message" />
                    <button className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium">
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="api" className="flex-1 p-6 overflow-auto m-0">
              <div className="max-w-2xl mx-auto space-y-4">
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">
                    Request
                  </Label>
                  <pre className="p-4 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 overflow-x-auto">
{`POST /api/v1/public/forms/${selectedForm?.slug || 'form-slug'}/submit
Content-Type: application/json

${JSON.stringify({ data: testData }, null, 2)}`}
                  </pre>
                </div>
                {lastResult && (
                  <div>
                    <Label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">
                      Response
                    </Label>
                    <pre className={cn(
                      'p-4 rounded-lg border text-xs font-mono overflow-x-auto',
                      lastResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    )}>
{lastResult.success
  ? JSON.stringify({
      success: true,
      submissionId: 'sub_' + Math.random().toString(36).substr(2, 9),
      leadId: lastResult.leadId,
      message: lastResult.message,
    }, null, 2)
  : JSON.stringify({
      success: false,
      error: lastResult.message,
      validationErrors: ['email: Invalid email format'],
    }, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
