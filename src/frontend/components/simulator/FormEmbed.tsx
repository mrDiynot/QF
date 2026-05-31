'use client';

/**
 * Form Embed Component
 * Embeddable lead capture form for testing
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

interface FormEmbedProps {
  theme: 'light' | 'dark';
  compact?: boolean;
}

export function FormEmbed({ theme, compact = false }: FormEmbedProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className={cn(
        'rounded-xl p-8 text-center',
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'
      )}>
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
        <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>
          We&apos;ve received your message and will get back to you shortly.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setIsSubmitted(false)}
        >
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'rounded-xl p-6',
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'
      )}
    >
      <div className="space-y-4">
        {/* Name Fields */}
        <div className={cn('grid gap-4', compact ? 'grid-cols-1' : 'grid-cols-2')}>
          <div>
            <Label className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-700')}>
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="John"
              required
              className={cn(
                'mt-1.5',
                isDark ? 'bg-slate-900 border-slate-600' : 'bg-white border-slate-300'
              )}
            />
          </div>
          {!compact && (
            <div>
              <Label className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-700')}>
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Doe"
                required
                className={cn(
                  'mt-1.5',
                  isDark ? 'bg-slate-900 border-slate-600' : 'bg-white border-slate-300'
                )}
              />
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <Label className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-700')}>
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            placeholder="john@example.com"
            required
            className={cn(
              'mt-1.5',
              isDark ? 'bg-slate-900 border-slate-600' : 'bg-white border-slate-300'
            )}
          />
        </div>

        {/* Phone */}
        <div>
          <Label className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-700')}>
            Phone Number
          </Label>
          <Input
            type="tel"
            placeholder="+1 (555) 123-4567"
            className={cn(
              'mt-1.5',
              isDark ? 'bg-slate-900 border-slate-600' : 'bg-white border-slate-300'
            )}
          />
        </div>

        {!compact && (
          <>
            {/* Company */}
            <div>
              <Label className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-700')}>
                Company
              </Label>
              <Input
                placeholder="Acme Inc."
                className={cn(
                  'mt-1.5',
                  isDark ? 'bg-slate-900 border-slate-600' : 'bg-white border-slate-300'
                )}
              />
            </div>

            {/* Interest */}
            <div>
              <Label className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-700')}>
                What are you interested in?
              </Label>
              <Select>
                <SelectTrigger className={cn(
                  'mt-1.5',
                  isDark ? 'bg-slate-900 border-slate-600' : 'bg-white border-slate-300'
                )}>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demo">Product Demo</SelectItem>
                  <SelectItem value="pricing">Pricing Information</SelectItem>
                  <SelectItem value="support">Technical Support</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div>
              <Label className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-700')}>
                Message
              </Label>
              <Textarea
                placeholder="Tell us how we can help..."
                rows={3}
                className={cn(
                  'mt-1.5 resize-none',
                  isDark ? 'bg-slate-900 border-slate-600' : 'bg-white border-slate-300'
                )}
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {compact ? 'Get Started' : 'Submit'}
            </>
          )}
        </Button>

        {/* Privacy Notice */}
        <p className={cn(
          'text-[11px] text-center',
          isDark ? 'text-slate-500' : 'text-slate-400'
        )}>
          By submitting, you agree to our{' '}
          <a href="#" className="underline">Privacy Policy</a>
        </p>
      </div>
    </form>
  );
}
