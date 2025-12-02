import React, { useState, useEffect, FormEvent } from "react";
import { User } from "@/types/user";
import { Room } from "@/types/room";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Upload from "@/components/ui/Upload";
import Button from "@/components/ui/Button";
import FormField from "@/components/form/FormField";
import {
  UserOutlined,
  MailOutlined,
  BarcodeOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  HomeOutlined,
} from "@ant-design/icons";

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
      title={
        editingUser ? "Chỉnh sửa thông tin người dùng" : "Thêm người dùng mới"
      }
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Thông tin cá nhân */}
          <div
            style={{
              backgroundColor: "#F8FAFC",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
                color: "#1E293B",
                fontWeight: 600,
                fontSize: "16px",
              }}
            >
              <UserOutlined style={{ fontSize: "20px", color: "#0090D9" }} />
              <span>Thông tin cá nhân</span>
            </div>

            {/* Avatar Upload */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
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
            <div style={{ marginBottom: "16px" }}>
              <FormField label="Họ và tên" required error={errors.name}>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  prefix={<UserOutlined style={{ color: "#94A3B8" }} />}
                  error={!!errors.name}
                  style={{ fontSize: "16px", height: "44px" }}
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
                  prefix={<MailOutlined style={{ color: "#94A3B8" }} />}
                  error={!!errors.email}
                  style={{ fontSize: "16px", height: "44px" }}
                />
              </FormField>
            </div>
          </div>

          {/* Right Column: Thông tin công tác */}
          <div
            style={{
              backgroundColor: "#F8FAFC",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
                color: "#1E293B",
                fontWeight: 600,
                fontSize: "16px",
              }}
            >
              <SafetyCertificateOutlined
                style={{ fontSize: "20px", color: "#10B981" }}
              />
              <span>Thông tin công tác</span>
            </div>

            {/* Staff ID */}
            <div style={{ marginBottom: "16px" }}>
              <FormField label="Mã nhân viên" required error={errors.staff_id}>
                <Input
                  value={formData.staff_id}
                  onChange={(e) => handleChange("staff_id", e.target.value)}
                  placeholder="VD: GV001"
                  prefix={<BarcodeOutlined style={{ color: "#94A3B8" }} />}
                  error={!!errors.staff_id}
                  style={{ fontSize: "16px", height: "44px" }}
                />
              </FormField>
            </div>

            {/* Position */}
            <div style={{ marginBottom: "16px" }}>
              <FormField label="Chức vụ" error={errors.position}>
                <Input
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                  placeholder="VD: Giảng viên"
                  style={{ fontSize: "16px", height: "44px" }}
                />
              </FormField>
            </div>

            {/* Roles */}
            <div style={{ marginBottom: "16px" }}>
              <FormField label="Vai trò" required error={errors.roles}>
                <Select
                  mode="multiple"
                  value={formData.roles}
                  onChange={(value) => handleChange("roles", value as string[])}
                  options={roles}
                  placeholder="Chọn vai trò hệ thống"
                  error={!!errors.roles}
                  suffixIcon={<TeamOutlined style={{ color: "#94A3B8" }} />}
                  style={{ fontSize: "16px" }}
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
                  suffixIcon={<HomeOutlined style={{ color: "#94A3B8" }} />}
                  style={{ fontSize: "16px" }}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Password - Full Width for New Users */}
        {!editingUser && (
          <div
            style={{
              backgroundColor: "#FEF3C7",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #FDE68A",
            }}
          >
            <FormField label="Mật khẩu" required error={errors.password}>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Nhập mật khẩu cho tài khoản mới"
                error={!!errors.password}
                style={{ fontSize: "16px", height: "44px" }}
              />
              <div
                style={{ fontSize: "13px", color: "#92400E", marginTop: "6px" }}
              >
                💡 Mật khẩu nên có ít nhất 8 ký tự
              </div>
            </FormField>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            paddingTop: "20px",
            borderTop: "2px solid #E2E8F0",
          }}
        >
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            style={{
              fontSize: "16px",
              height: "44px",
              paddingLeft: "24px",
              paddingRight: "24px",
              fontWeight: 600,
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            style={{
              fontSize: "16px",
              height: "44px",
              paddingLeft: "24px",
              paddingRight: "24px",
              fontWeight: 600,
            }}
          >
            {editingUser ? "Cập nhật thông tin" : "Tạo tài khoản"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;
