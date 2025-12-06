import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/design-system/utilities";
import { colors, borderRadius, shadows } from "@/design-system/tokens";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  loading?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      hoverable = false,
      loading = false,
      padding = "md",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      bg-white rounded-lg border border-gray-200
      transition-all duration-200
    `;

    const hoverStyles = hoverable
      ? `
        hover:shadow-lg hover:-translate-y-1
        cursor-pointer
      `
      : "shadow-sm";

    const paddingStyles = {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    const loadingOverlay = loading && (
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
        <div className="flex flex-col items-center gap-2">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
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
          <span className="text-sm text-gray-600">Đang tải...</span>
        </div>
      </div>
    );

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          hoverStyles,
          paddingStyles[padding],
          "relative",
          className
        )}
        {...props}
      >
        {loadingOverlay}
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card subcomponents
export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-4 pb-3 border-b border-gray-200", className)}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-gray-900", className)}
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 mt-1", className)}
    {...props}
  >
    {children}
  </p>
));

CardDescription.displayName = "CardDescription";

export const CardBody = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-3", className)} {...props}>
    {children}
  </div>
));

CardBody.displayName = "CardBody";

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-4 pt-3 border-t border-gray-200 flex items-center gap-2",
      className
    )}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = "CardFooter";

export default Card;
