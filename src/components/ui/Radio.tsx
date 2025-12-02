import React, { forwardRef } from "react";
import { cn } from "@/design-system/utilities";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Radio size */
  radioSize?: "sm" | "md" | "lg";
  /** Label text */
  label?: React.ReactNode;
  /** Description text */
  description?: string;
  /** Card style variant */
  variant?: "default" | "card";
  /** Validation state */
  state?: "default" | "error";
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      radioSize = "md",
      label,
      description,
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
        radio: "w-4 h-4",
        dot: "w-2 h-2",
        label: "text-sm",
        description: "text-xs",
      },
      md: {
        radio: "w-5 h-5",
        dot: "w-2.5 h-2.5",
        label: "text-base",
        description: "text-sm",
      },
      lg: {
        radio: "w-6 h-6",
        dot: "w-3 h-3",
        label: "text-lg",
        description: "text-base",
      },
    };

    const radioStyles = cn(
      "appearance-none rounded-full border-2 transition-all duration-200",
      "cursor-pointer flex items-center justify-center",

      // Default state
      state === "default" &&
        !checked &&
        "border-neutral-300 hover:border-primary-500",

      // Checked state
      checked && "border-primary-500 hover:border-primary-600",

      // Error state
      state === "error" && !checked && "border-error-500",
      state === "error" && checked && "border-error-500",

      // Disabled state
      disabled && "cursor-not-allowed opacity-50",

      // Focus state
      "focus:ring-2 focus:ring-primary-100 focus:ring-offset-2",

      sizeStyles[radioSize].radio
    );

    const dotStyles = cn(
      "rounded-full transition-all duration-200",
      checked && state === "default" && "bg-primary-500",
      checked && state === "error" && "bg-error-500",
      !checked && "scale-0",
      checked && "scale-100",
      sizeStyles[radioSize].dot
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
          <div className="relative">
            <input
              ref={ref}
              type="radio"
              checked={checked}
              disabled={disabled}
              className={radioStyles}
              {...props}
            />
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center pointer-events-none"
              )}
            >
              <div className={dotStyles} />
            </div>
          </div>

          {(label || description) && (
            <div className="flex flex-col gap-1">
              {label && (
                <span
                  className={cn(
                    "font-medium",
                    disabled ? "text-neutral-400" : "text-neutral-900",
                    sizeStyles[radioSize].label
                  )}
                >
                  {label}
                </span>
              )}
              {description && (
                <span
                  className={cn(
                    disabled ? "text-neutral-300" : "text-neutral-500",
                    sizeStyles[radioSize].description
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

Radio.displayName = "Radio";

// Radio Group Component
export interface RadioGroupProps {
  /** Array of options */
  options: Array<{
    value: string;
    label: React.ReactNode;
    description?: string;
    disabled?: boolean;
  }>;
  /** Selected value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Group name */
  name: string;
  /** Layout direction */
  direction?: "horizontal" | "vertical";
  /** Radio size */
  radioSize?: "sm" | "md" | "lg";
  /** Card style variant */
  variant?: "default" | "card";
  /** Validation state */
  state?: "default" | "error";
  /** Custom class */
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  name,
  direction = "vertical",
  radioSize = "md",
  variant = "default",
  state = "default",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex gap-3",
        direction === "vertical" ? "flex-col" : "flex-row flex-wrap",
        className
      )}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          radioSize={radioSize}
          variant={variant}
          state={state}
          label={option.label}
          description={option.description}
          disabled={option.disabled}
          value={option.value}
          checked={value === option.value}
          onChange={() => onChange?.(option.value)}
        />
      ))}
    </div>
  );
};

export default Radio;
