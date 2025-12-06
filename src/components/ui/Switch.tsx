import React, { forwardRef } from "react";
import { cn } from "@/design-system/utilities";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Switch size */
  switchSize?: "sm" | "md" | "lg";
  /** Label text */
  label?: React.ReactNode;
  /** Description text */
  description?: string;
  /** Loading state */
  loading?: boolean;
  /** Custom label for checked state */
  checkedLabel?: string;
  /** Custom label for unchecked state */
  uncheckedLabel?: string;
  /** Show inline labels inside switch */
  showInlineLabels?: boolean;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      switchSize = "md",
      label,
      description,
      loading = false,
      checkedLabel,
      uncheckedLabel,
      showInlineLabels = false,
      className,
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Size configurations
    const sizeConfig = {
      sm: {
        track: "w-8 h-4",
        thumb: "w-3 h-3",
        thumbTranslate: checked ? "translate-x-4" : "translate-x-0.5",
        label: "text-sm",
        description: "text-xs",
        inlineLabel: "text-[10px]",
      },
      md: {
        track: "w-11 h-6",
        thumb: "w-5 h-5",
        thumbTranslate: checked ? "translate-x-5" : "translate-x-0.5",
        label: "text-base",
        description: "text-sm",
        inlineLabel: "text-xs",
      },
      lg: {
        track: "w-14 h-8",
        thumb: "w-7 h-7",
        thumbTranslate: checked ? "translate-x-6" : "translate-x-0.5",
        label: "text-lg",
        description: "text-base",
        inlineLabel: "text-sm",
      },
    };

    const config = sizeConfig[switchSize];

    const trackStyles = cn(
      "relative inline-flex items-center rounded-full transition-all duration-200",
      "cursor-pointer",

      // Background colors
      checked && !isDisabled && "bg-primary-500 hover:bg-primary-600",
      !checked && !isDisabled && "bg-neutral-300 hover:bg-neutral-400",

      // Disabled state
      isDisabled && "cursor-not-allowed opacity-50",

      // Focus state
      "focus-within:ring-2 focus-within:ring-primary-100 focus-within:ring-offset-2",

      config.track
    );

    const thumbStyles = cn(
      "inline-block rounded-full bg-white shadow-md transition-transform duration-200",
      "flex items-center justify-center",
      config.thumb,
      config.thumbTranslate
    );

    const inlineLabelStyles = cn(
      "absolute font-medium transition-opacity duration-200",
      "pointer-events-none select-none",
      config.inlineLabel
    );

    return (
      <label className={cn("flex items-start gap-3", className)}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={isDisabled}
            className="sr-only"
            {...props}
          />

          <div className={trackStyles}>
            {/* Inline labels */}
            {showInlineLabels && (
              <>
                {checkedLabel && (
                  <span
                    className={cn(
                      inlineLabelStyles,
                      "left-2 text-white",
                      checked ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {checkedLabel}
                  </span>
                )}
                {uncheckedLabel && (
                  <span
                    className={cn(
                      inlineLabelStyles,
                      "right-2 text-neutral-600",
                      !checked ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {uncheckedLabel}
                  </span>
                )}
              </>
            )}

            {/* Thumb */}
            <span className={thumbStyles}>
              {loading && (
                <svg
                  className="animate-spin h-3 w-3 text-neutral-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
            </span>
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col gap-1">
            {label && (
              <span
                className={cn(
                  "font-medium",
                  isDisabled ? "text-neutral-400" : "text-neutral-900",
                  config.label
                )}
              >
                {label}
              </span>
            )}
            {description && (
              <span
                className={cn(
                  isDisabled ? "text-neutral-300" : "text-neutral-500",
                  config.description
                )}
              >
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = "Switch";

export default Switch;
