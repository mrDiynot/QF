"use client";

/**
 * AdminModal - Reusable modal component for the admin portal
 * 
 * Uses admin theme CSS variables for proper styling in dark/light themes.
 * Adaptive to content size with proper scrolling behavior.
 * Adapts to theme changes via AdminThemeContext.
 */

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAdminTheme } from "@/contexts/AdminThemeContext";

// ============================================================================
// SIZE VARIANTS
// ============================================================================

const adminModalSizeVariants = cva("", {
  variants: {
    size: {
      xs: "max-w-[320px]",
      sm: "max-w-[400px]",
      md: "max-w-[500px]",
      lg: "max-w-[640px]",
      xl: "max-w-[800px]",
      "2xl": "max-w-[1024px]",
      full: "max-w-[calc(100vw-2rem)]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type AdminModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

// ============================================================================
// ADMIN MODAL OVERLAY
// ============================================================================

const AdminModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "duration-200",
      className
    )}
    {...props}
  />
));
AdminModalOverlay.displayName = "AdminModalOverlay";

// ============================================================================
// ADMIN MODAL CONTENT
// ============================================================================

interface AdminModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof adminModalSizeVariants> {
  showClose?: boolean;
}

// Inner component that uses the theme hook
const AdminModalContentInner = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  AdminModalContentProps & { theme: 'dark' | 'light' }
>(({ className, children, size, showClose = true, theme, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <AdminModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      data-admin-theme={theme}
      className={cn(
        // Base positioning - centered
        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
        "w-[calc(100%-2rem)]",
        // Admin theme styling - solid background using theme variables
        "rounded-lg border border-admin-border shadow-2xl",
        "bg-admin-card",
        // Layout
        "flex flex-col max-h-[85vh]",
        // Animation
        "duration-200 ease-out",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        // Focus
        "focus:outline-none",
        // Size
        adminModalSizeVariants({ size }),
        className
      )}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close
          className={cn(
            "absolute right-4 top-4 rounded-md p-1.5 z-10",
            "text-admin-muted-foreground hover:text-admin-foreground",
            "hover:bg-admin-muted transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[#FF6900] focus:ring-offset-2 focus:ring-offset-admin-card"
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
AdminModalContentInner.displayName = "AdminModalContentInner";

// Wrapper component that gets theme from context
const AdminModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  AdminModalContentProps
>((props, ref) => {
  // Try to get theme from context, default to 'dark' if not available
  let theme: 'dark' | 'light' = 'dark';
  try {
    const themeContext = useAdminTheme();
    theme = themeContext.resolvedTheme;
  } catch {
    // Context not available, use default
  }
  return <AdminModalContentInner ref={ref} theme={theme} {...props} />;
});
AdminModalContent.displayName = "AdminModalContent";

// ============================================================================
// ADMIN MODAL HEADER
// ============================================================================

const AdminModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-6 pt-6 pb-4 flex-shrink-0",
      "border-b border-admin-border bg-admin-muted/30",
      className
    )}
    {...props}
  />
));
AdminModalHeader.displayName = "AdminModalHeader";

// ============================================================================
// ADMIN MODAL BODY
// ============================================================================

const AdminModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 py-5 flex-1 overflow-y-auto min-h-0", className)}
    {...props}
  />
));
AdminModalBody.displayName = "AdminModalBody";

// ============================================================================
// ADMIN MODAL FOOTER
// ============================================================================

const AdminModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-6 py-4 flex-shrink-0",
      "border-t border-admin-border bg-admin-muted/40",
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
));
AdminModalFooter.displayName = "AdminModalFooter";

// ============================================================================
// ADMIN MODAL TITLE
// ============================================================================

const AdminModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-admin-foreground", className)}
    {...props}
  />
));
AdminModalTitle.displayName = "AdminModalTitle";

// ============================================================================
// ADMIN MODAL DESCRIPTION
// ============================================================================

const AdminModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-admin-muted-foreground mt-1.5", className)}
    {...props}
  />
));
AdminModalDescription.displayName = "AdminModalDescription";

// ============================================================================
// ADMIN FORM MODAL - Higher-level component for forms
// ============================================================================

export interface AdminFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: AdminModalSize;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit?: () => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  submitDisabled?: boolean;
}

export function AdminFormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onSubmit,
  onCancel,
  loading = false,
  submitDisabled = false,
}: AdminFormModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const showLoading = loading || isSubmitting;

  const handleSubmit = async () => {
    if (showLoading || submitDisabled) return;
    setIsSubmitting(true);
    try {
      await onSubmit?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      onCancel?.();
    }
    onOpenChange(newOpen);
  };

  return (
    <AdminModal open={open} onOpenChange={handleClose}>
      <AdminModalContent size={size}>
        <AdminModalHeader>
          <AdminModalTitle>{title}</AdminModalTitle>
          {description && <AdminModalDescription>{description}</AdminModalDescription>}
        </AdminModalHeader>

        <AdminModalBody>{children}</AdminModalBody>

        <AdminModalFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={showLoading}
            className="border-admin-border text-admin-foreground hover:bg-admin-muted"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={showLoading || submitDisabled}
            className="bg-[#FF6900] hover:bg-orange-600 text-white"
          >
            {showLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </AdminModalFooter>
      </AdminModalContent>
    </AdminModal>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export const AdminModal = DialogPrimitive.Root;
export const AdminModalTrigger = DialogPrimitive.Trigger;
export const AdminModalClose = DialogPrimitive.Close;

export {
  AdminModalContent,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
  AdminModalTitle,
  AdminModalDescription,
  AdminModalOverlay,
};
