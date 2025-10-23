import { Room } from '@/types/room';
import { Form, Input, Modal, FormInstance } from 'antd';

interface RoomModalProps {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  editing: Room | null;
  form: FormInstance<Room>;
}

export default function RoomModal({ open, onOk, onCancel, editing, form }: RoomModalProps) {
  return (
    <Modal
      open={open}
      title={editing ? 'Sửa phòng' : 'Thêm phòng'}
      okText={editing ? 'Cập nhật' : 'Thêm'}
      cancelText="Hủy"
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={editing || undefined}
      >
        <Form.Item
          name="room_id"
          label="Mã phòng"
          rules={[{ required: true, message: 'Vui lòng nhập mã phòng' }]}
        >
          <Input placeholder="Nhập mã phòng" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên phòng"
          rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}
        >
          <Input placeholder="Nhập tên phòng" />
        </Form.Item>

        <Form.Item
          name="location"
          label="Vị trí"
          rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
        >
          <Input placeholder="Nhập vị trí phòng" />
        </Form.Item>
      </Form>
    </Modal>
  );
}