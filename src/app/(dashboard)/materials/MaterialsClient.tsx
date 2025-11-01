"use client";

import { useState, lazy, Suspense, useMemo } from "react";
import { Form, message } from "antd";
import { Material } from "@/types/material";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PageHeader, ActionButtons } from "@/components/common";
import { useMaterials } from "@/hooks/stores";

// Lazy load components
const MaterialFilters = lazy(() => import("./_components/MaterialFilters"));
const MaterialsTable = lazy(() => import("./_components/MaterialsTable"));
const MaterialModal = lazy(() => import("./_components/MaterialModal"));
const ImportButtons = lazy(() => import("./_components/ImportButtons"));

export default function MaterialsClient() {
  const [filters, setFilters] = useState({ q: "", category: "", status: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form] = Form.useForm<Material>();
  const [submitting, setSubmitting] = useState(false);

  // Use Zustand store with auto-fetch and caching
  const { materials, loading, updateMaterial, deleteMaterial, fetchMaterials } =
    useMaterials();

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
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
  }, [materials, filters]);

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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Xóa thất bại");
      }

      message.success("Xóa vật tư thành công!");
      deleteMaterial(id);
    } catch (err: any) {
      message.error(err?.message || "Có lỗi xảy ra khi xóa vật tư");
    }
  };

  const handleOk = async () => {
    setSubmitting(true);
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Lưu thất bại");
      }

      const savedMaterial = await response.json();
      message.success(
        editing ? "Cập nhật vật tư thành công!" : "Thêm vật tư mới thành công!"
      );
      setModalOpen(false);

      // Refetch materials to get latest data (force bypass cache)
      await fetchMaterials(true);
    } catch (err: any) {
      message.error(err?.message || "Có lỗi xảy ra khi lưu vật tư");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <PageHeader
        title="Vật tư thiết bị"
        description="Quản lý danh sách vật tư và thiết bị phòng học"
        extra={
          <div style={{ display: "flex", gap: 8 }}>
            <ActionButtons onAdd={openCreateModal} addText="Thêm vật tư mới" />
            <Suspense
              fallback={<LoadingSpinner fullScreen={false} tip="Đang tải..." />}
            >
              <ImportButtons />
            </Suspense>
          </div>
        }
      />

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
            loading={submitting}
          />
        </Suspense>
      )}
    </div>
  );
}
