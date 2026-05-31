'use client';

/**
 * AI Form Preview Component
 * Displays a preview of AI-generated form with BANT field indicators
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Type,
  Mail,
  Phone,
  Hash,
  Calendar,
  AlignLeft,
  List,
  CheckSquare,
  Circle,
  DollarSign,
  Users,
  Target,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GeneratedFormData, GeneratedFormField, BANTCategory } from '@/types/ai-forms';

interface AIFormPreviewProps {
  form: GeneratedFormData;
  className?: string;
}

const FIELD_ICONS: Record<string, React.ReactNode> = {
  text: <Type className="size-4" />,
  email: <Mail className="size-4" />,
  phone: <Phone className="size-4" />,
  number: <Hash className="size-4" />,
  date: <Calendar className="size-4" />,
  textarea: <AlignLeft className="size-4" />,
  select: <List className="size-4" />,
  checkbox: <CheckSquare className="size-4" />,
  radio: <Circle className="size-4" />,
};

const BANT_CONFIG: Record<NonNullable<BANTCategory>, { icon: React.ReactNode; color: string; label: string }> = {
  Budget: { icon: <DollarSign className="size-3" />, color: 'bg-green-100 text-green-700 border-green-200', label: 'Budget' },
  Authority: { icon: <Users className="size-3" />, color: 'bg-muted/50 text-info border-border', label: 'Authority' },
  Need: { icon: <Target className="size-3" />, color: 'bg-primary/10 text-primary border-primary/20', label: 'Need' },
  Timeline: { icon: <Clock className="size-3" />, color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Timeline' },
};

function FieldPreview({ field }: { field: GeneratedFormField }) {
  const bantConfig = field.bantMapping ? BANT_CONFIG[field.bantMapping] : null;

  const renderFieldInput = () => {
    switch (field.type) {
      case 'textarea':
        return <Textarea placeholder={field.placeholder} disabled className="resize-none opacity-60" />;
      case 'select':
        return (
          <Select disabled>
            <SelectTrigger className="opacity-60">
              <SelectValue placeholder={field.placeholder || 'Select...'} />
            </SelectTrigger>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="space-y-2 opacity-60">
            {field.options?.slice(0, 3).map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <Checkbox disabled />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );
      case 'radio':
        return (
          <RadioGroup disabled className="opacity-60">
            {field.options?.slice(0, 3).map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <RadioGroupItem value={option} disabled />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </RadioGroup>
        );
      default:
        return <Input type={field.type} placeholder={field.placeholder} disabled className="opacity-60" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">{FIELD_ICONS[field.type]}</span>
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </Label>
        {bantConfig && (
          <Badge variant="outline" className={cn("gap-1 text-[10px] font-medium", bantConfig.color)}>
            {bantConfig.icon}
            {bantConfig.label}
          </Badge>
        )}
      </div>
      {renderFieldInput()}
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
}

export function AIFormPreview({ form, className }: AIFormPreviewProps) {
  const bantFields = form.fields.filter(f => f.bantMapping);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Form Header */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-primary/20">
        <h3 className="font-semibold text-foreground">{form.name}</h3>
        {form.description && (
          <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
        )}
        {bantFields.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted-foreground">BANT Fields:</span>
            {bantFields.map((f, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">
                {f.bantMapping}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Form Fields Preview */}
      <Card className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
        {form.fields.map((field, index) => (
          <FieldPreview key={index} field={field} />
        ))}
        <Button className="w-full mt-4" disabled>
          {form.submitButtonText || 'Submit'}
        </Button>
      </Card>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{form.fields.length} fields generated</span>
        <span>{bantFields.length} BANT qualification fields</span>
      </div>
    </div>
  );
}

export default AIFormPreview;

