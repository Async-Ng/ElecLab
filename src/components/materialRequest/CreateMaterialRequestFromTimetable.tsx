"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  message,
  Table,
  InputNumber,
  Divider,
  Button,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useMaterialRequestStore } from "@/stores/useMaterialRequestStore";
import {
  MaterialRequestType,
  MaterialRequestPriority,
} from "@/types/materialRequest";
import { Timetable } from "@/types/timetable";
import { brandColors } from "@/styles/theme";

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
  const { createRequest, loading } = useMaterialRequestStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestType, setRequestType] = useState<string>(
    MaterialRequestType.Allocation
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
      requestType === MaterialRequestType.Repair
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
        requestType: requestType as MaterialRequestType,
        description: values.description,
        room:
          requestType === MaterialRequestType.Repair ? values.room : undefined,
        materials: selectedMaterials.map((m) => ({
          materialId: m.materialId,
          quantity: m.quantity,
          reason: m.reason,
        })),
        priority: values.priority || MaterialRequestPriority.Medium,
        timetable: timetable?._id,
      };

      await createRequest(payload);
      message.success("Yêu cầu vật tư đã được gửi thành công");
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
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: brandColors.primaryLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingOutlined
              style={{ color: brandColors.primary, fontSize: "20px" }}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: brandColors.textPrimary,
              }}
            >
              {timetable?.subject || "Yêu cầu vật tư"}
            </div>
            <div style={{ fontSize: "12px", color: brandColors.textSecondary }}>
              {timetable?.className || ""}
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting || loading}
      width="98%"
      style={{ maxWidth: "1200px" }}
      okText="Gửi yêu cầu"
      cancelText="Hủy"
      styles={{ body: { padding: "24px" } }}
    >
      <Form form={form} layout="vertical" className="mb-4">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
          }}
        >
          <Form.Item
            label="Loại Yêu Cầu"
            name="requestType"
            initialValue={MaterialRequestType.Allocation}
            rules={[{ required: true, message: "Vui lòng chọn loại yêu cầu" }]}
            style={{ marginBottom: 0 }}
          >
            <Select onChange={(value) => setRequestType(value)}>
              <Select.Option value={MaterialRequestType.Allocation}>
                Cấp phát vật tư
              </Select.Option>
              <Select.Option value={MaterialRequestType.Repair}>
                Sửa chữa/Hư hỏng
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Mức Ưu Tiên"
            name="priority"
            initialValue={MaterialRequestPriority.Medium}
            style={{ marginBottom: 0 }}
          >
            <Select>
              <Select.Option value={MaterialRequestPriority.Low}>
                Thấp
              </Select.Option>
              <Select.Option value={MaterialRequestPriority.Medium}>
                Trung bình
              </Select.Option>
              <Select.Option value={MaterialRequestPriority.High}>
                Cao
              </Select.Option>
            </Select>
          </Form.Item>

          {requestType === MaterialRequestType.Repair && (
            <Form.Item
              label="Phòng Thực Hành"
              name="room"
              rules={[
                { required: true, message: "Vui lòng chọn phòng thực hành" },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Select placeholder="Chọn phòng">
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
          style={{ marginTop: "16px" }}
        >
          <Input.TextArea
            rows={3}
            placeholder="Mô tả chi tiết yêu cầu của bạn"
          />
        </Form.Item>
      </Form>

      <Divider>Chọn Vật Tư</Divider>

      <Form form={materialForm} layout="vertical" className="mb-4">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 1fr 1.5fr auto",
            gap: "12px",
            alignItems: "flex-end",
          }}
        >
          <Form.Item
            name="materialId"
            label={
              <span style={{ fontSize: "13px", fontWeight: 500 }}>Vật Tư</span>
            }
            rules={[{ required: true, message: "Chọn vật tư" }]}
            style={{ marginBottom: 0 }}
          >
            <Select placeholder="Chọn vật tư">
              {materials.map((m) => (
                <Select.Option key={m._id} value={m._id}>
                  {m.name} (Kho: {m.quantity})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label={
              <span style={{ fontSize: "13px", fontWeight: 500 }}>
                Số Lượng
              </span>
            }
            rules={[{ required: true, message: "Nhập số lượng" }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber min={1} placeholder="SL" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="reason"
            label={
              <span style={{ fontSize: "13px", fontWeight: 500 }}>Lý Do</span>
            }
            rules={[{ required: true, message: "Nhập lý do" }]}
            style={{ marginBottom: 0 }}
          >
            <Input placeholder="Lý do" />
          </Form.Item>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddMaterial}
            style={{ width: "100%" }}
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
    </Modal>
  );
}
