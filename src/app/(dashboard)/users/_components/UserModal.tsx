import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { User, UserRole } from "@/types/user";
import { Room } from "@/types/room";
import Image from "next/image";

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
        // Nếu có avatar dạng base64 thì set fileList để preview
        if (
          editingUser.avatar &&
          typeof editingUser.avatar === "string" &&
          editingUser.avatar.startsWith("data:image")
        ) {
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
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("staff_id", values.staff_id);
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("position", values.position || "");
      if (values.password) formData.append("password", values.password);
      formData.append("roles", JSON.stringify(values.roles));
      formData.append("rooms_manage", JSON.stringify(values.rooms_manage));
      if (fileList.length && fileList[0].originFileObj) {
        formData.append("avatar", fileList[0].originFileObj);
      }
      onSubmit(formData);
    } catch (err) {}
  };

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
      destroyOnHidden
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Avatar">
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
        </Form.Item>
        <Modal
          open={previewVisible}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
        >
          {previewImage ? (
            <Image alt="preview" style={{ width: "100%" }} src={previewImage} />
          ) : null}
        </Modal>
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
        <Form.Item name="position" label="Chức vụ">
          <Input placeholder="Nhập chức vụ" />
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
            options={roles}
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

export default UserModal;
