"use client";

import { UserOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Table, Tag, Popconfirm, Empty, Avatar as AntAvatar } from "antd";
import type { ColumnsType } from "antd/es/table";
import Button from "@/components/ui/Button";
import { User, UserRole, UserRoleLabels } from "@/types/user";
import { Room } from "@/types/room";
import {
  FilterBar,
  FilterConfig,
  FilterValues,
  ExportButton,
  ExportColumn,
} from "@/components/table";
import { useState, useMemo } from "react";

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
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    role: undefined,
    room: undefined,
  });

  // Filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      key: "search",
      label: "Tìm kiếm",
      type: "search",
      placeholder: "Tìm theo tên, email, mã NV...",
    },
    {
      key: "role",
      label: "Vai trò",
      type: "select",
      options: [
        { label: "Quản lý", value: UserRole.Admin },
        { label: "Người dùng", value: UserRole.User },
      ],
    },
    {
      key: "room",
      label: "Phòng quản lý",
      type: "select",
      options: rooms.map((room) => ({
        label: room.name,
        value: room._id!,
      })),
    },
  ];

  // Apply filters
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.staff_id?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Role filter
      if (filters.role && !user.roles.includes(filters.role)) {
        return false;
      }

      // Room filter
      if (filters.room && !user.rooms_manage?.includes(filters.room)) {
        return false;
      }

      return true;
    });
  }, [users, filters]);

  // Get avatar src
  const getAvatarSrc = (avatar?: string) => {
    if (!avatar) return undefined;
    if (avatar.startsWith("http")) return avatar;
    if (avatar.startsWith("data:image")) return avatar;
    return `data:image/png;base64,${avatar}`;
  };

  // Table columns
  const columns: ColumnsType<User> = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      width: 100,
      render: (avatar: string | undefined, record: User) => (
        <AntAvatar
          size={48}
          src={getAvatarSrc(avatar)}
          icon={<UserOutlined />}
          style={{
            border: "2px solid #E2E8F0",
            backgroundColor: "#F1F5F9",
            color: "#64748B",
          }}
        >
          {!avatar && record.name.charAt(0).toUpperCase()}
        </AntAvatar>
      ),
    },
    {
      title: "Mã nhân viên",
      dataIndex: "staff_id",
      key: "staff_id",
      width: 140,
      render: (value: string) => (
        <span style={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}>
          {value}
        </span>
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value: string) => (
        <span style={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}>
          {value}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      render: (value: string) => (
        <span style={{ color: "#334155", fontSize: "15px" }}>{value}</span>
      ),
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      key: "position",
      width: 160,
      render: (position: string | undefined) => (
        <span style={{ color: "#334155", fontSize: "15px" }}>
          {position || "-"}
        </span>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      key: "roles",
      width: 180,
      render: (roles: string[]) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {roles.map((role) => {
            const isAdmin = role === UserRole.Admin;
            return (
              <Tag
                key={role}
                color={isAdmin ? "volcano" : "geekblue"}
                style={{ fontSize: "14px", padding: "4px 12px" }}
              >
                {isAdmin ? "Quản trị viên" : "Giảng viên"}
              </Tag>
            );
          })}
        </div>
      ),
    },
    {
      title: "Quản lý phòng",
      dataIndex: "rooms_manage",
      key: "rooms_manage",
      width: 200,
      render: (roomIds: string[]) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {roomIds?.map((roomId) => {
            const room = rooms.find((r) => r._id === roomId);
            return (
              <Tag
                key={roomId}
                color="green"
                style={{ fontSize: "14px", padding: "4px 10px" }}
              >
                {room?.name || roomId}
              </Tag>
            );
          })}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      fixed: "right" as const,
      render: (_: any, record: User) => (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            style={{
              fontSize: "15px",
              height: "40px",
              paddingLeft: "16px",
              paddingRight: "16px",
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa tài khoản người dùng"
            description="Bạn chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác."
            onConfirm={() => record._id && onDelete(record._id)}
            okText="Xóa tài khoản"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              style={{
                fontSize: "15px",
                height: "40px",
                paddingLeft: "16px",
                paddingRight: "16px",
              }}
            >
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Export columns configuration
  const exportColumns: ExportColumn[] = [
    { key: "staff_id", header: "Mã nhân viên", accessor: "staff_id" },
    { key: "name", header: "Họ và tên", accessor: "name" },
    { key: "email", header: "Email", accessor: "email" },
    { key: "position", header: "Chức vụ", accessor: "position" },
    {
      key: "roles",
      header: "Vai trò",
      accessor: (row: User) =>
        row.roles.map((r) => UserRoleLabels[r as UserRole]).join(", "),
    },
    {
      key: "rooms",
      header: "Quản lý phòng",
      accessor: (row: User) =>
        row.rooms_manage
          ?.map((roomId) => {
            const room = rooms.find((r) => r._id === roomId);
            return room?.name || roomId;
          })
          .join(", ") || "",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <FilterBar
        filters={filterConfigs}
        values={filters}
        onChange={setFilters}
        extra={
          <ExportButton
            data={filteredUsers}
            columns={exportColumns}
            filename="giang-vien"
          />
        }
      />

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey={(record) => record._id || ""}
        loading={loading}
        size="middle"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} giảng viên`,
          pageSizeOptions: ["10", "20", "50"],
        }}
        rowClassName={(_, index) =>
          index % 2 === 0 ? "bg-white" : "bg-slate-50"
        }
        locale={{
          emptyText: (
            <Empty
              image={
                <UserOutlined style={{ fontSize: 64, color: "#94A3B8" }} />
              }
              imageStyle={{ height: 80 }}
              description={
                <div style={{ color: "#64748B", fontSize: "16px" }}>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                    Chưa có người dùng nào
                  </div>
                  <div style={{ fontSize: "14px" }}>
                    Thêm người dùng mới để bắt đầu quản lý
                  </div>
                </div>
              }
            />
          ),
        }}
        scroll={{ x: 1400 }}
      />
    </div>
  );
};
