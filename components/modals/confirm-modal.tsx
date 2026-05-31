"use client";

/**
 * ConfirmModal - Unified confirmation dialog
 * 
 * Replaces: ConfirmDialog, DeleteConfirm, LogoutConfirm, DiscardChangesConfirm
 * 
 * Features:
 * - Consistent styling with variant support
 * - Loading state handling
 * - Keyboard shortcuts (Enter to confirm, Escape to cancel)
 * - Accessible with proper ARIA attributes
 */

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "./modal-system";
import {
  AlertTriangle,
  Trash2,
  LogOut,
  XCircle,
  CheckCircle,
  Info,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export type ConfirmVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: ConfirmVariant;
  loading?: boolean;
  icon?: React.ReactNode;
  /** If true, pressing Enter will trigger confirm */
  confirmOnEnter?: boolean;
  /** If true, the modal cannot be closed by clicking outside */
  preventClose?: boolean;
}

// ============================================================================
// VARIANT CONFIGURATION
// ============================================================================

const VARIANT_CONFIG: Record<
  ConfirmVariant,
  {
    icon: React.ReactNode;
    iconBg: string;
    buttonVariant: "destructive" | "default" | "secondary";
    buttonClass?: string;
  }
> = {
  danger: {
    icon: <AlertTriangle className="h-5 w-5" />,
    iconBg: "bg-destructive/10 text-destructive",
    buttonVariant: "destructive",
  },
  warning: {
    icon: <AlertCircle className="h-5 w-5" />,
    iconBg: "bg-warning/10 text-warning",
    buttonVariant: "default",
    buttonClass: "bg-warning hover:bg-warning/90 text-warning-foreground",
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    iconBg: "bg-primary/10 text-primary",
    buttonVariant: "default",
  },
  success: {
    icon: <CheckCircle className="h-5 w-5" />,
    iconBg: "bg-success/10 text-success",
    buttonVariant: "default",
    buttonClass: "bg-success hover:bg-success/90 text-success-foreground",
  },
};

// ============================================================================
// CONFIRM MODAL COMPONENT
// ============================================================================

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
  loading = false,
  icon,
  confirmOnEnter = true,
  preventClose = false,
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const config = VARIANT_CONFIG[variant];
  const showLoading = loading || isLoading;

  const handleConfirm = React.useCallback(async () => {
    if (showLoading) return;
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  }, [showLoading, onConfirm, onOpenChange]);

  const handleCancel = () => {
    if (showLoading) return;
    onCancel?.();
    onOpenChange(false);
  };

  // Handle Enter key for confirmation
  React.useEffect(() => {
    if (!open || !confirmOnEnter) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !showLoading) {
        e.preventDefault();
        handleConfirm();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, confirmOnEnter, showLoading, handleConfirm]);

  return (
    <Modal open={open} onOpenChange={preventClose ? undefined : onOpenChange}>
      <ModalContent
        size="sm"
        showClose={!preventClose}
        onPointerDownOutside={preventClose ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={preventClose ? (e) => e.preventDefault() : undefined}
      >
        <ModalHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                config.iconBg
              )}
            >
              {icon || config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <ModalTitle>{title}</ModalTitle>
              {description && (
                <ModalDescription>
                  {typeof description === "string" ? description : description}
                </ModalDescription>
              )}
            </div>
          </div>
        </ModalHeader>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={showLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={showLoading}
            className={config.buttonClass}
          >
            {showLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ============================================================================
// PRE-BUILT CONFIRMATION MODALS
// ============================================================================

interface PrebuiltConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  itemName = "this item",
  loading,
}: PrebuiltConfirmProps & { itemName?: string }) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Confirmation"
      description={`Are you sure you want to delete ${itemName}? This action cannot be undone.`}
      confirmLabel="Delete"
      onConfirm={onConfirm}
      variant="danger"
      icon={<Trash2 className="h-5 w-5" />}
      loading={loading}
    />
  );
}

export function LogoutConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: PrebuiltConfirmProps) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Sign Out"
      description="Are you sure you want to sign out of your account?"
      confirmLabel="Sign Out"
      onConfirm={onConfirm}
      variant="warning"
      icon={<LogOut className="h-5 w-5" />}
      loading={loading}
    />
  );
}

export function DiscardChangesModal({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: PrebuiltConfirmProps) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Discard Changes"
      description="You have unsaved changes. Are you sure you want to discard them?"
      confirmLabel="Discard"
      onConfirm={onConfirm}
      variant="warning"
      icon={<XCircle className="h-5 w-5" />}
      loading={loading}
    />
  );
}

// ============================================================================
// HOOK FOR IMPERATIVE CONFIRMATION
// ============================================================================

export function useConfirmModal() {
  const [state, setState] = React.useState<{
    open: boolean;
    title: string;
    description?: string;
    variant: ConfirmVariant;
    confirmLabel?: string;
    resolve: (value: boolean) => void;
  }>({
    open: false,
    title: "",
    variant: "danger",
    resolve: () => {},
  });

  const confirm = React.useCallback(
    (options: {
      title: string;
      description?: string;
      variant?: ConfirmVariant;
      confirmLabel?: string;
    }): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          open: true,
          title: options.title,
          description: options.description,
          variant: options.variant || "danger",
          confirmLabel: options.confirmLabel,
          resolve,
        });
      });
    },
    []
  );

  const handleConfirm = React.useCallback(() => {
    state.resolve(true);
    setState((prev) => ({ ...prev, open: false }));
  }, [state]);

  const handleCancel = React.useCallback(() => {
    state.resolve(false);
    setState((prev) => ({ ...prev, open: false }));
  }, [state]);

  const modal = (
    <ConfirmModal
      open={state.open}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
      title={state.title}
      description={state.description}
      variant={state.variant}
      confirmLabel={state.confirmLabel}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, modal };
}

// ============================================================================
// ALERT MODAL (Information only - single button)
// ============================================================================

export interface AlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string | React.ReactNode;
  variant?: ConfirmVariant;
  actionLabel?: string;
  icon?: React.ReactNode;
}

export function AlertModal({
  open,
  onOpenChange,
  title,
  description,
  variant = "info",
  actionLabel = "OK",
  icon,
}: AlertModalProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="sm">
        <ModalHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                config.iconBg
              )}
            >
              {icon || config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <ModalTitle>{title}</ModalTitle>
              {description && (
                <ModalDescription>
                  {typeof description === "string" ? description : description}
                </ModalDescription>
              )}
            </div>
          </div>
        </ModalHeader>

        <ModalFooter>
          <Button
            variant={config.buttonVariant}
            onClick={() => onOpenChange(false)}
            className={config.buttonClass}
          >
            {actionLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

