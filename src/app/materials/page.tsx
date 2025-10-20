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

type Material = {
  _id?: string;
  material_id: string;
  name: string;
  category: string;
  status?: string;
  place_used?: string;
};

const { Option } = Select;

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
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
      message.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMaterials();
  }, []);

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
      if (!res.ok) throw new Error("Delete failed");
      message.success("Deleted");
      fetchMaterials();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete");
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
      if (!res.ok) throw new Error("Save failed");
      message.success(editing ? "Updated" : "Created");
      setModalOpen(false);
      fetchMaterials();
    } catch (err: any) {
      console.error(err);
      message.error(err?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { title: "Material ID", dataIndex: "material_id", key: "material_id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Place Used", dataIndex: "place_used", key: "place_used" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Material) => (
        <div className="space-x-2">
          <Button size="small" onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this material?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Materials</h1>
        <Button type="primary" onClick={openCreate}>
          Add Material
        </Button>
      </div>

      <Table
        rowKey={(r: Material) => r._id || r.material_id}
        dataSource={materials}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? "Edit Material" : "Add Material"}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="material_id"
            label="Material ID"
            rules={[{ required: true, message: "Please enter material id" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select>
              <Option value="resistor">Resistor</Option>
              <Option value="capacitor">Capacitor</Option>
              <Option value="ic">IC</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select>
              <Option value="available">Available</Option>
              <Option value="in_use">In use</Option>
              <Option value="broken">Broken</Option>
            </Select>
          </Form.Item>

          <Form.Item name="place_used" label="Place used">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
