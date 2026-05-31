"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  merged?: boolean;
}

interface InputGroupTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

/**
 * Input Group Component
 *
 * Wrapper for grouping input elements with icons, buttons, etc.
 * Compatible with DashCode sidebar search component
 */
const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, merged, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center",
          merged && "input-group-merged",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

InputGroup.displayName = "InputGroup";

/**
 * Input Group Text Component
 *
 * Text element within an input group (for icons, labels, etc.)
 */
const InputGroupText = React.forwardRef<HTMLSpanElement, InputGroupTextProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn("flex items-center justify-center px-3", className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

InputGroupText.displayName = "InputGroupText";

export { InputGroup, InputGroupText };
