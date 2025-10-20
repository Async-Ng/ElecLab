"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
} from "antd";

import { Material, MaterialCategory, MaterialStatus } from "@/types/material";

const { Option } = Select;

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filters, setFilters] = useState({ q: "", category: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form] = Form.useForm<Material>();

  async function fetchMaterials() {
    setLoading(true);
    try {
      const res = await fetch("/api/materials");
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      message.error("Tải danh sách vật tư thất bại");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMaterials();
  }, []);

  const filteredMaterials = materials.filter((m) => {
    const q = filters.q.trim().toLowerCase();
    if (q) {
      const inId = m.material_id?.toLowerCase().includes(q);
      const inName = m.name?.toLowerCase().includes(q);
      if (!inId && !inName) return false;
    }
    if (filters.category) {
      if ((m.category || "") !== filters.category) return false;
    }
    if (filters.status) {
      if ((m.status || "") !== filters.status) return false;
    }
    return true;
  });

  function openCreate() {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  }

  function openEdit(record: Material) {
    setEditing(record);
    form.setFieldsValue(record as any);
    setModalOpen(true);
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch("/api/materials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      message.success("Đã xóa");
      fetchMaterials();
    } catch (err) {
      console.error(err);
      message.error("Xóa thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function handleOk() {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const method = editing ? "PUT" : "POST";
      const payload = editing ? { id: editing._id, ...values } : values;
      const res = await fetch("/api/materials", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Lưu thất bại");
      message.success(editing ? "Đã cập nhật" : "Đã tạo");
      setModalOpen(false);
      fetchMaterials();
    } catch (err: any) {
      console.error(err);
      message.error(err?.message || "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { title: "Mã vật tư", dataIndex: "material_id", key: "material_id" },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Danh mục", dataIndex: "category", key: "category" },
    { title: "Tình trạng", dataIndex: "status", key: "status" },
    { title: "Vị trí sử dụng", dataIndex: "place_used", key: "place_used" },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: Material) => (
        <div className="space-x-2">
          <Button size="small" onClick={() => openEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa vật tư này?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Vật tư</h1>
        <Button type="primary" onClick={openCreate}>
          Thêm vật tư
        </Button>
      </div>

      <div className="mb-4 bg-white dark:bg-black p-4 rounded shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Input
            placeholder="Tìm theo mã hoặc tên"
            value={filters.q}
            onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))}
            style={{ maxWidth: 320 }}
          />

          <Select
            placeholder="Lọc theo danh mục"
            value={filters.category || undefined}
            onChange={(val) =>
              setFilters((s) => ({ ...s, category: val || "" }))
            }
            allowClear
            style={{ minWidth: 180 }}
          >
            {Object.values(MaterialCategory).map((v) => (
              <Option key={v} value={v}>
                {v}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Lọc theo tình trạng"
            value={filters.status || undefined}
            onChange={(val) => setFilters((s) => ({ ...s, status: val || "" }))}
            allowClear
            style={{ minWidth: 180 }}
          >
            {Object.values(MaterialStatus).map((v) => (
              <Option key={v} value={v}>
                {v}
              </Option>
            ))}
          </Select>

          <div className="ml-auto">
            <Button
              onClick={() => setFilters({ q: "", category: "", status: "" })}
            >
              Đặt lại
            </Button>
          </div>
        </div>
      </div>

      <Table
        rowKey={(r: Material) => r._id || r.material_id}
        dataSource={filteredMaterials}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? "Chỉnh sửa vật tư" : "Thêm vật tư"}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText="Lưu"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="material_id"
            label="Mã vật tư"
            rules={[{ required: true, message: "Vui lòng nhập mã vật tư" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select>
              {Object.values(MaterialCategory).map((v) => (
                <Option key={v} value={v}>
                  {v}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Tình trạng">
            <Select>
              {Object.values(MaterialStatus).map((v) => (
                <Option key={v} value={v}>
                  {v}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="place_used" label="Vị trí sử dụng">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
