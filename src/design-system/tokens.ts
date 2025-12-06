/**
 * Design System Tokens
 * Central source of truth for design values
 */

// Spacing scale based on 4px grid
export const spacing = {
  px: "1px",
  0: "0",
  0.5: "2px",
  1: "4px",
  1.5: "6px",
  2: "8px",
  2.5: "10px",
  3: "12px",
  3.5: "14px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  9: "36px",
  10: "40px",
  11: "44px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
  28: "112px",
  32: "128px",
} as const;

// Typography system
export const typography = {
  fontFamily: {
    primary:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'JetBrains Mono, "Fira Code", Consolas, monospace',
    display: "Poppins, Inter, sans-serif",
  },
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px (standard readable size)
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
  },
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
} as const;

// Enhanced color palette
export const colors = {
  // Brand colors from logo
  primary: {
    50: "#E6F7FF",
    100: "#BAE7FF",
    200: "#91D5FF",
    300: "#69C0FF",
    400: "#40A9FF",
    500: "#0090D9", // Main primary
    600: "#0077B6",
    700: "#005A8D",
    800: "#003F64",
    900: "#002A43",
  },
  secondary: {
    50: "#EEF2FF",
    100: "#E0E7FF",
    200: "#C7D2FE",
    300: "#A5B4FC",
    400: "#818CF8",
    500: "#1E3A8A", // Main secondary
    600: "#1E40AF",
    700: "#1D4ED8",
    800: "#1E3A8A",
    900: "#172554",
  },
  accent: {
    50: "#FEE2E2",
    100: "#FECACA",
    200: "#FCA5A5",
    300: "#F87171",
    400: "#EF4444",
    500: "#DC2626", // Main accent
    600: "#B91C1C",
    700: "#991B1B",
    800: "#7F1D1D",
    900: "#450A0A",
  },

  // Semantic colors
  success: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },
  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },
  error: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
  },
  info: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },

  // Neutral grays
  gray: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
  },

  // Additional utility colors
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
  current: "currentColor",
} as const;

// Shadow system
export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",

  // Colored shadows for emphasis
  primarySm: "0 1px 2px 0 rgba(0, 144, 217, 0.15)",
  primaryMd: "0 4px 12px 0 rgba(0, 144, 217, 0.2)",
  primaryLg: "0 8px 24px 0 rgba(0, 144, 217, 0.25)",
} as const;

// Border radius
export const borderRadius = {
  none: "0",
  sm: "0.25rem", // 4px
  base: "0.375rem", // 6px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  "2xl": "1.5rem", // 24px
  "3xl": "2rem", // 32px
  full: "9999px",
} as const;

// Z-index scale
export const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  notification: 1700,
} as const;

// Transition durations
export const duration = {
  instant: "50ms",
  fast: "100ms",
  normal: "200ms",
  slow: "300ms",
  slower: "500ms",
  slowest: "700ms",
} as const;

// Transition timing functions
export const easing = {
  linear: "linear",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  xs: "475px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Container max widths
export const containerMaxWidth = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
  full: "100%",
} as const;

// Export all tokens as a single object
export const tokens = {
  spacing,
  typography,
  colors,
  shadows,
  borderRadius,
  zIndex,
  duration,
  easing,
  breakpoints,
  containerMaxWidth,
} as const;

export type Tokens = typeof tokens;
export type Spacing = keyof typeof spacing;
export type Color = keyof typeof colors;
export type Shadow = keyof typeof shadows;
export type BorderRadius = keyof typeof borderRadius;
export type ZIndex = keyof typeof zIndex;
export type Duration = keyof typeof duration;
export type Easing = keyof typeof easing;
export type Breakpoint = keyof typeof breakpoints;
