"use client";

import React from "react";
import { Button, Space } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

interface StaffFilterBarProps {
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export default function StaffFilterBar({
  onPrevWeek,
  onNextWeek,
}: StaffFilterBarProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px",
        backgroundColor: "#fafafa",
        borderRadius: "4px",
      }}
    >
      <div style={{ flex: 1 }} />
      <Space>
        <Button icon={<LeftOutlined />} onClick={onPrevWeek}>
          Tuần trước
        </Button>
        <Button icon={<RightOutlined />} onClick={onNextWeek}>
          Tuần sau
        </Button>
      </Space>
    </div>
  );
}
