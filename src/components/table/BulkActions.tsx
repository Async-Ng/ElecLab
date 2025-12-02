"use client";

import React from "react";
import { Button } from "@/components/ui";
import { cn } from "@/design-system/utilities";
import { CloseOutlined } from "@ant-design/icons";

interface BulkAction<T = any> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedKeys: React.Key[], selectedRows: T[]) => void;
  danger?: boolean;
}

interface BulkActionsProps<T = any> {
  selectedCount: number;
  actions: BulkAction<T>[];
  selectedKeys: React.Key[];
  selectedRows: T[];
  onClear: () => void;
}

export default function BulkActions<T>({
  selectedCount,
  actions,
  selectedKeys,
  selectedRows,
  onClear,
}: BulkActionsProps<T>) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between gap-4">
      {/* Selection Info */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-blue-900">
          Đã chọn {selectedCount} mục
        </span>
        <button
          onClick={onClear}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Bỏ chọn
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {actions.map((action) => (
          <Button
            key={action.key}
            variant={action.danger ? "danger" : "outline"}
            size="sm"
            leftIcon={action.icon}
            onClick={() => action.onClick(selectedKeys, selectedRows)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
