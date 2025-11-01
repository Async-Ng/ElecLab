"use client";

import { Tag } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Avatar as AntdAvatar } from "antd";
import Image from "next/image";
import type { ColumnsType } from "antd/es/table";
import { User, UserRole } from "@/types/user";
import { Room } from "@/types/room";
import { DataTable } from "@/components/common";

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
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={src}
              alt="avatar"
              fill
              style={{
                objectFit: "contain",
                borderRadius: "8px",
                background: "#f0f0f0",
              }}
              unoptimized
            />
          </div>
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
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      onEdit={onEdit}
      onDelete={(record) => record._id && onDelete(record._id)}
      loading={loading}
    />
  );
};
