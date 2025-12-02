"use client";

import React from "react";
import { Checkbox } from "antd";
import { cn } from "@/design-system/utilities";
import { SmartTableColumn } from "./SmartTable";
import Card, { CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui";

interface TableCardProps<T> {
  record: T;
  columns: SmartTableColumn<T>[];
  config?: {
    title?: (record: T) => React.ReactNode;
    subtitle?: (record: T) => React.ReactNode;
    avatar?: (record: T) => React.ReactNode;
    badge?: (record: T) => React.ReactNode;
    actions?: (record: T) => React.ReactNode;
  };
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick?: () => void;
  className?: string;
}

export default function TableCard<T>({
  record,
  columns,
  config,
  selected = false,
  onSelect,
  onClick,
  className,
}: TableCardProps<T>) {
  const renderFieldValue = (column: SmartTableColumn<T>) => {
    const dataIndex = column.dataIndex;
    let value: any;

    if (Array.isArray(dataIndex)) {
      value = dataIndex.reduce((obj, key) => obj?.[key], record as any);
    } else if (dataIndex) {
      value = (record as any)[dataIndex];
    }

    if (column.renderCard) {
      return column.renderCard(value, record);
    }

    if (column.render) {
      return column.render(value, record, 0);
    }

    return value?.toString() || "-";
  };

  const mobileColumns = columns.filter(
    (col) => col.mobile !== false && col.key !== "actions"
  );
  const actionsColumn = columns.find((col) => col.key === "actions");

  return (
    <Card
      className={cn(
        "relative transition-all duration-200",
        selected && "ring-2 ring-blue-500 bg-blue-50",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-3 left-3 z-10">
          <Checkbox
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Card Header */}
      <div className={cn("flex items-start gap-3", onSelect && "pl-8")}>
        {/* Avatar */}
        {config?.avatar && (
          <div className="flex-shrink-0">{config.avatar(record)}</div>
        )}

        {/* Title & Subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {config?.title && (
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {config.title(record)}
                </h3>
              )}
              {config?.subtitle && (
                <p className="text-sm text-gray-600 mt-0.5">
                  {config.subtitle(record)}
                </p>
              )}
            </div>

            {/* Badge */}
            {config?.badge && (
              <div className="flex-shrink-0">{config.badge(record)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Card Body - Field Data */}
      {mobileColumns.length > 0 && (
        <CardBody className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-2">
            {mobileColumns.map((column) => (
              <div key={column.key} className="flex justify-between gap-2">
                <span className="text-sm font-medium text-gray-600">
                  {column.title}:
                </span>
                <span className="text-sm text-gray-900 text-right">
                  {renderFieldValue(column)}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      )}

      {/* Actions */}
      {(config?.actions || actionsColumn) && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
          {config?.actions
            ? config.actions(record)
            : actionsColumn?.render?.(null, record, 0)}
        </div>
      )}
    </Card>
  );
}
