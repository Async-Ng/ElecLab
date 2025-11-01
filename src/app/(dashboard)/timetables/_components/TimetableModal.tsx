"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";
import viVN from "antd/es/date-picker/locale/vi_VN";
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
  rooms = [],
  users = [],
}: TimetableModalProps) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && timetable && rooms.length > 0 && users.length > 0) {
      let d = timetable.date;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
        const [dd, mm, yyyy] = d.split("/");
        d = `${yyyy}-${mm}-${dd}`;
      }
      form.resetFields();
      form.setFieldsValue({
        schoolYear: timetable.schoolYear || "",
        semester: Number(timetable.semester) || undefined,
        date: d ? dayjs(d, "YYYY-MM-DD") : null,
        period: Number(timetable.period) || undefined,
        time: timetable.time || undefined,
        subject: timetable.subject || "",
        room:
          typeof timetable.room === "object"
            ? timetable.room._id
            : timetable.room,
        className: timetable.className || "",
        lecturer:
          typeof timetable.lecturer === "object"
            ? timetable.lecturer._id
            : timetable.lecturer,
      });
    }
  }, [visible, timetable, rooms, users, form]);

  const handleOk = async () => {
    setLoading(true);
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      user = null;
    }
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        _id: timetable?._id,
        date: values.date.format("YYYY-MM-DD"),
        userId: user && user._id,
        userRole: user && user.roles ? user.roles : [],
      };
      const res = await fetch("/api/timetables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Cập nhật thất bại");
      }

      const updated = await res.json();
      message.success("Cập nhật thời khóa biểu thành công!");
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      message.error(
        err?.message || "Có lỗi xảy ra khi cập nhật thời khóa biểu"
      );
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
      destroyOnHidden
      width={800}
    >
      {!timetable || rooms.length === 0 || users.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center" }}>
          <b>Đang tải dữ liệu...</b>
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="schoolYear"
                label="Năm học"
                rules={[{ required: true, message: "Vui lòng nhập năm học" }]}
              >
                <Input placeholder="VD: 2024-2025" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="semester"
                label="Học kỳ"
                rules={[{ required: true, message: "Vui lòng chọn học kỳ" }]}
              >
                <Select placeholder="Chọn học kỳ">
                  <Select.Option value={1}>HK1</Select.Option>
                  <Select.Option value={2}>HK2</Select.Option>
                  <Select.Option value={3}>HK3</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Ngày"
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  locale={viVN}
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="period"
                label="Ca học"
                rules={[{ required: true, message: "Vui lòng chọn ca học" }]}
              >
                <Select placeholder="Chọn ca học">
                  <Select.Option value={1}>Ca 1</Select.Option>
                  <Select.Option value={2}>Ca 2</Select.Option>
                  <Select.Option value={3}>Ca 3</Select.Option>
                  <Select.Option value={4}>Ca 4</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="time"
                label="Giờ học"
                rules={[{ required: true, message: "Vui lòng chọn giờ học" }]}
              >
                <Select placeholder="Chọn giờ học">
                  {Object.values(StudyTime).map((t) => (
                    <Select.Option key={t} value={t}>
                      {t}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="subject"
                label="Môn học"
                rules={[{ required: true, message: "Vui lòng nhập môn học" }]}
              >
                <Input placeholder="VD: TN Máy điện" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="room"
                label="Phòng học"
                rules={[{ required: true, message: "Vui lòng chọn phòng học" }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn phòng học"
                  optionFilterProp="children"
                >
                  {rooms.map((r) => (
                    <Select.Option key={r._id} value={r._id}>
                      {r.room_id} - {r.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="className"
                label="Lớp"
                rules={[{ required: true, message: "Vui lòng nhập lớp" }]}
              >
                <Input placeholder="VD: C23A.ĐL2" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="lecturer"
                label="Giảng viên"
                rules={[
                  { required: true, message: "Vui lòng chọn giảng viên" },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Chọn giảng viên"
                  optionFilterProp="children"
                >
                  {users.map((u) => (
                    <Select.Option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <Button onClick={onClose}>Hủy</Button>
              <Button type="primary" onClick={handleOk} loading={loading}>
                Lưu
              </Button>
            </div>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
