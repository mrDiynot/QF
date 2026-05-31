'use client';

/**
 * Form Templates Gallery Component
 * Pre-built form templates users can start from
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Users,
  Calendar,
  Star,
  Mail,
  Briefcase,
  HeartHandshake,
  Megaphone,
  ClipboardList,
  Search,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  fieldCount: number;
  popular?: boolean;
  fields: Array<{
    type: string;
    label: string;
    required: boolean;
  }>;
}

const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'contact',
    name: 'Contact Form',
    description: 'Simple contact form with name, email, and message',
    category: 'General',
    icon: <Mail className="size-5" />,
    fieldCount: 4,
    popular: true,
    fields: [
      { type: 'text', label: 'Full Name', required: true },
      { type: 'email', label: 'Email Address', required: true },
      { type: 'phone', label: 'Phone Number', required: false },
      { type: 'textarea', label: 'Message', required: true },
    ],
  },
  {
    id: 'lead-capture',
    name: 'Lead Capture',
    description: 'Capture leads with company and interest info',
    category: 'Sales',
    icon: <Users className="size-5" />,
    fieldCount: 6,
    popular: true,
    fields: [
      { type: 'text', label: 'First Name', required: true },
      { type: 'text', label: 'Last Name', required: true },
      { type: 'email', label: 'Work Email', required: true },
      { type: 'text', label: 'Company Name', required: true },
      { type: 'select', label: 'Company Size', required: true },
      { type: 'select', label: 'Interest', required: true },
    ],
  },
  {
    id: 'appointment',
    name: 'Appointment Request',
    description: 'Let customers request appointments',
    category: 'Scheduling',
    icon: <Calendar className="size-5" />,
    fieldCount: 7,
    popular: true,
    fields: [
      { type: 'text', label: 'Full Name', required: true },
      { type: 'email', label: 'Email', required: true },
      { type: 'phone', label: 'Phone', required: true },
      { type: 'select', label: 'Service Type', required: true },
      { type: 'date', label: 'Preferred Date', required: true },
      { type: 'select', label: 'Preferred Time', required: true },
      { type: 'textarea', label: 'Additional Notes', required: false },
    ],
  },
  {
    id: 'feedback',
    name: 'Customer Feedback',
    description: 'Collect feedback and ratings from customers',
    category: 'Feedback',
    icon: <Star className="size-5" />,
    fieldCount: 5,
    fields: [
      { type: 'text', label: 'Name', required: false },
      { type: 'email', label: 'Email', required: false },
      { type: 'rating', label: 'Overall Rating', required: true },
      { type: 'checkbox', label: 'What did you like?', required: false },
      { type: 'textarea', label: 'Additional Comments', required: false },
    ],
  },
  {
    id: 'quote-request',
    name: 'Quote Request',
    description: 'Collect information for service quotes',
    category: 'Sales',
    icon: <Briefcase className="size-5" />,
    fieldCount: 8,
    fields: [
      { type: 'text', label: 'Full Name', required: true },
      { type: 'email', label: 'Email', required: true },
      { type: 'phone', label: 'Phone', required: true },
      { type: 'text', label: 'Company', required: false },
      { type: 'select', label: 'Service Needed', required: true },
      { type: 'textarea', label: 'Project Description', required: true },
      { type: 'select', label: 'Budget Range', required: true },
      { type: 'select', label: 'Timeline', required: true },
    ],
  },
  {
    id: 'event-registration',
    name: 'Event Registration',
    description: 'Register attendees for events or webinars',
    category: 'Events',
    icon: <Megaphone className="size-5" />,
    fieldCount: 6,
    fields: [
      { type: 'text', label: 'Full Name', required: true },
      { type: 'email', label: 'Email', required: true },
      { type: 'text', label: 'Company', required: false },
      { type: 'text', label: 'Job Title', required: false },
      { type: 'select', label: 'How did you hear about us?', required: false },
      { type: 'checkbox', label: 'Dietary Restrictions', required: false },
    ],
  },
  {
    id: 'support-ticket',
    name: 'Support Ticket',
    description: 'Customer support request form',
    category: 'Support',
    icon: <HeartHandshake className="size-5" />,
    fieldCount: 6,
    fields: [
      { type: 'text', label: 'Name', required: true },
      { type: 'email', label: 'Email', required: true },
      { type: 'select', label: 'Issue Type', required: true },
      { type: 'select', label: 'Priority', required: true },
      { type: 'textarea', label: 'Describe your issue', required: true },
      { type: 'file', label: 'Attachments', required: false },
    ],
  },
  {
    id: 'job-application',
    name: 'Job Application',
    description: 'Collect job applications and resumes',
    category: 'HR',
    icon: <ClipboardList className="size-5" />,
    fieldCount: 8,
    fields: [
      { type: 'text', label: 'Full Name', required: true },
      { type: 'email', label: 'Email', required: true },
      { type: 'phone', label: 'Phone', required: true },
      { type: 'select', label: 'Position Applied For', required: true },
      { type: 'url', label: 'LinkedIn Profile', required: false },
      { type: 'file', label: 'Resume/CV', required: true },
      { type: 'textarea', label: 'Cover Letter', required: false },
      { type: 'select', label: 'How did you find this job?', required: false },
    ],
  },
];

const CATEGORIES = ['All', 'General', 'Sales', 'Scheduling', 'Feedback', 'Events', 'Support', 'HR'];

interface FormTemplatesProps {
  onSelect?: (template: FormTemplate) => void;
  className?: string;
}

export function FormTemplates({ onSelect, className }: FormTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const filteredTemplates = FORM_TEMPLATES.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (template: FormTemplate) => {
    setSelectedTemplate(template.id);
    onSelect?.(template);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Form Templates</h2>
          <p className="text-sm text-muted-foreground">Start with a pre-built template or create from scratch</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Blank Template */}
        <Card
          className={cn(
            "p-5 cursor-pointer transition-all hover:shadow-md border-2 border-dashed",
            selectedTemplate === 'blank' 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-purple-300"
          )}
          onClick={() => handleSelect({ 
            id: 'blank', 
            name: 'Blank Form', 
            description: 'Start from scratch',
            category: 'General',
            icon: <FileText className="size-5" />,
            fieldCount: 0,
            fields: []
          })}
        >
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted/40 text-muted-foreground mb-3">
              <FileText className="size-6" />
            </div>
            <h3 className="font-medium text-foreground">Blank Form</h3>
            <p className="text-xs text-muted-foreground mt-1">Start from scratch</p>
          </div>
        </Card>

        {/* Template Cards */}
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "p-5 cursor-pointer transition-all hover:shadow-md",
              selectedTemplate === template.id 
                ? "ring-2 ring-purple-500 bg-primary/5" 
                : "hover:border-purple-300"
            )}
            onClick={() => handleSelect(template)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 text-primary">
                {template.icon}
              </div>
              {template.popular && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px]">
                  <Sparkles className="size-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>

            <h3 className="font-medium text-foreground mb-1">{template.name}</h3>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description}</p>

            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-[10px]">
                {template.fieldCount} fields
              </Badge>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                {template.category}
              </Badge>
            </div>

            {selectedTemplate === template.id && (
              <div className="mt-3 pt-3 border-t">
                <Button size="sm" className="w-full gap-2">
                  Use Template
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Search className="size-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No templates found matching your search</p>
        </div>
      )}
    </div>
  );
}

// Template preview component
export function TemplatePreview({ template }: { template: FormTemplate }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {template.icon}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{template.name}</h3>
          <p className="text-xs text-muted-foreground">{template.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground/80">Fields included:</p>
        <ul className="space-y-1">
          {template.fields.map((field, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="size-3 text-green-500" />
              {field.label}
              {field.required && <span className="text-red-500 text-xs">*</span>}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
