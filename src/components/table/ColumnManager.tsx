"use client";

import React, { useState } from "react";
import { Dropdown, Checkbox } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui";
import { cn } from "@/design-system/utilities";
import { SmartTableColumn } from "./SmartTable";

interface ColumnManagerProps {
  columns: SmartTableColumn[];
  visibleColumns: string[];
  onChange: (visibleColumns: string[]) => void;
}

export default function ColumnManager({
  columns,
  visibleColumns,
  onChange,
}: ColumnManagerProps) {
  const [open, setOpen] = useState(false);

  const toggleColumn = (columnKey: string) => {
    if (visibleColumns.includes(columnKey)) {
      // Don't allow hiding all columns
      if (visibleColumns.length > 1) {
        onChange(visibleColumns.filter((key) => key !== columnKey));
      }
    } else {
      onChange([...visibleColumns, columnKey]);
    }
  };

  const selectAll = () => {
    onChange(columns.map((col) => col.key));
  };

  const resetToDefault = () => {
    onChange(columns.filter((col) => !col.hidden).map((col) => col.key));
  };

  const dropdownContent = (
    <div className="w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Hiển thị cột</h3>
      </div>

      {/* Column List */}
      <div className="max-h-80 overflow-y-auto py-2">
        {columns.map((column) => (
          <label
            key={column.key}
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
          >
            <Checkbox
              checked={visibleColumns.includes(column.key)}
              onChange={() => toggleColumn(column.key)}
            />
            <span className="text-sm text-gray-700">{column.title}</span>
          </label>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="px-3 py-2 border-t border-gray-200 flex gap-2">
        <button
          onClick={selectAll}
          className="flex-1 text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 px-3 rounded hover:bg-blue-50"
        >
          Chọn tất cả
        </button>
        <button
          onClick={resetToDefault}
          className="flex-1 text-xs text-gray-600 hover:text-gray-700 font-medium py-1.5 px-3 rounded hover:bg-gray-100"
        >
          Đặt lại
        </button>
      </div>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={["click"]}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Button variant="outline" size="sm" leftIcon={<SettingOutlined />}>
        Cột hiển thị
      </Button>
    </Dropdown>
  );
}
