"use client";

import { UserOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { User, UserRole, UserRoleLabels } from "@/types/user";
import { Room } from "@/types/room";
import {
  SmartTable,
  SmartTableColumn,
  FilterBar,
  FilterConfig,
  FilterValues,
  ExportButton,
  ExportColumn,
} from "@/components/table";
import { Avatar, Badge } from "@/components/ui";
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

  // Table columns
  const columns: SmartTableColumn<User>[] = [
    {
      key: "avatar",
      title: "Avatar",
      dataIndex: "avatar",
      width: 80,
      mobile: false,
      render: (avatar: string | undefined, record: User) => (
        <Avatar
          src={
            avatar?.startsWith("http")
              ? avatar
              : avatar?.startsWith("data:image")
              ? avatar
              : avatar
              ? `data:image/png;base64,${avatar}`
              : undefined
          }
          name={record.name}
          size="lg"
          shape="square"
        />
      ),
      renderCard: (avatar: string | undefined, record: User) => (
        <Avatar
          src={
            avatar?.startsWith("http")
              ? avatar
              : avatar?.startsWith("data:image")
              ? avatar
              : avatar
              ? `data:image/png;base64,${avatar}`
              : undefined
          }
          name={record.name}
          size="xl"
          shape="square"
        />
      ),
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
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
      width: 200,
      mobile: true,
    },
    {
      key: "position",
      title: "Chức vụ",
      dataIndex: "position",
      width: 150,
      mobile: true,
      render: (position: string | undefined) => position || "-",
    },
    {
      key: "roles",
      title: "Vai trò",
      dataIndex: "roles",
      width: 150,
      mobile: true,
      render: (roles: string[]) => (
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => (
            <Badge
              key={role}
              variant={role === UserRole.Admin ? "error" : "primary"}
            >
              {UserRoleLabels[role as UserRole]}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "rooms_manage",
      title: "Quản lý phòng",
      dataIndex: "rooms_manage",
      mobile: true,
      render: (roomIds: string[]) => (
        <div className="flex flex-wrap gap-1">
          {roomIds?.map((roomId) => {
            const room = rooms.find((r) => r._id === roomId);
            return (
              <Badge key={roomId} variant="success">
                {room?.name || roomId}
              </Badge>
            );
          })}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      width: 150,
      fixed: "right",
      render: (_: any, record: User) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(record)}
          >
            <EditOutlined /> Sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => record._id && onDelete(record._id)}
          >
            <DeleteOutlined /> Xóa
          </Button>
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
        data={filteredUsers}
        columns={columns}
        loading={loading}
        responsive={{
          mobile: "card",
          tablet: "table",
          desktop: "table",
        }}
        enableColumnManager
        cardConfig={{
          title: (record) => record.name,
          subtitle: (record) => record.email,
          avatar: (record) => (
            <Avatar
              src={
                record.avatar?.startsWith("http")
                  ? record.avatar
                  : record.avatar?.startsWith("data:image")
                  ? record.avatar
                  : record.avatar
                  ? `data:image/png;base64,${record.avatar}`
                  : undefined
              }
              name={record.name}
              size="xl"
              shape="square"
            />
          ),
          badge: (record) => {
            const isAdmin = record.roles.includes(UserRole.Admin);
            return (
              <Badge variant={isAdmin ? "error" : "primary"}>
                {isAdmin ? "Quản lý" : "Người dùng"}
              </Badge>
            );
          },
          actions: (record) => (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(record)}
              >
                <EditOutlined /> Sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => record._id && onDelete(record._id)}
              >
                <DeleteOutlined /> Xóa
              </Button>
            </div>
          ),
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} giảng viên`,
        }}
      />
    </div>
  );
};
