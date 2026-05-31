"use client";

/**
 * QualiFlow AI Unified Modal System
 * 
 * A comprehensive modal system inspired by Linear, Notion, Stripe, and Vercel Geist.
 * Provides consistent behavior, animations, and accessibility across the platform.
 * 
 * Modal Types:
 * - Modal: Standard centered dialog for forms, confirmations, and content
 * - Drawer: Slide-in panel from edge for secondary workflows
 * - CommandModal: AI-powered command palette with search
 * - FullscreenModal: Full viewport for complex workflows
 * 
 * Features:
 * - Consistent animations (200ms duration, ease-out timing)
 * - Proper focus management with focus trap
 * - Keyboard navigation (Escape to close, Tab to navigate)
 * - Mobile-responsive (bottom sheet on mobile for drawers)
 * - Z-index layering for nested modals
 * - Loading states and AI streaming support
 */

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================================
// CONSTANTS
// ============================================================================

const _ANIMATION_DURATION = 200; // ms - consistent across all modals
const Z_INDEX_BASE = 50;
const Z_INDEX_INCREMENT = 10;

// ============================================================================
// MODAL CONTEXT - For nested modal z-index management
// ============================================================================

interface ModalContextValue {
  level: number;
  registerModal: () => () => void;
}

const ModalContext = React.createContext<ModalContextValue>({
  level: 0,
  registerModal: () => () => {},
});

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalCount, setModalCount] = React.useState(0);

  const registerModal = React.useCallback(() => {
    setModalCount((prev) => prev + 1);
    return () => setModalCount((prev) => prev - 1);
  }, []);

  return (
    <ModalContext.Provider value={{ level: modalCount, registerModal }}>
      {children}
    </ModalContext.Provider>
  );
}

function useModalLevel() {
  const context = React.useContext(ModalContext);
  const [level, setLevel] = React.useState(0);

  React.useEffect(() => {
    const unregister = context.registerModal();
    setLevel(context.level + 1);
    return unregister;
  }, [context]);

  return level;
}

// ============================================================================
// MODAL SIZE VARIANTS
// ============================================================================

