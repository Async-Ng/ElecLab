import { Room } from "@/types/room";
import { User } from "@/types/user";
import { Form, Input, Select, message } from "antd";
import FormModal from "@/components/common/FormModal";
import Button from "@/components/ui/Button";
import { useEffect, useMemo } from "react";

interface RoomModalProps {
  open: boolean;
  onSubmit: (formData: Room) => void;
  onCancel: () => void;
  editing: Room | null;
  users: User[];
  loading?: boolean;
  onDelete?: (id?: string) => void;
}

export default function RoomModal({
  open,
  onSubmit,
  onCancel,
  editing,
  users,
  loading = false,
  onDelete,
}: RoomModalProps) {
  const [form] = Form.useForm();

  // Initialize form data when modal opens
  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          room_id: editing.room_id || "",
          name: editing.name || "",
          location: editing.location || "",
          users_manage: Array.isArray(editing.users_manage)
            ? editing.users_manage.map((user: any) =>
                typeof user === "object" && user !== null ? user._id : user
              )
            : [],
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editing, form]);

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values as any);
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin nhập vào");
    }
  };

  const userOptions = useMemo(() => {
    return users
      .filter((user) => user._id)
      .map((user) => ({
        label: user.name,
        value: user._id!,
      }));
  }, [users]);
  const customFooter = (
    <div className="flex justify-between gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700 w-full">
      <div>
        {editing && onDelete && (
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm("Bạn chắc chắn muốn xóa phòng này?")) {
                onDelete(editing._id);
                onCancel();
              }
            }}
            disabled={loading}
          >
            Xóa phòng
          </Button>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant="primary" loading={loading}>
          {editing ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </div>
  );

  return (
    <FormModal
      open={open}
      title={editing ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      loading={loading}
      form={form}
      size="md"
      footer={customFooter}
      layout="vertical"
    >
      {/* Room ID */}
      <Form.Item
        name="room_id"
        label="Mã phòng"
        rules={[{ required: true, message: "Vui lòng nhập mã phòng!" }]}
      >
        <Input placeholder="Nhập mã phòng..." size="large" />
      </Form.Item>

      {/* Name */}
      <Form.Item
        name="name"
        label="Tên phòng"
        rules={[{ required: true, message: "Vui lòng nhập tên phòng!" }]}
      >
        <Input placeholder="Nhập tên phòng..." size="large" />
      </Form.Item>

      {/* Location */}
      <Form.Item
        name="location"
        label="Vị trí"
        rules={[{ required: true, message: "Vui lòng nhập vị trí!" }]}
      >
        <Input placeholder="Nhập vị trí phòng..." size="large" />
      </Form.Item>

      {/* Users Manage */}
      <Form.Item name="users_manage" label="Người quản lý phòng">
        <Select
          mode="multiple"
          placeholder="Chọn người quản lý..."
          options={userOptions}
          size="large"
          showSearch
          filterOption={(input: string, option: any) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>
    </FormModal>
  );
}
