"use client";

import React, { useEffect, useState } from "react";
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

export default function MaterialModal(props: Props) {
  const { open, onOk, onCancel, editing, form } = props;
  const [rooms, setRooms] = useState<{ _id: string; name: string }[]>([]);
  useEffect(() => {
    if (!form) return;
    if (open) {
      if (editing) {
        // Nếu editing.place_used là object, lấy _id
        const values = {
          ...editing,
          place_used:
            typeof editing.place_used === "object" && editing.place_used?._id
              ? editing.place_used._id
              : editing.place_used,
        };
        form.setFieldsValue(values as any);
      } else {
        form.resetFields();
      }
    }
  }, [open, editing, form]);

  useEffect(() => {
    // Lấy danh sách phòng với quyền Head_of_deparment
    fetch("/api/rooms?userRole=Admin")
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.rooms || []);
      });
  }, []);

  return (
    <Modal
      title={editing ? "Chỉnh sửa vật tư" : "Thêm vật tư"}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="Lưu"
      destroyOnHidden={true}
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
          <Select
            showSearch
            optionFilterProp="children"
            placeholder="Chọn phòng"
          >
            {rooms.map((room) => (
              <Option key={room._id} value={room._id}>
                {room.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
