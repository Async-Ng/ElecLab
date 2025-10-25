import { Room } from "@/types/room";
import { User } from "@/types/user";
import { Button, Popconfirm, Table, Tag } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

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
        <>
          {users_manage.map((user) => (
            <Tag key={user._id} color="green">
              {user.name}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: "20%",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa?"
            onConfirm={() => onDelete(record._id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={rooms}
      loading={loading}
      rowKey="_id"
      scroll={{ x: 800 }}
    />
  );
}
