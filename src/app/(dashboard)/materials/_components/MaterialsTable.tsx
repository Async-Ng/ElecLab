"use client";

import React, { useMemo, useCallback } from "react";
import { Tag } from "antd";
import { Material } from "@/types/material";
import { DataTable } from "@/components/common";

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
  const handleEdit = useCallback(
    (material: Material) => {
      onEdit(material);
    },
    [onEdit]
  );

  const handleDelete = useCallback(
    (id?: string) => {
      onDelete(id);
    },
    [onDelete]
  );

  const columns = useMemo(
    () => [
      { title: "Mã", dataIndex: "material_id", key: "material_id", width: 100 },
      { title: "Tên", dataIndex: "name", key: "name", width: 600 },
      { title: "Danh mục", dataIndex: "category", key: "category", width: 150 },
      {
        title: "Tình trạng",
        dataIndex: "status",
        key: "status",
        width: 140,
        render: (status: unknown) => {
          const s = String(status || "");
          const color =
            s === "Có sẵn" ? "green" : s === "Đang sử dụng" ? "blue" : "red";
          return <Tag color={color}>{s || "-"}</Tag>;
        },
      },
      {
        title: "Vị trí",
        dataIndex: "place_used",
        key: "place_used",
        width: 240,
        render: (place_used: any) => {
          if (!place_used) return "-";
          if (typeof place_used === "object" && place_used.name)
            return place_used.name;
          return String(place_used);
        },
      },
    ],
    [handleEdit, handleDelete]
  );

  return (
    <DataTable
      data={materials}
      columns={columns}
      onEdit={handleEdit}
      onDelete={(record) => handleDelete(record._id)}
      loading={loading}
    />
  );
});
