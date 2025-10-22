"use client";

import React from "react";
import { Table, Button, Popconfirm, Tag, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Material } from "@/types/material";

type Props = {
  materials: Material[];
  loading: boolean;
  onEdit: (m: Material) => void;
  onDelete: (id?: string) => void;
};

export default function MaterialsTable({
  materials,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const columns = [
    { title: "Mã", dataIndex: "material_id", key: "material_id", width: 160 },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Danh mục", dataIndex: "category", key: "category", width: 200 },
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
      width: 180,
      render: (place_used: any) => {
        if (!place_used) return "-";
        if (typeof place_used === "object" && place_used.name)
          return place_used.name;
        return String(place_used);
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 160,
      render: (_: unknown, record: Material) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => onDelete(record._id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey={(r: Material) => r._id || r.material_id}
      dataSource={materials}
      columns={columns}
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
}
