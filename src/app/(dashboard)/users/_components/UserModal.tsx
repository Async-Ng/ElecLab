import React, { useState, useEffect, FormEvent } from "react";
import { User } from "@/types/user";
import { Room } from "@/types/room";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Upload from "@/components/ui/Upload";
import Button from "@/components/ui/Button";
import FormField from "@/components/common/FormField";
import {
  UserOutlined,
  MailOutlined,
  BarcodeOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  HomeOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";

interface UserModalProps {
  open: boolean;
  loading?: boolean;
  editingUser?: User;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
  roles: { value: string; label: string }[];
  rooms: Room[];
  onDelete?: (id?: string) => void;
}

const UserModal: React.FC<UserModalProps> = ({
  open,
  loading,
  editingUser,
  onCancel,
  onSubmit,
  roles,
  rooms,
  onDelete,
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
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            {editingUser ? (
              <EditOutlined className="text-purple-600 text-lg" />
            ) : (
              <PlusOutlined className="text-purple-600 text-lg" />
            )}
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
            </div>
            <div className="text-xs text-gray-500">
              {editingUser
                ? "Cập nhật thông tin người dùng"
                : "Tạo tài khoản người dùng mới"}
            </div>
          </div>
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Thông tin cá nhân */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold text-base">
              <UserOutlined className="text-xl text-primary-500" />
              <span>Thông tin cá nhân</span>
            </div>

            {/* Avatar Upload */}
            <div className="mb-4">
              <label className="block text-[15px] font-medium text-gray-700 mb-2">
                Ảnh đại diện
              </label>
              <Upload
                value={avatarFile}
                onChange={handleAvatarChange}
                accept="image/*"
                maxSize={5}
                preview={avatarPreview}
              />
            </div>

            {/* Name */}
            <div className="mb-4">
              <FormField label="Họ và tên" required error={errors.name}>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  prefix={<UserOutlined className="text-gray-400" />}
                  error={!!errors.name}
                  className="text-base h-11"
                />
              </FormField>
            </div>

            {/* Email */}
            <div>
              <FormField label="Email" required error={errors.email}>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="VD: nguyenvana@hcmct.edu.vn"
                  prefix={<MailOutlined className="text-gray-400" />}
                  error={!!errors.email}
                  className="text-base h-11"
                />
              </FormField>
            </div>
          </div>

          {/* Right Column: Thông tin công tác */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold text-base">
              <SafetyCertificateOutlined className="text-xl text-green-600" />
              <span>Thông tin công tác</span>
            </div>

            {/* Staff ID */}
            <div className="mb-4">
              <FormField label="Mã nhân viên" required error={errors.staff_id}>
                <Input
                  value={formData.staff_id}
                  onChange={(e) => handleChange("staff_id", e.target.value)}
                  placeholder="VD: GV001"
                  prefix={<BarcodeOutlined className="text-gray-400" />}
                  error={!!errors.staff_id}
                  className="text-base h-11"
                />
              </FormField>
            </div>

            {/* Position */}
            <div className="mb-4">
              <FormField label="Chức vụ" error={errors.position}>
                <Input
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                  placeholder="VD: Giảng viên"
                  className="text-base h-11"
                />
              </FormField>
            </div>

            {/* Roles */}
            <div className="mb-4">
              <FormField label="Vai trò" required error={errors.roles}>
                <Select
                  mode="multiple"
                  value={formData.roles}
                  onChange={(value) => handleChange("roles", value as string[])}
                  options={roles}
                  placeholder="Chọn vai trò hệ thống"
                  error={!!errors.roles}
                  suffixIcon={<TeamOutlined className="text-gray-400" />}
                  className="text-base"
                />
              </FormField>
            </div>

            {/* Rooms Manage */}
            <div>
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
                  placeholder="Chọn phòng thực hành"
                  suffixIcon={<HomeOutlined className="text-gray-400" />}
                  className="text-base"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Password - Full Width for New Users */}
        {!editingUser && (
          <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200">
            <FormField label="Mật khẩu" required error={errors.password}>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Nhập mật khẩu cho người dùng mới"
                error={!!errors.password}
                className="text-base h-11"
              />
              <div className="text-[13px] text-yellow-800 mt-1.5">
                💡 Mật khẩu nên có ít nhất 8 ký tự
              </div>
            </FormField>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex justify-between gap-3 pt-5 border-t-2 border-gray-200">
          <div>
            {editingUser && onDelete && (
              <Button
                variant="danger"
                onClick={() => {
                  if (
                    window.confirm(
                      "Bạn chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác."
                    )
                  ) {
                    onDelete(editingUser._id);
                    onCancel();
                  }
                }}
                disabled={loading}
                className="text-base h-11 px-6 font-semibold"
              >
                Xóa tài khoản
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="text-base h-11 px-6 font-semibold"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="text-base h-11 px-6 font-semibold"
            >
              {editingUser ? "Cập nhật thông tin" : "Tạo tài khoản"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;
