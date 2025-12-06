import React, { forwardRef, useState } from "react";
import { cn } from "@/design-system/utilities";
import { tokens } from "@/design-system/tokens";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Input variant style */
  variant?: "default" | "filled" | "ghost";
  /** Input size */
  inputSize?: "sm" | "md" | "lg";
  /** Validation state */
  state?: "default" | "error" | "success" | "warning";
  /** Icon to display on the left */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right */
  rightIcon?: React.ReactNode;
  /** Helper text below input */
  helperText?: string;
  /** Show character counter */
  showCount?: boolean;
  /** Maximum character length */
  maxLength?: number;
  /** Full width */
  fullWidth?: boolean;
  /** Custom wrapper class */
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "default",
      inputSize = "md",
      state = "default",
      leftIcon,
      rightIcon,
      helperText,
      showCount,
      maxLength,
      fullWidth,
      className,
      wrapperClassName,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string>("");
    const currentValue = value !== undefined ? String(value) : internalValue;
    const charCount = currentValue.length;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    // Base styles
    const baseStyles = cn(
      "transition-all duration-200 ease-in-out",
      "font-sans outline-none",
      "placeholder:text-neutral-400",
      disabled && "cursor-not-allowed opacity-60"
    );

    // Variant styles
    const variantStyles = {
      default: cn(
        "bg-white border",
        state === "default" &&
          "border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100",
        state === "error" &&
          "border-error-500 focus:border-error-500 focus:ring-2 focus:ring-error-100",
        state === "success" &&
          "border-success-500 focus:border-success-500 focus:ring-2 focus:ring-success-100",
        state === "warning" &&
          "border-warning-500 focus:border-warning-500 focus:ring-2 focus:ring-warning-100"
      ),
      filled: cn(
        "bg-neutral-100 border border-transparent",
        state === "default" &&
          "hover:bg-neutral-200 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100",
        state === "error" &&
          "bg-error-50 focus:bg-white focus:border-error-500 focus:ring-2 focus:ring-error-100",
        state === "success" &&
          "bg-success-50 focus:bg-white focus:border-success-500 focus:ring-2 focus:ring-success-100",
        state === "warning" &&
          "bg-warning-50 focus:bg-white focus:border-warning-500 focus:ring-2 focus:ring-warning-100"
      ),
      ghost: cn(
        "bg-transparent border-b-2",
        state === "default" &&
          "border-neutral-300 hover:border-neutral-400 focus:border-primary-500",
        state === "error" && "border-error-500 focus:border-error-500",
        state === "success" && "border-success-500 focus:border-success-500",
        state === "warning" && "border-warning-500 focus:border-warning-500"
      ),
    };

    // Size styles
    const sizeStyles = {
      sm: cn(
        "h-8 text-sm",
        variant === "ghost" ? "px-0" : "px-3",
        leftIcon ? "pl-8" : "",
        rightIcon ? "pr-8" : "",
        variant === "ghost" ? "rounded-none" : "rounded-md"
      ),
      md: cn(
        "h-10 text-base",
        variant === "ghost" ? "px-0" : "px-4",
        leftIcon ? "pl-10" : "",
        rightIcon ? "pr-10" : "",
        variant === "ghost" ? "rounded-none" : "rounded-lg"
      ),
      lg: cn(
        "h-12 text-lg",
        variant === "ghost" ? "px-0" : "px-5",
        leftIcon ? "pl-12" : "",
        rightIcon ? "pr-12" : "",
        variant === "ghost" ? "rounded-none" : "rounded-lg"
      ),
    };

    // Icon container styles
    const iconContainerStyles = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
    };

    // Icon size styles
    const iconSizeStyles = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    // State colors for icons and helper text
    const stateColors = {
      default: "text-neutral-500",
      error: "text-error-500",
      success: "text-success-500",
      warning: "text-warning-500",
    };

    return (
      <div
        className={cn(
          "flex flex-col gap-1",
          fullWidth && "w-full",
          wrapperClassName
        )}
      >
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div
              className={cn(
                "absolute left-0 top-0 flex items-center justify-center pointer-events-none",
                iconContainerStyles[inputSize],
                stateColors[state]
              )}
            >
              <div className={iconSizeStyles[inputSize]}>{leftIcon}</div>
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            maxLength={maxLength}
            className={cn(
              baseStyles,
              variantStyles[variant],
              sizeStyles[inputSize],
              fullWidth && "w-full",
              className
            )}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div
              className={cn(
                "absolute right-0 top-0 flex items-center justify-center pointer-events-none",
                iconContainerStyles[inputSize],
                stateColors[state]
              )}
            >
              <div className={iconSizeStyles[inputSize]}>{rightIcon}</div>
            </div>
          )}
        </div>

        {/* Helper Text & Character Counter */}
        {(helperText || (showCount && maxLength)) && (
          <div className="flex items-center justify-between gap-2 px-1">
            {helperText && (
              <span className={cn("text-sm", stateColors[state])}>
                {helperText}
              </span>
            )}
            {showCount && maxLength && (
              <span
                className={cn(
                  "text-sm tabular-nums ml-auto",
                  charCount > maxLength ? "text-error-500" : "text-neutral-500"
                )}
              >
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