const modalSizeVariants = cva("", {
  variants: {
    size: {
      xs: "max-w-[320px]",
      sm: "max-w-[400px]",
      md: "max-w-[500px]",
      lg: "max-w-[640px]",
      xl: "max-w-[800px]",
      "2xl": "max-w-[1024px]",
      full: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

// ============================================================================
// DRAWER SIZE VARIANTS
// ============================================================================

const drawerSizeVariants = cva("", {
  variants: {
    size: {
      sm: "w-[320px]",
      md: "w-[400px]",
      lg: "w-[500px]",
      xl: "w-[640px]",
      "2xl": "w-[800px]",
      full: "w-screen",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

// ============================================================================
// SHARED OVERLAY COMPONENT
// ============================================================================

interface ModalOverlayProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> {
  blur?: boolean;
  level?: number;
}

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  ModalOverlayProps
>(({ className, blur = false, level = 1, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    style={{ zIndex: Z_INDEX_BASE + (level - 1) * Z_INDEX_INCREMENT }}
    className={cn(
      "fixed inset-0 bg-black/60",
      blur && "backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "duration-200",
      className
    )}
    {...props}
  />
));
ModalOverlay.displayName = "ModalOverlay";

// ============================================================================
// MODAL COMPONENT (Centered Dialog)
// ============================================================================

export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof modalSizeVariants> {
  showClose?: boolean;
  blur?: boolean;
}

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(({ className, children, size, showClose = true, blur = false, ...props }, ref) => {
  const level = useModalLevel();
  const zIndex = Z_INDEX_BASE + level * Z_INDEX_INCREMENT;

  return (
    <DialogPrimitive.Portal>
      <ModalOverlay blur={blur} level={level} />
      <DialogPrimitive.Content
        ref={ref}
        style={{ zIndex }}
        className={cn(
          // Base positioning - centered in viewport
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-[calc(100%-2rem)] rounded-xl border bg-card shadow-2xl",
          // DYNAMIC HEIGHT: Use flex-col for structure, content determines height
          // max-h-[85vh] provides safety cap, but modal shrinks to fit smaller content
          "flex flex-col max-h-[85vh]",
          // Animation
          "duration-200 ease-out",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          // Focus
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Size (width only, height is dynamic)
          modalSizeVariants({ size }),
          className
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            className={cn(
              "absolute right-4 top-4 rounded-md p-1 z-10",
              "text-muted-foreground hover:text-foreground",
              "opacity-70 hover:opacity-100 transition-opacity",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:pointer-events-none"
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
ModalContent.displayName = "ModalContent";

// ============================================================================
// MODAL HEADER, BODY, FOOTER
// ============================================================================

const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 pt-6 pb-4 flex-shrink-0", className)}
    {...props}
  />
));
ModalHeader.displayName = "ModalHeader";

const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 py-2 flex-1 overflow-y-auto min-h-0", className)}
    {...props}
  />
));
ModalBody.displayName = "ModalBody";

const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-6 py-4 border-t bg-muted/30 flex-shrink-0",
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
));
ModalFooter.displayName = "ModalFooter";

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
ModalTitle.displayName = "ModalTitle";

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground mt-1.5", className)}
    {...props}
  />
));
ModalDescription.displayName = "ModalDescription";

// ============================================================================
// EXPORTS - Base Modal
// ============================================================================

export const Modal = DialogPrimitive.Root;
export const ModalTrigger = DialogPrimitive.Trigger;
export const ModalClose = DialogPrimitive.Close;
export const ModalPortal = DialogPrimitive.Portal;

export {
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalOverlay,
};

// ============================================================================
// DRAWER COMPONENT (Slide-in Panel)
// ============================================================================

export type DrawerSide = "left" | "right" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof drawerSizeVariants> {
  side?: DrawerSide;
  showClose?: boolean;
  blur?: boolean;
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ className, children, size, side = "right", showClose = true, blur = false, ...props }, ref) => {
  const level = useModalLevel();
  const zIndex = Z_INDEX_BASE + level * Z_INDEX_INCREMENT;

  const sideStyles = {
    right: cn(
      "inset-y-0 right-0 h-full border-l",
      "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
    ),
    left: cn(
      "inset-y-0 left-0 h-full border-r",
      "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
    ),
    top: cn(
      "inset-x-0 top-0 w-full border-b",
      "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top"
    ),
    bottom: cn(
      "inset-x-0 bottom-0 w-full border-t rounded-t-xl",
      "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
    ),
  };

  return (
    <DialogPrimitive.Portal>
      <ModalOverlay blur={blur} level={level} />
      <DialogPrimitive.Content
        ref={ref}
        style={{ zIndex }}
        className={cn(
          "fixed bg-card shadow-2xl",
          "duration-300 ease-out",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "focus:outline-none",
          sideStyles[side],
          (side === "left" || side === "right") && drawerSizeVariants({ size }),
          className
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            className={cn(
              "absolute right-4 top-4 rounded-md p-1",
              "text-muted-foreground hover:text-foreground",
              "opacity-70 hover:opacity-100 transition-opacity",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 py-4 border-b", className)}
    {...props}
  />
));
DrawerHeader.displayName = "DrawerHeader";

const DrawerBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto p-6", className)}
    {...props}
  />
));
DrawerBody.displayName = "DrawerBody";

const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-6 py-4 border-t bg-muted/30",
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
));
DrawerFooter.displayName = "DrawerFooter";

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export {
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
};

// ============================================================================
// MODAL LOADING OVERLAY - For AI operations within modals
// ============================================================================

interface ModalLoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: number;
}

export function ModalLoadingOverlay({ visible, message, progress }: ModalLoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
        {typeof progress === "number" && (
          <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

