"use client";

import React from "react";
import { Typography } from "antd";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { brandColors } from "@/styles/theme";

const { Title } = Typography;

interface PageHeaderProps {
  /**
   * Main page title - should be clear and descriptive
   */
  title: string;
  /**
   * Optional description - use simple language for low-tech users
   * Example: "Xem và quản lý tất cả phòng thực hành"
   */
  description?: string;
  /**
   * Action buttons area (e.g., "Thêm mới", "Xuất file")
   */
  extra?: React.ReactNode;
  /**
   * Show breadcrumbs navigation (default: true)
   */
  showBreadcrumbs?: boolean;
}

/**
 * Standard Page Header Component
 *
 * Features:
 * - Integrated breadcrumbs for navigation
 * - Clear title and description for senior-friendly UX
 * - Action buttons area for primary actions
 * - White background with subtle bottom border
 * - Generous padding and spacing
 */
export default function PageHeader({
  title,
  description,
  extra,
  showBreadcrumbs = true,
}: PageHeaderProps) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderBottom: `1px solid ${brandColors.borderLight}`,
        marginBottom: 24,
        padding: "20px 24px",
        borderRadius: "0 0 10px 10px",
      }}
    >
      {/* Breadcrumbs Navigation */}
      {showBreadcrumbs && (
        <div style={{ marginBottom: 16 }}>
          <Breadcrumbs />
        </div>
      )}

      {/* Title and Actions Row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: description ? 12 : 0,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Title
            level={2}
            style={{
              margin: 0,
              color: "#1F2937", // Near black for maximum readability
              fontSize: "1.875rem", // 30px - large and bold
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            {title}
          </Title>
        </div>

        {/* Action Buttons */}
        {extra && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {extra}
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p
          style={{
            margin: 0,
            marginTop: 8,
            color: brandColors.textSecondary,
            fontSize: "1rem", // 16px - readable
            lineHeight: 1.6,
            maxWidth: "800px",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
