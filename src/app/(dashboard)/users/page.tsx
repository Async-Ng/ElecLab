"use client";

import { useEffect, useState } from "react";
import { Button, Card, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { UsersTable } from "./_components/UsersTable";
import { UserModal } from "./_components/UserModal";
import { User, UserFormData, UserRole } from "@/types/user";

const availableRoles = [
  { value: UserRole.Lecture, label: UserRole.Lecture },
  { value: UserRole.Head_of_deparment, label: UserRole.Head_of_deparment },
];

import { Room } from "@/types/room";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }
      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách phòng");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRooms();
  }, []);

  const handleCreate = () => {
    setEditingUser(undefined);
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      await fetchUsers();
      message.success("Xóa người dùng thành công");
    } catch (error) {
      message.error("Xóa người dùng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: UserFormData) => {
    try {
      setLoading(true);
      if (editingUser) {
        const response = await fetch(`/api/users/${editingUser._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to update user");
        }

        message.success("Cập nhật người dùng thành công");
      } else {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create user");
        }

        message.success("Tạo người dùng thành công");
      }

      setModalOpen(false);
      await fetchUsers();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("Lưu người dùng thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Giảng viên</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách giảng viên
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm giảng viên
        </Button>
      </div>

      <UsersTable
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rooms={rooms}
      />
      <UserModal
        open={modalOpen}
        loading={loading}
        editingUser={editingUser}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        roles={availableRoles}
        rooms={rooms}
      />
    </div>
  );
}
