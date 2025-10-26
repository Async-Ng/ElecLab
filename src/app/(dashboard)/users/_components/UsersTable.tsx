"use client";

import { Table, Space, Button, Popconfirm, Tag } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Avatar as AntdAvatar } from "antd";
import Image from "next/image";
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
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      width: "10%",
      render: (avatar: string | undefined) => {
        if (!avatar || typeof avatar !== "string") {
          return (
            <AntdAvatar
              shape="square"
              size={100}
              icon={<UserOutlined style={{ fontSize: 64 }} />}
            />
          );
        }
        // FE tự ghép prefix nếu avatar là base64
        const src = avatar.startsWith("data:image")
          ? avatar
          : `data:image/png;base64,${avatar}`;
        return (
          <img
            src={src}
            alt="avatar"
            width={32}
            height={32}
            style={{ objectFit: "cover", borderRadius: "50%" }}
          />
        );
      },
    },
    {
      title: "Mã nhân viên",
      dataIndex: "staff_id",
      key: "staff_id",
      width: "10%",
      align: "center",
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      width: "15%",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "15%",
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      key: "position",
      width: "10%",
      render: (position: string | undefined) => position || "-",
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      key: "roles",
      render: (roles: string[]) => (
        <>
          {roles.map((role) => (
            <Tag color={role === UserRole.Admin ? "red" : "blue"} key={role}>
              {role === UserRole.Admin ? "Quản lý" : "Người dùng"}
            </Tag>
          ))}
        </>
      ),
      width: "15%",
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
