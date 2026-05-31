"use client";

/**
 * FormModal - Modal for forms and CRUD operations
 * 
 * Features:
 * - Form validation integration
 * - Loading states
 * - Dirty state tracking (warn before close)
 * - Keyboard shortcuts (Cmd+Enter to submit)
 * - Responsive sizing
 */

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalLoadingOverlay,
  type ModalSize,
} from "./modal-system";
import { DiscardChangesModal } from "./confirm-modal";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Size of the modal */
  size?: ModalSize;
  /** Submit button label */
  submitLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Called when form is submitted */
  onSubmit?: () => void | Promise<void>;
  /** Called when modal is cancelled */
  onCancel?: () => void;
  /** Whether the form is currently submitting */
  loading?: boolean;
  /** Whether the form has unsaved changes */
  isDirty?: boolean;
  /** Whether to show the discard changes confirmation */
  confirmDiscard?: boolean;
  /** Whether the submit button is disabled */
  submitDisabled?: boolean;
  /** Custom footer content (replaces default buttons) */
  footer?: React.ReactNode;
  /** Whether to show the footer */
  showFooter?: boolean;
  /** Loading message for AI operations */
  loadingMessage?: string;
  /** Loading progress (0-100) for AI operations */
  loadingProgress?: number;
}

// ============================================================================
// FORM MODAL COMPONENT
// ============================================================================

export function FormModal({
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
  isDirty = false,
  confirmDiscard = true,
  submitDisabled = false,
  footer,
  showFooter = true,
  loadingMessage,
  loadingProgress,
}: FormModalProps) {
  const [showDiscardConfirm, setShowDiscardConfirm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const showLoading = loading || isSubmitting;

  const handleSubmit = React.useCallback(async () => {
    if (showLoading || submitDisabled) return;
    setIsSubmitting(true);
    try {
      await onSubmit?.();
    } finally {
      setIsSubmitting(false);
    }
  }, [showLoading, submitDisabled, onSubmit]);

  const handleClose = (newOpen: boolean) => {
    if (newOpen) {
      onOpenChange(true);
      return;
    }

    // If dirty and confirmDiscard is enabled, show confirmation
    if (isDirty && confirmDiscard && !showLoading) {
      setShowDiscardConfirm(true);
      return;
    }

    onCancel?.();
    onOpenChange(false);
  };

  const handleDiscardConfirm = () => {
    setShowDiscardConfirm(false);
    onCancel?.();
    onOpenChange(false);
  };

  // Handle Cmd+Enter to submit
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !showLoading && !submitDisabled) {
        e.preventDefault();
        handleSubmit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, showLoading, submitDisabled, handleSubmit]);

  return (
    <>
      <Modal open={open} onOpenChange={handleClose}>
        <ModalContent
          size={size}
          onPointerDownOutside={showLoading ? (e) => e.preventDefault() : undefined}
          onEscapeKeyDown={showLoading ? (e) => e.preventDefault() : undefined}
        >
          <div className="relative">
            <ModalLoadingOverlay
              visible={showLoading && !!loadingMessage}
              message={loadingMessage}
              progress={loadingProgress}
            />

            <ModalHeader>
              <ModalTitle>{title}</ModalTitle>
              {description && <ModalDescription>{description}</ModalDescription>}
            </ModalHeader>

            <ModalBody className="max-h-[60vh]">{children}</ModalBody>

            {showFooter && (
              <ModalFooter>
                {footer || (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleClose(false)}
                      disabled={showLoading}
                    >
                      {cancelLabel}
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={showLoading || submitDisabled}
                    >
                      {showLoading && !loadingMessage && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {submitLabel}
                    </Button>
                  </>
                )}
              </ModalFooter>
            )}
          </div>
        </ModalContent>
      </Modal>

      <DiscardChangesModal
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        onConfirm={handleDiscardConfirm}
      />
    </>
  );
}

// ============================================================================
// FORM MODAL WITH STEPS (Multi-step wizard)
// ============================================================================

export interface FormModalStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  isValid?: boolean;
}

export interface StepFormModalProps extends Omit<FormModalProps, "children"> {
  steps: FormModalStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  /** Whether to show step indicators */
  showStepIndicator?: boolean;
}

export function StepFormModal({
  steps,
  currentStep,
  onStepChange,
  showStepIndicator = true,
  submitLabel = "Complete",
  ...props
}: StepFormModalProps) {
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      props.onSubmit?.();
    } else {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <FormModal
      {...props}
      title={currentStepData?.title || props.title}
      description={currentStepData?.description || props.description}
      submitLabel={isLastStep ? submitLabel : "Continue"}
      submitDisabled={currentStepData?.isValid === false}
      footer={
        <div className="flex w-full items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={isFirstStep || props.loading}
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => props.onOpenChange(false)}
              disabled={props.loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={props.loading || currentStepData?.isValid === false}
            >
              {props.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLastStep ? submitLabel : "Continue"}
            </Button>
          </div>
        </div>
      }
    >
      {showStepIndicator && (
        <div className="flex items-center gap-2 mb-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  index === currentStep
                    ? "bg-primary text-primary-foreground"
                    : index < currentStep
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-colors",
                    index < currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      {currentStepData?.content}
    </FormModal>
  );
}

