"use client";

import React from "react";
import { Typography } from "antd";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { cn } from "@/design-system/utilities";

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
      className="bg-white border-b border-gray-200 mb-4 sm:mb-6 p-4 sm:p-5 md:p-6 rounded-b-lg"
    >
      {/* Breadcrumbs Navigation */}
      {showBreadcrumbs && (
        <div className="mb-3 sm:mb-4">
          <Breadcrumbs />
        </div>
      )}

      {/* Title and Actions Row */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4",
          description && "mb-3"
        )}
      >
        <div className="flex-1 min-w-0">
          <Title
            level={2}
            className="!m-0 !text-2xl sm:!text-3xl md:!text-4xl !text-gray-900 !font-bold"
          >
            {title}
          </Title>
        </div>

        {/* Action Buttons */}
        {extra && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {extra}
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p
          className="m-0 mt-2 text-sm sm:text-base max-w-full md:max-w-3xl text-gray-600 leading-relaxed"
        >
          {description}
        </p>
      )}
    </div>
  );
}
