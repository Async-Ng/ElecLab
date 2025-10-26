"use client";

import { useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { User, UserFormData, UserRole } from "@/types/user";
import { Room } from "@/types/room";

interface UserModalProps {
  open: boolean;
  loading?: boolean;
  editingUser?: User;
  onCancel: () => void;
  onSubmit: (values: UserFormData) => void;
  roles: { value: string; label: string }[];
  rooms: Room[];
}

export const UserModal = ({
  open,
  loading,
  editingUser,
  onCancel,
  onSubmit,
  roles,
  rooms,
}: UserModalProps) => {
  const [form] = Form.useForm<UserFormData>();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      // Đảm bảo roles là value enum UserRole
      if (Array.isArray(values.roles)) {
        values.roles = values.roles.map((role) => {
          // Nếu role là key của enum thì chuyển sang giá trị enum
          if (Object.prototype.hasOwnProperty.call(UserRole, role)) {
            return (UserRole as Record<string, UserRole>)[role];
          }
          // Nếu đã là giá trị enum thì giữ nguyên
          if (Object.values(UserRole).includes(role as UserRole)) {
            return role as UserRole;
          }
          return role as UserRole;
        }) as UserRole[];
      }
      onSubmit(values);
    });
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (editingUser) {
        form.setFieldsValue(editingUser);
      } else {
        form.setFieldsValue({
          staff_id: "",
          name: "",
          email: "",
          password: "",
          roles: [],
          rooms_manage: [],
        });
      }
    }
    // Do not call form.resetFields() when modal closes to avoid warning
  }, [open, editingUser, form]);

  return (
    <Modal
      open={open}
      title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {editingUser ? "Cập nhật" : "Tạo mới"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        {loading && (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <span>Đang tải dữ liệu...</span>
          </div>
        )}
        <Form.Item
          name="staff_id"
          label="Mã nhân viên"
          rules={[{ required: true, message: "Vui lòng nhập mã nhân viên!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên"
          rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Vui lòng nhập email hợp lệ!" },
          ]}
        >
          <Input />
        </Form.Item>

        {!editingUser && (
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password />
          </Form.Item>
        )}

        <Form.Item
          name="roles"
          label="Vai trò"
          rules={[
            { required: true, message: "Vui lòng chọn ít nhất một vai trò!" },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Chọn vai trò"
            options={Object.entries(UserRole).map(([key, label]) => ({
              value: key,
              label,
            }))}
            optionLabelProp="label"
          />
        </Form.Item>

        <Form.Item name="rooms_manage" label="Quản lý phòng">
          <Select
            mode="multiple"
            placeholder="Chọn phòng"
            options={rooms.map((room) => ({
              label: room.name,
              value: room._id,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
