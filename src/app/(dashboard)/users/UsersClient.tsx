"use client";

import { useState, lazy, Suspense } from "react";
import { message } from "antd";
import { User, UserFormData, UserRole } from "@/types/user";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PageHeader, ActionButtons } from "@/components/common";
import { useUsers, useRooms } from "@/hooks/stores";

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

export default function UsersClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();

  // Use Zustand stores with auto-fetch and caching
  const { users, loading: usersLoading, updateUser, deleteUser: removeUser } = useUsers();
  const { rooms } = useRooms();

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
      removeUser(id);
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

      const savedUser = await response.json();

      message.success(
        editingUser
          ? "Cập nhật người dùng thành công"
          : "Tạo người dùng thành công"
      );
      
      if (editingUser && editingUser._id) {
        updateUser(editingUser._id, savedUser);
      } else {
        // Force refetch for new user
        window.location.reload();
      }
      
      setModalOpen(false);
    } catch (error: any) {
      message.error(error.message || "Lỗi khi lưu người dùng");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <PageHeader
        title="Giảng viên"
        description="Quản lý danh sách giảng viên trong hệ thống"
        extra={<ActionButtons onAdd={handleCreate} addText="Thêm giảng viên" />}
      />

      <Suspense
        fallback={<LoadingSpinner tip="Đang tải danh sách giảng viên..." />}
      >
        <UsersTable
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={usersLoading}
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
              const rolesString = formData.get("roles") as string;
              const roomsString = formData.get("rooms_manage") as string;

              const userFormData: any = {
                staff_id: formData.get("staff_id"),
                name: formData.get("name"),
                email: formData.get("email"),
                password: formData.get("password"),
                position: formData.get("position"),
                roles: rolesString ? JSON.parse(rolesString) : [],
                rooms_manage: roomsString ? JSON.parse(roomsString) : [],
              };

              // Handle avatar
              const avatarFile = formData.get("avatar");
              if (avatarFile && avatarFile instanceof File) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  userFormData.avatar = reader.result;
                  handleSave(userFormData);
                };
                reader.readAsDataURL(avatarFile);
              } else {
                handleSave(userFormData);
              }
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
