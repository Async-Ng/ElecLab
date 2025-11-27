"use client";

import { useState, lazy, Suspense, useMemo } from "react";
import { Form, message } from "antd";
import { Room } from "@/types/room";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PageHeader, ActionButtons } from "@/components/common";
import { useRooms, useUsers } from "@/hooks/stores";

// Lazy load components
const RoomTable = lazy(() => import("./_components/RoomTable"));
const RoomModal = lazy(() => import("./_components/RoomModal"));

export default function RoomsClient() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form] = Form.useForm<Room>();

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
  const {
    rooms,
    updateRoom,
    deleteRoom: removeRoom,
    fetchRooms,
  } = useRooms({
    userRole: user?.roles?.[0],
    // Don't pass userId for admin page - should fetch all rooms
  });
  const { users } = useUsers();

  function openCreate() {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  }

  function openEdit(record: Room) {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Xóa thất bại");
      }

      message.success("Xóa phòng thành công!");
      removeRoom(id);
    } catch (err: any) {
      message.error(err?.message || "Có lỗi xảy ra khi xóa phòng");
    }
  }

  async function handleOk() {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/rooms/${editing._id}` : "/api/rooms";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lưu thất bại");
      }

      const savedRoom = await res.json();

      message.success(
        editing ? "Cập nhật phòng thành công!" : "Thêm phòng mới thành công!"
      );
      setModalOpen(false);

      // Refetch rooms to get latest data (force bypass cache)
      await fetchRooms(user?.roles?.[0], user?._id, true);
    } catch (err: any) {
      message.error(err?.message || "Có lỗi xảy ra khi lưu phòng");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: "24px" }}>
      <PageHeader
        title="Phòng học"
        description="Quản lý danh sách phòng học và thiết bị"
        extra={<ActionButtons onAdd={openCreate} addText="Thêm phòng mới" />}
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
            onOk={handleOk}
            onCancel={() => setModalOpen(false)}
            editing={editing}
            form={form}
            users={users}
            loading={submitting}
          />
        </Suspense>
      )}
    </div>
  );
}
