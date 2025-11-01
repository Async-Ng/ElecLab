"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { Button, Form, message } from "antd";
import { Material } from "@/types/material";
import { PlusOutlined } from "@ant-design/icons";
import LoadingSpinner from "@/components/LoadingSpinner";

// Lazy load components
const MaterialFilters = lazy(() => import("./_components/MaterialFilters"));
const MaterialsTable = lazy(() => import("./_components/MaterialsTable"));
const MaterialModal = lazy(() => import("./_components/MaterialModal"));
const ImportButtons = lazy(() => import("./_components/ImportButtons"));

interface MaterialsClientProps {
  initialMaterials: Material[];
}

export default function MaterialsClient({
  initialMaterials,
}: MaterialsClientProps) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [filters, setFilters] = useState({ q: "", category: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form] = Form.useForm<Material>();

  // Client-side refresh function
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

  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (mat: Material) => {
    setEditing(mat);
    form.setFieldsValue(mat);
    setModalOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      const response = await fetch(`/api/materials?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        message.success("Xóa thành công");
        fetchMaterials();
      } else {
        const error = await response.json();
        message.error(error.message || "Xóa thất bại");
      }
    } catch (err) {
      message.error("Xóa thất bại");
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values };

      let response;
      if (editing) {
        response = await fetch(`/api/materials?id=${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/materials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        message.success(editing ? "Cập nhật thành công" : "Tạo mới thành công");
        setModalOpen(false);
        fetchMaterials();
      } else {
        const error = await response.json();
        message.error(error.message || "Lưu thất bại");
      }
    } catch (err) {
      message.error("Có lỗi xảy ra");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
        >
          Thêm vật tư mới
        </Button>
        <Suspense
          fallback={<LoadingSpinner fullScreen={false} tip="Đang tải..." />}
        >
          <ImportButtons />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <LoadingSpinner fullScreen={false} tip="Đang tải bộ lọc..." />
        }
      >
        <MaterialFilters filters={filters} setFilters={setFilters} />
      </Suspense>

      <Suspense
        fallback={
          <LoadingSpinner fullScreen={false} tip="Đang tải danh sách..." />
        }
      >
        <MaterialsTable
          materials={filteredMaterials}
          loading={loading}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      </Suspense>

      {modalOpen && (
        <Suspense
          fallback={<LoadingSpinner fullScreen={false} tip="Đang tải..." />}
        >
          <MaterialModal
            open={modalOpen}
            editing={editing}
            form={form}
            onCancel={() => setModalOpen(false)}
            onOk={handleOk}
          />
        </Suspense>
      )}
    </div>
  );
}
