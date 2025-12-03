"use client";

import React, { useEffect, useState } from "react";
import { Material, MaterialCategory, MaterialStatus } from "@/types/material";
import { Form, Input, Select, Radio, message } from "antd";
import FormModal from "@/components/common/FormModal";
import Button from "@/components/ui/Button";
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
  const [form] = Form.useForm();
  const [rooms, setRooms] = useState<{ _id: string; name: string }[]>([]);
  const { user } = useAuth();

  // Initialize form data when modal opens
  useEffect(() => {
    if (open && user) {
      if (editing) {
        form.setFieldsValue({
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
        form.resetFields();
      }

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
  }, [open, editing, user, form]);

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values as Material);
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin nhập vào");
    }
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
    <FormModal
      open={open}
      title={editing ? "Chỉnh sửa vật tư" : "Thêm vật tư mới"}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      loading={loading}
      form={form}
      width={650}
      footer={customFooter}
      layout="vertical"
    >
      {/* Group 1: Thông tin chính */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold text-base">
          <TagOutlined className="text-xl text-primary-500" />
          <span>Thông tin chính</span>
        </div>

        {/* Material ID */}
        <Form.Item
          name="material_id"
          label="Mã vật tư"
          rules={[{ required: true, message: "Vui lòng nhập mã vật tư!" }]}
        >
          <Input placeholder="Nhập mã vật tư (VD: MAT-001)..." size="large" />
        </Form.Item>

        {/* Name */}
        <Form.Item
          name="name"
          label="Tên vật tư"
          rules={[{ required: true, message: "Vui lòng nhập tên vật tư!" }]}
        >
          <Input
            placeholder="Nhập tên vật tư (VD: Máy hàn HAKKO)..."
            size="large"
          />
        </Form.Item>

        {/* Category */}
        <Form.Item
          name="category"
          label="Danh mục"
          rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
        >
          <Select
            placeholder="Chọn danh mục vật tư..."
            options={categoryOptions}
            size="large"
          />
        </Form.Item>
      </div>

      {/* Group 2: Trạng thái & Vị trí */}
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-6">
        <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold text-base">
          <CheckCircleOutlined className="text-xl text-green-600" />
          <span>Trạng thái & Vị trí</span>
        </div>

        {/* Status - Using Radio.Group for better UX (only 3 options) */}
        <Form.Item
          name="status"
          label="Tình trạng"
          initialValue={MaterialStatus.AVAILABLE}
        >
          <Radio.Group className="w-full" size="large">
            <div className="grid grid-cols-3 gap-3">
              <Radio.Button
                value={MaterialStatus.AVAILABLE}
                className="text-center"
              >
                ✅ Có sẵn
              </Radio.Button>
              <Radio.Button
                value={MaterialStatus.IN_USE}
                className="text-center"
              >
                🔧 Đang sử dụng
              </Radio.Button>
              <Radio.Button
                value={MaterialStatus.BROKEN}
                className="text-center"
              >
                ⚠️ Hư hỏng
              </Radio.Button>
            </div>
          </Radio.Group>
        </Form.Item>

        {/* Place Used */}
        <Form.Item name="place_used" label="Vị trí sử dụng">
          <Select
            placeholder="Chọn phòng thực hành..."
            options={roomOptions}
            size="large"
            showSearch
            allowClear
            filterOption={(input: string, option: any) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </div>
    </FormModal>
  );
}
