"use client";

import React, { useEffect, useState } from "react";
import { Material, MaterialCategory, MaterialStatus } from "@/types/material";
import { Radio, message } from "antd";
import BaseModal from "@/components/common/BaseModal";
import FormField from "@/components/form/FormField";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { authFetch, getApiEndpoint } from "@/lib/apiClient";
import {
  BarcodeOutlined,
  TagOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";

type Props = {
  open: boolean;
  onSubmit: (formData: Material) => Promise<void> | void;
  onCancel: () => void;
  editing: Material | null;
  loading?: boolean;
  onDelete?: (id?: string) => void;
};

export default function MaterialModal(props: Props) {
  const {
    open,
    onSubmit,
    onCancel,
    editing,
    loading = false,
    onDelete,
  } = props;

  // State management - Controlled components
  const [formData, setFormData] = useState<Partial<Material>>({
    material_id: "",
    name: "",
    category: undefined,
    status: MaterialStatus.AVAILABLE,
    place_used: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rooms, setRooms] = useState<{ _id: string; name: string }[]>([]);
  const { user } = useAuth();

  // Initialize form data when modal opens
  useEffect(() => {
    if (open && user) {
      if (editing) {
        setFormData({
          material_id: editing.material_id || "",
          name: editing.name || "",
          category: editing.category,
          status: editing.status || MaterialStatus.AVAILABLE,
          place_used:
            typeof editing.place_used === "object" && editing.place_used?._id
              ? editing.place_used._id
              : (editing.place_used as string) || "",
        });
      } else {
        setFormData({
          material_id: "",
          name: "",
          category: undefined,
          status: MaterialStatus.AVAILABLE,
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

  // Handle field changes
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.material_id?.trim()) {
      newErrors.material_id = "Vui lòng nhập mã vật tư!";
    }
    if (!formData.name?.trim()) {
      newErrors.name = "Vui lòng nhập tên vật tư!";
    }
    if (!formData.category) {
      newErrors.category = "Vui lòng chọn danh mục!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!validate()) {
      message.error("Vui lòng kiểm tra lại thông tin nhập vào");
      return;
    }

    onSubmit(formData as Material);
  };

  const categoryOptions = [
    { label: "Thiết bị cố định", value: MaterialCategory.EQUIPMENT },
    { label: "Vật tư tiêu hao", value: MaterialCategory.CONSUMABLE },
  ];

  const roomOptions = rooms.map((room) => ({
    label: room.name,
    value: room._id,
  }));

  const customFooter = (
    <div className="flex justify-between gap-3 pt-5 border-t-2 border-gray-200 w-full">
      <div>
        {editing && onDelete && (
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm("Bạn chắc chắn muốn xóa vật tư này?")) {
                onDelete(editing._id);
                onCancel();
              }
            }}
            disabled={loading}
            className="text-base h-11 px-6 font-semibold"
          >
            Xóa vật tư
          </Button>
        )}
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="text-base h-11 px-6 font-semibold"
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSubmit}
          variant="primary"
          loading={loading}
          className="text-base h-11 px-6 font-semibold"
        >
          {editing ? "Cập nhật thông tin" : "Lưu thông tin"}
        </Button>
      </div>
    </div>
  );

  return (
    <BaseModal
      open={open}
      title={editing ? "Chỉnh sửa vật tư" : "Thêm vật tư mới"}
      onCancel={onCancel}
      size="md"
      showFooter={false}
    >
      {/* Group 1: Thông tin chính */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold text-base">
          <TagOutlined className="text-xl text-primary-500" />
          <span>Thông tin chính</span>
        </div>

        {/* Material ID */}
        <FormField label="Mã vật tư" required error={errors.material_id}>
          <Input
            placeholder="Nhập mã vật tư (VD: MAT-001)..."
            value={formData.material_id}
            onChange={(e) => handleChange("material_id", e.target.value)}
            state={errors.material_id ? "error" : "default"}
            fullWidth
          />
        </FormField>

        {/* Name */}
        <FormField label="Tên vật tư" required error={errors.name}>
          <Input
            placeholder="Nhập tên vật tư (VD: Máy hàn HAKKO)..."
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            state={errors.name ? "error" : "default"}
            fullWidth
          />
        </FormField>

        {/* Category */}
        <FormField label="Danh mục" required error={errors.category}>
          <Select
            placeholder="Chọn danh mục vật tư..."
            options={categoryOptions}
            value={formData.category}
            onChange={(val) => handleChange("category", val)}
            state={errors.category ? "error" : "default"}
            fullWidth
          />
        </FormField>
      </div>

      {/* Group 2: Trạng thái & Vị trí */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-6">
        <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold text-base">
          <CheckCircleOutlined className="text-xl text-green-600" />
          <span>Trạng thái & Vị trí</span>
        </div>

        {/* Status - Using Radio.Group for better UX (only 3 options) */}
        <FormField label="Tình trạng">
          <Radio.Group
            className="w-full"
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <div className="grid grid-cols-3 gap-3">
              <Radio.Button
                value={MaterialStatus.AVAILABLE}
                className="text-center h-12 flex items-center justify-center"
              >
                ✅ Có sẵn
              </Radio.Button>
              <Radio.Button
                value={MaterialStatus.IN_USE}
                className="text-center h-12 flex items-center justify-center"
              >
                🔧 Đang sử dụng
              </Radio.Button>
              <Radio.Button
                value={MaterialStatus.BROKEN}
                className="text-center h-12 flex items-center justify-center"
              >
                ⚠️ Hư hỏng
              </Radio.Button>
            </div>
          </Radio.Group>
        </FormField>

        {/* Place Used */}
        <FormField label="Vị trí sử dụng">
          <Select
            placeholder="Chọn phòng thực hành..."
            options={roomOptions}
            value={
              typeof formData.place_used === "string" ? formData.place_used : ""
            }
            onChange={(val) => handleChange("place_used", val)}
            searchable
            clearable
            fullWidth
          />
        </FormField>
      </div>

      {/* Footer buttons */}
      <div className="flex justify-between gap-3 pt-6 border-t-2 border-gray-200 mt-6">
        <div>
          {editing && onDelete && (
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm("Bạn chắc chắn muốn xóa vật tư này?")) {
                  onDelete(editing._id);
                  onCancel();
                }
              }}
              disabled={loading}
              className="text-base h-11 px-6 font-semibold"
            >
              Xóa vật tư
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="text-base h-11 px-6 font-semibold"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            loading={loading}
            className="text-base h-11 px-6 font-semibold"
          >
            {editing ? "Cập nhật thông tin" : "Lưu thông tin"}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
