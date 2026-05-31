/**
 * QualiFlow AI Modal System
 *
 * Unified modal components for consistent UX across the platform.
 *
 * NEW SYSTEM (Recommended):
 * - Modal, ModalContent, ModalHeader, etc. - Base modal primitives
 * - Drawer, DrawerContent, etc. - Slide-in panels
 * - ConfirmModal - Confirmation dialogs
 * - FormModal, StepFormModal - Form dialogs
 *
 * LEGACY (Deprecated - use new system):
 * - ConfirmDialog → use ConfirmModal
 * - SlideoutPanel → use Drawer
 */

// ============================================================================
// NEW UNIFIED MODAL SYSTEM
// ============================================================================

// Base Modal System
export {
  Modal,
  ModalTrigger,
  ModalClose,
  ModalPortal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalOverlay,
  ModalProvider,
  // Drawer
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  // Utilities
  ModalLoadingOverlay,
} from './modal-system';

export type { ModalSize, DrawerSide, DrawerSize } from './modal-system';

// Confirm Modal
export {
  ConfirmModal,
  DeleteConfirmModal,
  LogoutConfirmModal,
  DiscardChangesModal,
  AlertModal,
  useConfirmModal,
} from './confirm-modal';

export type { ConfirmModalProps, AlertModalProps, ConfirmVariant } from './confirm-modal';

// Form Modal
export {
  FormModal,
  StepFormModal,
} from './form-modal';

export type { FormModalProps, FormModalStep, StepFormModalProps } from './form-modal';

// ============================================================================
// LEGACY EXPORTS (Deprecated - for backward compatibility)
// ============================================================================

/** @deprecated Use ConfirmModal instead */
export {
  ConfirmDialog,
  DeleteConfirm,
  LogoutConfirm,
  DiscardChangesConfirm,
  AlertDialog,
  useConfirmDialog,
} from './ConfirmDialog';

/** @deprecated Use Drawer instead */
export {
  SlideoutPanel,
  DetailPanel,
  FormPanel,
  QuickViewPanel,
} from './SlideoutPanel';
