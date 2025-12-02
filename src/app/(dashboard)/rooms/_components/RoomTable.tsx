import { Room } from "@/types/room";
import { User } from "@/types/user";
import Badge from "@/components/ui/Badge";
import type { ColumnsType } from "antd/es/table";
import { DataTable } from "@/components/common";

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
  const columns: ColumnsType<Room> = [
    {
      title: "Mã phòng",
      dataIndex: "room_id",
      key: "room_id",
      width: "20%",
    },
    {
      title: "Tên phòng",
      dataIndex: "name",
      key: "name",
      width: "30%",
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      width: "10%",
    },
    {
      title: "Người quản lý",
      dataIndex: "users_manage",
      key: "users_manage",
      width: "40%",
      render: (users_manage: User[] = []) => (
        <div className="flex flex-wrap gap-1">
          {users_manage.map((user) => (
            <Badge key={user._id} variant="success">
              {user.name}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={rooms}
      columns={columns}
      onEdit={onEdit}
      onDelete={(record) => onDelete(record._id)}
      loading={loading}
    />
  );
}
