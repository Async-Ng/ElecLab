"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { Button, Form, message, Popconfirm } from "antd";

import { Material } from "@/types/material";
import { PlusOutlined } from "@ant-design/icons";
import LoadingSpinner from "@/components/LoadingSpinner";

// Lazy load components
const MaterialFilters = lazy(() => import("./_components/MaterialFilters"));
const MaterialsTable = lazy(() => import("./_components/MaterialsTable"));
const MaterialModal = lazy(() => import("./_components/MaterialModal"));
const ImportButtons = lazy(() => import("./_components/ImportButtons"));

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filters, setFilters] = useState({ q: "", category: "", status: "" });
  const [loading, setLoading] = useState(true);
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
      message.error(err?.message || "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  }

  if (loading && materials.length === 0) {
    return <LoadingSpinner tip="Đang tải danh sách vật tư..." />;
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
            <Suspense
              fallback={
                <LoadingSpinner size="small" tip="Đang tải bộ lọc..." />
              }
            >
              <MaterialFilters filters={filters} setFilters={setFilters} />
            </Suspense>
          </div>
          <div className=" ml-auto flex gap-2">
            <Suspense fallback={null}>
              <ImportButtons
                onImported={fetchMaterials}
                setLoading={setLoading}
              />
            </Suspense>

            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm
            </Button>
          </div>
        </div>
      </div>
      <Suspense fallback={<LoadingSpinner tip="Đang tải bảng dữ liệu..." />}>
        <MaterialsTable
          materials={filteredMaterials}
          loading={loading}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </Suspense>

      {modalOpen && (
        <Suspense fallback={null}>
          <MaterialModal
            open={modalOpen}
            onOk={handleOk}
            onCancel={() => setModalOpen(false)}
            editing={editing}
            form={form}
          />
        </Suspense>
      )}
    </div>
  );
}
