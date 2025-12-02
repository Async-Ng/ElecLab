"use client";

import React from "react";
import { Checkbox, Tooltip } from "antd";
import { cn } from "@/design-system/utilities";
import { SmartTableColumn, SmartTableAction } from "./SmartTable";
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
  actions?: SmartTableAction<T>[]; // Standardized actions from SmartTable
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick?: () => void;
  className?: string;
}

/**
 * TableCard - Mobile-optimized card view for table rows
 *
 * Features:
 * - Large touch targets (44px+)
 * - Clear visual hierarchy
 * - Automatic field rendering
 * - Action buttons at bottom
 */
export default function TableCard<T>({
  record,
  columns,
  config,
  actions,
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

  return (
    <Card
      className={cn(
        "relative transition-all duration-200",
        selected && "ring-2 ring-blue-500 bg-blue-50",
        onClick && "cursor-pointer hover:shadow-md",
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
              <div key={column.key} className="flex justify-between gap-3">
                <span className="text-sm font-medium text-gray-600">
                  {column.title}:
                </span>
                <span className="text-sm text-gray-900 text-right flex-1">
                  {renderFieldValue(column)}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      )}

      {/* Actions - Standardized action buttons with large touch targets */}
      {(config?.actions || actions) && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
          {config?.actions
            ? config.actions(record)
            : actions?.map((action) => {
                const isDisabled = action.disabled?.(record) || false;
                const button = (
                  <button
                    key={action.key}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDisabled) action.onClick(record);
                    }}
                    disabled={isDisabled}
                    className={cn(
                      "flex items-center justify-center gap-2",
                      "px-4 py-2.5 min-h-[44px]", // Large touch target
                      "rounded-lg transition-all duration-200",
                      "border text-sm font-medium",
                      !isDisabled &&
                        !action.danger &&
                        "border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600",
                      !isDisabled &&
                        action.danger &&
                        "border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400",
                      isDisabled &&
                        "opacity-40 cursor-not-allowed border-gray-200 text-gray-400"
                    )}
                    aria-label={action.label}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                );

                return action.tooltip && !isDisabled ? (
                  <Tooltip key={action.key} title={action.tooltip}>
                    {button}
                  </Tooltip>
                ) : (
                  button
                );
              })}
        </div>
      )}
    </Card>
  );
}
