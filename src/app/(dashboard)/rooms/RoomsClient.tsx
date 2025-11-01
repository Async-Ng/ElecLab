"use client";

import { useState, lazy, Suspense, useMemo } from "react";
import { Form, message } from "antd";
import { Room } from "@/types/room";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PageHeader, ActionButtons } from "@/components/common";
import { useRooms, useUsers } from "@/hooks/stores";
import { useAuth } from "@/hooks/useAuth";
import { authFetch, getApiEndpoint } from "@/lib/apiClient";

// Lazy load components
const RoomTable = lazy(() => import("./_components/RoomTable"));
const RoomModal = lazy(() => import("./_components/RoomModal"));

export default function RoomsClient() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form] = Form.useForm<Room>();

  // Get user from auth hook
  const { user } = useAuth();

  // Use Zustand stores with auto-fetch and caching
  const { rooms, deleteRoom: removeRoom, fetchRooms } = useRooms();
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
    if (!id || !user) return;
    try {
      const endpoint = `${getApiEndpoint("rooms", user.roles)}`;
      const res = await authFetch(endpoint, user._id!, user.roles, {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });

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
    if (!user) return;
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const payload = editing ? { id: editing._id, ...values } : values;

      const endpoint = getApiEndpoint("rooms", user.roles);
      const res = await authFetch(endpoint, user._id!, user.roles, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lưu thất bại");
      }

      message.success(
        editing ? "Cập nhật phòng thành công!" : "Thêm phòng mới thành công!"
      );
      setModalOpen(false);

      // Refetch rooms to get latest data (force bypass cache)
      await fetchRooms(user._id!, user.roles, true);
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
