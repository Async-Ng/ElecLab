"use client";

import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  message,
  Table,
  InputNumber,
  Divider,
  Button,
} from "antd";
import BaseModal from "@/components/common/BaseModal";
import {
  DeleteOutlined,
  PlusOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useUnifiedRequestsStore } from "@/stores/useUnifiedRequestsStore";
import {
  UnifiedRequestType,
  UnifiedRequestPriority,
  MATERIAL_REQUEST_TYPES,
} from "@/types/unifiedRequest";
import { Timetable } from "@/types/timetable";
import { brandColors } from "@/styles/theme";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/lib/apiClient";

interface Material {
  _id: string;
  name: string;
  quantity: number;
}

interface Room {
  _id: string;
  room_id: string;
  name: string;
}

interface CreateMaterialRequestFromTimetableProps {
  visible: boolean;
  onClose: () => void;
  timetable: Timetable | null;
  materials: Material[];
  rooms: Room[];
}

interface SelectedMaterial {
  key: string;
  materialId: string;
  materialName: string;
  quantity: number;
  reason: string;
}

export function CreateMaterialRequestFromTimetable({
  visible,
  onClose,
  timetable,
  materials = [],
  rooms = [],
}: CreateMaterialRequestFromTimetableProps) {
  const [form] = Form.useForm();
  const [materialForm] = Form.useForm();
  const { user } = useAuth();
  const { fetchRequests } = useUnifiedRequestsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestType, setRequestType] = useState<UnifiedRequestType>(
    "Cấp phát vật tư" as UnifiedRequestType
  );
  const [selectedMaterials, setSelectedMaterials] = useState<
    SelectedMaterial[]
  >([]);

  // Auto-select room if timetable has room and requestType is Repair
  useEffect(() => {
    if (
      visible &&
      timetable &&
      timetable.room &&
      requestType === "Sửa chữa vật tư"
    ) {
      const roomId =
        typeof timetable.room === "object"
          ? timetable.room._id
          : timetable.room;
      form.setFieldValue("room", roomId);
    }
  }, [visible, timetable, requestType, form]);

  const handleAddMaterial = async () => {
    try {
      const values = await materialForm.validateFields();

      if (!values.materialId || !values.quantity || !values.reason) {
        message.error("Vui lòng điền đầy đủ thông tin vật tư");
        return;
      }

      const material = materials.find((m) => m._id === values.materialId);
      if (!material) {
        message.error("Vật tư không hợp lệ");
        return;
      }

      const newItem: SelectedMaterial = {
        key: `${Date.now()}-${Math.random()}`,
        materialId: values.materialId,
        materialName: material.name,
        quantity: values.quantity,
        reason: values.reason,
      };

      setSelectedMaterials([...selectedMaterials, newItem]);
      materialForm.resetFields();
      message.success("Đã thêm vật tư");
    } catch {
      message.error("Vui lòng điền đầy đủ thông tin");
    }
  };

  const handleRemoveMaterial = (key: string) => {
    setSelectedMaterials(selectedMaterials.filter((m) => m.key !== key));
  };

  const handleSubmit = async () => {
    if (selectedMaterials.length === 0) {
      message.error("Vui lòng thêm ít nhất một vật tư");
      return;
    }

    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      const payload = {
        type: requestType,
        title: `${
          requestType === "Cấp phát vật tư"
            ? "Yêu cầu cấp phát"
            : "Yêu cầu sửa chữa"
        } - ${timetable?.subject}`,
        description: values.description,
        room: requestType === "Sửa chữa vật tư" ? values.room : undefined,
        materials: selectedMaterials.map((m) => ({
          materialId: m.materialId,
          quantity: m.quantity,
          reason: m.reason,
        })),
        priority: values.priority || "Trung bình",
        status: "Chờ duyệt",
        requester: user?._id,
        timetable: timetable?._id,
      };

      const response = await authFetch(
        "/api/unified-requests",
        user?._id!,
        user?.roles || [],
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Không thể gửi yêu cầu");
      }

      message.success("Yêu cầu vật tư đã được gửi thành công");

      // Refresh the store
      if (user?._id) {
        fetchRequests(user._id, user.roles || []);
      }

      onClose();
      setSelectedMaterials([]);
      form.resetFields();
      materialForm.resetFields();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Không thể gửi yêu cầu vật tư";
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const materialColumns = [
    { title: "Vật Tư", dataIndex: "materialName", key: "materialName" },
    { title: "Số Lượng", dataIndex: "quantity", key: "quantity" },
    { title: "Lý Do", dataIndex: "reason", key: "reason" },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_: unknown, record: SelectedMaterial) => (
        <DeleteOutlined
          onClick={() => handleRemoveMaterial(record.key)}
          style={{ cursor: "pointer", color: "red" }}
        />
      ),
    },
  ];

  return (
    <BaseModal
      title={timetable?.subject || "Yêu cầu vật tư"}
      open={visible}
      onCancel={onClose}
      okText="Gửi yêu cầu"
      cancelText="Hủy"
      onOk={handleSubmit}
      loading={isSubmitting}
      size="lg"
      centered
    >
      <Form form={form} layout="vertical" className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item
            label="Loại Yêu Cầu"
            name="requestType"
            initialValue="Cấp phát vật tư"
            rules={[{ required: true, message: "Vui lòng chọn loại yêu cầu" }]}
          >
            <Select
              onChange={(value) => setRequestType(value as UnifiedRequestType)}
              size="large"
            >
              {MATERIAL_REQUEST_TYPES.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Mức Ươ Tiên"
            name="priority"
            initialValue="Trung bình"
          >
            <Select size="large">
              <Select.Option value="Thấp">Thấp</Select.Option>
              <Select.Option value="Trung bình">Trung bình</Select.Option>
              <Select.Option value="Cao">Cao</Select.Option>
            </Select>
          </Form.Item>

          {requestType === "Sửa chữa vật tư" && (
            <Form.Item
              label="Phòng Thực Hành"
              name="room"
              rules={[
                { required: true, message: "Vui lòng chọn phòng thực hành" },
              ]}
            >
              <Select placeholder="Chọn phòng..." size="large">
                {rooms.map((r) => (
                  <Select.Option key={r._id} value={r._id}>
                    {r.room_id} - {r.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </div>

        <Form.Item
          label="Mô Tả"
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Mô tả chi tiết yêu cầu của bạn..."
            size="large"
          />
        </Form.Item>
      </Form>

      <Divider>Chọn Vật Tư</Divider>

      <Form form={materialForm} layout="vertical" className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <Form.Item
            name="materialId"
            label="Vật Tư"
            rules={[{ required: true, message: "Chọn vật tư" }]}
            className="mb-0"
          >
            <Select placeholder="Chọn vật tư..." size="large">
              {materials.map((m) => (
                <Select.Option key={m._id} value={m._id}>
                  {m.name} (Kho: {m.quantity})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số Lượng"
            rules={[{ required: true, message: "Nhập số lượng" }]}
            className="mb-0"
          >
            <InputNumber
              min={1}
              placeholder="SL"
              style={{ width: "100%" }}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý Do"
            rules={[{ required: true, message: "Nhập lý do" }]}
            className="mb-0"
          >
            <Input placeholder="Lý do yêu cầu..." size="large" />
          </Form.Item>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddMaterial}
            style={{ width: "100%" }}
            size="large"
          >
            Thêm
          </Button>
        </div>
      </Form>

      <Table
        columns={materialColumns}
        dataSource={selectedMaterials}
        rowKey="key"
        pagination={false}
        size="small"
      />
    </BaseModal>
  );
}
