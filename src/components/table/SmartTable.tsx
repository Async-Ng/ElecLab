"use client";

import React, { useState, useMemo } from "react";
import { Table, TableProps, Checkbox } from "antd";
import { cn } from "@/design-system/utilities";
import { colors } from "@/design-system/tokens";
import TableCard from "./TableCard";
import BulkActions from "./BulkActions";
import ColumnManager from "./ColumnManager";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export type ViewMode = "table" | "card";
export type ResponsiveConfig = {
  mobile: ViewMode;
  tablet: ViewMode;
  desktop: ViewMode;
};

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
}

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
  pagination = {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total) => `Tổng ${total} bản ghi`,
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

  // Add selection column if bulk actions enabled
  const tableColumns = useMemo(() => {
    if (!enableBulkActions) return filteredColumns;

    const selectionColumn: any = {
      key: "selection",
      width: 50,
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
        />
      ),
    };

    return [selectionColumn, ...filteredColumns];
  }, [enableBulkActions, filteredColumns, selectedRowKeys, data]);

  const selectedRows = useMemo(() => {
    return data.filter((item) =>
      selectedRowKeys.includes(item._id || item.key || "")
    );
  }, [data, selectedRowKeys]);

  const handleClearSelection = () => {
    setSelectedRowKeys([]);
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

        {/* Card List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Không có dữ liệu
          </div>
        ) : (
          data.map((record, index) => (
            <TableCard
              key={record._id || record.key || index}
              record={record}
              columns={filteredColumns}
              config={cardConfig}
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
              className={rowClassName?.(record, index)}
            />
          ))
        )}
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

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table
          columns={tableColumns as any}
          dataSource={data}
          rowKey={(record) => record._id || record.key || ""}
          loading={loading}
          pagination={pagination}
          scroll={{ x: "max-content" }}
          onRow={(record, index) => ({
            onClick: () => onRowClick?.(record),
            className: cn(
              onRowClick && "cursor-pointer hover:bg-blue-50",
              rowClassName?.(record, index || 0)
            ),
          })}
          {...restProps}
        />
      </div>
    </div>
  );
}
