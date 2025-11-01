"use client";
import React from "react";
import { Button, Space } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

interface StaffFilterBarProps {
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}

export default function StaffFilterBar({
  onPrevWeek,
  onNextWeek,
}: StaffFilterBarProps) {
  return (
    <Space
      size="small"
      style={{ marginBottom: 12 }}
      className="sm:size-middle sm:mb-4 flex-wrap"
    >
      {onPrevWeek && (
        <Button
          icon={<LeftOutlined />}
          onClick={onPrevWeek}
          size="small"
          className="sm:size-middle"
        >
          <span className="hidden sm:inline">Tuần trước</span>
          <span className="sm:hidden">Trước</span>
        </Button>
      )}
      {onNextWeek && (
        <Button
          icon={<RightOutlined />}
          onClick={onNextWeek}
          size="small"
          className="sm:size-middle"
        >
          <span className="hidden sm:inline">Tuần sau</span>
          <span className="sm:hidden">Sau</span>
        </Button>
      )}
    </Space>
  );
}
