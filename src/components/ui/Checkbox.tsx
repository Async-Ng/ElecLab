import React, { forwardRef } from "react";
import { cn } from "@/design-system/utilities";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Checkbox size */
  checkboxSize?: "sm" | "md" | "lg";
  /** Label text */
  label?: React.ReactNode;
  /** Description text */
  description?: string;
  /** Indeterminate state */
  indeterminate?: boolean;
  /** Card style variant */
  variant?: "default" | "card";
  /** Validation state */
  state?: "default" | "error";
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checkboxSize = "md",
      label,
      description,
      indeterminate = false,
      variant = "default",
      state = "default",
      className,
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    // Size styles
    const sizeStyles = {
      sm: {
        checkbox: "w-4 h-4",
        label: "text-sm",
        description: "text-xs",
      },
      md: {
        checkbox: "w-5 h-5",
        label: "text-base",
        description: "text-sm",
      },
      lg: {
        checkbox: "w-6 h-6",
        label: "text-lg",
        description: "text-base",
      },
    };

    const checkboxStyles = cn(
      "appearance-none rounded border-2 transition-all duration-200",
      "cursor-pointer flex items-center justify-center",
      'before:content-[""] before:w-0 before:h-0 before:transition-all before:duration-200',

      // Default state
      state === "default" &&
        !checked &&
        !indeterminate &&
        "border-neutral-300 hover:border-primary-500",

      // Checked state
      checked &&
        !indeterminate &&
        "bg-primary-500 border-primary-500 hover:bg-primary-600 hover:border-primary-600",
      checked &&
        !indeterminate &&
        "before:w-1.5 before:h-3 before:border-white before:border-r-2 before:border-b-2 before:rotate-45 before:translate-y-[-1px]",

      // Indeterminate state
      indeterminate &&
        "bg-primary-500 border-primary-500 hover:bg-primary-600 hover:border-primary-600",
      indeterminate && "before:w-2.5 before:h-0.5 before:bg-white",

      // Error state
      state === "error" && !checked && !indeterminate && "border-error-500",
      state === "error" &&
        (checked || indeterminate) &&
        "bg-error-500 border-error-500 hover:bg-error-600 hover:border-error-600",

      // Disabled state
      disabled && "cursor-not-allowed opacity-50",

      // Focus state
      "focus:ring-2 focus:ring-primary-100 focus:ring-offset-2",

      sizeStyles[checkboxSize].checkbox
    );

    const containerStyles = cn(
      variant === "card" && "border-2 rounded-lg transition-all duration-200",
      variant === "card" &&
        !checked &&
        "border-neutral-200 hover:border-neutral-300 bg-white",
      variant === "card" && checked && "border-primary-500 bg-primary-50",
      variant === "card" && state === "error" && "border-error-500 bg-error-50",
      variant === "card" && "p-4",
      variant === "card" && disabled && "opacity-50 cursor-not-allowed",
      variant === "default" && "flex items-start gap-2"
    );

    return (
      <label className={cn(containerStyles, className)}>
        <div
          className={variant === "card" ? "flex items-start gap-3" : "contents"}
        >
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className={checkboxStyles}
            {...props}
          />

          {(label || description) && (
            <div className="flex flex-col gap-1">
              {label && (
                <span
                  className={cn(
                    "font-medium",
                    disabled ? "text-neutral-400" : "text-neutral-900",
                    sizeStyles[checkboxSize].label
                  )}
                >
                  {label}
                </span>
              )}
              {description && (
                <span
                  className={cn(
                    disabled ? "text-neutral-300" : "text-neutral-500",
                    sizeStyles[checkboxSize].description
                  )}
                >
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

// Checkbox Group Component
export interface CheckboxGroupProps {
  /** Array of options */
  options: Array<{
    value: string;
    label: React.ReactNode;
    description?: string;
    disabled?: boolean;
  }>;
  /** Selected values */
  value?: string[];
  /** Change handler */
  onChange?: (values: string[]) => void;
  /** Layout direction */
  direction?: "horizontal" | "vertical";
  /** Checkbox size */
  checkboxSize?: "sm" | "md" | "lg";
  /** Card style variant */
  variant?: "default" | "card";
  /** Validation state */
  state?: "default" | "error";
  /** Custom class */
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  value = [],
  onChange,
  direction = "vertical",
  checkboxSize = "md",
  variant = "default",
  state = "default",
  className,
}) => {
  const handleChange = (optionValue: string, checked: boolean) => {
    const newValue = checked
      ? [...value, optionValue]
      : value.filter((v) => v !== optionValue);
    onChange?.(newValue);
  };

  return (
    <div
      className={cn(
        "flex gap-3",
        direction === "vertical" ? "flex-col" : "flex-row flex-wrap",
        className
      )}
    >
      {options.map((option) => (
        <Checkbox
          key={option.value}
          checkboxSize={checkboxSize}
          variant={variant}
          state={state}
          label={option.label}
          description={option.description}
          disabled={option.disabled}
          checked={value.includes(option.value)}
          onChange={(e) => handleChange(option.value, e.target.checked)}
        />
      ))}
    </div>
  );
};

export default Checkbox;
