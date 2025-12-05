"use client";

import { useState, useEffect } from "react";
import { Form, Input, message, Upload, Avatar } from "antd";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import BaseModal from "@/components/common/BaseModal";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/lib/apiClient";
import type { UploadFile } from "antd/es/upload/interface";

interface ProfileModalProps {
  open: boolean;
  onCancel: () => void;
}

interface ProfileFormData {
  name: string;
  email: string;
  position?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ProfileModal({ open, onCancel }: ProfileModalProps) {
  const { user, refreshUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar);

  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        position: user.position || "",
      });
      setAvatarUrl(user.avatar);
    }
  }, [open, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const updateData: any = {
        name: values.name,
        email: values.email,
        position: values.position,
      };

      // Only include password if user wants to change it
      if (values.currentPassword && values.newPassword) {
        updateData.currentPassword = values.currentPassword;
        updateData.newPassword = values.newPassword;
      }

      if (avatarUrl && avatarUrl !== user?.avatar) {
        updateData.avatar = avatarUrl;
      }

      const response = await authFetch(
        `/api/user/profile`,
        user!._id!,
        user!.roles,
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Cập nhật thất bại");
      }

      const result = await response.json();

      // Update localStorage with new user data
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      message.success("Cập nhật thông tin thành công!");
      await refreshUser?.(); // Refresh user data in auth context
      onCancel();
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    try {
      // Upload to ImgBB or your image service
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      if (result.success) {
        setAvatarUrl(result.data.url);
        message.success("Tải ảnh lên thành công!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      message.error("Không thể tải ảnh lên");
    }
  };

  return (
    <BaseModal
      open={open}
      onCancel={onCancel}
      title="Thông tin cá nhân"
      size="md"
      customFooter={
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Cập nhật
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="space-y-4">
        {/* Avatar Upload */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Avatar
              size={100}
              src={avatarUrl}
              icon={!avatarUrl && <UserOutlined />}
              className="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                handleAvatarChange(file);
                return false;
              }}
            >
              <button
                type="button"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
                aria-label="Tải ảnh lên"
              >
                <CameraOutlined className="text-sm" />
              </button>
            </Upload>
          </div>
        </div>

        {/* Staff ID (Read-only) */}
        <Form.Item label="Mã nhân viên">
          <Input value={user?.staff_id} disabled />
        </Form.Item>

        {/* Name */}
        <Form.Item
          label="Họ và tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        {/* Email */}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        {/* Position */}
        <Form.Item label="Chức vụ" name="position">
          <Input placeholder="Nhập chức vụ (tùy chọn)" />
        </Form.Item>

        {/* Divider */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* Change Password Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Đổi mật khẩu (tùy chọn)
          </h3>

          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    !value &&
                    (getFieldValue("newPassword") ||
                      getFieldValue("confirmPassword"))
                  ) {
                    return Promise.reject(
                      new Error("Vui lòng nhập mật khẩu hiện tại")
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value && getFieldValue("currentPassword")) {
                    return Promise.reject(
                      new Error("Vui lòng nhập mật khẩu mới")
                    );
                  }
                  if (value && value.length < 6) {
                    return Promise.reject(
                      new Error("Mật khẩu phải có ít nhất 6 ký tự")
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value && getFieldValue("newPassword")) {
                    return Promise.reject(
                      new Error("Vui lòng xác nhận mật khẩu")
                    );
                  }
                  if (value && value !== getFieldValue("newPassword")) {
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp")
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
        </div>
      </Form>
    </BaseModal>
  );
}
