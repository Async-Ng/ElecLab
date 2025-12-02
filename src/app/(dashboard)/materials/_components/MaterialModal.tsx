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
import {
  BarcodeOutlined,
  TagOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

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

  const categoryOptions = [
    { label: "Thiết bị cố định", value: MaterialCategory.EQUIPMENT },
    { label: "Vật tư tiêu hao", value: MaterialCategory.CONSUMABLE },
  ];

  const statusOptions = [
    { label: "Có sẵn", value: MaterialStatus.AVAILABLE },
    { label: "Đang sử dụng", value: MaterialStatus.IN_USE },
    { label: "Hư hỏng", value: MaterialStatus.BROKEN },
  ];

  const roomOptions = rooms.map((room) => ({
    label: room.name,
    value: room._id,
  }));

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={editing ? "Chỉnh sửa vật tư" : "Thêm vật tư mới"}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group 1: Thông tin chính */}
        <div
          style={{
            backgroundColor: "#F8FAFC",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              color: "#1E293B",
              fontWeight: 600,
              fontSize: "16px",
            }}
          >
            <TagOutlined style={{ fontSize: "20px", color: "#0090D9" }} />
            <span>Thông tin chính</span>
          </div>

          {/* Material ID */}
          <div style={{ marginBottom: "16px" }}>
            <FormField label="Mã vật tư" required error={errors.material_id}>
              <Input
                value={formData.material_id}
                onChange={(e) => handleChange("material_id", e.target.value)}
                placeholder="VD: MAT-001"
                prefix={<BarcodeOutlined style={{ color: "#94A3B8" }} />}
                error={!!errors.material_id}
                style={{ fontSize: "16px", height: "44px" }}
              />
            </FormField>
          </div>

          {/* Name */}
          <div style={{ marginBottom: "16px" }}>
            <FormField label="Tên vật tư" required error={errors.name}>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="VD: Máy hàn HAKKO"
                error={!!errors.name}
                style={{ fontSize: "16px", height: "44px" }}
              />
            </FormField>
          </div>

          {/* Category */}
          <div>
            <FormField label="Danh mục" required error={errors.category}>
              <Select
                value={formData.category}
                onChange={(value) => handleChange("category", value as string)}
                options={categoryOptions}
                placeholder="Chọn danh mục vật tư"
                error={!!errors.category}
                suffixIcon={<AppstoreOutlined style={{ color: "#94A3B8" }} />}
                style={{ fontSize: "16px" }}
              />
            </FormField>
          </div>
        </div>

        {/* Group 2: Trạng thái & Vị trí */}
        <div
          style={{
            backgroundColor: "#F8FAFC",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              color: "#1E293B",
              fontWeight: 600,
              fontSize: "16px",
            }}
          >
            <CheckCircleOutlined
              style={{ fontSize: "20px", color: "#10B981" }}
            />
            <span>Trạng thái & Vị trí</span>
          </div>

          {/* Status */}
          <div style={{ marginBottom: "16px" }}>
            <FormField label="Tình trạng" error={errors.status}>
              <Select
                value={formData.status}
                onChange={(value) => handleChange("status", value as string)}
                options={statusOptions}
                placeholder="Chọn tình trạng hiện tại"
                style={{ fontSize: "16px" }}
              />
            </FormField>
          </div>

          {/* Place Used */}
          <div>
            <FormField label="Vị trí sử dụng" error={errors.place_used}>
              <Select
                value={formData.place_used}
                onChange={(value) =>
                  handleChange("place_used", value as string)
                }
                options={roomOptions}
                placeholder="Chọn phòng thực hành"
                suffixIcon={
                  <EnvironmentOutlined style={{ color: "#94A3B8" }} />
                }
                style={{ fontSize: "16px" }}
              />
            </FormField>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            paddingTop: "20px",
            borderTop: "2px solid #E2E8F0",
          }}
        >
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            style={{
              fontSize: "16px",
              height: "44px",
              paddingLeft: "24px",
              paddingRight: "24px",
              fontWeight: 600,
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            style={{
              fontSize: "16px",
              height: "44px",
              paddingLeft: "24px",
              paddingRight: "24px",
              fontWeight: 600,
            }}
          >
            {editing ? "Cập nhật thông tin" : "Lưu thông tin"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
