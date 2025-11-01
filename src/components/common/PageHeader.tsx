import React from "react";
import { Typography } from "antd";

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
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <Title level={level} style={{ margin: 0 }}>
          {title}
        </Title>
        {extra && <div className="flex items-center gap-2">{extra}</div>}
      </div>
      {description && <p className="text-gray-600 mt-2">{description}</p>}
    </div>
  );
}
