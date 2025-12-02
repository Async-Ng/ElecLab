import { Room } from "@/types/room";
import { User } from "@/types/user";
import Badge from "@/components/ui/Badge";
import {
  SmartTable,
  SmartTableColumn,
  SmartTableAction,
} from "@/components/table";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Popconfirm } from "antd";

interface RoomTableProps {
  rooms: (Room & { users_manage?: User[] })[];
  loading: boolean;
  onEdit: (record: Room) => void;
  onDelete: (id?: string) => void;
}

export default function RoomTable({
  rooms,
  loading,
  onEdit,
  onDelete,
}: RoomTableProps) {
  const columns: SmartTableColumn<Room>[] = [
    {
      key: "room_id",
      title: "Mã phòng",
      dataIndex: "room_id",
      width: "20%",
      mobile: true, // Show in mobile card view
    },
    {
      key: "name",
      title: "Tên phòng",
      dataIndex: "name",
      width: "30%",
      mobile: true,
    },
    {
      key: "location",
      title: "Vị trí",
      dataIndex: "location",
      width: "10%",
    },
    {
      key: "users_manage",
      title: "Người quản lý",
      dataIndex: "users_manage",
      width: "40%",
      render: (users_manage: User[] = []) => (
        <div className="flex flex-wrap gap-1">
          {users_manage.length > 0 ? (
            users_manage.map((user) => (
              <Badge key={user._id} variant="success" size="sm">
                {user.name}
              </Badge>
            ))
          ) : (
            <span className="text-gray-400 text-sm">Chưa có người quản lý</span>
          )}
        </div>
      ),
    },
  ];

  const actions: SmartTableAction<Room>[] = [
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      onClick: onEdit,
      tooltip: "Chỉnh sửa thông tin phòng",
    },
    {
      key: "delete",
      label: "Xóa",
      icon: <DeleteOutlined />,
      onClick: (record) => onDelete(record._id),
      danger: true,
      tooltip: "Xóa phòng này",
    },
  ];

  return (
    <SmartTable
      data={rooms}
      columns={columns}
      actions={actions}
      loading={loading}
      rowKey="_id"
      emptyState={{
        title: "Chưa có phòng học nào",
        description: "Nhấn nút 'Thêm phòng' để bắt đầu thêm phòng học mới",
        illustration: "inbox",
      }}
      stickyHeader
      zebraStriping
      cardConfig={{
        title: (record) => record.name,
        subtitle: (record) =>
          `Mã: ${record.room_id} • ${record.location || "Chưa có vị trí"}`,
        badge: (record) =>
          record.users_manage && record.users_manage.length > 0 ? (
            <Badge variant="success" size="sm">
              {record.users_manage.length} người quản lý
            </Badge>
          ) : null,
      }}
    />
  );
}
