import React from "react";
import { Typography } from "antd";
import { brandColors } from "@/styles/theme";

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  level?: 1 | 2 | 3 | 4 | 5;
  extra?: React.ReactNode;
  description?: string;
}

export default function PageHeader({
  title,
  level = 3,
  extra,
  description,
}: PageHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-2">
        <Title
          level={level}
          style={{
            margin: 0,
            color: brandColors.primary,
            fontSize: level === 3 ? "1.25rem" : undefined,
          }}
          className="sm:text-2xl"
        >
          {title}
        </Title>
        {extra && (
          <div className="flex items-center gap-2 flex-wrap">{extra}</div>
        )}
      </div>
      {description && (
        <p
          style={{ color: brandColors.textSecondary, marginTop: 8 }}
          className="text-sm sm:text-base"
        >
          {description}
        </p>
      )}
    </div>
  );
}
