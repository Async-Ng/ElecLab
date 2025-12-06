import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/design-system/utilities";
import { colors } from "@/design-system/tokens";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "default",
      size = "md",
      dot = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center gap-1.5
      font-medium rounded-full
      transition-all duration-200
    `;

    const variantStyles = {
      default: "bg-gray-100 text-gray-800 border border-gray-200",
      primary: "bg-blue-50 text-blue-700 border border-blue-200",
      secondary: "bg-indigo-50 text-indigo-700 border border-indigo-200",
      success: "bg-green-50 text-green-700 border border-green-200",
      warning: "bg-amber-50 text-amber-700 border border-amber-200",
      error: "bg-red-50 text-red-700 border border-red-200",
      info: "bg-sky-50 text-sky-700 border border-sky-200",
    };

    const sizeStyles = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
      lg: "px-3 py-1.5 text-base",
    };

    const dotColors = {
      default: "bg-gray-500",
      primary: "bg-blue-500",
      secondary: "bg-indigo-500",
      success: "bg-green-500",
      warning: "bg-amber-500",
      error: "bg-red-500",
      info: "bg-sky-500",
    };

    const dotSizes = {
      sm: "w-1.5 h-1.5",
      md: "w-2 h-2",
      lg: "w-2.5 h-2.5",
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn("rounded-full", dotColors[variant], dotSizes[size])}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
