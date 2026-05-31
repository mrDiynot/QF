'use client';

/**
 * Slideout Panel / Drawer Component
 * Side panel for forms, details, and secondary content
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type SlideoutPosition = 'right' | 'left';
type SlideoutSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface SlideoutPanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  position?: SlideoutPosition;
  size?: SlideoutSize;
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  footer?: React.ReactNode;
  className?: string;
}

const SIZE_CLASSES: Record<SlideoutSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
};

export function SlideoutPanel({
  open,
  onClose,
  title,
  description,
  children,
  position = 'right',
  size = 'md',
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  showBackButton = false,
  onBack,
  footer,
  className,
}: SlideoutPanelProps) {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose, closeOnEscape]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      {showOverlay && (
        <div
          className="absolute inset-0 bg-black/50 transition-opacity"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />
      )}

      {/* Panel */}
      <div
        data-state={open ? 'open' : 'closed'}
        className={cn(
          "fixed top-0 h-full bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out",
          SIZE_CLASSES[size],
          position === 'right' ? 'right-0' : 'left-0',
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton || showBackButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <Button variant="ghost" size="icon" className="size-8 -ml-2" onClick={onBack || onClose}>
                  <ArrowLeft className="size-4" />
                </Button>
              )}
              <div>
                {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
              </div>
            </div>
            {showCloseButton && (
              <Button variant="ghost" size="icon" className="size-8" onClick={onClose}>
                <X className="size-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t bg-muted/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Detail Panel variant (for viewing record details)
interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function DetailPanel({ open, onClose, title, subtitle, children, actions }: DetailPanelProps) {
  return (
    <SlideoutPanel
      open={open}
      onClose={onClose}
      size="lg"
      footer={actions && (
        <div className="flex items-center justify-end gap-2">
          {actions}
        </div>
      )}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {children}
      </div>
    </SlideoutPanel>
  );
}

// Form Panel variant (for editing/creating)
interface FormPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export function FormPanel({
  open,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
}: FormPanelProps) {
  return (
    <SlideoutPanel
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button onClick={onSubmit} disabled={loading} variant="default">
            {submitLabel}
          </Button>
        </div>
      }
    >
      {children}
    </SlideoutPanel>
  );
}

// Quick View Panel (compact, for previews)
interface QuickViewPanelProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function QuickViewPanel({ open, onClose, children }: QuickViewPanelProps) {
  return (
    <SlideoutPanel
      open={open}
      onClose={onClose}
      size="sm"
      showOverlay={false}
      className="shadow-2xl border-l"
    >
      {children}
    </SlideoutPanel>
  );
}
