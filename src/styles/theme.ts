import type { ThemeConfig } from "antd";
import { colors } from "@/design-system/tokens";

// Enhanced brand colors using design tokens
// Optimized for senior-friendly, high-contrast accessibility
export const brandColors = {
  // Màu xanh dương chính (từ vòng tròn logo)
  primary: colors.primary[500],
  primaryHover: colors.primary[600],
  primaryActive: colors.primary[700],
  primaryLight: colors.primary[50],

  // Màu xanh navy (từ biểu tượng trung tâm)
  secondary: colors.secondary[500],
  secondaryHover: colors.secondary[600],
  secondaryActive: colors.secondary[700],

  // Màu đỏ (từ chữ logo)
  accent: colors.accent[500],
  accentHover: colors.accent[600],
  accentLight: colors.accent[50],

  // Màu vàng cam (từ bánh răng) - High contrast for warnings
  warning: colors.warning[600], // Darker for better visibility
  warningLight: colors.warning[100],

  // Màu bổ sung - Semantic colors (colorblind-friendly)
  success: colors.success[600], // Darker green for better contrast
  error: colors.error[600], // Clear red for errors
  info: colors.info[600],

  // Màu nền
  background: colors.gray[50],
  backgroundSecondary: colors.gray[100],

  // Màu text - HIGH CONTRAST for readability
  textPrimary: colors.gray[900], // Nearly black (#0F172A) instead of gray-800
  textSecondary: colors.gray[700], // Darker gray (#334155) instead of gray-600
  textDisabled: colors.gray[400],

  // Màu border - Visible borders for clarity
  border: colors.gray[300], // More visible than gray-200
  borderLight: colors.gray[200],
};

