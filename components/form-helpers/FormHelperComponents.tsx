'use client';

/**
 * Form Validation & Helper Components
 * Form field wrappers, validation indicators, character counters
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Info,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Form Field Wrapper
interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground/80">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      {children}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="size-4" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Info className="size-4" />
          {hint}
        </p>
      )}
    </div>
  );
}

// Input with Validation State
interface ValidatedInputProps {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  isValid?: boolean;
  isInvalid?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ValidatedInput({
  value,
  onChange,
  type = 'text',
  placeholder,
  isValid,
  isInvalid,
  disabled,
  className,
}: ValidatedInputProps) {
  return (
    <div className="relative">
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "pr-10",
          isValid && "border-green-500 focus-visible:ring-green-500",
          isInvalid && "border-red-500 focus-visible:ring-red-500",
          className
        )}
      />
      {isValid && (
        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-green-500" />
      )}
      {isInvalid && (
        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-red-500" />
      )}
    </div>
  );
}

// Password Input with Toggle
interface PasswordInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showStrengthMeter?: boolean;
  className?: string;
}

export function PasswordInputField({
  value,
  onChange,
  placeholder = 'Enter password',
  showStrengthMeter = false,
  className,
}: PasswordInputFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {showStrengthMeter && <PasswordStrengthMeter password={value} />}
    </div>
  );
}

// Password Strength Meter
interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-amber-500' };
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-green-500' };
  return { score: 5, label: 'Very Strong', color: 'bg-green-600' };
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const strength = getPasswordStrength(password);
  const percentage = (strength.score / 5) * 100;

  if (!password) return null;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", strength.color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={cn(
          strength.score <= 2 ? 'text-red-600' : strength.score <= 3 ? 'text-amber-600' : 'text-green-600'
        )}>
          {strength.label}
        </span>
        <span className="text-muted-foreground/60">{password.length} characters</span>
      </div>
    </div>
  );
}

// Character Counter
interface CharacterCounterProps {
  current: number;
  max: number;
  showWarning?: boolean;
  warningThreshold?: number;
  className?: string;
}

export function CharacterCounter({
  current,
  max,
  showWarning = true,
  warningThreshold = 0.9,
  className,
}: CharacterCounterProps) {
  const percentage = current / max;
  const isWarning = showWarning && percentage >= warningThreshold;
  const isOver = current > max;

  return (
    <span className={cn(
      "text-xs",
      isOver ? "text-red-600 font-medium" : isWarning ? "text-amber-600" : "text-muted-foreground/60",
      className
    )}>
      {current}/{max}
    </span>
  );
}

// Textarea with Character Counter
interface TextareaWithCounterProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function TextareaWithCounter({
  value,
  onChange,
  maxLength,
  placeholder,
  rows = 4,
  className,
}: TextareaWithCounterProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
      />
      <div className="flex justify-end">
        <CharacterCounter current={value.length} max={maxLength} />
      </div>
    </div>
  );
}

// Form Section Header
interface FormSectionProps {
  title: string;
  description?: string;
  className?: string;
}

export function FormSection({ title, description, className }: FormSectionProps) {
  return (
    <div className={cn("pb-4 border-b mb-6", className)}>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}

// Required Fields Notice
export function RequiredFieldsNotice({ className }: { className?: string }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      <span className="text-red-500">*</span> indicates required fields
    </p>
  );
}

// Form Actions Footer
interface FormActionsProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormActions({
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  disabled = false,
  className,
}: FormActionsProps) {
  return (
    <div className={cn("flex items-center justify-end gap-3 pt-4 border-t", className)}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground"
        >
          {cancelLabel}
        </button>
      )}
      <button
        type="submit"
        onClick={onSubmit}
        disabled={disabled || isSubmitting}
        className={cn(
          "px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed",
          isSubmitting && "cursor-wait"
        )}
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </div>
  );
}

// Inline Validation Message
interface ValidationMessageProps {
  type: 'error' | 'warning' | 'success' | 'info';
  message: string;
  className?: string;
}

export function ValidationMessage({ type, message, className }: ValidationMessageProps) {
  const config = {
    error: { icon: <AlertCircle className="size-4" />, color: 'text-red-600' },
    warning: { icon: <AlertCircle className="size-4" />, color: 'text-amber-600' },
    success: { icon: <CheckCircle className="size-4" />, color: 'text-green-600' },
    info: { icon: <Info className="size-4" />, color: 'text-info' },
  };

  const { icon, color } = config[type];

  return (
    <p className={cn("text-sm flex items-center gap-1", color, className)}>
      {icon}
      {message}
    </p>
  );
}

// Field Hint with Tooltip
interface FieldHintProps {
  hint: string;
  className?: string;
}

export function FieldHint({ hint, className }: FieldHintProps) {
  return (
    <button
      type="button"
      className={cn("text-muted-foreground/60 hover:text-muted-foreground", className)}
      title={hint}
    >
      <HelpCircle className="size-4" />
    </button>
  );
}

// Phone Number Input
interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode?: string;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  countryCode = '+1',
  placeholder = '(555) 000-0000',
  className,
}: PhoneInputProps) {
  const formatPhone = (input: string) => {
    const cleaned = input.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const parts = [match[1], match[2], match[3]].filter(Boolean);
      if (parts.length === 0) return '';
      if (parts.length === 1) return `(${parts[0]}`;
      if (parts.length === 2) return `(${parts[0]}) ${parts[1]}`;
      return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
    }
    return input;
  };

  return (
    <div className={cn("flex", className)}>
      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 bg-muted/20 text-muted-foreground text-sm">
        {countryCode}
      </span>
      <Input
        type="tel"
        value={value}
        onChange={(e) => onChange(formatPhone(e.target.value))}
        placeholder={placeholder}
        className="rounded-l-none"
      />
    </div>
  );
}

// Email Input with Validation
interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  validateOnBlur?: boolean;
  className?: string;
}

export function EmailInput({
  value,
  onChange,
  placeholder = 'email@example.com',
  className,
}: EmailInputProps) {
  const [touched] = useState(false);
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const showValidation = touched && value.length > 0;

  return (
    <ValidatedInput
      type="email"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isValid={showValidation && isValidEmail}
      isInvalid={showValidation && !isValidEmail}
      className={className}
    />
  );
}

// URL Input
interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  protocol?: string;
  className?: string;
}

export function UrlInput({
  value,
  onChange,
  placeholder = 'www.example.com',
  protocol = 'https://',
  className,
}: UrlInputProps) {
  return (
    <div className={cn("flex", className)}>
      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 bg-muted/20 text-muted-foreground text-sm">
        {protocol}
      </span>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-l-none"
      />
    </div>
  );
}
