"use client";

import { useEffect, useState } from "react";
import { Button, Form, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Room } from "@/types/room";
import RoomTable from "./_components/RoomTable";
import RoomModal from "./_components/RoomModal";

export default function RoomPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form] = Form.useForm<Room>();

  async function fetchRooms() {
    setLoading(true);
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      setRooms(Array.isArray(data.rooms) ? data.rooms : []);
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
      const method = editing ? "PUT" : "POST";
      const payload = editing ? { ...values, _id: editing._id } : values;
      const url = editing ? `/api/rooms/${editing._id}` : "/api/rooms";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error("Lưu thất bại");
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
