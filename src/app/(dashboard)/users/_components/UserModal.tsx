import React, { useState, useEffect } from "react";
import { Form, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { User, UserRole } from "@/types/user";
import { Room } from "@/types/room";
import Image from "next/image";
import { FormModal, FormField } from "@/components/common";

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
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | undefined>();
  const [previewVisible, setPreviewVisible] = useState(false);

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
        // If avatar exists (URL or base64), set fileList for preview
        if (editingUser.avatar && typeof editingUser.avatar === "string") {
          setFileList([
            {
              uid: "1",
              name: "avatar.png",
              status: "done",
              url: editingUser.avatar,
            },
          ]);
        } else {
          setFileList([]);
        }
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [open, editingUser, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    // If there's a file to upload, convert to base64
    if (fileList.length && fileList[0].originFileObj) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const formData = new FormData();
        formData.append("staff_id", values.staff_id);
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("position", values.position || "");
        if (values.password) formData.append("password", values.password);
        formData.append("roles", JSON.stringify(values.roles));
        formData.append("rooms_manage", JSON.stringify(values.rooms_manage));
        // Append base64 avatar
        formData.append("avatar", reader.result as string);
        onSubmit(formData);
      };
      reader.readAsDataURL(fileList[0].originFileObj);
    } else {
      // No avatar file
      const formData = new FormData();
      formData.append("staff_id", values.staff_id);
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("position", values.position || "");
      if (values.password) formData.append("password", values.password);
      formData.append("roles", JSON.stringify(values.roles));
      formData.append("rooms_manage", JSON.stringify(values.rooms_manage));
      onSubmit(formData);
    }
  };

  return (
    <FormModal
      open={open}
      title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      form={form}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      loading={loading}
      width={800}
      twoColumns={true}
      initialValues={editingUser || undefined}
    >
      {/* Avatar Upload - Full width custom field */}
      <Form.Item label="Avatar" style={{ gridColumn: "1 / -1" }}>
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
          maxCount={1}
          showUploadList={{ showPreviewIcon: true }}
          onPreview={async (file) => {
            let src = file.url || file.thumbUrl;
            if (!src && file.originFileObj) {
              src = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                if (file.originFileObj)
                  reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result as string);
              });
            }
            setPreviewImage(src);
            setPreviewVisible(true);
          }}
        >
          <div>
            <UploadOutlined /> Chọn ảnh
          </div>
        </Upload>
        {/* Avatar preview modal */}
        {previewVisible && previewImage && (
          <div
            onClick={() => setPreviewVisible(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
            }}
          >
            <Image
              alt="preview"
              style={{ width: "80%", maxWidth: "600px" }}
              src={previewImage}
              width={600}
              height={600}
            />
          </div>
        )}
      </Form.Item>

      {/* Staff ID */}
      <FormField
        name="staff_id"
        label="Mã nhân viên"
        type="text"
        span={12}
        rules={[{ required: true, message: "Vui lòng nhập mã nhân viên!" }]}
      />

      {/* Name */}
      <FormField
        name="name"
        label="Họ và tên"
        type="text"
        span={12}
        rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
      />

      {/* Email */}
      <FormField
        name="email"
        label="Email"
        type="email"
        span={12}
        rules={[
          { required: true, message: "Vui lòng nhập email!" },
          { type: "email", message: "Vui lòng nhập email hợp lệ!" },
        ]}
      />

      {/* Position */}
      <FormField
        name="position"
        label="Chức vụ"
        type="text"
        placeholder="Nhập chức vụ"
        span={12}
      />

      {/* Password - only for new users */}
      {!editingUser && (
        <FormField
          name="password"
          label="Mật khẩu"
          type="password"
          span={24}
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        />
      )}

      {/* Roles */}
      <FormField
        name="roles"
        label="Vai trò"
        type="multiselect"
        placeholder="Chọn vai trò"
        options={roles}
        span={12}
        rules={[
          { required: true, message: "Vui lòng chọn ít nhất một vai trò!" },
        ]}
      />

      {/* Rooms Manage */}
      <FormField
        name="rooms_manage"
        label="Quản lý phòng"
        type="multiselect"
        placeholder="Chọn phòng"
        options={rooms.map((room) => ({
          label: room.name,
          value: room._id,
        }))}
        span={24}
      />
    </FormModal>
  );
};

export default UserModal;
