import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/design-system/utilities";

export interface DrawerProps {
  /** Control drawer visibility */
  open: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Drawer title */
  title?: React.ReactNode;
  /** Drawer content */
  children: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Drawer placement */
  placement?: "left" | "right" | "top" | "bottom";
  /** Drawer size */
  size?: "sm" | "md" | "lg" | "full";
  /** Show close button */
  closable?: boolean;
  /** Close on backdrop click */
  maskClosable?: boolean;
  /** Close on escape key */
  keyboard?: boolean;
  /** Custom drawer class */
  className?: string;
  /** Custom backdrop class */
  backdropClassName?: string;
  /** Disable body scroll when open */
  disableBodyScroll?: boolean;
}

const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  placement = "right",
  size = "md",
  closable = true,
  maskClosable = true,
  keyboard = true,
  className,
  backdropClassName,
  disableBodyScroll = true,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!open || !keyboard) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, keyboard, onClose]);

  // Handle body scroll
  useEffect(() => {
    if (!open || !disableBodyScroll) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open, disableBodyScroll]);

  if (!open) return null;

  // Size styles based on placement
  const getSizeStyles = () => {
    const isHorizontal = placement === "left" || placement === "right";

    if (isHorizontal) {
      return {
        sm: "w-80",
        md: "w-96",
        lg: "w-[480px]",
        full: "w-full",
      }[size];
    } else {
      return {
        sm: "h-80",
        md: "h-96",
        lg: "h-[480px]",
        full: "h-full",
      }[size];
    }
  };

  // Position and animation styles
  const placementStyles = {
    left: cn(
      "left-0 top-0 bottom-0",
      "animate-in slide-in-from-left duration-300"
    ),
    right: cn(
      "right-0 top-0 bottom-0",
      "animate-in slide-in-from-right duration-300"
    ),
    top: cn(
      "top-0 left-0 right-0",
      "animate-in slide-in-from-top duration-300"
    ),
    bottom: cn(
      "bottom-0 left-0 right-0",
      "animate-in slide-in-from-bottom duration-300"
    ),
  };

  const drawerContent = (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300",
          "animate-in fade-in",
          backdropClassName
        )}
        onClick={maskClosable ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
        className={cn(
          "absolute bg-white shadow-xl",
          "flex flex-col",
          getSizeStyles(),
          placementStyles[placement],
          className
        )}
      >
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
            {title && (
              <h2
                id="drawer-title"
                className="text-lg font-semibold text-neutral-900"
              >
                {title}
              </h2>
            )}
            {closable && (
              <button
                onClick={onClose}
                className={cn(
                  "p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100",
                  "transition-colors",
                  !title && "absolute top-4 right-4 z-10"
                )}
                aria-label="Close drawer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

export default Drawer;
