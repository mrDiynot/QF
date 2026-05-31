'use client';

/**
 * Email Template Builder Component
 * Rich editor for creating and customizing email templates
 */

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bold,
  Italic,
  Underline,
  Link,
  AlignLeft,
  AlignCenter,
  Eye,
  Save,
  Send,
  Variable,
  Palette,
  Layout,
  Type,
  FileText,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  preheader?: string;
  body: string;
  category: string;
  variables: string[];
}

const DEFAULT_TEMPLATE: EmailTemplate = {
  name: '',
  subject: '',
  preheader: '',
  body: '',
  category: 'general',
  variables: [],
};

const VARIABLE_OPTIONS = [
  { key: '{{first_name}}', label: 'First Name' },
  { key: '{{last_name}}', label: 'Last Name' },
  { key: '{{full_name}}', label: 'Full Name' },
  { key: '{{email}}', label: 'Email' },
  { key: '{{company}}', label: 'Company' },
  { key: '{{phone}}', label: 'Phone' },
  { key: '{{appointment_date}}', label: 'Appointment Date' },
  { key: '{{appointment_time}}', label: 'Appointment Time' },
  { key: '{{business_name}}', label: 'Business Name' },
  { key: '{{unsubscribe_link}}', label: 'Unsubscribe Link' },
];

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'welcome', label: 'Welcome' },
  { value: 'follow-up', label: 'Follow Up' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'promotional', label: 'Promotional' },
];

interface EmailTemplateBuilderProps {
  initialTemplate?: Partial<EmailTemplate>;
  onSave?: (template: EmailTemplate) => void;
  onSendTest?: (template: EmailTemplate, email: string) => void;
  className?: string;
}