// Ant Design Theme Configuration
// Optimized for senior-friendly UI with high readability and clear affordances
export const themeConfig: ThemeConfig = {
  token: {
    // Màu chính
    colorPrimary: brandColors.primary,
    colorSuccess: brandColors.success,
    colorWarning: brandColors.warning,
    colorError: brandColors.error,
    colorInfo: brandColors.info,

    // Màu link
    colorLink: brandColors.primary,
    colorLinkHover: brandColors.primaryHover,
    colorLinkActive: brandColors.primaryActive,

    // Màu text - HIGH CONTRAST
    colorText: brandColors.textPrimary, // Nearly black for maximum readability
    colorTextSecondary: brandColors.textSecondary, // Darker secondary text
    colorTextDisabled: brandColors.textDisabled,

    // Màu nền
    colorBgContainer: "#FFFFFF",
    colorBgElevated: "#FFFFFF",
    colorBgLayout: brandColors.background,

    // Màu border - More visible
    colorBorder: brandColors.border,
    colorBorderSecondary: brandColors.borderLight,

    // Border radius - Slightly larger for better visual separation
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // Font - LARGER for readability (16px base instead of 14px)
    fontSize: 16, // Increased from 14px
    fontSizeHeading1: 36, // Increased from 32px
    fontSizeHeading2: 30, // Increased from 28px
    fontSizeHeading3: 26, // Increased from 24px
    fontSizeHeading4: 22, // Increased from 20px
    fontSizeHeading5: 18, // Increased from 16px

    // Line height for readability
    lineHeight: 1.6, // Increased from default 1.5
    lineHeightHeading1: 1.4,
    lineHeightHeading2: 1.4,
    lineHeightHeading3: 1.5,
    lineHeightHeading4: 1.5,
    lineHeightHeading5: 1.5,

    // Spacing - More generous
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,

    // Shadow - Stronger for better depth perception
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)", // Slightly stronger
    boxShadowSecondary: "0 4px 16px rgba(0, 0, 0, 0.15)", // Slightly stronger
  },
  components: {
    Button: {
      primaryColor: "#FFFFFF",
      colorPrimary: brandColors.primary,
      colorPrimaryHover: brandColors.primaryHover,
      colorPrimaryActive: brandColors.primaryActive,
      borderRadius: 8,
      controlHeight: 44, // Increased from 36px (Fitts's Law - larger touch targets)
      fontSize: 16, // Increased from 14px
      fontWeight: 600, // Bolder for better affordance
      paddingContentHorizontal: 20, // More generous padding
      defaultBorderColor: brandColors.border, // Visible border for default buttons
      defaultShadow: "0 1px 2px rgba(0, 0, 0, 0.08)", // Subtle shadow for depth
    },
    Input: {
      borderRadius: 8,
      controlHeight: 44, // Increased from 36px
      fontSize: 16, // Increased from default
      paddingBlock: 10, // More vertical padding
      paddingInline: 14, // More horizontal padding
      colorBorder: brandColors.border, // Visible border
      colorPrimaryHover: brandColors.primaryHover,
      activeBorderColor: brandColors.primary,
      hoverBorderColor: brandColors.primaryHover,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 44, // Increased from 36px
      fontSize: 16, // Increased from default
      colorBorder: brandColors.border, // Visible border
      colorPrimaryHover: brandColors.primaryHover,
      optionFontSize: 16,
      optionLineHeight: 1.6,
      optionPadding: "10px 14px", // Larger touch targets in dropdown
    },
    Card: {
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", // More visible shadow
      colorBorderSecondary: brandColors.border, // More visible border
      paddingLG: 24,
    },
    Table: {
      borderRadius: 8,
      headerBg: brandColors.primaryLight,
      headerColor: brandColors.textPrimary, // High contrast header text
      rowHoverBg: brandColors.primaryLight,
      fontSize: 16, // Increased from default
      cellPaddingBlock: 14, // More vertical padding for rows
      cellPaddingInline: 16,
      fontWeightStrong: 600, // Bolder header
    },
    Modal: {
      borderRadius: 12,
      headerBg: brandColors.primary,
      titleColor: "#FFFFFF",
      titleFontSize: 20, // Larger modal titles
      fontSize: 16,
      paddingContentHorizontalLG: 24,
    },
    Tabs: {
      colorPrimary: brandColors.primary,
      itemActiveColor: brandColors.primary,
      itemHoverColor: brandColors.primaryHover,
      inkBarColor: brandColors.primary,
      fontSize: 16, // Increased from default
      horizontalItemPadding: "14px 0", // More padding for touch targets
      titleFontSize: 16,
    },
    Tag: {
      borderRadius: 6,
      fontSize: 15, // Slightly larger
      lineHeight: 1.6,
      defaultBg: brandColors.backgroundSecondary,
      defaultColor: brandColors.textPrimary,
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: brandColors.primaryLight,
      itemSelectedColor: brandColors.primary,
      itemHoverBg: brandColors.primaryLight,
      itemHoverColor: brandColors.primary,
      itemHeight: 48, // Taller menu items (increased from default ~40px)
      fontSize: 16, // Increased from default
      itemPaddingInline: 16, // More horizontal padding
      iconSize: 20, // Larger icons
    },
    Layout: {
      headerBg: "#FFFFFF",
      siderBg: "#FFFFFF",
      bodyBg: brandColors.background,
    },
    Badge: {
      colorPrimary: brandColors.accent,
      fontSize: 14, // Slightly larger badge text
    },
    Progress: {
      defaultColor: brandColors.primary,
    },
    Segmented: {
      itemSelectedBg: brandColors.primary,
      itemSelectedColor: "#FFFFFF",
      itemHoverBg: brandColors.primaryLight,
      itemHoverColor: brandColors.primary,
      controlHeight: 44, // Larger segmented controls
      fontSize: 16,
    },
    Checkbox: {
      controlInteractiveSize: 20, // Larger checkbox (default ~16px)
      fontSize: 16,
    },
    Radio: {
      controlInteractiveSize: 20, // Larger radio button
      fontSize: 16,
    },
    Switch: {
      handleSize: 22, // Larger switch handle
      trackHeight: 26, // Taller switch track
      trackMinWidth: 48, // Wider switch
    },
    DatePicker: {
      controlHeight: 44,
      fontSize: 16,
      borderRadius: 8,
    },
    Tooltip: {
      fontSize: 15,
      borderRadius: 6,
    },
  },
};

// Gradient presets
export const gradients = {
  primary: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
  secondary: `linear-gradient(135deg, ${brandColors.secondary} 0%, ${brandColors.primary} 100%)`,
  accent: `linear-gradient(135deg, ${brandColors.accent} 0%, ${brandColors.warning} 100%)`,
  card: `linear-gradient(135deg, ${brandColors.primaryLight} 0%, #FFFFFF 100%)`,
  header: `linear-gradient(90deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
};

export default themeConfig;
