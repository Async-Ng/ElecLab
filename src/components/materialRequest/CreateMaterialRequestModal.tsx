"use client";

import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
  Table,
  InputNumber,
  Divider,
  Row,
  Col,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useMaterialRequestStore } from "@/stores/useMaterialRequestStore";
import {
  MaterialRequestType,
  MaterialRequestPriority,
} from "@/types/materialRequest";

interface Material {
  _id: string;
  material_id: string;
  name: string;
  quantity: number;
}

interface Room {
  _id: string;
  room_id: string;
  name: string;
}

interface MaterialRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  rooms: Room[];
  onSuccess?: () => void;
}

interface SelectedMaterial {
  key: string;
  materialId: string;
  materialName: string;
  quantity: number;
  reason: string;
}

export function CreateMaterialRequestModal({
  isOpen,
  onClose,
  materials,
  rooms,
  onSuccess,
}: MaterialRequestModalProps) {
  const [form] = Form.useForm();
  const { createRequest, loading } = useMaterialRequestStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestType, setRequestType] = useState<string | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<
    SelectedMaterial[]
  >([]);
  const [materialFormKey, setMaterialFormKey] = useState(0);

  const handleAddMaterial = (values: Record<string, unknown>) => {
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
      materialId: values.materialId as string,
      materialName: material.name,
      quantity: values.quantity as number,
      reason: values.reason as string,
    };

    setSelectedMaterials([...selectedMaterials, newItem]);
    setMaterialFormKey((prev) => prev + 1);
  };

  const handleRemoveMaterial = (key: string) => {
    setSelectedMaterials(selectedMaterials.filter((m) => m.key !== key));
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (selectedMaterials.length === 0) {
      message.error("Vui lòng thêm ít nhất một vật tư");
      return;
    }

    if (requestType === "Sửa chữa" && !values.roomId) {
      message.error("Vui lòng chọn phòng cho yêu cầu sửa chữa");
      return;
    }

    try {
      setIsSubmitting(true);
      await createRequest({
        requestType: requestType as MaterialRequestType,
        materials: selectedMaterials.map((m) => ({
          materialId: m.materialId,
          quantity: m.quantity,
          reason: m.reason,
        })),
        roomId: values.roomId ? (values.roomId as string) : undefined,
        description: values.description as string,
        priority:
          (values.priority as MaterialRequestPriority) ||
          MaterialRequestPriority.Medium,
      });
      message.success("Yêu cầu đã được gửi thành công");
      form.resetFields();
      setSelectedMaterials([]);
      setRequestType(null);
      onClose();
      onSuccess?.();
    } catch {
      message.error("Không thể gửi yêu cầu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Tạo Yêu Cầu Vật Tư"
      open={isOpen}
      onCancel={onClose}
      width={900}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          label="Loại Yêu Cầu"
          name="requestType"
          rules={[{ required: true, message: "Vui lòng chọn loại yêu cầu" }]}
        >
          <Select
            placeholder="Chọn loại yêu cầu"
            onChange={(value) => setRequestType(value)}
          >
            <Select.Option value={MaterialRequestType.Allocation}>
              {MaterialRequestType.Allocation}
            </Select.Option>
            <Select.Option value={MaterialRequestType.Repair}>
              {MaterialRequestType.Repair}
            </Select.Option>
          </Select>
        </Form.Item>

        {requestType === MaterialRequestType.Repair && (
          <Form.Item
            label="Chọn Phòng"
            name="roomId"
            rules={[{ required: true, message: "Vui lòng chọn phòng" }]}
          >
            <Select placeholder="Chọn phòng">
              {rooms.map((room) => (
                <Select.Option key={room._id} value={room._id}>
                  {room.name} ({room.room_id})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Divider>Thêm Vật Tư</Divider>

        <Row gutter={16} key={materialFormKey} className="mb-4">
          <Col xs={24} sm={8}>
            <Form.Item label="Vật Tư" required>
              <Select
                placeholder="Chọn vật tư"
                id={`material-select-${materialFormKey}`}
              >
                {materials.map((material) => (
                  <Select.Option key={material._id} value={material._id}>
                    {material.name} (Kho: {material.quantity})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item label="Số Lượng" required>
              <InputNumber
                id={`material-qty-${materialFormKey}`}
                min={1}
                placeholder="Số lượng"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item label="Lý Do" required>
              <Input placeholder="Lý do cấp phát/sửa chữa" />
            </Form.Item>
          </Col>
        </Row>

        <Button
          block
          onClick={() => {
            const materialId = (
              document.getElementById(
                `material-select-${materialFormKey}`
              ) as HTMLInputElement
            )?.value;
            const quantity = (
              document.getElementById(
                `material-qty-${materialFormKey}`
              ) as HTMLInputElement
            )?.value;
            const reason = (
              document.querySelector(
                `input[placeholder="Lý do cấp phát/sửa chữa"]`
              ) as HTMLInputElement
            )?.value;

            if (!materialId || !quantity || !reason) {
              message.error("Vui lòng điền đầy đủ thông tin");
              return;
            }

            handleAddMaterial({
              materialId,
              quantity: parseInt(quantity),
              reason,
            });
          }}
          icon={<PlusOutlined />}
          className="mb-4"
        >
          Thêm Vật Tư
        </Button>

        {selectedMaterials.length > 0 && (
          <>
            <Divider>Danh Sách Vật Tư Đã Chọn</Divider>
            <Table
              columns={[
                {
                  title: "Vật Tư",
                  dataIndex: "materialName",
                  key: "materialName",
                },
                {
                  title: "Số Lượng",
                  dataIndex: "quantity",
                  key: "quantity",
                },
                {
                  title: "Lý Do",
                  dataIndex: "reason",
                  key: "reason",
                },
                {
                  title: "Hành Động",
                  key: "action",
                  render: (_, record) => (
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveMaterial(record.key)}
                    />
                  ),
                },
              ]}
              dataSource={selectedMaterials}
              pagination={false}
              rowKey="key"
              size="small"
            />
          </>
        )}

        <Form.Item
          label="Mô Tả Chi Tiết"
          name="description"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả" },
            { min: 10, message: "Mô tả phải có ít nhất 10 ký tự" },
          ]}
          className="mt-4"
        >
          <Input.TextArea rows={4} placeholder="Mô tả chi tiết yêu cầu" />
        </Form.Item>

        <Form.Item
          label="Mức Độ Ưu Tiên"
          name="priority"
          initialValue={MaterialRequestPriority.Medium}
        >
          <Select>
            <Select.Option value={MaterialRequestPriority.Low}>
              {MaterialRequestPriority.Low}
            </Select.Option>
            <Select.Option value={MaterialRequestPriority.Medium}>
              {MaterialRequestPriority.Medium}
            </Select.Option>
            <Select.Option value={MaterialRequestPriority.High}>
              {MaterialRequestPriority.High}
            </Select.Option>
          </Select>
        </Form.Item>

        <Space style={{ width: "100%" }} className="justify-end mt-4">
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting || loading}
          >
            Gửi Yêu Cầu
          </Button>
        </Space>
      </Form>
    </Modal>
  );
}
