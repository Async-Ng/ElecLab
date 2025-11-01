"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { User, UserFormData, UserRole } from "@/types/user";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Room } from "@/types/room";

// Lazy load components
const UsersTable = lazy(() =>
  import("./_components/UsersTable").then((module) => ({
    default: module.UsersTable,
  }))
);
const UserModal = lazy(() => import("./_components/UserModal"));

const availableRoles = [
  { value: UserRole.User, label: "Người dùng" },
  { value: UserRole.Admin, label: "Quản lý" },
];

interface UsersClientProps {
  initialUsers: User[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
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
      if (Array.isArray(data)) {
        data.forEach((u) => {
          if (u.avatar) {
            // Avatar handling if needed
          }
        });
      }
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
      const roomsData = data.rooms || [];
      setRooms(roomsData);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  useEffect(() => {
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
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      message.success("Xóa người dùng thành công");
      fetchUsers();
    } catch (error) {
      message.error("Lỗi khi xóa người dùng");
    }
  };

  const handleSave = async (formData: UserFormData) => {
    try {
      const url = editingUser ? `/api/users/${editingUser._id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save user");
      }

      message.success(
        editingUser
          ? "Cập nhật người dùng thành công"
          : "Tạo người dùng thành công"
      );
      setModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      message.error(error.message || "Lỗi khi lưu người dùng");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
          Giảng viên
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm giảng viên
        </Button>
      </div>

      <Suspense
        fallback={<LoadingSpinner tip="Đang tải danh sách giảng viên..." />}
      >
        <UsersTable
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          rooms={rooms}
        />
      </Suspense>

      {modalOpen && (
        <Suspense
          fallback={<LoadingSpinner fullScreen={false} tip="Đang tải..." />}
        >
          <UserModal
            open={modalOpen}
            editingUser={editingUser}
            onSubmit={(formData) => {
              // Convert FormData to UserFormData
              const userFormData: any = {
                staff_id: formData.get("staff_id"),
                name: formData.get("name"),
                email: formData.get("email"),
                password: formData.get("password"),
                roles: [formData.get("roles")],
                rooms_manage: formData.getAll("rooms_manage"),
              };
              handleSave(userFormData);
            }}
            onCancel={() => setModalOpen(false)}
            roles={availableRoles}
            rooms={rooms}
          />
        </Suspense>
      )}
    </div>
  );
}
