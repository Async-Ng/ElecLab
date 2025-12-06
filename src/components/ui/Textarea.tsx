import React, { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "@/design-system/utilities";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea variant style */
  variant?: "default" | "filled" | "ghost";
  /** Validation state */
  state?: "default" | "error" | "success" | "warning";
  /** Helper text below textarea */
  helperText?: string;
  /** Show character counter */
  showCount?: boolean;
  /** Maximum character length */
  maxLength?: number;
  /** Auto-resize based on content */
  autoResize?: boolean;
  /** Minimum rows */
  minRows?: number;
  /** Maximum rows (only works with autoResize) */
  maxRows?: number;
  /** Full width */
  fullWidth?: boolean;
  /** Custom wrapper class */
  wrapperClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant = "default",
      state = "default",
      helperText,
      showCount,
      maxLength,
      autoResize = false,
      minRows = 3,
      maxRows,
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
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const currentValue = value !== undefined ? String(value) : internalValue;
    const charCount = currentValue.length;

    // Auto-resize functionality
    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;

        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = "auto";

        // Calculate new height
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const minHeight = lineHeight * minRows;
        const maxHeight = maxRows ? lineHeight * maxRows : Infinity;
        const newHeight = Math.min(
          Math.max(textarea.scrollHeight, minHeight),
          maxHeight
        );

        textarea.style.height = `${newHeight}px`;
      }
    }, [currentValue, autoResize, minRows, maxRows]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const setRefs = (element: HTMLTextAreaElement | null) => {
      textareaRef.current = element;
      if (typeof ref === "function") {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    // Base styles
    const baseStyles = cn(
      "transition-all duration-200 ease-in-out",
      "font-sans outline-none resize-none",
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

    // State colors for helper text
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
        {/* Textarea */}
        <textarea
          ref={setRefs}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          maxLength={maxLength}
          rows={autoResize ? minRows : props.rows || 3}
          className={cn(
            baseStyles,
            variantStyles[variant],
            "px-4 py-3 text-base rounded-lg",
            variant === "ghost" && "px-0 rounded-none",
            fullWidth && "w-full",
            className
          )}
          {...props}
        />

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

Textarea.displayName = "Textarea";

export default Textarea;
