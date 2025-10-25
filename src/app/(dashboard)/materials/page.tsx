"use client";

import { useEffect, useState } from "react";
import { Button, Form, message, Popconfirm } from "antd";

import { Material } from "@/types/material";
import MaterialFilters from "./_components/MaterialFilters";
import MaterialsTable from "./_components/MaterialsTable";
import MaterialModal from "./_components/MaterialModal";
import ImportButtons from "./_components/ImportButtons";
import { PlusOutlined } from "@ant-design/icons";

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
    setModalOpen(true);
  }

  // Import from Excel
  // import buttons component will handle file import and template download

  function openEdit(record: Material) {
    setEditing(record);
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

  return (
    <div>
      <div className="flex flex-col gap-4 ">
        <div>
          <h1 className="text-3xl font-bold">Vật tư</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách vật tư của phòng thí nghiệm
          </p>
        </div>

        <div className="flex justify-between mb-6 p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <MaterialFilters filters={filters} setFilters={setFilters} />
          </div>
          <div className=" ml-auto flex gap-2">
            <ImportButtons
              onImported={fetchMaterials}
              setLoading={setLoading}
            />

            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm
            </Button>
          </div>
        </div>
      </div>
      <MaterialsTable
        materials={filteredMaterials}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <MaterialModal
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        editing={editing}
        form={form}
      />
    </div>
  );
}
