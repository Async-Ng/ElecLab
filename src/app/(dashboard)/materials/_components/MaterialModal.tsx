"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { Material, MaterialCategory, MaterialStatus } from "@/types/material";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import FormField from "@/components/form/FormField";
import { useAuth } from "@/hooks/useAuth";
import { authFetch, getApiEndpoint } from "@/lib/apiClient";

type Props = {
  open: boolean;
  onSubmit: (formData: Material) => Promise<void> | void;
  onCancel: () => void;
  editing: Material | null;
  loading?: boolean;
};

export default function MaterialModal(props: Props) {
  const { open, onSubmit, onCancel, editing, loading = false } = props;
  const [rooms, setRooms] = useState<{ _id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    material_id: "",
    name: "",
    category: "" as MaterialCategory,
    status: "" as MaterialStatus,
    place_used: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();

  // Initialize form data when modal opens
  useEffect(() => {
    if (open && user) {
      if (editing) {
        setFormData({
          material_id: editing.material_id || "",
          name: editing.name || "",
          category: editing.category || ("" as MaterialCategory),
          status: editing.status || ("" as MaterialStatus),
          place_used:
            typeof editing.place_used === "object" && editing.place_used?._id
              ? editing.place_used._id
              : (editing.place_used as string) || "",
        });
      } else {
        setFormData({
          material_id: "",
          name: "",
          category: "" as MaterialCategory,
          status: "" as MaterialStatus,
          place_used: "",
        });
      }
      setErrors({});

      // Fetch rooms
      const fetchRooms = async () => {
        try {
          const endpoint = getApiEndpoint("rooms", user.roles);
          const res = await authFetch(endpoint, user._id!, user.roles);
          const data = await res.json();
          setRooms(data.rooms || []);
        } catch (error) {
          console.error("Error fetching rooms:", error);
          setRooms([]);
        }
      };
      fetchRooms();
    }
  }, [open, editing, user]);

  // Handle input change
  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.material_id.trim()) {
      newErrors.material_id = "Vui lòng nhập mã vật tư";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên";
    }
    if (!formData.category) {
      newErrors.category = "Vui lòng chọn danh mục";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit(formData as Material);
  };

  const categoryOptions = Object.values(MaterialCategory).map((v) => ({
    label: v,
    value: v,
  }));

  const statusOptions = Object.values(MaterialStatus).map((v) => ({
    label: v,
    value: v,
  }));

  const roomOptions = rooms.map((room) => ({
    label: room.name,
    value: room._id,
  }));

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={editing ? "Chỉnh sửa vật tư" : "Thêm vật tư"}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Material ID */}
        <FormField label="Mã vật tư" required error={errors.material_id}>
          <Input
            value={formData.material_id}
            onChange={(e) => handleChange("material_id", e.target.value)}
            placeholder="Ví dụ: MAT-001"
            error={!!errors.material_id}
          />
        </FormField>

        {/* Name */}
        <FormField label="Tên" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Nhập tên vật tư"
            error={!!errors.name}
          />
        </FormField>

        {/* Category */}
        <FormField label="Danh mục" required error={errors.category}>
          <Select
            value={formData.category}
            onChange={(value) => handleChange("category", value as string)}
            options={categoryOptions}
            placeholder="Chọn danh mục"
            error={!!errors.category}
          />
        </FormField>

        {/* Status */}
        <FormField label="Tình trạng" error={errors.status}>
          <Select
            value={formData.status}
            onChange={(value) => handleChange("status", value as string)}
            options={statusOptions}
            placeholder="Chọn tình trạng"
          />
        </FormField>

        {/* Place Used */}
        <FormField label="Vị trí sử dụng" error={errors.place_used}>
          <Select
            value={formData.place_used}
            onChange={(value) => handleChange("place_used", value as string)}
            options={roomOptions}
            placeholder="Chọn phòng"
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
