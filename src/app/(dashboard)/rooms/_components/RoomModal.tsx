import { Room } from "@/types/room";
import { Form, Input, Modal, FormInstance } from "antd";
import { Select } from "antd";
import { User } from "@/types/user";
interface RoomModalProps {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  editing: Room | null;
  form: FormInstance<Room>;
  users: User[];
}

export default function RoomModal({
  open,
  onOk,
  onCancel,
  editing,
  form,
  users,
}: RoomModalProps) {
  return (
    <Modal
      open={open}
      title={editing ? "Sửa phòng" : "Thêm phòng"}
      okText={editing ? "Cập nhật" : "Thêm"}
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
          rules={[{ required: true, message: "Vui lòng nhập mã phòng" }]}
        >
          <Input placeholder="Nhập mã phòng" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên phòng"
          rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}
        >
          <Input placeholder="Nhập tên phòng" />
        </Form.Item>

        <Form.Item
          name="location"
          label="Vị trí"
          rules={[{ required: true, message: "Vui lòng nhập vị trí" }]}
        >
          <Input placeholder="Nhập vị trí phòng" />
        </Form.Item>

        <Form.Item
          name="users_manage"
          label="Người quản lý phòng"
          rules={[{ required: false }]}
        >
          <Select
            mode="multiple"
            placeholder="Chọn người quản lý"
            optionFilterProp="children"
            showSearch
            allowClear
          >
            {users.map((user) => (
              <Select.Option key={user._id} value={user._id}>
                {user.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
