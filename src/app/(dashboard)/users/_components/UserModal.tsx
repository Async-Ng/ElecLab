import React, { useState, useEffect, FormEvent } from "react";
import { User } from "@/types/user";
import { Room } from "@/types/room";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Upload from "@/components/ui/Upload";
import Button from "@/components/ui/Button";
import FormField from "@/components/form/FormField";

interface UserModalProps {
  open: boolean;
  loading?: boolean;
  editingUser?: User;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
  roles: { value: string; label: string }[];
  rooms: Room[];
}

const UserModal: React.FC<UserModalProps> = ({
  open,
  loading,
  editingUser,
  onCancel,
  onSubmit,
  roles,
  rooms,
}) => {
  // Form state
  const [formData, setFormData] = useState({
    staff_id: "",
    name: "",
    email: "",
    position: "",
    password: "",
    roles: [] as string[],
    rooms_manage: [] as string[],
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (open) {
      if (editingUser) {
        setFormData({
          staff_id: editingUser.staff_id || "",
          name: editingUser.name || "",
          email: editingUser.email || "",
          position: editingUser.position || "",
          password: "",
          roles: editingUser.roles || [],
          rooms_manage: editingUser.rooms_manage || [],
        });
        setAvatarPreview(editingUser.avatar || "");
        setAvatarFile(null);
      } else {
        setFormData({
          staff_id: "",
          name: "",
          email: "",
          position: "",
          password: "",
          roles: [],
          rooms_manage: [],
        });
        setAvatarPreview("");
        setAvatarFile(null);
      }
      setErrors({});
    }
  }, [open, editingUser]);

  // Handle input changes
  const handleChange = (name: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle avatar upload
  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(editingUser?.avatar || "");
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.staff_id.trim()) {
      newErrors.staff_id = "Vui lòng nhập mã nhân viên!";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên!";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Vui lòng nhập email hợp lệ!";
    }
    if (!editingUser && !formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu!";
    }
    if (formData.roles.length === 0) {
      newErrors.roles = "Vui lòng chọn ít nhất một vai trò!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const submitData = new FormData();
    submitData.append("staff_id", formData.staff_id);
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("position", formData.position || "");
    if (formData.password) submitData.append("password", formData.password);
    submitData.append("roles", JSON.stringify(formData.roles));
    submitData.append("rooms_manage", JSON.stringify(formData.rooms_manage));

    // Convert avatar file to base64 if exists
    if (avatarFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        submitData.append("avatar", reader.result as string);
        onSubmit(submitData);
      };
      reader.readAsDataURL(avatarFile);
    } else {
      onSubmit(submitData);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Avatar
          </label>
          <Upload
            value={avatarFile}
            onChange={handleAvatarChange}
            accept="image/*"
            maxSize={5}
            preview={avatarPreview}
          />
        </div>

        {/* Two column grid for form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Staff ID */}
          <FormField label="Mã nhân viên" required error={errors.staff_id}>
            <Input
              value={formData.staff_id}
              onChange={(e) => handleChange("staff_id", e.target.value)}
              placeholder="Nhập mã nhân viên"
              error={!!errors.staff_id}
            />
          </FormField>

          {/* Name */}
          <FormField label="Họ và tên" required error={errors.name}>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Nhập họ và tên"
              error={!!errors.name}
            />
          </FormField>

          {/* Email */}
          <FormField label="Email" required error={errors.email}>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Nhập email"
              error={!!errors.email}
            />
          </FormField>

          {/* Position */}
          <FormField label="Chức vụ" error={errors.position}>
            <Input
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
              placeholder="Nhập chức vụ"
            />
          </FormField>

          {/* Password - only for new users */}
          {!editingUser && (
            <FormField
              label="Mật khẩu"
              required
              error={errors.password}
              className="md:col-span-2"
            >
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Nhập mật khẩu"
                error={!!errors.password}
              />
            </FormField>
          )}

          {/* Roles */}
          <FormField label="Vai trò" required error={errors.roles}>
            <Select
              mode="multiple"
              value={formData.roles}
              onChange={(value) => handleChange("roles", value as string[])}
              options={roles}
              placeholder="Chọn vai trò"
              error={!!errors.roles}
            />
          </FormField>

          {/* Rooms Manage */}
          <FormField label="Quản lý phòng" error={errors.rooms_manage}>
            <Select
              mode="multiple"
              value={formData.rooms_manage}
              onChange={(value) =>
                handleChange("rooms_manage", value as string[])
              }
              options={rooms.map((room) => ({
                label: room.name,
                value: room._id,
              }))}
              placeholder="Chọn phòng"
            />
          </FormField>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {editingUser ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;
