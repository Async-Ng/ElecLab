"use client";

import { Table, Space, Button, Popconfirm, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { User, UserRole } from "@/types/user";
import { Room } from "@/types/room";

export interface UsersTableProps {
  users: User[];
  loading?: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  rooms: Room[];
}

export const UsersTable = ({
  users,
  loading,
  onEdit,
  onDelete,
  rooms,
}: UsersTableProps) => {
  const columns: ColumnsType<User> = [
    {
      title: "Mã nhân viên",
      dataIndex: "staff_id",
      key: "staff_id",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      key: "roles",
      render: (roles: string[]) => (
        <>
          {roles.map((role) => (
            <Tag color="blue" key={role}>
              {UserRole[role as keyof typeof UserRole] || role}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Quản lý phòng",
      dataIndex: "rooms_manage",
      key: "rooms_manage",
      render: (roomIds: string[]) => (
        <>
          {roomIds.map((roomId) => {
            const room = rooms.find((r) => r._id === roomId);
            return (
              <Tag color="green" key={roomId}>
                {room ? room.name : roomId}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa người dùng"
            description="Bạn có chắc muốn xóa người dùng này?"
            onConfirm={() => record._id && onDelete(record._id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      loading={loading}
      rowKey="_id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Tổng cộng ${total} người dùng`,
      }}
    />
  );
};