export function EmailTemplateBuilder({
  initialTemplate,
  onSave,
  onSendTest,
  className,
}: EmailTemplateBuilderProps) {
  const [template, setTemplate] = useState<EmailTemplate>({
    ...DEFAULT_TEMPLATE,
    ...initialTemplate,
  });
  const [activeTab, setActiveTab] = useState('editor');
  const [testEmail, setTestEmail] = useState('');

  const updateTemplate = useCallback(<K extends keyof EmailTemplate>(
    key: K,
    value: EmailTemplate[K]
  ) => {
    setTemplate(prev => ({ ...prev, [key]: value }));
  }, []);

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = template.body.slice(0, start) + variable + template.body.slice(end);
      updateTemplate('body', newBody);
      
      // Track used variables
      if (!template.variables.includes(variable)) {
        updateTemplate('variables', [...template.variables, variable]);
      }
    }
  };

  const handleSave = () => {
    if (!template.name || !template.subject || !template.body) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave?.(template);
    toast.success('Template saved');
  };

  const handleSendTest = () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }
    onSendTest?.(template, testEmail);
    toast.success(`Test email sent to ${testEmail}`);
  };

  // Parse body for preview with sample data
  const parsePreview = (text: string) => {
    const sampleData: Record<string, string> = {
      '{{first_name}}': 'John',
      '{{last_name}}': 'Doe',
      '{{full_name}}': 'John Doe',
      '{{email}}': 'john@example.com',
      '{{company}}': 'Acme Inc',
      '{{phone}}': '(555) 123-4567',
      '{{appointment_date}}': 'January 15, 2026',
      '{{appointment_time}}': '2:00 PM',
      '{{business_name}}': 'Your Business',
      '{{unsubscribe_link}}': '#',
    };

    return text.replace(/\{\{[^}]+\}\}/g, (match) => sampleData[match] || match);
  };

  return (
    <div className={cn("grid lg:grid-cols-2 gap-6", className)}>
      {/* Editor Panel */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl gradient-brand">
              <FileText className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Email Template</h2>
              <p className="text-sm text-muted-foreground">Create and customize your email</p>
            </div>
          </div>
          <Button onClick={handleSave} variant="default" className="gap-2">
            <Save className="size-4" />
            Save
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="editor" className="gap-1">
              <Type className="size-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="design" className="gap-1">
              <Palette className="size-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1">
              <Layout className="size-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="editor" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Template Name *</Label>
              <Input
                value={template.name}
                onChange={(e) => updateTemplate('name', e.target.value)}
                placeholder="e.g., Welcome Email"
              />
            </div>

            <div className="space-y-2">
              <Label>Subject Line *</Label>
              <Input
                value={template.subject}
                onChange={(e) => updateTemplate('subject', e.target.value)}
                placeholder="e.g., Welcome to {{business_name}}!"
              />
            </div>

            <div className="space-y-2">
              <Label>Preheader (optional)</Label>
              <Input
                value={template.preheader || ''}
                onChange={(e) => updateTemplate('preheader', e.target.value)}
                placeholder="Preview text shown in inbox"
              />
              <p className="text-xs text-muted-foreground">
                This text appears after the subject in email clients
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Email Body *</Label>
                <div className="flex items-center gap-1">
                  {/* Formatting toolbar */}
                  <Button variant="ghost" size="icon" className="size-8">
                    <Bold className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8">
                    <Italic className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8">
                    <Underline className="size-4" />
                  </Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button variant="ghost" size="icon" className="size-8">
                    <AlignLeft className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8">
                    <AlignCenter className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8">
                    <Link className="size-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                id="email-body"
                value={template.body}
                onChange={(e) => updateTemplate('body', e.target.value)}
                placeholder="Write your email content here..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {/* Variables */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Variable className="size-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Insert Variables</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {VARIABLE_OPTIONS.map((variable) => (
                  <Button
                    key={variable.key}
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(variable.key)}
                    className="text-xs h-7 bg-white"
                  >
                    {variable.label}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Design Tab */}
          <TabsContent value="design" className="space-y-4 mt-6">
            <div className="p-6 rounded-lg bg-muted/30 text-center">
              <Sparkles className="size-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground font-medium">Visual Email Designer</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Drag-and-drop email builder coming soon
              </p>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={template.category}
                onValueChange={(v) => updateTemplate('category', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Send Test */}
            <div className="pt-4 border-t">
              <Label className="mb-2 block">Send Test Email</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
                <Button variant="outline" onClick={handleSendTest} className="gap-2">
                  <Send className="size-4" />
                  Send Test
                </Button>
              </div>
            </div>

            {/* Used Variables */}
            {template.variables.length > 0 && (
              <div className="pt-4 border-t">
                <Label className="mb-2 block">Variables Used</Label>
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((v) => (
                    <Badge key={v} variant="secondary" className="font-mono text-xs">
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Preview Panel */}
      <Card className="p-6 bg-muted/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Eye className="size-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Preview</h3>
          </div>
          <Badge variant="outline">Sample Data</Badge>
        </div>

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          {/* Email Header */}
          <div className="p-4 border-b bg-muted/20">
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="text-muted-foreground w-16">From:</span>
                <span className="text-foreground">Your Business &lt;hello@business.com&gt;</span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground w-16">To:</span>
                <span className="text-foreground">John Doe &lt;john@example.com&gt;</span>
              </div>
              <div className="flex">
                <span className="text-muted-foreground w-16">Subject:</span>
                <span className="text-foreground font-medium">
                  {parsePreview(template.subject) || 'Your subject line'}
                </span>
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className="p-6">
            {template.body ? (
              <div 
                className="prose prose-sm max-w-none"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {parsePreview(template.body)}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground/60">
                <FileText className="size-12 mx-auto mb-4" />
                <p>Your email content will appear here</p>
              </div>
            )}
          </div>

          {/* Email Footer */}
          <div className="p-4 border-t bg-muted/20 text-center text-xs text-muted-foreground">
            <p>Your Business • 123 Main St, City, ST 12345</p>
            <p className="mt-1">
              <a href="#" className="text-primary hover:underline">Unsubscribe</a>
              {' • '}
              <a href="#" className="text-primary hover:underline">View in browser</a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
