"use client";

import React, { useState, useMemo } from "react";
import { Table, TableProps, Checkbox, Tooltip } from "antd";
import { cn } from "@/design-system/utilities";
import { colors, spacing } from "@/design-system/tokens";
import { brandColors } from "@/styles/theme";
import TableCard from "./TableCard";
import BulkActions from "./BulkActions";
import ColumnManager from "./ColumnManager";
import EmptyState, { EmptyIllustrations } from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";

export type ViewMode = "table" | "card";
export type ResponsiveConfig = {
  mobile: ViewMode;
  tablet: ViewMode;
  desktop: ViewMode;
};

/**
 * Status mapping for automatic Badge rendering
 * Maps common status values to Badge variants
 */
export const STATUS_BADGE_MAP: Record<
  string,
  { variant: any; label?: string }
> = {
  // Success states
  "Hoàn thành": { variant: "success", label: "Hoàn thành" },
  Completed: { variant: "success", label: "Hoàn thành" },
  Approved: { variant: "success", label: "Đã duyệt" },
  "Đã duyệt": { variant: "success", label: "Đã duyệt" },
  Active: { variant: "success", label: "Hoạt động" },
  "Hoạt động": { variant: "success", label: "Hoạt động" },

  // Warning states
  Pending: { variant: "warning", label: "Chờ duyệt" },
  "Chờ duyệt": { variant: "warning", label: "Chờ duyệt" },
  "In Progress": { variant: "warning", label: "Đang xử lý" },
  "Đang xử lý": { variant: "warning", label: "Đang xử lý" },
  Processing: { variant: "warning", label: "Đang xử lý" },

  // Error states
  Rejected: { variant: "error", label: "Từ chối" },
  "Từ chối": { variant: "error", label: "Từ chối" },
  Failed: { variant: "error", label: "Thất bại" },
  "Thất bại": { variant: "error", label: "Thất bại" },
  Cancelled: { variant: "error", label: "Đã hủy" },
  "Đã hủy": { variant: "error", label: "Đã hủy" },
  Inactive: { variant: "error", label: "Không hoạt động" },

  // Info states
  Draft: { variant: "info", label: "Nháp" },
  Nháp: { variant: "info", label: "Nháp" },
  New: { variant: "info", label: "Mới" },
  Mới: { variant: "info", label: "Mới" },
};

/**
 * Helper function to render status as Badge
 */
export function renderStatusBadge(status: string | undefined | null) {
  if (!status) return "-";

  const statusStr = String(status);
  const badgeConfig = STATUS_BADGE_MAP[statusStr];

  if (badgeConfig) {
    return (
      <Badge variant={badgeConfig.variant} size="md">
        {badgeConfig.label || statusStr}
      </Badge>
    );
  }

  // Default badge for unmapped statuses
  return (
    <Badge variant="default" size="md">
      {statusStr}
    </Badge>
  );
}

export interface SmartTableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: string | string[];
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: number | string;
  sorter?: boolean | ((a: T, b: T) => number);
  filters?: Array<{ text: string; value: any }>;
  fixed?: "left" | "right";
  hidden?: boolean;
  mobile?: boolean; // Show in mobile card view
  renderCard?: (value: any, record: T) => React.ReactNode; // Custom card render
  isStatus?: boolean; // Auto-render as Badge if true
  align?: "left" | "center" | "right";
}

export interface SmartTableAction<T> {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: (record: T) => void;
  danger?: boolean;
  disabled?: (record: T) => boolean;
  tooltip?: string;
}

export interface SmartTableProps<T> extends Omit<TableProps<T>, "columns"> {
  data: T[];
  columns: SmartTableColumn<T>[];
  responsive?: ResponsiveConfig;
  enableBulkActions?: boolean;
  bulkActions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedKeys: React.Key[], selectedRows: T[]) => void;
    danger?: boolean;
  }>;
  enableColumnManager?: boolean;
  cardConfig?: {
    title?: (record: T) => React.ReactNode;
    subtitle?: (record: T) => React.ReactNode;
    avatar?: (record: T) => React.ReactNode;
    badge?: (record: T) => React.ReactNode;
    actions?: (record: T) => React.ReactNode;
  };
  onRowClick?: (record: T) => void;
  rowClassName?: (record: T, index: number) => string;
  actions?: SmartTableAction<T>[]; // Standardized action buttons
  emptyState?: {
    title?: string;
    description?: string;
    illustration?: React.ReactNode;
    action?: React.ReactNode;
  };
  stickyHeader?: boolean; // Enable sticky table header
  zebraStriping?: boolean; // Enable zebra striping (default: true)
}

