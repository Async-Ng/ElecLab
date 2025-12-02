import type { ThemeConfig } from "antd";
import { colors } from "@/design-system/tokens";

// Enhanced brand colors using design tokens
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

  // Màu vàng cam (từ bánh răng)
  warning: colors.warning[500],
  warningLight: colors.warning[100],

  // Màu bổ sung
  success: colors.success[500],
  error: colors.error[500],
  info: colors.info[500],

  // Màu nền
  background: colors.gray[50],
  backgroundSecondary: colors.gray[100],

  // Màu text
  textPrimary: colors.gray[800],
  textSecondary: colors.gray[600],
  textDisabled: colors.gray[400],

  // Màu border
  border: colors.gray[200],
  borderLight: colors.gray[100],
};

// Ant Design Theme Configuration
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

    // Màu text
    colorText: brandColors.textPrimary,
    colorTextSecondary: brandColors.textSecondary,
    colorTextDisabled: brandColors.textDisabled,

    // Màu nền
    colorBgContainer: "#FFFFFF",
    colorBgElevated: "#FFFFFF",
    colorBgLayout: brandColors.background,

    // Màu border
    colorBorder: brandColors.border,
    colorBorderSecondary: brandColors.borderLight,

    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // Font
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 28,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,

    // Shadow
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    boxShadowSecondary: "0 4px 16px rgba(0, 0, 0, 0.12)",
  },
  components: {
    Button: {
      primaryColor: "#FFFFFF",
      colorPrimary: brandColors.primary,
      colorPrimaryHover: brandColors.primaryHover,
      colorPrimaryActive: brandColors.primaryActive,
      borderRadius: 8,
      controlHeight: 36,
      fontSize: 14,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 36,
      colorBorder: brandColors.border,
      colorPrimaryHover: brandColors.primaryHover,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 36,
      colorBorder: brandColors.border,
      colorPrimaryHover: brandColors.primaryHover,
    },
    Card: {
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      colorBorderSecondary: brandColors.borderLight,
    },
    Table: {
      borderRadius: 8,
      headerBg: brandColors.primaryLight,
      headerColor: brandColors.primary,
      rowHoverBg: brandColors.primaryLight,
    },
    Modal: {
      borderRadius: 12,
      headerBg: brandColors.primary,
      titleColor: "#FFFFFF",
    },
    Tabs: {
      colorPrimary: brandColors.primary,
      itemActiveColor: brandColors.primary,
      itemHoverColor: brandColors.primaryHover,
      inkBarColor: brandColors.primary,
    },
    Tag: {
      borderRadius: 6,
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: brandColors.primaryLight,
      itemSelectedColor: brandColors.primary,
      itemHoverBg: brandColors.primaryLight,
      itemHoverColor: brandColors.primary,
    },
    Layout: {
      headerBg: "#FFFFFF",
      siderBg: "#FFFFFF",
      bodyBg: brandColors.background,
    },
    Badge: {
      colorPrimary: brandColors.accent,
    },
    Progress: {
      defaultColor: brandColors.primary,
    },
    Segmented: {
      itemSelectedBg: brandColors.primary,
      itemSelectedColor: "#FFFFFF",
      itemHoverBg: brandColors.primaryLight,
      itemHoverColor: brandColors.primary,
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
