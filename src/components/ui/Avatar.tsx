import React, { forwardRef, ImgHTMLAttributes, useState } from "react";
import { cn } from "@/design-system/utilities";
import { colors } from "@/design-system/tokens";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface AvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "size"> {
  size?: AvatarSize;
  name?: string;
  src?: string;
  fallbackText?: string;
  status?: "online" | "offline" | "busy" | "away";
  shape?: "circle" | "square";
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      size = "md",
      name,
      src,
      fallbackText,
      status,
      shape = "circle",
      className,
      alt,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const sizeStyles = {
      xs: "w-6 h-6 text-xs",
      sm: "w-8 h-8 text-sm",
      md: "w-10 h-10 text-base",
      lg: "w-12 h-12 text-lg",
      xl: "w-16 h-16 text-xl",
      "2xl": "w-20 h-20 text-2xl",
    };

    const shapeStyles = {
      circle: "rounded-full",
      square: "rounded-lg",
    };

    const statusColors = {
      online: "bg-green-500",
      offline: "bg-gray-400",
      busy: "bg-red-500",
      away: "bg-amber-500",
    };

    const statusSizes = {
      xs: "w-1.5 h-1.5",
      sm: "w-2 h-2",
      md: "w-2.5 h-2.5",
      lg: "w-3 h-3",
      xl: "w-3.5 h-3.5",
      "2xl": "w-4 h-4",
    };

    // Generate initials from name
    const getInitials = (text: string): string => {
      const words = text.trim().split(/\s+/);
      if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
      }
      return (
        words[0].charAt(0) + words[words.length - 1].charAt(0)
      ).toUpperCase();
    };

    const displayFallback = !src || imageError;
    const fallback = fallbackText || (name ? getInitials(name) : "?");

    // Generate a consistent color based on the name
    const getBackgroundColor = (text?: string): string => {
      if (!text) return colors.gray[300];

      const hash = text.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);

      const hue = Math.abs(hash) % 360;
      return `hsl(${hue}, 65%, 55%)`;
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center",
          "font-semibold select-none flex-shrink-0",
          sizeStyles[size],
          shapeStyles[shape],
          "overflow-hidden",
          className
        )}
        style={{
          backgroundColor: displayFallback
            ? getBackgroundColor(name || fallbackText)
            : "transparent",
        }}
      >
        {displayFallback ? (
          <span className="text-white">{fallback}</span>
        ) : (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <img
              src={src}
              alt={alt || name || "Avatar"}
              className={cn(
                "w-full h-full object-cover",
                imageLoaded ? "opacity-100" : "opacity-0",
                "transition-opacity duration-200"
              )}
              onError={() => setImageError(true)}
              onLoad={() => setImageLoaded(true)}
              {...props}
            />
          </>
        )}

        {status && (
          <span
            className={cn(
              "absolute bottom-0 right-0",
              "rounded-full border-2 border-white",
              statusColors[status],
              statusSizes[size]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

// AvatarGroup component for displaying multiple avatars
export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max = 5, size = "md", className }, ref) => {
    const childArray = React.Children.toArray(children);
    const displayedChildren = max ? childArray.slice(0, max) : childArray;
    const extraCount = Math.max(0, childArray.length - max);

    const sizeStyles = {
      xs: "w-6 h-6 text-xs",
      sm: "w-8 h-8 text-sm",
      md: "w-10 h-10 text-base",
      lg: "w-12 h-12 text-lg",
      xl: "w-16 h-16 text-xl",
      "2xl": "w-20 h-20 text-2xl",
    };

    return (
      <div ref={ref} className={cn("flex items-center -space-x-2", className)}>
        {displayedChildren.map((child, index) => (
          <div
            key={index}
            className="ring-2 ring-white"
            style={{ zIndex: displayedChildren.length - index }}
          >
            {child}
          </div>
        ))}
        {extraCount > 0 && (
          <div
            className={cn(
              "flex items-center justify-center",
              "bg-gray-300 text-gray-700 font-semibold",
              "ring-2 ring-white rounded-full",
              sizeStyles[size]
            )}
            style={{ zIndex: 0 }}
          >
            +{extraCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

export default Avatar;
