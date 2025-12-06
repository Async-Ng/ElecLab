/**
 * Design System Utilities
 * Helper functions and class generators
 */

import { tokens, colors, spacing, shadows, borderRadius } from "./tokens";
import { CSSProperties } from "react";

/**
 * Get spacing value from tokens
 */
export const getSpacing = (value: keyof typeof spacing): string => {
  return spacing[value];
};

/**
 * Get color value from tokens
 */
export const getColor = (
  color: keyof typeof colors,
  shade?: number
): string => {
  const colorValue = colors[color];
  if (typeof colorValue === "string") {
    return colorValue;
  }
  if (shade && typeof colorValue === "object") {
    return (colorValue as any)[shade] || colorValue[500];
  }
  return (colorValue as any)[500] || "#000000";
};

/**
 * Generate responsive spacing
 */
export const responsiveSpacing = (
  mobile: keyof typeof spacing,
  tablet?: keyof typeof spacing,
  desktop?: keyof typeof spacing
) => ({
  padding: spacing[mobile],
  "@media (min-width: 768px)": {
    padding: spacing[tablet || mobile],
  },
  "@media (min-width: 1024px)": {
    padding: spacing[desktop || tablet || mobile],
  },
});

/**
 * Create CSS variable from token path
 */
export const cssVar = (path: string): string => {
  return `var(--${path.replace(/\./g, "-")})`;
};

/**
 * Generate box shadow with optional color
 */
export const boxShadow = (
  size: keyof typeof shadows = "md",
  color?: string
): string => {
  const shadow = shadows[size];
  if (color && shadow !== "none") {
    return shadow.replace(/rgba\([^)]+\)/g, color);
  }
  return shadow;
};

/**
 * Clamp function for responsive typography
 */
export const clamp = (min: number, preferred: number, max: number): string => {
  return `clamp(${min}rem, ${preferred}vw, ${max}rem)`;
};

/**
 * Convert hex to rgba
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Focus ring styles for accessibility
 */
export const focusRing = (
  color: string = colors.primary[500]
): CSSProperties => ({
  outline: "none",
  boxShadow: `0 0 0 3px ${hexToRgba(color, 0.5)}`,
  transition: "box-shadow 150ms ease-in-out",
});

/**
 * Truncate text with ellipsis
 */
export const truncate = (lines: number = 1): CSSProperties => {
  if (lines === 1) {
    return {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    };
  }
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };
};

/**
 * Generate gradient background
 */
export const gradient = (
  from: string,
  to: string,
  direction: string = "135deg"
): string => {
  return `linear-gradient(${direction}, ${from} 0%, ${to} 100%)`;
};

/**
 * Glassmorphism effect
 */
export const glassmorphism = (
  blur: number = 10,
  opacity: number = 0.1
): CSSProperties => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  WebkitBackdropFilter: `blur(${blur}px)`,
  border: "1px solid rgba(255, 255, 255, 0.2)",
});

/**
 * Create transition string
 */
export const transition = (
  properties: string[] = ["all"],
  duration: keyof typeof tokens.duration = "normal",
  easing: keyof typeof tokens.easing = "inOut"
): string => {
  const dur = tokens.duration[duration];
  const ease = tokens.easing[easing];
  return properties.map((prop) => `${prop} ${dur} ${ease}`).join(", ");
};

/**
 * Media query helpers
 */
export const mediaQuery = {
  up: (breakpoint: keyof typeof tokens.breakpoints) =>
    `@media (min-width: ${tokens.breakpoints[breakpoint]})`,
  down: (breakpoint: keyof typeof tokens.breakpoints) =>
    `@media (max-width: ${tokens.breakpoints[breakpoint]})`,
  between: (
    min: keyof typeof tokens.breakpoints,
    max: keyof typeof tokens.breakpoints
  ) =>
    `@media (min-width: ${tokens.breakpoints[min]}) and (max-width: ${tokens.breakpoints[max]})`,
  only: (breakpoint: keyof typeof tokens.breakpoints) => {
    const breakpoints = Object.keys(tokens.breakpoints);
    const index = breakpoints.indexOf(breakpoint);
    if (index === -1) return "";
    const nextBreakpoint = breakpoints[
      index + 1
    ] as keyof typeof tokens.breakpoints;
    return nextBreakpoint
      ? mediaQuery.between(breakpoint, nextBreakpoint)
      : mediaQuery.up(breakpoint);
  },
};

/**
 * Hover and active states
 */
export const interactiveStates = (
  baseColor: string,
  hoverColor?: string,
  activeColor?: string
): CSSProperties => ({
  backgroundColor: baseColor,
  transition: transition(["background-color", "transform"], "fast"),
  cursor: "pointer",
  ":hover": {
    backgroundColor: hoverColor || baseColor,
  },
  ":active": {
    backgroundColor: activeColor || hoverColor || baseColor,
    transform: "scale(0.98)",
  },
});

/**
 * Skeleton loading shimmer effect
 */
export const shimmer = (): string => {
  return `
    @keyframes shimmer {
      0% {
        background-position: -468px 0;
      }
      100% {
        background-position: 468px 0;
      }
    }
    animation: shimmer 1.5s ease-in-out infinite;
    background: linear-gradient(
      to right,
      ${colors.gray[200]} 0%,
      ${colors.gray[100]} 20%,
      ${colors.gray[200]} 40%,
      ${colors.gray[200]} 100%
    );
    background-size: 800px 100%;
  `;
};

/**
 * Visually hidden but accessible to screen readers
 */
export const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

/**
 * Reset button styles
 */
export const resetButton: CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  margin: 0,
  font: "inherit",
  cursor: "pointer",
  outline: "inherit",
};

/**
 * Common flex layouts
 */
export const flexLayouts = {
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as CSSProperties,

  between: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  } as CSSProperties,

  start: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  } as CSSProperties,

  end: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  } as CSSProperties,

  column: {
    display: "flex",
    flexDirection: "column",
  } as CSSProperties,
};

/**
 * Generate className for conditional styling
 */
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Common animation keyframes
 */
export const animations = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  slideUp: `
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(10px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  slideDown: `
    @keyframes slideDown {
      from { 
        opacity: 0;
        transform: translateY(-10px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  scaleIn: `
    @keyframes scaleIn {
      from { 
        opacity: 0;
        transform: scale(0.95);
      }
      to { 
        opacity: 1;
        transform: scale(1);
      }
    }
  `,
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
};

export default {
  getSpacing,
  getColor,
  responsiveSpacing,
  cssVar,
  boxShadow,
  clamp,
  hexToRgba,
  focusRing,
  truncate,
  gradient,
  glassmorphism,
  transition,
  mediaQuery,
  interactiveStates,
  shimmer,
  visuallyHidden,
  resetButton,
  flexLayouts,
  cn,
  animations,
};
