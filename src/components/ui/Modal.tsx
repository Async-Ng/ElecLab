import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/design-system/utilities";
import Button from "./Button";

export interface ModalProps {
  /** Control modal visibility */
  open: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Modal title */
  title?: React.ReactNode;
  /** Modal content */
  children: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Modal size */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Center modal vertically */
  centered?: boolean;
  /** Show close button */
  closable?: boolean;
  /** Close on backdrop click */
  maskClosable?: boolean;
  /** Close on escape key */
  keyboard?: boolean;
  /** Custom modal class */
  className?: string;
  /** Custom backdrop class */
  backdropClassName?: string;
  /** Disable body scroll when open */
  disableBodyScroll?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  centered = true,
  closable = true,
  maskClosable = true,
  keyboard = true,
  className,
  backdropClassName,
  disableBodyScroll = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Focus trap
  useEffect(() => {
    if (!open) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener("keydown", handleTab as any);
    firstElement?.focus();

    return () => {
      modal.removeEventListener("keydown", handleTab as any);
    };
  }, [open]);

  if (!open) return null;

  // Size presets with exact pixel values
  const sizeStyles = {
    sm: "max-w-[400px]", // Small - Simple forms (1-2 fields)
    md: "max-w-[600px]", // Medium - Standard forms (default)
    lg: "max-w-[800px]", // Large - Two-column forms
    xl: "max-w-[1000px]", // Extra Large - Tables, preview
    full: "max-w-[calc(100vw-40px)]", // Full - Calendar, charts
  };

  const modalContent = (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center p-4",
        centered ? "items-center" : "items-start pt-20"
      )}
    >
      {/* Glassmorphism Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm",
          "transition-all duration-300 ease-out",
          "animate-in fade-in",
          backdropClassName
        )}
        onClick={maskClosable ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Container - Enhanced Visual */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={cn(
          "relative bg-white rounded-2xl shadow-2xl",
          "w-full overflow-hidden",
          "border border-gray-100",
          "animate-in zoom-in-95 fade-in slide-in-from-bottom-4",
          "duration-300 ease-out",
          sizeStyles[size],
          className
        )}
      >
        {/* Header - Enhanced Styling */}
        {(title || closable) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            {title && (
              <h2
                id="modal-title"
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
                aria-label="Close modal"
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
        <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>

        {/* Footer - Subtle Background */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-50 bg-gray-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Preset footer with confirm/cancel buttons
export const ModalFooter: React.FC<{
  onOk?: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  okLoading?: boolean;
  okDisabled?: boolean;
}> = ({
  onOk,
  onCancel,
  okText = "Xác nhận",
  cancelText = "Hủy",
  okLoading = false,
  okDisabled = false,
}) => (
  <>
    <Button variant="outline" onClick={onCancel}>
      {cancelText}
    </Button>
    <Button onClick={onOk} loading={okLoading} disabled={okDisabled}>
      {okText}
    </Button>
  </>
);

export default Modal;
