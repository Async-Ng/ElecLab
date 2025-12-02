"use client";

import React, { useState, useMemo } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Button from "@/components/ui/Button";
import { Material, MaterialCategory, MaterialStatus } from "@/types/material";
import {
  SmartTable,
  SmartTableColumn,
  FilterBar,
  FilterConfig,
  FilterValues,
  ExportButton,
  ExportColumn,
} from "@/components/table";
import { Badge } from "@/components/ui";

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

  // Get status badge variant
  const getStatusVariant = (status?: MaterialStatus) => {
    switch (status) {
      case MaterialStatus.AVAILABLE:
        return "success";
      case MaterialStatus.IN_USE:
        return "primary";
      case MaterialStatus.BROKEN:
        return "error";
      default:
        return "secondary";
    }
  };

  // Get category badge variant
  const getCategoryVariant = (category?: MaterialCategory) => {
    switch (category) {
      case MaterialCategory.EQUIPMENT:
        return "info";
      case MaterialCategory.CONSUMABLE:
        return "warning";
      default:
        return "secondary";
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
  const columns: SmartTableColumn<Material>[] = [
    {
      key: "material_id",
      title: "Mã vật tư",
      dataIndex: "material_id",
      width: 120,
      mobile: true,
      sorter: (a, b) => a.material_id.localeCompare(b.material_id),
    },
    {
      key: "name",
      title: "Tên vật tư",
      dataIndex: "name",
      mobile: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      key: "category",
      title: "Danh mục",
      dataIndex: "category",
      width: 160,
      mobile: true,
      render: (category: MaterialCategory) => (
        <Badge variant={getCategoryVariant(category)}>{category}</Badge>
      ),
    },
    {
      key: "status",
      title: "Tình trạng",
      dataIndex: "status",
      width: 140,
      mobile: true,
      render: (status: MaterialStatus) => (
        <Badge variant={getStatusVariant(status)} dot>
          {status || "-"}
        </Badge>
      ),
    },
    {
      key: "place_used",
      title: "Vị trí",
      dataIndex: "place_used",
      width: 200,
      mobile: true,
      render: (place_used: string | { name?: string } | undefined) =>
        getPlaceName(place_used),
    },
    {
      key: "actions",
      title: "Thao tác",
      width: 150,
      fixed: "right",
      render: (_: any, record: Material) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(record)}>
            <EditOutlined /> Sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(record._id)}
          >
            <DeleteOutlined /> Xóa
          </Button>
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
      <SmartTable
        data={filteredMaterials}
        columns={columns}
        loading={loading}
        responsive={{
          mobile: "card",
          tablet: "table",
          desktop: "table",
        }}
        enableColumnManager
        cardConfig={{
          title: (record) => record.name,
          subtitle: (record) => `Mã: ${record.material_id}`,
          badge: (record) => (
            <Badge variant={getStatusVariant(record.status)} dot>
              {record.status || "-"}
            </Badge>
          ),
          actions: (record) => (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(record)}
              >
                <EditOutlined /> Sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(record._id)}
              >
                <DeleteOutlined /> Xóa
              </Button>
            </div>
          ),
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} vật tư`,
        }}
      />
    </div>
  );
});
