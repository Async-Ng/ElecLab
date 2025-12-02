"use client";

import React, { useState, useMemo } from "react";
import { EditOutlined, DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Material, MaterialCategory, MaterialStatus } from "@/types/material";
import {
  FilterBar,
  FilterConfig,
  FilterValues,
  ExportButton,
  ExportColumn,
  SmartTable,
  SmartTableColumn,
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

  // Table columns for SmartTable
  const columns: SmartTableColumn<Material>[] = [
    {
      key: "material_id",
      title: "Mã vật tư",
      dataIndex: "material_id",
      width: "15%",
      mobile: true,
      render: (value: string) => (
        <span className="font-semibold text-gray-800 text-[15px]">{value}</span>
      ),
    },
    {
      key: "name",
      title: "Tên vật tư",
      dataIndex: "name",
      width: "25%",
      mobile: true,
      render: (value: string) => (
        <span className="font-semibold text-gray-800 text-[15px]">{value}</span>
      ),
    },
    {
      key: "category",
      title: "Danh mục",
      dataIndex: "category",
      width: "18%",
      mobile: true,
      render: (category: MaterialCategory) => {
        const variant =
          category === MaterialCategory.EQUIPMENT ? "info" : "warning";
        const text =
          category === MaterialCategory.EQUIPMENT
            ? "Thiết bị cố định"
            : "Vật tư tiêu hao";
        return (
          <Badge variant={variant} size="md">
            {text}
          </Badge>
        );
      },
    },
    {
      key: "status",
      title: "Tình trạng",
      dataIndex: "status",
      width: "16%",
      mobile: true,
      isStatus: true,
      render: (status: MaterialStatus) => {
        let variant: "success" | "info" | "danger" = "success";
        let text = "Có sẵn";
        if (status === MaterialStatus.IN_USE) {
          variant = "info";
          text = "Đang sử dụng";
        } else if (status === MaterialStatus.BROKEN) {
          variant = "danger";
          text = "Hư hỏng";
        }
        return (
          <Badge variant={variant} size="md">
            {text}
          </Badge>
        );
      },
    },
    {
      key: "place_used",
      title: "Vị trí sử dụng",
      dataIndex: "place_used",
      width: "18%",
      render: (place_used: string | { name?: string } | undefined) => (
        <span className="text-gray-700 text-[15px]">
          {getPlaceName(place_used)}
        </span>
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
      <SmartTable
        columns={columns}
        data={filteredMaterials}
        loading={loading}
        rowKey="_id"
        emptyState={{
          title: "Chưa có vật tư nào",
          description: "Thêm vật tư mới để bắt đầu quản lý",
          illustration: "search",
          icon: <InboxOutlined />,
        }}
        stickyHeader
        zebraStriping
        cardConfig={{
          title: (record) => record.name,
          subtitle: (record) => `Mã: ${record.material_id}`,
          meta: (record) => getPlaceName(record.place_used),
          badge: (record) => {
            let variant: "success" | "info" | "danger" = "success";
            let text = "Có sẵn";
            if (record.status === MaterialStatus.IN_USE) {
              variant = "info";
              text = "Đang sử dụng";
            } else if (record.status === MaterialStatus.BROKEN) {
              variant = "danger";
              text = "Hư hỏng";
            }
            return (
              <Badge variant={variant} size="sm">
                {text}
              </Badge>
            );
          },
        }}
        actions={[
          {
            key: "edit",
            label: "Sửa",
            icon: <EditOutlined />,
            onClick: onEdit,
            tooltip: "Chỉnh sửa vật tư",
          },
          {
            key: "delete",
            label: "Xóa",
            icon: <DeleteOutlined />,
            onClick: (record) => {
              if (window.confirm("Bạn chắc chắn muốn xóa vật tư này?")) {
                onDelete(record._id);
              }
            },
            danger: true,
            tooltip: "Xóa vật tư",
          },
        ]}
      />
    </div>
  );
});
