"use client";

import { useState, lazy, Suspense } from "react";
import { Material } from "@/types/material";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useMaterials } from "@/hooks/stores";
import { useAuth } from "@/hooks/useAuth";
import { authFetch, getApiEndpoint } from "@/lib/apiClient";

// Lazy load components
const MaterialsTable = lazy(() => import("./_components/MaterialsTable"));
const MaterialModal = lazy(() => import("./_components/MaterialModal"));
const ImportButtons = lazy(() => import("./_components/ImportButtons"));

export default function MaterialsClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);

  const { user } = useAuth();

  // Use Zustand store with auto-fetch and caching
  const { materials, loading, deleteMaterial, fetchMaterials } = useMaterials();

  const openCreateModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (mat: Material) => {
    setEditing(mat);
    setModalOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id || !user) return;
    try {
      const endpoint = getApiEndpoint("materials", user.roles);
      const response = await authFetch(endpoint, user._id!, user.roles, {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Xóa thất bại");
      }

      setAlertMessage({ type: "success", message: "Xóa vật tư thành công!" });
      deleteMaterial(id);
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (err: any) {
      setAlertMessage({
        type: "error",
        message: err?.message || "Có lỗi xảy ra khi xóa vật tư",
      });
      setTimeout(() => setAlertMessage(null), 5000);
    }
  };

  const handleSubmit = async (formData: Material) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const payload = editing ? { id: editing._id, ...formData } : formData;

      const endpoint = getApiEndpoint("materials", user.roles);
      const response = await authFetch(endpoint, user._id!, user.roles, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Lưu thất bại");
      }

      setAlertMessage({
        type: "success",
        message: editing
          ? "Cập nhật vật tư thành công!"
          : "Thêm vật tư mới thành công!",
      });
      setTimeout(() => setAlertMessage(null), 3000);
      setModalOpen(false);

      // Refetch materials to get latest data (force bypass cache)
      await fetchMaterials(user._id!, user.roles, true);
    } catch (err: any) {
      setAlertMessage({
        type: "error",
        message: err?.message || "Có lỗi xảy ra khi lưu vật tư",
      });
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Alert Messages */}
      {alertMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Alert
            type={alertMessage.type}
            message={alertMessage.message}
            onClose={() => setAlertMessage(null)}
          />
        </div>
      )}

      <PageHeader
        title="Vật tư thiết bị"
        description="Quản lý danh sách vật tư và thiết bị phòng học"
        extra={
          <div className="flex gap-2">
            <Button variant="primary" onClick={openCreateModal} size="md">
              Thêm vật tư mới
            </Button>
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
          <LoadingSpinner fullScreen={false} tip="Đang tải danh sách..." />
        }
      >
        <MaterialsTable
          materials={materials}
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
            onCancel={() => setModalOpen(false)}
            onSubmit={handleSubmit}
            loading={submitting}
          />
        </Suspense>
      )}
    </div>
  );
}
