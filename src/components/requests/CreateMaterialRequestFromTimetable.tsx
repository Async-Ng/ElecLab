"use client";

import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  message,
  InputNumber,
  Button,
  Tag,
  Empty,
} from "antd";
import BaseModal from "@/components/common/BaseModal";
import Card from "@/components/ui/Card";
import {
  DeleteOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useUnifiedRequestsStore } from "@/stores/useUnifiedRequestsStore";
import {
  UnifiedRequestType,
  MATERIAL_REQUEST_TYPES,
} from "@/types/unifiedRequest";
import { Timetable } from "@/types/timetable";
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

  const footerContent = (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-2">
        <ShoppingCartOutlined className="text-xl text-blue-600" />
        <span className="text-gray-600">
          Đã chọn:{" "}
          <strong className="text-blue-600">{selectedMaterials.length}</strong>{" "}
          vật tư
        </span>
      </div>
      <div className="flex gap-2">
        <Button onClick={onClose} size="large">
          Hủy
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={selectedMaterials.length === 0}
        >
          Gửi yêu cầu
        </Button>
      </div>
    </div>
  );

  return (
    <BaseModal
      title="Gửi yêu cầu vật tư"
      open={visible}
      onCancel={onClose}
      size="full"
      customFooter={footerContent}
    >
      {/* Request Info Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
          <h3 className="text-base font-semibold text-gray-800">
            Thông tin yêu cầu
          </h3>
        </div>

        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Loại yêu cầu"
              name="requestType"
              initialValue="Cấp phát vật tư"
              rules={[{ required: true }]}
            >
              <Select
                onChange={(value) =>
                  setRequestType(value as UnifiedRequestType)
                }
                size="large"
                getPopupContainer={(trigger) =>
                  trigger.parentElement || document.body
                }
                dropdownStyle={{ zIndex: 10000 }}
              >
                {MATERIAL_REQUEST_TYPES.map((type) => (
                  <Select.Option key={type} value={type}>
                    {type}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Mức ưu tiên"
              name="priority"
              initialValue="Trung bình"
            >
              <Select
                size="large"
                getPopupContainer={(trigger) =>
                  trigger.parentElement || document.body
                }
                dropdownStyle={{ zIndex: 10000 }}
              >
                <Select.Option value="Thấp">
                  <Tag color="default">Thấp</Tag>
                </Select.Option>
                <Select.Option value="Trung bình">
                  <Tag color="blue">Trung bình</Tag>
                </Select.Option>
                <Select.Option value="Cao">
                  <Tag color="red">Cao</Tag>
                </Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô tả chi tiết yêu cầu của bạn..."
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </div>

      {/* Materials Selection & List Combined Section */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column - Add Material Form */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-green-600 rounded-full"></div>
            <h3 className="text-base font-semibold text-gray-800">
              Chọn vật tư
            </h3>
          </div>

          <Card className="bg-gray-50 border-dashed">
            <Form form={materialForm} layout="vertical">
              <div className="space-y-3">
                <Form.Item
                  name="materialId"
                  label="Vật tư"
                  rules={[{ required: true, message: "Chọn vật tư" }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Chọn vật tư..."
                    showSearch
                    optionFilterProp="children"
                    getPopupContainer={(trigger) =>
                      trigger.parentElement || document.body
                    }
                    dropdownStyle={{ zIndex: 10000 }}
                  >
                    {materials.map((m) => (
                      <Select.Option key={m._id} value={m._id}>
                        {m.name}{" "}
                        <span className="text-gray-400">
                          (Kho: {m.quantity})
                        </span>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="quantity"
                  label="Số lượng"
                  rules={[{ required: true, message: "Nhập số lượng" }]}
                  className="mb-0"
                >
                  <InputNumber
                    min={1}
                    placeholder="Nhập số lượng"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  name="reason"
                  label="Lý do"
                  rules={[{ required: true, message: "Nhập lý do" }]}
                  className="mb-0"
                >
                  <Input.TextArea
                    placeholder="Mô tả chi tiết lý do yêu cầu..."
                    rows={3}
                    showCount
                    maxLength={200}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddMaterial}
                  block
                  size="large"
                >
                  Thêm vật tư
                </Button>
              </div>
            </Form>
          </Card>
        </div>

        {/* Right Column - Selected Materials List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
              <h3 className="text-base font-semibold text-gray-800">
                Danh sách đã chọn
              </h3>
            </div>
            {selectedMaterials.length > 0 && (
              <Tag color="blue">{selectedMaterials.length} vật tư</Tag>
            )}
          </div>

          {selectedMaterials.length === 0 ? (
            <Card className="bg-gray-50 h-full min-h-[400px] flex items-center justify-center">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-gray-500">
                    Chưa có vật tư nào được chọn.
                    <br />
                    Vui lòng thêm vật tư từ form bên trái.
                  </span>
                }
              />
            </Card>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {selectedMaterials.map((item) => (
                <Card
                  key={item.key}
                  className="hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 truncate">
                          {item.materialName}
                        </p>
                        <Tag color="blue" className="ml-2 flex-shrink-0">
                          SL: {item.quantity}
                        </Tag>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {item.reason}
                      </p>
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveMaterial(item.key)}
                      className="flex-shrink-0"
                      size="small"
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