/**
 * SmartTable - Advanced Data Table Component
 *
 * Features:
 * ✅ Mobile-First: Auto-switches to card view on mobile
 * ✅ Visual Status: Automatic Badge rendering for status columns
 * ✅ Empty State: Friendly empty state with illustrations
 * ✅ Zebra Striping: Alternating row colors for readability
 * ✅ Clickable Rows: Full row click support
 * ✅ Sticky Header: Header stays visible on scroll
 * ✅ Large Touch Targets: 44px+ for action buttons
 * ✅ Accessible: Full keyboard navigation and ARIA labels
 */
export default function SmartTable<
  T extends { _id?: string; key?: string | number }
>({
  data,
  columns: initialColumns,
  responsive = {
    mobile: "card",
    tablet: "table",
    desktop: "table",
  },
  enableBulkActions = false,
  bulkActions = [],
  enableColumnManager = false,
  cardConfig,
  onRowClick,
  rowClassName,
  actions,
  emptyState,
  stickyHeader = true,
  zebraStriping = true,
  pagination = {
    pageSize: 10,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
    position: ["bottomRight"],
    size: "default",
    showQuickJumper: true,
  },
  loading = false,
  ...restProps
}: SmartTableProps<T>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    initialColumns.map((col) => col.key)
  );

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Determine current view mode
  const viewMode: ViewMode = useMemo(() => {
    if (isMobile) return responsive.mobile;
    if (isTablet) return responsive.tablet;
    if (isDesktop) return responsive.desktop;
    return "table";
  }, [isMobile, isTablet, isDesktop, responsive]);

  // Filter columns based on visibility
  const filteredColumns = useMemo(() => {
    return initialColumns.filter(
      (col) => !col.hidden && visibleColumns.includes(col.key)
    );
  }, [initialColumns, visibleColumns]);

  // Process columns with automatic status badge rendering
  const processedColumns = useMemo(() => {
    return filteredColumns.map((col) => {
      if (col.isStatus && !col.render) {
        return {
          ...col,
          render: (value: any) => renderStatusBadge(value),
        };
      }
      return col;
    });
  }, [filteredColumns]);

  // Add actions column if actions are provided
  const columnsWithActions = useMemo(() => {
    if (!actions || actions.length === 0) return processedColumns;

    const actionsColumn: SmartTableColumn<T> = {
      key: "actions",
      title: "Thao tác",
      align: "center",
      fixed: "right",
      width: Math.max(actions.length * 48 + 16, 120),
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          {actions.map((action) => {
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
                  "flex items-center justify-center",
                  "w-10 h-10 min-w-[40px] min-h-[40px]", // Large touch targets
                  "rounded-lg transition-all duration-200",
                  "border border-transparent",
                  !isDisabled &&
                    !action.danger &&
                    "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600",
                  !isDisabled &&
                    action.danger &&
                    "hover:bg-red-50 hover:border-red-200 hover:text-red-600",
                  isDisabled && "opacity-40 cursor-not-allowed",
                  action.danger ? "text-red-600" : "text-gray-600"
                )}
                aria-label={action.label}
              >
                {action.icon}
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
      ),
    };

    return [...processedColumns, actionsColumn];
  }, [processedColumns, actions]);

  // Add selection column if bulk actions enabled
  const tableColumns = useMemo(() => {
    if (!enableBulkActions) return columnsWithActions;

    const selectionColumn: any = {
      key: "selection",
      width: 60,
      fixed: "left",
      title: (
        <Checkbox
          checked={selectedRowKeys.length === data.length && data.length > 0}
          indeterminate={
            selectedRowKeys.length > 0 && selectedRowKeys.length < data.length
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRowKeys(
                data.map((item) => item._id || item.key || "")
              );
            } else {
              setSelectedRowKeys([]);
            }
          }}
        />
      ),
      render: (_: any, record: T) => (
        <Checkbox
          checked={selectedRowKeys.includes(record._id || record.key || "")}
          onChange={(e) => {
            const key = record._id || record.key || "";
            if (e.target.checked) {
              setSelectedRowKeys([...selectedRowKeys, key]);
            } else {
              setSelectedRowKeys(selectedRowKeys.filter((k) => k !== key));
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    };

    return [selectionColumn, ...columnsWithActions];
  }, [enableBulkActions, columnsWithActions, selectedRowKeys, data]);

  const selectedRows = useMemo(() => {
    return data.filter((item) =>
      selectedRowKeys.includes(item._id || item.key || "")
    );
  }, [data, selectedRowKeys]);

  const handleClearSelection = () => {
    setSelectedRowKeys([]);
  };

  // Default zebra striping row class
  const defaultRowClassName = (record: T, index: number) => {
    const customClass = rowClassName?.(record, index) || "";
    const zebraClass = zebraStriping && index % 2 === 1 ? "bg-gray-50" : "";
    return cn(zebraClass, customClass);
  };

  // Render card view for mobile
  if (viewMode === "card") {
    return (
      <div className="space-y-4">
        {/* Bulk Actions */}
        {enableBulkActions && selectedRowKeys.length > 0 && (
          <BulkActions
            selectedCount={selectedRowKeys.length}
            actions={bulkActions}
            selectedKeys={selectedRowKeys}
            selectedRows={selectedRows}
            onClear={handleClearSelection}
          />
        )}

        {/* Column Manager */}
        {enableColumnManager && (
          <div className="flex justify-end">
            <ColumnManager
              columns={initialColumns}
              visibleColumns={visibleColumns}
              onChange={setVisibleColumns}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && data.length === 0 && (
          <EmptyState
            title={emptyState?.title || "Chưa có dữ liệu"}
            description={
              emptyState?.description ||
              "Hiện tại chưa có bản ghi nào. Hãy thêm mới để bắt đầu."
            }
            illustration={
              emptyState?.illustration || <EmptyIllustrations.NoData />
            }
            action={emptyState?.action}
          />
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Card List */}
        {!loading &&
          data.length > 0 &&
          data.map((record, index) => (
            <TableCard
              key={record._id || record.key || index}
              record={record}
              columns={processedColumns}
              config={cardConfig}
              actions={actions}
              selected={selectedRowKeys.includes(
                record._id || record.key || ""
              )}
              onSelect={
                enableBulkActions
                  ? (selected) => {
                      const key = record._id || record.key || "";
                      if (selected) {
                        setSelectedRowKeys([...selectedRowKeys, key]);
                      } else {
                        setSelectedRowKeys(
                          selectedRowKeys.filter((k) => k !== key)
                        );
                      }
                    }
                  : undefined
              }
              onClick={() => onRowClick?.(record)}
              className={defaultRowClassName(record, index)}
            />
          ))}
      </div>
    );
  }

  // Render table view
  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {enableBulkActions && selectedRowKeys.length > 0 && (
        <BulkActions
          selectedCount={selectedRowKeys.length}
          actions={bulkActions}
          selectedKeys={selectedRowKeys}
          selectedRows={selectedRows}
          onClear={handleClearSelection}
        />
      )}

      {/* Column Manager */}
      {enableColumnManager && (
        <div className="flex justify-end">
          <ColumnManager
            columns={initialColumns}
            visibleColumns={visibleColumns}
            onChange={setVisibleColumns}
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && data.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <EmptyState
            title={emptyState?.title || "Chưa có dữ liệu"}
            description={
              emptyState?.description ||
              "Hiện tại chưa có bản ghi nào. Hãy thêm mới để bắt đầu."
            }
            illustration={
              emptyState?.illustration || <EmptyIllustrations.NoData />
            }
            action={emptyState?.action}
          />
        </div>
      )}

      {/* Table */}
      {(loading || data.length > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table
            columns={tableColumns as any}
            dataSource={data}
            rowKey={(record) => record._id || record.key || ""}
            loading={loading}
            pagination={pagination}
            scroll={{ x: "max-content" }}
            sticky={stickyHeader}
            onRow={(record, index) => ({
              onClick: (e) => {
                // Don't trigger row click if clicking on action buttons or checkboxes
                const target = e.target as HTMLElement;
                if (
                  target.closest("button") ||
                  target.closest(".ant-checkbox-wrapper")
                ) {
                  return;
                }
                onRowClick?.(record);
              },
              className: cn(
                onRowClick &&
                  "cursor-pointer hover:bg-blue-50 transition-colors",
                defaultRowClassName(record, index || 0)
              ),
            })}
            {...restProps}
          />
        </div>
      )}
    </div>
  );
}
