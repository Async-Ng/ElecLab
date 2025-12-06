import React, { forwardRef, ButtonHTMLAttributes } from "react";
import { cn, transition } from "@/design-system/utilities";
import { colors, spacing, borderRadius, shadows } from "@/design-system/tokens";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      active:scale-[0.98]
    `;

    const variantStyles = {
      primary: `
        bg-blue-600 text-white
        hover:bg-blue-700
        focus:ring-blue-500
        shadow-sm hover:shadow-md
      `,
      secondary: `
        bg-indigo-900 text-white
        hover:bg-indigo-800
        focus:ring-indigo-700
        shadow-sm hover:shadow-md
      `,
      outline: `
        bg-transparent text-blue-700
        border-2 border-blue-600
        hover:bg-blue-50
        focus:ring-blue-500
      `,
      ghost: `
        bg-transparent text-gray-700
        hover:bg-gray-100
        focus:ring-gray-400
      `,
      danger: `
        bg-red-600 text-white
        hover:bg-red-700
        focus:ring-red-500
        shadow-sm hover:shadow-md
      `,
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm min-h-[32px]",
      md: "px-4 py-2 text-base min-h-[40px]",
      lg: "px-6 py-3 text-lg min-h-[48px]",
    };

    const widthStyle = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyle,
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
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
        {!loading && leftIcon && (
          <span className="inline-flex">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && (
          <span className="inline-flex">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
