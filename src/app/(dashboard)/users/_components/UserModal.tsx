'use client';

import { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { User, UserFormData } from '@/types/user';

interface UserModalProps {
  open: boolean;
  loading?: boolean;
  editingUser?: User;
  onCancel: () => void;
  onSubmit: (values: UserFormData) => void;
  roles: string[];
  rooms: string[];
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
      onSubmit(values);
    });
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.setFieldsValue(editingUser || {
        staff_id: '',
        name: '',
        email: '',
        password: '',
        roles: [],
        rooms_manage: [],
      });
    } else {
      form.resetFields();
    }
  }, [open, editingUser, form]);

  return (
    <Modal
      open={open}
      title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
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
          {editingUser ? 'Cập nhật' : 'Tạo mới'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={editingUser}
      >
        <Form.Item
          name="staff_id"
          label="Mã nhân viên"
          rules={[{ required: true, message: 'Vui lòng nhập mã nhân viên!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên"
          rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Vui lòng nhập email hợp lệ!' },
          ]}
        >
          <Input />
        </Form.Item>

        {!editingUser && (
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password />
          </Form.Item>
        )}

        <Form.Item
          name="roles"
          label="Vai trò"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một vai trò!' }]}
        >
          <Select
            mode="multiple"
            placeholder="Chọn vai trò"
            options={roles.map((role) => ({ label: role, value: role }))}
          />
        </Form.Item>

        <Form.Item
          name="rooms_manage"
          label="Quản lý phòng"
        >
          <Select
            mode="multiple"
            placeholder="Chọn phòng"
            options={rooms.map((room) => ({ label: room, value: room }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
