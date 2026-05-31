'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { FormError } from './FormError';
import { cn } from '@/lib/utils';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, required, helperText, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-gray-900 mb-2">
            {label}{required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-12 px-4 border-2 rounded-xl text-gray-900 transition-all',
              'focus:outline-none focus:ring-2 focus:border-transparent',
              'disabled:opacity-50 disabled:bg-gray-50 placeholder:text-gray-400',
              icon ? 'pl-12' : 'pl-4',
              error ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:ring-[#6B2D9E]',
              className
            )}
            aria-invalid={!!error}
            {...props}
          />
        </div>
        {helperText && !error && <p className="text-xs text-gray-500 mt-1.5">{helperText}</p>}
        <FormError message={error} />
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
