"use client";

import React, { useState, useMemo } from "react";
import { EditOutlined, DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import { Table, Tag, Popconfirm, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import Button from "@/components/ui/Button";
import { Material, MaterialCategory, MaterialStatus } from "@/types/material";
import {
  FilterBar,
  FilterConfig,
  FilterValues,
  ExportButton,
  ExportColumn,
} from "@/components/table";

type Props = {
  materials: Material[];
  loading: boolean;
  onEdit: (m: Material) => void;
  onDelete: (id?: string) => void;
};

export default React.memo(function MaterialsTable({
  materials,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    category: undefined,
    status: undefined,
  });

  // Filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      key: "search",
      label: "Tìm kiếm",
      type: "search",
      placeholder: "Tìm theo mã, tên vật tư...",
    },
    {
      key: "category",
      label: "Danh mục",
      type: "select",
      options: [
        { label: "Thiết bị cố định", value: MaterialCategory.EQUIPMENT },
        { label: "Vật tư tiêu hao", value: MaterialCategory.CONSUMABLE },
      ],
    },
    {
      key: "status",
      label: "Tình trạng",
      type: "select",
      options: [
        { label: "Có sẵn", value: MaterialStatus.AVAILABLE },
        { label: "Đang sử dụng", value: MaterialStatus.IN_USE },
        { label: "Hư hỏng", value: MaterialStatus.BROKEN },
      ],
    },
  ];

  // Apply filters
  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          material.material_id?.toLowerCase().includes(searchLower) ||
          material.name?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && material.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status && material.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [materials, filters]);

  // Get status tag color and text
  const getStatusTag = (status?: MaterialStatus) => {
    switch (status) {
      case MaterialStatus.AVAILABLE:
        return { color: "success", text: "Có sẵn" };
      case MaterialStatus.IN_USE:
        return { color: "processing", text: "Đang sử dụng" };
      case MaterialStatus.BROKEN:
        return { color: "error", text: "Hư hỏng" };
      default:
        return { color: "default", text: "-" };
    }
  };

  // Get category tag color
  const getCategoryTag = (category?: MaterialCategory) => {
    switch (category) {
      case MaterialCategory.EQUIPMENT:
        return { color: "blue", text: "Thiết bị cố định" };
      case MaterialCategory.CONSUMABLE:
        return { color: "orange", text: "Vật tư tiêu hao" };
      default:
        return { color: "default", text: "-" };
    }
  };

  // Get place name
  const getPlaceName = (place_used?: string | { name?: string }) => {
    if (!place_used) return "-";
    if (typeof place_used === "object" && place_used.name)
      return place_used.name;
    return String(place_used);
  };

  // Table columns
  const columns: ColumnsType<Material> = [
    {
      title: "Mã vật tư",
      dataIndex: "material_id",
      key: "material_id",
      width: 140,
      sorter: (a, b) => a.material_id.localeCompare(b.material_id),
      render: (value: string) => (
        <span style={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}>
          {value}
        </span>
      ),
    },
    {
      title: "Tên vật tư",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value: string) => (
        <span style={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}>
          {value}
        </span>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 180,
      render: (category: MaterialCategory) => {
        const { color, text } = getCategoryTag(category);
        return (
          <Tag color={color} style={{ fontSize: "14px", padding: "4px 12px" }}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status: MaterialStatus) => {
        const { color, text } = getStatusTag(status);
        return (
          <Tag color={color} style={{ fontSize: "14px", padding: "4px 12px" }}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Vị trí sử dụng",
      dataIndex: "place_used",
      key: "place_used",
      width: 180,
      render: (place_used: string | { name?: string } | undefined) => (
        <span style={{ color: "#334155", fontSize: "15px" }}>
          {getPlaceName(place_used)}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      fixed: "right" as const,
      render: (_: any, record: Material) => (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            style={{
              fontSize: "15px",
              height: "40px",
              paddingLeft: "16px",
              paddingRight: "16px",
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa vật tư"
            description="Bạn chắc chắn muốn xóa vật tư này?"
            onConfirm={() => onDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              style={{
                fontSize: "15px",
                height: "40px",
                paddingLeft: "16px",
                paddingRight: "16px",
              }}
            >
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Export columns configuration
  const exportColumns: ExportColumn[] = [
    { key: "material_id", header: "Mã vật tư", accessor: "material_id" },
    { key: "name", header: "Tên vật tư", accessor: "name" },
    { key: "category", header: "Danh mục", accessor: "category" },
    { key: "status", header: "Tình trạng", accessor: "status" },
    {
      key: "place_used",
      header: "Vị trí",
      accessor: (row: Material) => getPlaceName(row.place_used),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <FilterBar
        filters={filterConfigs}
        values={filters}
        onChange={setFilters}
        extra={
          <ExportButton
            data={filteredMaterials}
            columns={exportColumns}
            filename="vat-tu-thiet-bi"
          />
        }
      />

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredMaterials}
        rowKey={(record) => record._id || ""}
        loading={loading}
        size="middle"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} vật tư`,
          pageSizeOptions: ["10", "20", "50"],
        }}
        rowClassName={(_, index) =>
          index % 2 === 0 ? "bg-white" : "bg-slate-50"
        }
        locale={{
          emptyText: (
            <Empty
              image={
                <InboxOutlined style={{ fontSize: 64, color: "#94A3B8" }} />
              }
              imageStyle={{ height: 80 }}
              description={
                <div style={{ color: "#64748B", fontSize: "16px" }}>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                    Chưa có vật tư nào
                  </div>
                  <div style={{ fontSize: "14px" }}>
                    Thêm vật tư mới để bắt đầu quản lý
                  </div>
                </div>
              }
            />
          ),
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
});
