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
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useMaterialRequestStore } from "@/stores/useMaterialRequestStore";
import {
  MaterialRequestType,
  MaterialRequestPriority,
} from "@/types/materialRequest";
import { Timetable } from "@/types/timetable";

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
      title={`Yêu Cầu Vật Tư - ${timetable?.subject || ""} (${
        timetable?.className || ""
      })`}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting || loading}
      width={700}
      okText="Gửi yêu cầu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" className="mb-4">
        <Form.Item
          label="Loại Yêu Cầu"
          name="requestType"
          initialValue={MaterialRequestType.Allocation}
          rules={[{ required: true, message: "Vui lòng chọn loại yêu cầu" }]}
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

        {requestType === MaterialRequestType.Repair && (
          <Form.Item
            label="Phòng Thực Hành"
            name="room"
            rules={[
              { required: true, message: "Vui lòng chọn phòng thực hành" },
            ]}
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

        <Form.Item
          label="Mô Tả"
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Mô tả chi tiết yêu cầu của bạn"
          />
        </Form.Item>

        <Form.Item
          label="Mức Ưu Tiên"
          name="priority"
          initialValue={MaterialRequestPriority.Medium}
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
      </Form>

      <Divider>Chọn Vật Tư</Divider>

      <Form form={materialForm} layout="vertical" className="mb-4">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "8px",
          }}
        >
          <Form.Item
            name="materialId"
            label="Vật Tư"
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
            label="Số Lượng"
            rules={[{ required: true, message: "Nhập số lượng" }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber min={1} placeholder="SL" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý Do"
            rules={[{ required: true, message: "Nhập lý do" }]}
            style={{ marginBottom: 0 }}
          >
            <Input placeholder="Lý do" />
          </Form.Item>

          <button
            type="button"
            onClick={handleAddMaterial}
            style={{
              marginTop: "24px",
              padding: "4px 12px",
              backgroundColor: "#1890ff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <PlusOutlined /> Thêm
          </button>
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
