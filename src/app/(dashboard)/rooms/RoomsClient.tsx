"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { Button, Form, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Room } from "@/types/room";
import { User } from "@/types/user";
import LoadingSpinner from "@/components/LoadingSpinner";

// Lazy load components
const RoomTable = lazy(() => import("./_components/RoomTable"));
const RoomModal = lazy(() => import("./_components/RoomModal"));

interface RoomsClientProps {
  initialRooms: (Room & { users_manage?: User[] })[];
  initialUsers: User[];
}

export default function RoomsClient({
  initialRooms,
  initialUsers,
}: RoomsClientProps) {
  const [rooms, setRooms] =
    useState<(Room & { users_manage?: User[] })[]>(initialRooms);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form] = Form.useForm<Room>();

  async function fetchRooms() {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        message.error("Vui lòng đăng nhập lại");
        return;
      }

      const user = JSON.parse(userStr);
      const queryParams = new URLSearchParams({
        userId: user._id,
        userRole: user.roles[0],
      }).toString();

      const res = await fetch(`/api/rooms?${queryParams}`);
      if (!res.ok) {
        throw new Error("Không có quyền truy cập");
      }
      const data = await res.json();
      const roomsData = Array.isArray(data.rooms) ? data.rooms : [];
      const roomsWithUsers = roomsData.map((room: any) => ({
        ...room,
        users_manage: Array.isArray(room.users_manage)
          ? room.users_manage.filter((u: any) => typeof u === "object")
          : [],
      }));
      setRooms(roomsWithUsers);

      const resUsers = await fetch("/api/users");
      if (resUsers.ok) {
        const dataUsers = await resUsers.json();
        setUsers(Array.isArray(dataUsers) ? dataUsers : []);
      }
    } catch (err) {
      message.error("Tải danh sách phòng thất bại");
    } finally {
      setLoading(false);
    }
  }

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
      if (!res.ok) throw new Error("Xóa thất bại");
      message.success("Đã xóa");
      fetchRooms();
    } catch (err) {
      message.error("Xóa thất bại");
    }
  }

  async function handleOk() {
    try {
      const values = await form.validateFields();
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/rooms/${editing._id}` : "/api/rooms";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Lưu thất bại");
      message.success(editing ? "Đã cập nhật" : "Đã tạo");
      setModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      message.error(err?.message || "Lưu thất bại");
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm phòng mới
        </Button>
      </div>

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
          />
        </Suspense>
      )}
    </div>
  );
}
