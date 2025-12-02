"use client";

import { UserOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { User, UserRole, UserRoleLabels } from "@/types/user";
import { Room } from "@/types/room";
import {
  FilterBar,
  FilterConfig,
  FilterValues,
  ExportButton,
  ExportColumn,
  SmartTable,
  SmartTableColumn,
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

  // Table columns for SmartTable
  const columns: SmartTableColumn<User>[] = [
    {
      key: "avatar",
      title: "Avatar",
      dataIndex: "avatar",
      width: "8%",
      mobile: true,
      render: (avatar: string | undefined, record: User) => (
        <Avatar
          size="lg"
          src={getAvatarSrc(avatar)}
          alt={record.name}
          fallback={record.name.charAt(0).toUpperCase()}
        />
      ),
    },
    {
      key: "staff_id",
      title: "Mã nhân viên",
      dataIndex: "staff_id",
      width: "10%",
      mobile: true,
      render: (value: string) => (
        <span className="font-semibold text-gray-800 text-[15px]">{value}</span>
      ),
    },
    {
      key: "name",
      title: "Họ và tên",
      dataIndex: "name",
      width: "15%",
      mobile: true,
      render: (value: string) => (
        <span className="font-semibold text-gray-800 text-[15px]">{value}</span>
      ),
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
      width: "18%",
      render: (value: string) => (
        <span className="text-gray-700 text-[15px]">{value}</span>
      ),
    },
    {
      key: "position",
      title: "Chức vụ",
      dataIndex: "position",
      width: "12%",
      render: (position: string | undefined) => (
        <span className="text-gray-700 text-[15px]">{position || "-"}</span>
      ),
    },
    {
      key: "roles",
      title: "Vai trò",
      dataIndex: "roles",
      width: "14%",
      mobile: true,
      render: (roles: string[]) => (
        <div className="flex flex-wrap gap-1.5">
          {roles.map((role) => {
            const isAdmin = role === UserRole.Admin;
            return (
              <Badge
                key={role}
                variant={isAdmin ? "warning" : "info"}
                size="md"
              >
                {isAdmin ? "Quản trị viên" : "Giảng viên"}
              </Badge>
            );
          })}
        </div>
      ),
    },
    {
      key: "rooms_manage",
      title: "Quản lý phòng",
      dataIndex: "rooms_manage",
      width: "15%",
      render: (roomIds: string[]) => (
        <div className="flex flex-wrap gap-1.5">
          {roomIds?.map((roomId) => {
            const room = rooms.find((r) => r._id === roomId);
            return (
              <Badge key={roomId} variant="success" size="sm">
                {room?.name || roomId}
              </Badge>
            );
          })}
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
      <SmartTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        rowKey="_id"
        emptyState={{
          title: "Chưa có người dùng nào",
          description: "Thêm người dùng mới để bắt đầu quản lý",
          illustration: "search",
          icon: <UserOutlined />,
        }}
        stickyHeader
        zebraStriping
        cardConfig={{
          title: (record) => record.name,
          subtitle: (record) => `${record.staff_id} • ${record.email}`,
          meta: (record) => record.position || undefined,
          badge: (record) => {
            const isAdmin = record.roles.includes(UserRole.Admin);
            return (
              <Badge variant={isAdmin ? "warning" : "info"} size="sm">
                {isAdmin ? "Quản trị viên" : "Giảng viên"}
              </Badge>
            );
          },
        }}
        actions={[
          {
            key: "edit",
            label: "Sửa",
            icon: <EditOutlined />,
            onClick: onEdit,
            tooltip: "Chỉnh sửa thông tin người dùng",
          },
          {
            key: "delete",
            label: "Xóa",
            icon: <DeleteOutlined />,
            onClick: (record) => {
              if (
                window.confirm(
                  "Bạn chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác."
                )
              ) {
                record._id && onDelete(record._id);
              }
            },
            danger: true,
            tooltip: "Xóa người dùng",
          },
        ]}
      />
    </div>
  );
};
