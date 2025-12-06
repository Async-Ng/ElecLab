"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Table,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Popconfirm,
  Switch,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { MaterialCategory, MaterialStatus } from "@/types/material";
import BaseModal from "@/components/common/BaseModal";
import Card from "@/components/ui/Card";
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
      onCell: () => ({
        style: { whiteSpace: "normal", wordBreak: "break-word" },
      }),
      render: (val: string, record: Row) => (
        <Input
          className="w-full"
          value={val}
          onChange={(e) =>
            updateRow(record.key, { material_id: e.target.value })
          }
        />
      ),
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      onCell: () => ({
        style: { whiteSpace: "normal", wordBreak: "break-word" },
      }),
      render: (val: string, record: Row) => (
        <Input
          className="w-full"
          value={val}
          onChange={(e) => updateRow(record.key, { name: e.target.value })}
        />
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      onCell: () => ({
        style: { whiteSpace: "normal", wordBreak: "break-word" },
      }),
      render: (val: string, record: Row) => (
        <Select
          value={val || undefined}
          className="w-full"
          onChange={(v) => updateRow(record.key, { category: String(v) })}
        >
          {Object.values(MaterialCategory).map((v) => (
            <Option key={v} value={v}>
              {v}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      onCell: () => ({
        style: { whiteSpace: "normal", wordBreak: "break-word" },
      }),
      render: (val: string, record: Row) => (
        <Select
          value={val || undefined}
          className="w-full"
          onChange={(v) => updateRow(record.key, { status: String(v) })}
          allowClear
        >
          {Object.values(MaterialStatus).map((v) => (
            <Option key={v} value={v}>
              {v}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Vị trí",
      dataIndex: "place_used",
      key: "place_used",
      onCell: () => ({
        style: { whiteSpace: "normal", wordBreak: "break-word" },
      }),
      render: (val: string, record: Row) => (
        <Select
          showSearch
          className="w-full"
          value={val || undefined}
          placeholder="Chọn phòng theo mã phòng"
          optionFilterProp="children"
          onChange={(v) => updateRow(record.key, { place_used: v })}
          filterOption={(input, option) => {
            const childrenStr = String(option?.children ?? "").toLowerCase();
            const valueStr = String(option?.value ?? "").toLowerCase();
            return (
              childrenStr.includes(input.toLowerCase()) ||
              valueStr.includes(input.toLowerCase())
            );
          }}
        >
          {rooms.map((room) => (
            <Option key={room.room_id} value={room.room_id}>
              {room.room_id} - {room.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Trạng thái",
      key: "valid",
      onCell: () => ({
        style: { whiteSpace: "normal", wordBreak: "break-word" },
      }),
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
      onCell: () => ({
        style: { whiteSpace: "normal", wordBreak: "break-word" },
      }),
      render: (_: any, record: Row) => (
        <Space>
          <Popconfirm
            title="Xóa bản ghi này?"
            onConfirm={() => removeRow(record.key)}
          >
            <Button danger size="small">
              Xóa
            </Button>
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
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng số dòng</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalCount}
              </p>
            </div>
            <InfoCircleOutlined className="text-4xl text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hợp lệ</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.validCount}
              </p>
            </div>
            <CheckCircleOutlined className="text-4xl text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lỗi/Cảnh báo</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.errorCount}
              </p>
            </div>
            <ExclamationCircleOutlined className="text-4xl text-red-500 opacity-50" />
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={showErrorsOnly}
            onChange={setShowErrorsOnly}
            checkedChildren="Chỉ hiện lỗi"
            unCheckedChildren="Hiện tất cả"
          />
          <span className="text-sm text-gray-600">
            {showErrorsOnly
              ? `Đang hiển thị ${displayRows.length} dòng lỗi`
              : `Đang hiển thị ${displayRows.length} dòng`}
          </span>
        </div>
      </div>

      {/* Data Table with Sticky Header */}
      <Table<Row>
        rowKey={(r) => r.key}
        dataSource={displayRows}
        columns={columns}
        scroll={{ x: "max-content", y: 500 }}
        pagination={{ pageSize: 10 }}
        rowClassName={(record) =>
          getRowError(record) ? "bg-red-50 hover:bg-red-100" : ""
        }
        sticky
      />

      {/* Action Footer */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
        <Button onClick={onCancel} size="large">
          Hủy
        </Button>
        <Popconfirm
          title="Xác nhận Import"
          description={
            stats.errorCount > 0
              ? `Có ${stats.errorCount} dòng lỗi sẽ bị bỏ qua. Tiếp tục import ${stats.validCount} bản ghi hợp lệ?`
              : `Import ${stats.validCount} bản ghi?`
          }
          onConfirm={() => onConfirm(data.filter((r) => !getRowError(r)))}
          okText="Import"
          cancelText="Hủy"
          disabled={stats.validCount === 0}
        >
          <Button
            type="primary"
            size="large"
            disabled={stats.validCount === 0}
            icon={<CheckCircleOutlined />}
          >
            Import {stats.validCount} bản ghi
          </Button>
        </Popconfirm>
      </div>
    </BaseModal>
  );
}
