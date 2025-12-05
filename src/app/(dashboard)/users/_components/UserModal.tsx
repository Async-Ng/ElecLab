import React, { useState, useEffect, useRef } from "react";
import { User } from "@/types/user";
import { Room } from "@/types/room";
import { Form, Input, Select as AntSelect, Row, Col, message } from "antd";
import FormModal from "@/components/common/FormModal";
import Upload from "@/components/ui/Upload";
import Button from "@/components/ui/Button";
import {
  UserOutlined,
  MailOutlined,
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
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when modal opens
  useEffect(() => {
    if (open) {
      if (editingUser) {
        form.setFieldsValue({
          staff_id: editingUser.staff_id || "",
          name: editingUser.name || "",
          email: editingUser.email || "",
          position: editingUser.position || "",
          roles: editingUser.roles || [],
          rooms_manage: editingUser.rooms_manage || [],
        });
        setAvatarPreview(editingUser.avatar || "");
        setAvatarFile(null);
      } else {
        form.resetFields();
        setAvatarPreview("");
        setAvatarFile(null);
      }
    }
  }, [open, editingUser, form]);

  // Handle avatar upload
  const handleAvatarChange = (fileList: any[]) => {
    console.log("Avatar onChange called:", fileList);

    if (fileList.length > 0) {
      const file = fileList[fileList.length - 1]; // Get the last file

      // Check if it's a custom Upload component structure
      if (file.url && file.url.startsWith("data:")) {
        // Already base64
        setAvatarPreview(file.url);
        setAvatarFile(null); // We already have base64
      } else if (file.originFileObj) {
        // Ant Design Upload structure
        setAvatarFile(file.originFileObj);
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file.originFileObj);
      } else if (file instanceof File) {
        // Raw File object
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        console.warn("Unknown file structure:", file);
      }
    } else {
      setAvatarFile(null);
      setAvatarPreview(editingUser?.avatar || "");
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const submitData = new FormData();
      submitData.append("staff_id", values.staff_id);
      submitData.append("name", values.name);
      submitData.append("email", values.email);
      submitData.append("position", values.position || "");
      if (values.password) submitData.append("password", values.password);
      submitData.append("roles", JSON.stringify(values.roles));
      submitData.append(
        "rooms_manage",
        JSON.stringify(values.rooms_manage || [])
      );

      // Convert avatar file to base64 if exists
      if (avatarFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          submitData.append("avatar", reader.result as string);
          onSubmit(submitData);
        };
        reader.readAsDataURL(avatarFile);
      } else if (avatarPreview && avatarPreview.startsWith("data:")) {
        // Already have base64 preview
        submitData.append("avatar", avatarPreview);
        onSubmit(submitData);
      } else if (avatarPreview) {
        // Existing avatar URL - keep it
        submitData.append("avatar", avatarPreview);
        onSubmit(submitData);
      } else {
        // No avatar - send empty string to remove
        submitData.append("avatar", "");
        onSubmit(submitData);
      }
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin nhập vào");
    }
  };

  const modalTitle = (
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
  );

  const customFooter = (
    <div className="flex justify-between gap-3 pt-5 border-t-2 border-gray-200 w-full">
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
          onClick={handleSubmit}
          variant="primary"
          loading={loading}
          className="text-base h-11 px-6 font-semibold"
        >
          {editingUser ? "Cập nhật thông tin" : "Tạo tài khoản"}
        </Button>
      </div>
    </div>
  );

  return (
    <FormModal
      open={open}
      title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      loading={loading}
      form={form}
      size="lg"
      footer={customFooter}
      layout="vertical"
    >
      {/* Two Column Layout */}
      <Row gutter={24}>
        {/* Left Column: Thông tin cá nhân */}
        <Col span={12}>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 h-full">
            <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold text-base">
              <UserOutlined className="text-xl text-primary-500" />
              <span>Thông tin cá nhân</span>
            </div>

            {/* Avatar Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh đại diện
              </label>
              {avatarPreview ? (
                <div className="relative group w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-primary-500 transition-all">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        inputRef.current?.click();
                      }}
                      className="bg-white"
                    >
                      Thay đổi
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarPreview("");
                        setAvatarFile(null);
                      }}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => inputRef.current?.click()}
                  className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserOutlined className="text-3xl text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      Kéo thả file vào đây hoặc
                    </p>
                    <p className="text-sm text-primary-600 font-medium">
                      chọn từ máy tính
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">Định dạng: image/*</p>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-label="Upload avatar"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setAvatarPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            {/* Name */}
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input placeholder="Nhập họ tên đầy đủ..." size="large" />
            </Form.Item>

            {/* Email */}
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                placeholder="Nhập địa chỉ email..."
                size="large"
                prefix={<MailOutlined />}
              />
            </Form.Item>
          </div>
        </Col>

        {/* Right Column: Thông tin công tác */}
        <Col span={12}>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 h-full">
            <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold text-base">
              <SafetyCertificateOutlined className="text-xl text-green-600" />
              <span>Thông tin công tác</span>
            </div>

            {/* Staff ID */}
            <Form.Item
              name="staff_id"
              label="Mã nhân viên"
              rules={[
                { required: true, message: "Vui lòng nhập mã nhân viên!" },
              ]}
            >
              <Input placeholder="Nhập mã nhân viên..." size="large" />
            </Form.Item>

            {/* Position */}
            <Form.Item name="position" label="Chức vụ">
              <Input placeholder="Nhập chức vụ..." size="large" />
            </Form.Item>

            {/* Roles */}
            <Form.Item
              name="roles"
              label="Vai trò"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ít nhất một vai trò!",
                },
              ]}
            >
              <AntSelect
                mode="multiple"
                placeholder="Chọn vai trò hệ thống..."
                options={roles}
                size="large"
                suffixIcon={<TeamOutlined />}
                getPopupContainer={(trigger) =>
                  trigger.parentElement || document.body
                }
                dropdownStyle={{ zIndex: 9999 }}
              />
            </Form.Item>

            {/* Rooms Manage */}
            <Form.Item name="rooms_manage" label="Quản lý phòng">
              <AntSelect
                mode="multiple"
                placeholder="Chọn phòng thực hành..."
                options={rooms.map((room) => ({
                  label: room.name,
                  value: room._id,
                }))}
                size="large"
                suffixIcon={<HomeOutlined />}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                getPopupContainer={(trigger) =>
                  trigger.parentElement || document.body
                }
                dropdownStyle={{ zIndex: 9999 }}
              />
            </Form.Item>
          </div>
        </Col>
      </Row>

      {/* Password - Full Width for New Users */}
      {!editingUser && (
        <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 mt-6">
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu cho người dùng mới..."
              size="large"
            />
          </Form.Item>
          <div className="text-[13px] text-yellow-800">
            💡 Mật khẩu nên có ít nhất 8 ký tự
          </div>
        </div>
      )}
    </FormModal>
  );
};

export default UserModal;
