import React, { useState } from "react";
import { cn } from "@/design-system/utilities";

export interface AlertProps {
  /** Alert message */
  message: React.ReactNode;
  /** Alert description */
  description?: React.ReactNode;
  /** Alert type */
  type?: "info" | "success" | "warning" | "error";
  /** Show icon */
  showIcon?: boolean;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Closable */
  closable?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** After close handler */
  afterClose?: () => void;
  /** Action buttons */
  action?: React.ReactNode;
  /** Custom class */
  className?: string;
  /** Banner style */
  banner?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  message,
  description,
  type = "info",
  showIcon = true,
  icon,
  closable = false,
  onClose,
  afterClose,
  action,
  className,
  banner = false,
}) => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
    setTimeout(() => {
      afterClose?.();
    }, 300);
  };

  if (!visible) return null;

  // Type configurations
  const typeConfig = {
    info: {
      bg: "bg-primary-50",
      border: "border-primary-200",
      icon: "text-primary-500",
      title: "text-primary-800",
      description: "text-primary-700",
    },
    success: {
      bg: "bg-success-50",
      border: "border-success-200",
      icon: "text-success-500",
      title: "text-success-800",
      description: "text-success-700",
    },
    warning: {
      bg: "bg-warning-50",
      border: "border-warning-200",
      icon: "text-warning-500",
      title: "text-warning-800",
      description: "text-warning-700",
    },
    error: {
      bg: "bg-error-50",
      border: "border-error-200",
      icon: "text-error-500",
      title: "text-error-800",
      description: "text-error-700",
    },
  };

  const config = typeConfig[type];

  // Default icons
  const defaultIcons = {
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 p-4 transition-all duration-300",
        banner ? "rounded-none" : "rounded-lg border",
        config.bg,
        !banner && config.border,
        "animate-in fade-in slide-in-from-top-2 duration-300",
        className
      )}
    >
      {/* Icon */}
      {showIcon && (
        <div className={cn("flex-shrink-0", config.icon)}>
          {icon || defaultIcons[type]}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={cn("font-medium", config.title)}>{message}</div>
        {description && (
          <div className={cn("mt-1 text-sm", config.description)}>
            {description}
          </div>
        )}
        {action && <div className="mt-3">{action}</div>}
      </div>

      {/* Close button */}
      {closable && (
        <button
          onClick={handleClose}
          className={cn(
            "flex-shrink-0 p-1 rounded-md transition-colors",
            config.icon,
            "hover:bg-black hover:bg-opacity-10"
          )}
          aria-label="Close alert"
        >
          <svg
            className="w-4 h-4"
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
  );
};

export default Alert;
