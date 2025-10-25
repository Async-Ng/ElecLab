"use client";

import React, { useEffect, useState } from "react";
import { Alert } from "antd";
import {
  Modal,
  Table,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Popconfirm,
} from "antd";
import { MaterialCategory, MaterialStatus } from "@/types/material";
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

  // Kiểm tra bản ghi có mã phòng không hợp lệ
  const invalidRoomRows = data.filter(
    (r) =>
      r.place_used &&
      rooms.length > 0 &&
      !rooms.some((room) => room.room_id === r.place_used)
  );

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
          style={{ width: "100%" }}
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
          style={{ width: "100%" }}
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
          style={{ width: "100%" }}
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
          style={{ width: "100%" }}
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
          style={{ width: "100%" }}
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
        if (!isValid(record)) return <Tag color="red">Thiếu trường</Tag>;
        if (
          record.place_used &&
          rooms.length > 0 &&
          !rooms.some((room) => room.room_id === record.place_used)
        ) {
          return <Tag color="orange">Mã phòng không hợp lệ</Tag>;
        }
        return <Tag color="green">Hợp lệ</Tag>;
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

  const validCount = data.filter(isValid).length;

  return (
    <Modal
      title="Xem trước dữ liệu import"
      open={open}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>Hủy</Button>
          <Button
            type="primary"
            onClick={() => onConfirm(data.filter(isValid))}
            disabled={validCount === 0}
          >
            Import {validCount} bản ghi
          </Button>
        </Space>
      }
      width="90vw"
      destroyOnHidden
    >
      <div style={{ marginBottom: 12 }}>
        <span>
          Hợp lệ: <b>{validCount}</b> &nbsp;|&nbsp; Tổng: <b>{data.length}</b>
        </span>
      </div>
      {invalidRoomRows.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message={`Có ${invalidRoomRows.length} bản ghi có mã phòng không hợp lệ (không tìm thấy trong hệ thống). Các bản ghi này sẽ không được liên kết phòng.`}
        />
      )}
      <Table<Row>
        rowKey={(r) => r.key}
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 8 }}
      />
    </Modal>
  );
}
