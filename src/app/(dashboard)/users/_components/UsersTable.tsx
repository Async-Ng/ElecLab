"use client";

import { UserOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
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

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.staff_id?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.role && !user.roles.includes(filters.role)) {
        return false;
      }

      if (filters.room && !user.rooms_manage?.includes(filters.room)) {
        return false;
      }

      return true;
    });
  }, [users, filters]);

  const columns: SmartTableColumn<User>[] = [
    {
      key: "avatar",
      title: "Avatar",
      dataIndex: "avatar",
      width: 150,
      align: "center",
      mobile: true,
      render: (avatar: string | undefined, record: User) => {
        const avatarSrc = avatar?.startsWith("http") ? avatar : undefined;
        return (
          <div className="flex items-center justify-center w-full h-full py-2">
            <Avatar
              size="2xl"
              shape="square"
              src={avatarSrc}
              name={record.name}
              fallbackText={record.name.charAt(0).toUpperCase()}
              className="w-[100px] h-[100px]"
            />
          </div>
        );
      },
    },
    {
      key: "staff_id",
      title: "Mã NV",
      dataIndex: "staff_id",
      width: 100,
      mobile: true,
    },
    {
      key: "name",
      title: "Họ và tên",
      dataIndex: "name",
      width: 180,
      mobile: true,
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
      width: 220,
    },
    {
      key: "position",
      title: "Chức vụ",
      dataIndex: "position",
      width: 130,
      render: (position: string | undefined) => position || "-",
    },
    {
      key: "roles",
      title: "Vai trò",
      dataIndex: "roles",
      width: 140,
      mobile: true,
      render: (roles: string[]) => (
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => {
            const isAdmin = role === UserRole.Admin;
            return (
              <Badge
                key={role}
                variant={isAdmin ? "warning" : "info"}
                size="sm"
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
      title: "Phòng quản lý",
      dataIndex: "rooms_manage",
      width: 150,
      render: (roomIds: string[]) => {
        if (!roomIds || roomIds.length === 0) {
          return <span className="text-gray-400 text-sm">-</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {roomIds.slice(0, 2).map((roomId) => {
              const room = rooms.find((r) => r._id === roomId);
              return (
                <Badge key={roomId} variant="success" size="sm">
                  {room?.name || roomId}
                </Badge>
              );
            })}
            {roomIds.length > 2 && (
              <Badge variant="default" size="sm">
                +{roomIds.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
  ];

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

      <SmartTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        rowKey="_id"
        onRowClick={onEdit}
        emptyState={{
          title: "Chưa có người dùng nào",
          description: "Thêm người dùng mới để bắt đầu quản lý",
          illustration: "search",
        }}
        stickyHeader
        zebraStriping
        cardConfig={{
          title: (record) => record.name,
          subtitle: (record) => `${record.staff_id} • ${record.email}`,
          badge: (record) => {
            const isAdmin = record.roles.includes(UserRole.Admin);
            return (
              <Badge variant={isAdmin ? "warning" : "info"} size="sm">
                {isAdmin ? "Quản trị viên" : "Giảng viên"}
              </Badge>
            );
          },
        }}
      />
    </div>
  );
};
