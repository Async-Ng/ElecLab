"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Table,
  Input,
  Select,
  Button as AntButton,
  Tag,
  Space,
  Popconfirm,
  Switch,
  Form,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { MaterialCategory, MaterialStatus } from "@/types/material";
import BaseModal from "@/components/common/BaseModal";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;

type Row = {
  key: string | number;
  material_id: string;
  name: string;
  category: string;
  status?: string;
  place_used?: string;
};

interface Props {
  open: boolean;
  initialRows: Row[];
  onCancel: () => void;
  onConfirm: (rows: Row[]) => Promise<void> | void;
  rooms?: Array<{ room_id: string; _id: string; name: string }>;
}

export default function ImportPreviewModal(props: Props) {
  const { open, initialRows, onCancel, onConfirm, rooms = [] } = props;
  const [data, setData] = useState<Row[]>([]);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      // clone rows and ensure each has a key (avoid overwriting existing 'key')
      setData(
        (initialRows || []).map((r, idx) => {
          const { key, ...rest } = r as any;
          return { key: key ?? r.material_id ?? idx, ...rest } as Row;
        })
      );
    }
  }, [open, initialRows]);

  function updateRow(key: string | number, patch: Partial<Row>) {
    setData((d) => d.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: string | number) {
    setData((d) => d.filter((r) => r.key !== key));
  }

  function handleEdit(record: Row) {
    setEditingRow(record);
    form.setFieldsValue({
      material_id: record.material_id,
      name: record.name,
      category: record.category,
      status: record.status,
      place_used: record.place_used,
    });
    setEditModalOpen(true);
  }

  function handleSaveEdit() {
    form.validateFields().then((values) => {
      if (editingRow) {
        updateRow(editingRow.key, values);
        setEditModalOpen(false);
        setEditingRow(null);
        form.resetFields();
      }
    });
  }

  const isValid = (r: Row) => !!(r.material_id && r.name && r.category);

  const getRowError = (record: Row): string | null => {
    if (!record.material_id) return "Thiếu mã vật tư";
    if (!record.name) return "Thiếu tên vật tư";
    if (!record.category) return "Thiếu danh mục";
    if (
      record.place_used &&
      rooms.length > 0 &&
      !rooms.some((room) => room.room_id === record.place_used)
    ) {
      return "Mã phòng không hợp lệ";
    }
    return null;
  };

  // Kiểm tra bản ghi có mã phòng không hợp lệ
  const invalidRoomRows = data.filter(
    (r) =>
      r.place_used &&
      rooms.length > 0 &&
      !rooms.some((room) => room.room_id === r.place_used)
  );

  // Stats calculation
  const stats = useMemo(() => {
    const totalCount = data.length;
    const validCount = data.filter((r) => !getRowError(r)).length;
    const errorCount = totalCount - validCount;

    return {
      totalCount,
      validCount,
      errorCount,
    };
  }, [data, rooms]);

  // Filter rows based on error toggle
  const displayRows = useMemo(() => {
    if (!showErrorsOnly) return data;
    return data.filter((r) => getRowError(r) !== null);
  }, [data, showErrorsOnly]);

  const columns: ColumnsType<Row> = [
    {
      title: "Mã vật tư",
      dataIndex: "material_id",
      key: "material_id",
      width: 150,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 150,
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      width: 120,
    },
    {
      title: "Vị trí",
      dataIndex: "place_used",
      key: "place_used",
      width: 200,
      render: (val: string) => {
        if (!val) return <span className="text-gray-400">Chưa chọn</span>;
        const room = rooms.find((r) => r.room_id === val);
        return room ? `${room.room_id} - ${room.name}` : val;
      },
    },
    {
      title: "Trạng thái",
      key: "valid",
      width: 150,
      render: (_: any, record: Row) => {
        const error = getRowError(record);
        if (error) {
          return (
            <Tag color="red" icon={<CloseCircleOutlined />}>
              {error}
            </Tag>
          );
        }
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Hợp lệ
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      fixed: "right" as const,
      render: (_: any, record: Row) => (
        <Space>
          <AntButton
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Sửa
          </AntButton>
          <Popconfirm
            title="Xóa bản ghi này?"
            onConfirm={() => removeRow(record.key)}
          >
            <AntButton danger type="link" size="small">
              Xóa
            </AntButton>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <BaseModal
      open={open}
      onCancel={onCancel}
      title="Kiểm tra dữ liệu Import Vật tư"
      size="full"
      showFooter={false}
    >
      {/* Stats Dashboard */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Tổng số dòng
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <InfoCircleOutlined className="text-2xl text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Hợp lệ</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.validCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircleOutlined className="text-2xl text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Lỗi/Cảnh báo
              </p>
              <p className="text-3xl font-bold text-red-600">
                {stats.errorCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <ExclamationCircleOutlined className="text-2xl text-red-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Error Alerts */}
      {invalidRoomRows.length > 0 && (
        <Alert
          type="warning"
          showIcon
          className="mb-3"
          message={`Có ${invalidRoomRows.length} bản ghi có mã phòng không hợp lệ. Các bản ghi này sẽ không được liên kết phòng.`}
        />
      )}

      {/* Filter Controls */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <Switch
            checked={showErrorsOnly}
            onChange={setShowErrorsOnly}
            checkedChildren="Chỉ hiện lỗi"
            unCheckedChildren="Hiện tất cả"
          />
          <span className="text-sm font-medium text-gray-700">
            {showErrorsOnly
              ? `Đang hiển thị ${displayRows.length} dòng lỗi`
              : `Đang hiển thị tất cả ${displayRows.length} dòng`}
          </span>
        </div>
      </div>

      {/* Data Table with Sticky Header */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table<Row>
          rowKey={(r) => r.key}
          dataSource={displayRows}
          columns={columns}
          scroll={{ x: "max-content", y: 500 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} dòng`,
          }}
          rowClassName={(record) =>
            getRowError(record)
              ? "bg-red-50/50 hover:bg-red-100/50 transition-colors"
              : "hover:bg-gray-50 transition-colors"
          }
          sticky
        />
      </div>

      {/* Edit Modal */}
      <BaseModal
        title="Chỉnh sửa vật tư"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingRow(null);
          form.resetFields();
        }}
        onOk={handleSaveEdit}
        size="md"
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="Mã vật tư"
            name="material_id"
            rules={[{ required: true, message: "Vui lòng nhập mã vật tư" }]}
          >
            <Input placeholder="Nhập mã vật tư" size="large" />
          </Form.Item>

          <Form.Item
            label="Tên vật tư"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên vật tư" }]}
          >
            <Input placeholder="Nhập tên vật tư" size="large" />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="category"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select
              placeholder="Chọn danh mục"
              size="large"
              getPopupContainer={(trigger) =>
                trigger.parentElement || document.body
              }
            >
              {Object.values(MaterialCategory).map((v) => (
                <Option key={v} value={v}>
                  {v}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Tình trạng" name="status">
            <Select
              placeholder="Chọn tình trạng"
              size="large"
              allowClear
              getPopupContainer={(trigger) =>
                trigger.parentElement || document.body
              }
            >
              {Object.values(MaterialStatus).map((v) => (
                <Option key={v} value={v}>
                  {v}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Vị trí sử dụng" name="place_used">
            <Select
              showSearch
              placeholder="Chọn phòng"
              size="large"
              allowClear
              optionFilterProp="children"
              getPopupContainer={(trigger) =>
                trigger.parentElement || document.body
              }
              filterOption={(input, option) => {
                const childrenStr = String(
                  option?.children ?? ""
                ).toLowerCase();
                return childrenStr.includes(input.toLowerCase());
              }}
            >
              {rooms.map((room) => (
                <Option key={room.room_id} value={room.room_id}>
                  {room.room_id} - {room.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </BaseModal>

      {/* Action Footer */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">
            {stats.validCount}
          </span>{" "}
          bản ghi hợp lệ
          {stats.errorCount > 0 && (
            <span className="ml-2">
              •{" "}
              <span className="font-semibold text-red-600">
                {stats.errorCount}
              </span>{" "}
              bản ghi lỗi
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" size="lg">
            Hủy
          </Button>
          <Popconfirm
            title={<span className="font-semibold">Xác nhận Import</span>}
            description={
              <div className="max-w-sm">
                {stats.errorCount > 0
                  ? `Có ${stats.errorCount} dòng lỗi sẽ bị bỏ qua. Tiếp tục import ${stats.validCount} bản ghi hợp lệ?`
                  : `Import ${stats.validCount} bản ghi vào hệ thống?`}
              </div>
            }
            onConfirm={() => {
              onConfirm(data.filter((r) => !getRowError(r)));
            }}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{
              danger: false,
              type: "primary",
            }}
            getPopupContainer={(trigger) =>
              trigger.parentElement || document.body
            }
          >
            <Button
              variant="primary"
              size="lg"
              disabled={stats.validCount === 0}
            >
              <CheckCircleOutlined className="mr-2" />
              Import {stats.validCount} bản ghi
            </Button>
          </Popconfirm>
        </div>
      </div>
    </BaseModal>
  );
}
