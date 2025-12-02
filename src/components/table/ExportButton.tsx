"use client";

import React, { useState } from "react";
import { Dropdown, message } from "antd";
import {
  DownloadOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Button } from "@/components/ui";
import { exportToCSV, exportToExcel, ExportColumn } from "./exportUtils";

interface ExportButtonProps<T = any> {
  data: T[];
  columns: ExportColumn[];
  filename?: string;
  disabled?: boolean;
}

export default function ExportButton<T>({
  data,
  columns,
  filename = "export",
  disabled = false,
}: ExportButtonProps<T>) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: "csv" | "excel") => {
    if (data.length === 0) {
      message.warning("Không có dữ liệu để xuất");
      return;
    }

    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const fullFilename = `${filename}_${timestamp}`;

      if (format === "csv") {
        exportToCSV(data, columns, `${fullFilename}.csv`);
        message.success("Xuất CSV thành công");
      } else {
        exportToExcel(data, columns, `${fullFilename}.xls`);
        message.success("Xuất Excel thành công");
      }
    } catch (error) {
      console.error("Export error:", error);
      message.error("Có lỗi xảy ra khi xuất dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      key: "csv",
      label: "Xuất CSV",
      icon: <FileTextOutlined />,
      onClick: () => handleExport("csv"),
    },
    {
      key: "excel",
      label: "Xuất Excel",
      icon: <FileExcelOutlined />,
      onClick: () => handleExport("excel"),
    },
  ];

  const dropdownContent = (
    <div className="w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1">
      {menuItems.map((item) => (
        <button
          key={item.key}
          onClick={item.onClick}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="text-base">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={["click"]}
      disabled={disabled || loading}
    >
      <Button
        variant="outline"
        size="sm"
        leftIcon={<DownloadOutlined />}
        loading={loading}
        disabled={disabled}
      >
        Xuất dữ liệu
      </Button>
    </Dropdown>
  );
}
