'use client';

import { useEffect, useState } from 'react';
import { Button, Card, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { UsersTable } from './_components/UsersTable';
import { UserModal } from './_components/UserModal';
import { User, UserFormData } from '@/types/user';

const availableRoles = [
  { value: 'Lecture', label: 'Giảng viên' },
  { value: 'Head_of_deparment', label: 'Trưởng bộ môn' }
];
const availableRooms = ['Phòng A', 'Phòng B', 'Phòng C', 'Phòng D'];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = () => {
    setEditingUser(undefined);
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      await fetchUsers();
      message.success('Xóa người dùng thành công');
    } catch (error) {
      message.error('Xóa người dùng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: UserFormData) => {
    try {
      setLoading(true);
      if (editingUser) {
        const response = await fetch(`/api/users/${editingUser._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update user');
        }

        message.success('Cập nhật người dùng thành công');
      } else {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create user');
        }

        message.success('Tạo người dùng thành công');
      }
      
      setModalOpen(false);
      await fetchUsers();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Lưu người dùng thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Quản lý người dùng"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Thêm người dùng
        </Button>
      }
    >
      <UsersTable
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <UserModal
        open={modalOpen}
        loading={loading}
        editingUser={editingUser}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        roles={availableRoles}
        rooms={availableRooms}
      />
    </Card>
  );
}
