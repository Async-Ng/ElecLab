"use client";

import React from "react";
import { Modal, Form, Input, Select, FormInstance } from "antd";
import { Material, MaterialCategory, MaterialStatus } from "@/types/material";

const { Option } = Select;

type Props = {
  open: boolean;
  onOk: () => Promise<void> | void;
  onCancel: () => void;
  editing: Material | null;
  form: FormInstance;
};

export default function MaterialModal({
  open,
  onOk,
  onCancel,
  editing,
  form,
}: Props) {
  return (
    <Modal
      title={editing ? "Chỉnh sửa vật tư" : "Thêm vật tư"}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="Lưu"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="material_id"
          label="Mã vật tư"
          rules={[{ required: true, message: "Vui lòng nhập mã vật tư" }]}
        >
          <Input placeholder="Ví dụ: MAT-001" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên"
          rules={[{ required: true, message: "Vui lòng nhập tên" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="category"
          label="Danh mục"
          rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
        >
          <Select style={{ width: "100%" }}>
            {Object.values(MaterialCategory).map((v) => (
              <Option key={v} value={v}>
                {v}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="status" label="Tình trạng">
          <Select style={{ width: "100%" }}>
            {Object.values(MaterialStatus).map((v) => (
              <Option key={v} value={v}>
                {v}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="place_used" label="Vị trí sử dụng">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
