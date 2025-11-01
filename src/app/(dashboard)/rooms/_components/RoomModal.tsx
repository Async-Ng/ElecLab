import { Room } from "@/types/room";
import { FormInstance } from "antd";
import { User } from "@/types/user";
import { FormModal, FormField } from "@/components/common";
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
  const userOptions = users.map((user) => ({
    label: user.name,
    value: user._id,
  }));

  return (
    <FormModal
      open={open}
      title={editing ? "Sửa phòng" : "Thêm phòng"}
      form={form}
      onSubmit={onOk}
      onCancel={onCancel}
      width={600}
      twoColumns={false}
      initialValues={editing || undefined}
    >
      <FormField
        name="room_id"
        label="Mã phòng"
        type="text"
        placeholder="Nhập mã phòng"
        rules={[{ required: true, message: "Vui lòng nhập mã phòng" }]}
      />

      <FormField
        name="name"
        label="Tên phòng"
        type="text"
        placeholder="Nhập tên phòng"
        rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}
      />

      <FormField
        name="location"
        label="Vị trí"
        type="text"
        placeholder="Nhập vị trí phòng"
        rules={[{ required: true, message: "Vui lòng nhập vị trí" }]}
      />

      <FormField
        name="users_manage"
        label="Người quản lý phòng"
        type="multiselect"
        placeholder="Chọn người quản lý"
        options={userOptions}
      />
    </FormModal>
  );
}
