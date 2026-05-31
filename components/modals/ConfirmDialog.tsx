'use client';

/**
 * Confirmation Dialog Components
 * Reusable confirmation and alert dialogs
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Trash2,
  LogOut,
  XCircle,
  CheckCircle,
  Info,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: ConfirmVariant;
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_CONFIG: Record<ConfirmVariant, { icon: React.ReactNode; color: string; buttonClass: string }> = {
  danger: {
    icon: <AlertTriangle className="size-6" />,
    color: 'bg-error/10 text-error border-error/20',
    buttonClass: 'bg-error hover:bg-error/90 text-white',
  },
  warning: {
    icon: <AlertTriangle className="size-6" />,
    color: 'bg-warning/10 text-warning border-warning/20',
    buttonClass: 'bg-warning hover:bg-warning/90 text-white',
  },
  info: {
    icon: <Info className="size-6" />,
    color: 'bg-info/10 text-info border-info/20',
    buttonClass: 'bg-info hover:bg-info/90 text-white',
  },
  success: {
    icon: <CheckCircle className="size-6" />,
    color: 'bg-success/10 text-success border-success/20',
    buttonClass: 'bg-success hover:bg-success/90 text-white',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
  loading = false,
  icon,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const config = VARIANT_CONFIG[variant];

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const showLoading = loading || isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn("flex size-12 items-center justify-center rounded-full", config.color)}>
              {icon || config.icon}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg">{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-2">{description}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={showLoading}>
            {cancelLabel}
          </Button>
          <Button onClick={handleConfirm} disabled={showLoading} className={config.buttonClass}>
            {showLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Pre-built confirmation dialogs
interface DeleteConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName?: string;
  onConfirm: () => void | Promise<void>;
}

export function DeleteConfirm({ open, onOpenChange, itemName = 'this item', onConfirm }: DeleteConfirmProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Confirmation"
      description={`Are you sure you want to delete ${itemName}? This action cannot be undone.`}
      confirmLabel="Delete"
      onConfirm={onConfirm}
      variant="danger"
      icon={<Trash2 className="size-6" />}
    />
  );
}

export function LogoutConfirm({ open, onOpenChange, onConfirm }: Omit<DeleteConfirmProps, 'itemName'>) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sign Out"
      description="Are you sure you want to sign out of your account?"
      confirmLabel="Sign Out"
      onConfirm={onConfirm}
      variant="warning"
      icon={<LogOut className="size-6" />}
    />
  );
}

export function DiscardChangesConfirm({ open, onOpenChange, onConfirm }: Omit<DeleteConfirmProps, 'itemName'>) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Discard Changes"
      description="You have unsaved changes. Are you sure you want to discard them?"
      confirmLabel="Discard"
      onConfirm={onConfirm}
      variant="warning"
      icon={<XCircle className="size-6" />}
    />
  );
}

// Alert Dialog (information only)
interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  variant?: ConfirmVariant;
  actionLabel?: string;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = 'info',
  actionLabel = 'OK',
}: AlertDialogProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn("flex size-12 items-center justify-center rounded-full", config.color)}>
              {config.icon}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg">{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-2">{description}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button onClick={() => onOpenChange(false)} className={config.buttonClass}>
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for confirmation dialogs
export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description?: string;
    variant: ConfirmVariant;
    onConfirm: () => void | Promise<void>;
  }>({
    open: false,
    title: '',
    variant: 'danger',
    onConfirm: () => {},
  });

  const confirm = (options: {
    title: string;
    description?: string;
    variant?: ConfirmVariant;
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: options.title,
        description: options.description,
        variant: options.variant || 'danger',
        onConfirm: () => resolve(true),
      });
    });
  };

  const dialog = (
    <ConfirmDialog
      open={state.open}
      onOpenChange={(open) => setState(prev => ({ ...prev, open }))}
      title={state.title}
      description={state.description}
      variant={state.variant}
      onConfirm={state.onConfirm}
      onCancel={() => setState(prev => ({ ...prev, open: false }))}
    />
  );

  return { confirm, dialog };
}
