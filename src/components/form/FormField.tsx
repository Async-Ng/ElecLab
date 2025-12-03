import React from "react";
import { cn } from "@/design-system/utilities";

export interface FormFieldProps {
  /** Field label */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text below the field */
  helperText?: string;
  /** Children - typically an input component */
  children: React.ReactNode;
  /** Additional wrapper class */
  className?: string;
  /** Field ID for accessibility */
  id?: string;
}

/**
 * FormField - A standalone form field wrapper for controlled components
 *
 * This component wraps input fields with proper label, error display, and styling
 * WITHOUT using Ant Design's Form.Item. It's designed for controlled components
 * where you manage value/onChange manually.
 *
 * @example
 * ```tsx
 * <FormField label="Category" required error={errors.category}>
 *   <Select
 *     value={formData.category}
 *     onChange={(val) => handleChange('category', val)}
 *     options={categoryOptions}
 *   />
 * </FormField>
 * ```
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  helperText,
  children,
  className,
  id,
}) => {
  return (
    <div className={cn("flex flex-col gap-1.5 mb-4", className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium text-gray-700 dark:text-gray-300",
            required && "after:content-['*'] after:ml-1 after:text-red-500"
          )}
        >
          {label}
        </label>
      )}

      {/* Input field */}
      <div className="relative">{children}</div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-1.5 text-sm text-red-600 dark:text-red-400 animate-fadeIn">
          <svg
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Helper text */}
      {!error && helperText && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </div>
      )}
    </div>
  );
};

export default FormField;
