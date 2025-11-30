"use client";

import { useState, lazy, Suspense } from "react";
import { message } from "antd";
import { User, UserFormData, UserRole, UserRoleLabels } from "@/types/user";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PageHeader, ActionButtons } from "@/components/common";
import { useUsers, useRooms } from "@/hooks/stores";
import { useAuth } from "@/hooks/useAuth";
import { authFetch, getApiEndpoint } from "@/lib/apiClient";

// Lazy load components
const UsersTable = lazy(() =>
  import("./_components/UsersTable").then((module) => ({
    default: module.UsersTable,
  }))
);
const UserModal = lazy(() => import("./_components/UserModal"));

const availableRoles = [
  { value: UserRole.User, label: UserRoleLabels[UserRole.User] },
  { value: UserRole.Admin, label: UserRoleLabels[UserRole.Admin] },
];

export default function UsersClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();

  // Use Zustand stores with auto-fetch and caching
  const {
    users,
    loading: usersLoading,
    deleteUser: removeUser,
    fetchUsers,
  } = useUsers();
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
    if (!user) return;
    try {
      const endpoint = getApiEndpoint("users", user.roles);
      const response = await authFetch(endpoint, user._id!, user.roles, {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        let errorMessage = "Xóa thất bại";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          // If response is not valid JSON, use status text
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      message.success("Xóa giảng viên thành công!");
      removeUser(id);
    } catch (error: any) {
      message.error(error?.message || "Có lỗi xảy ra khi xóa giảng viên");
    }
  };

  const handleSave = async (formData: UserFormData) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const payload = editingUser
        ? { id: editingUser._id, ...formData }
        : formData;

      const endpoint = getApiEndpoint("users", user.roles);
      const response = await authFetch(endpoint, user._id!, user.roles, {
        method: editingUser ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = "Lưu thất bại";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          // If response is not valid JSON, use status text
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      // Try to parse success response
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        // If response is not JSON, just continue
        responseData = null;
      }

      message.success(
        editingUser
          ? "Cập nhật giảng viên thành công!"
          : "Thêm giảng viên mới thành công!"
      );

      setModalOpen(false);

      // Refetch users to get latest data (force bypass cache)
      await fetchUsers(user._id!, user.roles, true);
    } catch (error: any) {
      message.error(error.message || "Có lỗi xảy ra khi lưu giảng viên");
    } finally {
      setSubmitting(false);
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
            loading={submitting}
            editingUser={editingUser}
            onSubmit={(formData) => {
              // Convert FormData to UserFormData
              const rolesString = formData.get("roles") as string;
              const roomsString = formData.get("rooms_manage") as string;

              console.log("FormData received:", {
                staff_id: formData.get("staff_id"),
                name: formData.get("name"),
                email: formData.get("email"),
                rolesString,
                roomsString,
              });

              let roles = [];
              let rooms_manage = [];

              try {
                roles = rolesString ? JSON.parse(rolesString) : [];
              } catch (e) {
                console.error("Error parsing roles:", e, rolesString);
                roles = [];
              }

              try {
                rooms_manage = roomsString ? JSON.parse(roomsString) : [];
              } catch (e) {
                console.error("Error parsing rooms_manage:", e, roomsString);
                rooms_manage = [];
              }

              const userFormData: any = {
                staff_id: formData.get("staff_id"),
                name: formData.get("name"),
                email: formData.get("email"),
                password: formData.get("password"),
                position: formData.get("position"),
                roles,
                rooms_manage,
              };

              // Avatar is already base64 or string from UserModal
              const avatar = formData.get("avatar");
              if (avatar && typeof avatar === "string") {
                userFormData.avatar = avatar;
              }

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
