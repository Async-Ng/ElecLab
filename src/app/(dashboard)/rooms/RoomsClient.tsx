"use client";

import { useState, lazy, Suspense, useMemo } from "react";
import { Room } from "@/types/room";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useRooms, useUsers } from "@/hooks/stores";
import { authFetch, getApiEndpoint } from "@/lib/apiClient";

// Lazy load components
const RoomTable = lazy(() => import("./_components/RoomTable"));
const RoomModal = lazy(() => import("./_components/RoomModal"));

export default function RoomsClient() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);

  // Get user info from localStorage - memoized to prevent re-calculation
  const user = useMemo(() => {
    const userStr =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }, []);

  // Use Zustand stores with auto-fetch and caching
  const { rooms, updateRoom, deleteRoom: removeRoom, fetchRooms } = useRooms();
  const { users } = useUsers();

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(record: Room) {
    setEditing(record);
    setModalOpen(true);
  }

  async function handleDelete(id?: string) {
    if (!id || !user) return;
    try {
      const endpoint = getApiEndpoint("rooms", user.roles);
      const res = await authFetch(`${endpoint}/${id}`, user._id, user.roles, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Xóa thất bại");
      }

      setAlertMessage({ type: "success", message: "Xóa phòng thành công!" });
      removeRoom(id);
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (err: any) {
      setAlertMessage({
        type: "error",
        message: err?.message || "Có lỗi xảy ra khi xóa phòng",
      });
      setTimeout(() => setAlertMessage(null), 5000);
    }
  }

  async function handleSubmit(formData: Room) {
    if (!user) return;
    setSubmitting(true);
    try {
      const method = editing ? "PUT" : "POST";
      const endpoint = getApiEndpoint("rooms", user.roles);
      const url = editing ? `${endpoint}/${editing._id}` : endpoint;

      const res = await authFetch(url, user._id, user.roles, {
        method,
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lưu thất bại");
      }

      const savedRoom = await res.json();

      setAlertMessage({
        type: "success",
        message: editing
          ? "Cập nhật phòng thành công!"
          : "Thêm phòng mới thành công!",
      });
      setTimeout(() => setAlertMessage(null), 3000);
      setModalOpen(false);

      // Refetch rooms to get latest data (force bypass cache)
      await fetchRooms(user.roles?.[0], user._id, true);
    } catch (err: any) {
      setAlertMessage({
        type: "error",
        message: err?.message || "Có lỗi xảy ra khi lưu phòng",
      });
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      setSubmitting(false);
    }
  }

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
        title="Phòng học"
        description="Quản lý danh sách phòng học và thiết bị"
        extra={
          <Button variant="primary" onClick={openCreate} size="md">
            Thêm phòng mới
          </Button>
        }
      />

      <Suspense
        fallback={
          <LoadingSpinner
            fullScreen={false}
            tip="Đang tải danh sách phòng..."
          />
        }
      >
        <RoomTable
          rooms={rooms}
          loading={loading}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </Suspense>

      {modalOpen && (
        <Suspense
          fallback={<LoadingSpinner fullScreen={false} tip="Đang tải..." />}
        >
          <RoomModal
            open={modalOpen}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
            editing={editing}
            users={users}
            loading={submitting}
            onDelete={handleDelete}
          />
        </Suspense>
      )}
    </div>
  );
}
