import { Room } from "@/types/room";
import { User } from "@/types/user";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import FormField from "@/components/common/FormField";
import { useState, useEffect, useMemo, FormEvent } from "react";

interface RoomModalProps {
  open: boolean;
  onSubmit: (formData: Room) => void;
  onCancel: () => void;
  editing: Room | null;
  users: User[];
  loading?: boolean;
}

export default function RoomModal({
  open,
  onSubmit,
  onCancel,
  editing,
  users,
  loading = false,
}: RoomModalProps) {
  const [formData, setFormData] = useState({
    room_id: "",
    name: "",
    location: "",
    users_manage: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (open) {
      if (editing) {
        setFormData({
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
        setFormData({
          room_id: "",
          name: "",
          location: "",
          users_manage: [],
        });
      }
      setErrors({});
    }
  }, [open, editing]);

  // Handle input change
  const handleChange = (name: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.room_id.trim()) {
      newErrors.room_id = "Vui lòng nhập mã phòng";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên phòng";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Vui lòng nhập vị trí";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit(formData as Room);
  };
  const userOptions = useMemo(() => {
    return users
      .filter((user) => user._id)
      .map((user) => ({
        label: user.name,
        value: user._id,
      }));
  }, [users]);

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={editing ? "Sửa phòng" : "Thêm phòng"}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Room ID */}
        <FormField label="Mã phòng" required error={errors.room_id}>
          <Input
            value={formData.room_id}
            onChange={(e) => handleChange("room_id", e.target.value)}
            placeholder="Nhập mã phòng"
            error={!!errors.room_id}
          />
        </FormField>

        {/* Name */}
        <FormField label="Tên phòng" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Nhập tên phòng"
            error={!!errors.name}
          />
        </FormField>

        {/* Location */}
        <FormField label="Vị trí" required error={errors.location}>
          <Input
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Nhập vị trí phòng"
            error={!!errors.location}
          />
        </FormField>

        {/* Users Manage */}
        <FormField label="Người quản lý phòng" error={errors.users_manage}>
          <Select
            mode="multiple"
            value={formData.users_manage}
            onChange={(value) =>
              handleChange("users_manage", value as string[])
            }
            options={userOptions}
            placeholder="Chọn người quản lý"
          />
        </FormField>

        {/* Modal Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {editing ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
