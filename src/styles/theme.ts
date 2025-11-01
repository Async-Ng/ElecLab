import type { ThemeConfig } from "antd";

// Màu sắc từ logo Trường Cao đẳng Giao thông Vận tải TP.HCM
export const brandColors = {
  // Màu xanh dương chính (từ vòng tròn logo)
  primary: "#0090D9",
  primaryHover: "#0077B6",
  primaryActive: "#005A8D",
  primaryLight: "#E6F7FF",

  // Màu xanh navy (từ biểu tượng trung tâm)
  secondary: "#1E3A8A",
  secondaryHover: "#1E40AF",
  secondaryActive: "#1E3A8A",

  // Màu đỏ (từ chữ logo)
  accent: "#DC2626",
  accentHover: "#B91C1C",
  accentLight: "#FEE2E2",

  // Màu vàng cam (từ bánh răng)
  warning: "#F59E0B",
  warningLight: "#FEF3C7",

  // Màu bổ sung
  success: "#10B981",
  error: "#EF4444",
  info: "#0090D9",

  // Màu nền
  background: "#F8FAFC",
  backgroundSecondary: "#F1F5F9",

  // Màu text
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textDisabled: "#94A3B8",

  // Màu border
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
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
