import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  tip?: string;
  size?: "small" | "default" | "large";
}

export default function LoadingSpinner({
  fullScreen = false,
  tip = "Đang tải...",
  size = "large",
}: LoadingSpinnerProps) {
  const antIcon = (
    <LoadingOutlined
      style={{ fontSize: size === "large" ? 48 : size === "default" ? 32 : 24 }}
      spin
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-50">
        <Spin indicator={antIcon} size={size} />
        <p className="mt-4 text-gray-600 font-medium">{tip}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      <Spin indicator={antIcon} size={size} />
      <p className="mt-4 text-gray-600 font-medium">{tip}</p>
    </div>
  );
}
