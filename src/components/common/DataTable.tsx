import React from "react";
import { Table, TableProps, Button, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface DataTableProps<T> extends TableProps<T> {
  data: T[];
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  editText?: string;
  deleteText?: string;
  showActions?: boolean;
  customActions?: (record: T) => React.ReactNode;
  loading?: boolean;
  scrollY?: number | string; // Custom scroll y value for vertical scrolling
}

export default function DataTable<
  T extends { _id?: string; key?: string | number }
>({
  data,
  columns = [],
  onEdit,
  onDelete,
  editText = "Chỉnh sửa",
  deleteText = "Xóa",
  showActions = true,
  customActions,
  loading = false,
  scrollY,
  pagination = {
    pageSize: 10,
    showTotal: (total) => `Tổng ${total} bản ghi`,
  },
  ...restProps
}: DataTableProps<T>) {
  const actionColumn =
    showActions && (onEdit || onDelete || customActions)
      ? {
          title: "Thao tác",
          key: "actions",
          width: 180,
          fixed: "right" as const,
          render: (_: any, record: T) => {
            if (customActions) {
              return customActions(record);
            }

            return (
              <Space size="small" className="flex-wrap">
                {onEdit && (
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(record)}
                    className="min-h-[44px] sm:min-h-0"
                  >
                    <span className="hidden sm:inline">{editText}</span>
                  </Button>
                )}
                {onDelete && (
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(record)}
                    className="min-h-[44px] sm:min-h-0"
                  >
                    <span className="hidden sm:inline">{deleteText}</span>
                  </Button>
                )}
              </Space>
            );
          },
        }
      : null;

  const finalColumns = actionColumn ? [...columns, actionColumn] : columns;

  // Build scroll config - responsive horizontal scroll for mobile
  const scrollConfig = {
    x: "max-content", // Horizontal scroll on small screens
    ...(scrollY ? { y: scrollY } : {}),
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <Table
              columns={finalColumns}
              dataSource={data}
              rowKey={(record) => record._id || record.key || ""}
              loading={loading}
              pagination={{
                ...pagination,
                className: "px-4 sm:px-0",
                responsive: true,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
              }}
              scroll={scrollConfig}
              className="min-w-full"
              {...restProps}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
