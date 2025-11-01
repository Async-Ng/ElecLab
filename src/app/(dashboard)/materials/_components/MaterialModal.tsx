"use client";

import React, { useEffect, useState } from "react";
import { FormInstance } from "antd";
import { Material, MaterialCategory, MaterialStatus } from "@/types/material";
import { FormModal, FormField } from "@/components/common";
import { cachedFetch } from "@/lib/requestCache";

type Props = {
  open: boolean;
  onOk: () => Promise<void> | void;
  onCancel: () => void;
  editing: Material | null;
  form: FormInstance;
  loading?: boolean;
};

export default function MaterialModal(props: Props) {
  const { open, onOk, onCancel, editing, form, loading = false } = props;
  const [rooms, setRooms] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    if (!form) return;

    // Tối ưu: Gộp logic xử lý form và fetch rooms trong 1 useEffect
    if (open) {
      // Xử lý form values
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

      // Fetch rooms nếu chưa có dữ liệu (sử dụng cachedFetch)
      if (rooms.length === 0) {
        cachedFetch("/api/rooms?userRole=Admin")
          .then((data) => {
            setRooms(data.rooms || []);
          })
          .catch((error) => {
            console.error("Error fetching rooms:", error);
            setRooms([]);
          });
      }
    }
  }, [open, editing, form, rooms.length]);

  const categoryOptions = Object.values(MaterialCategory).map((v) => ({
    label: v,
    value: v,
  }));

  const statusOptions = Object.values(MaterialStatus).map((v) => ({
    label: v,
    value: v,
  }));

  const roomOptions = rooms.map((room) => ({
    label: room.name,
    value: room._id,
  }));

  return (
    <FormModal
      open={open}
      title={editing ? "Chỉnh sửa vật tư" : "Thêm vật tư"}
      form={form}
      onSubmit={onOk}
      onCancel={onCancel}
      width={600}
      loading={loading}
    >
      <FormField
        name="material_id"
        label="Mã vật tư"
        type="text"
        placeholder="Ví dụ: MAT-001"
        rules={[{ required: true, message: "Vui lòng nhập mã vật tư" }]}
      />

      <FormField
        name="name"
        label="Tên"
        type="text"
        rules={[{ required: true, message: "Vui lòng nhập tên" }]}
      />

      <FormField
        name="category"
        label="Danh mục"
        type="select"
        options={categoryOptions}
        rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
      />

      <FormField
        name="status"
        label="Tình trạng"
        type="select"
        options={statusOptions}
      />

      <FormField
        name="place_used"
        label="Vị trí sử dụng"
        type="select"
        placeholder="Chọn phòng"
        options={roomOptions}
      />
    </FormModal>
  );
}
