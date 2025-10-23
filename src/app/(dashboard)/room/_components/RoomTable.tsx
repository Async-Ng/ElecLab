import { Room } from '@/types/room';
import { Button, Popconfirm, Table } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface RoomTableProps {
  rooms: Room[];
  loading: boolean;
  onEdit: (record: Room) => void;
  onDelete: (id?: string) => void;
}

export default function RoomTable({ rooms, loading, onEdit, onDelete }: RoomTableProps) {
  const columns: ColumnsType<Room> = [
    {
      title: 'Mã phòng',
      dataIndex: 'room_id',
      key: 'room_id',
      width: '20%',
    },
    {
      title: 'Tên phòng',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      width: '30%',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '20%',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Xác nhận xóa?"
            onConfirm={() => onDelete(record._id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
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