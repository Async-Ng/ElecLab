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
          width: 150,
          fixed: "right" as const,
          render: (_: any, record: T) => {
            if (customActions) {
              return customActions(record);
            }

            return (
              <Space size="small">
                {onEdit && (
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(record)}
                  >
                    {editText}
                  </Button>
                )}
                {onDelete && (
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(record)}
                  >
                    {deleteText}
                  </Button>
                )}
              </Space>
            );
          },
        }
      : null;

  const finalColumns = actionColumn ? [...columns, actionColumn] : columns;

  // Build scroll config - only y scroll, x will fit to container
  const scrollConfig = scrollY ? { y: scrollY } : undefined;

  return (
    <div style={{ width: "100%" }}>
      <Table
        columns={finalColumns}
        dataSource={data}
        rowKey={(record) => record._id || record.key || ""}
        loading={loading}
        pagination={pagination}
        scroll={scrollConfig}
        {...restProps}
      />
    </div>
  );
}
