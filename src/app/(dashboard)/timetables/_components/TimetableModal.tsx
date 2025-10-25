"use client";
import React, { useState } from "react";
import { Modal, Form, Input, Select, DatePicker, Button, message } from "antd";
import dayjs from "dayjs";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";

interface TimetableModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (updated: Timetable) => void;
  timetable: Timetable | null;
  rooms: Array<{ _id: string; name: string; room_id: string }>;
  users: Array<{ _id: string; name: string; email: string }>;
}

export default function TimetableModal({
  visible,
  onClose,
  onSuccess,
  timetable,
  rooms,
  users,
}: TimetableModalProps) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible && timetable && rooms.length > 0 && users.length > 0) {
      console.log("TimetableModal - timetable:", timetable);
      form.resetFields();
      form.setFieldsValue({
        ...timetable,
        date: timetable.date ? dayjs(timetable.date) : null,
        room:
          typeof timetable.room === "object"
            ? timetable.room._id
            : timetable.room,
        lecturer:
          typeof timetable.lecturer === "object"
            ? timetable.lecturer._id
            : timetable.lecturer,
      });
    }
  }, [visible, timetable, rooms, users, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload = {
        ...values,
        _id: timetable?._id,
        date: values.date.format("YYYY-MM-DD"),
      };
      const res = await fetch("/api/timetables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        message.success("Đã cập nhật thời khóa biểu");
        onSuccess(updated);
        onClose();
      } else {
        const errorData = await res.json();
        message.error(errorData.error || "Cập nhật thất bại");
      }
    } catch (err) {
      message.error("Vui lòng kiểm tra lại thông tin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa thời khóa biểu"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="schoolYear"
          label="Năm học"
          rules={[{ required: true }]}
        >
          {" "}
          <Input />{" "}
        </Form.Item>
        <Form.Item name="semester" label="Học kỳ" rules={[{ required: true }]}>
          {" "}
          <Select>
            <Select.Option value={1}>HK1</Select.Option>
            <Select.Option value={2}>HK2</Select.Option>
            <Select.Option value={3}>HK3</Select.Option>
          </Select>{" "}
        </Form.Item>
        <Form.Item name="date" label="Ngày" rules={[{ required: true }]}>
          {" "}
          <DatePicker format="YYYY-MM-DD" />{" "}
        </Form.Item>
        <Form.Item name="period" label="Ca học" rules={[{ required: true }]}>
          {" "}
          <Select>
            <Select.Option value={1}>Ca 1</Select.Option>
            <Select.Option value={2}>Ca 2</Select.Option>
            <Select.Option value={3}>Ca 3</Select.Option>
            <Select.Option value={4}>Ca 4</Select.Option>
          </Select>{" "}
        </Form.Item>
        <Form.Item name="time" label="Giờ học" rules={[{ required: true }]}>
          {" "}
          <Select>
            {Object.values(StudyTime).map((t) => (
              <Select.Option key={t} value={t}>
                {t}
              </Select.Option>
            ))}
          </Select>{" "}
        </Form.Item>
        <Form.Item name="subject" label="Môn học" rules={[{ required: true }]}>
          {" "}
          <Input />{" "}
        </Form.Item>
        <Form.Item name="room" label="Phòng học" rules={[{ required: true }]}>
          {" "}
          <Select showSearch>
            {rooms.map((r) => (
              <Select.Option key={r._id} value={r._id}>
                {r.room_id} - {r.name}
              </Select.Option>
            ))}
          </Select>{" "}
        </Form.Item>
        <Form.Item name="className" label="Lớp" rules={[{ required: true }]}>
          {" "}
          <Input />{" "}
        </Form.Item>
        <Form.Item
          name="lecturer"
          label="Giảng viên"
          rules={[{ required: true }]}
        >
          {" "}
          <Select showSearch>
            {users.map((u) => (
              <Select.Option key={u._id} value={u._id}>
                {u.name}
              </Select.Option>
            ))}
          </Select>{" "}
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleOk} loading={loading}>
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
