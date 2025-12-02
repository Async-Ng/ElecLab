import React from "react";
import { cn } from "@/design-system/utilities";

export interface FormFieldProps {
  /** Field label */
  label?: React.ReactNode;
  /** Field name/id */
  name?: string;
  /** Helper text below field */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Required indicator */
  required?: boolean;
  /** Validation state */
  state?: "default" | "error" | "success" | "warning";
  /** Layout direction */
  direction?: "vertical" | "horizontal";
  /** Label width (only for horizontal layout) */
  labelWidth?: string;
  /** Custom label class */
  labelClassName?: string;
  /** Custom wrapper class */
  className?: string;
  /** Field children */
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  helperText,
  error,
  required = false,
  state = "default",
  direction = "vertical",
  labelWidth = "120px",
  labelClassName,
  className,
  children,
}) => {
  const effectiveState = error ? "error" : state;

  // State colors
  const stateColors = {
    default: "text-neutral-600",
    error: "text-error-500",
    success: "text-success-500",
    warning: "text-warning-500",
  };

  // Container styles
  const containerStyles = cn(
    "flex gap-2",
    direction === "vertical" ? "flex-col" : "flex-row items-start",
    className
  );

  // Label styles
  const labelStyles = cn(
    "font-medium text-sm",
    effectiveState === "error" ? "text-error-700" : "text-neutral-700",
    labelClassName
  );

  return (
    <div className={containerStyles}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className={labelStyles}
          style={
            direction === "horizontal"
              ? { width: labelWidth, flexShrink: 0 }
              : undefined
          }
        >
          {label}
          {required && (
            <span className="text-error-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      {/* Field wrapper */}
      <div className="flex-1 min-w-0">
        {/* Clone children with state prop if it accepts it */}
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Try to pass state to child component
            return React.cloneElement(child as React.ReactElement<any>, {
              state: effectiveState,
              id: name,
              "aria-invalid": effectiveState === "error",
              "aria-describedby": error
                ? `${name}-error`
                : helperText
                ? `${name}-helper`
                : undefined,
            });
          }
          return child;
        })}

        {/* Error message */}
        {error && (
          <p
            id={`${name}-error`}
            className="mt-1 text-sm text-error-500 flex items-start gap-1"
          >
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper text (only show if no error) */}
        {!error && helperText && (
          <p
            id={`${name}-helper`}
            className={cn("mt-1 text-sm", stateColors[effectiveState])}
          >
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormField;
