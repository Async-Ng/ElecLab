"use client";

import { useEffect, useState } from "react";
import { Button, Form, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Room } from "@/types/room";
import { User } from "@/types/user";
import RoomTable from "./_components/RoomTable";
import RoomModal from "./_components/RoomModal";

export default function RoomPage() {
  const [rooms, setRooms] = useState<(Room & { users_manage?: User[] })[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form] = Form.useForm<Room>();

  async function fetchRooms() {
    setLoading(true);
    try {
      // Get user info from localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        message.error("Vui lòng đăng nhập lại");
        return;
      }

      const user = JSON.parse(userStr);
      const queryParams = new URLSearchParams({
        userId: user._id,
        userRole: user.roles[0], // Assuming first role is primary
      }).toString();

      const res = await fetch(`/api/rooms?${queryParams}`);
      if (!res.ok) {
        throw new Error("Không có quyền truy cập");
      }
      const data = await res.json();
      // Đảm bảo users_manage là mảng User[] hoặc []
      const roomsData = Array.isArray(data.rooms) ? data.rooms : [];
      const roomsWithUsers = roomsData.map((room: any) => ({
        ...room,
        users_manage: Array.isArray(room.users_manage)
          ? room.users_manage.filter((u: any) => typeof u === "object")
          : [],
      }));
      setRooms(roomsWithUsers);
    } catch (err) {
      console.error(err);
      message.error("Tải danh sách phòng thất bại");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRooms();
  }, []);

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
      setLoading(true);
      const res = await fetch(`/api/rooms/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      message.success("Đã xóa phòng");
      fetchRooms();
    } catch (err) {
      console.error(err);
      message.error("Xóa phòng thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function handleOk() {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Get user info from localStorage
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("Vui lòng đăng nhập lại");
      }

      const user = JSON.parse(userStr);
      const queryParams = new URLSearchParams({
        userId: user._id,
        userRole: user.roles[0], // Assuming first role is primary
      }).toString();

      const method = editing ? "PUT" : "POST";
      let payload;
      let url;
      if (editing) {
        payload = { ...values, _id: editing._id };
        url = `/api/rooms/${editing._id}`;
      } else {
        payload = { ...values };
        delete payload._id; // Xóa _id nếu có
        url = `/api/rooms?${queryParams}`;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lưu thất bại");
      }

      message.success(editing ? "Đã cập nhật phòng" : "Đã thêm phòng");
      setModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      console.error(err);
      message.error(err?.message || "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Phòng thí nghiệm</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách phòng thí nghiệm
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm phòng
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <RoomTable
          rooms={rooms}
          loading={loading}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </div>

      <RoomModal
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        editing={editing}
        form={form}
      />
    </div>
  );
}
