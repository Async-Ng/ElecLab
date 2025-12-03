"use client";
import React, { useState, useEffect } from "react";
import { DatePicker, message, Button, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import viVN from "antd/es/date-picker/locale/vi_VN";
import { Timetable, StudyTime } from "@/types/timetable";
import BaseModal from "@/components/common/BaseModal";
import FormField from "@/components/form/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { CreateMaterialRequestFromTimetable } from "@/components/materialRequest/CreateMaterialRequestFromTimetable";

interface TimetableModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (updated: Timetable) => void;
  timetable: Timetable | null;
  rooms: Array<{ _id: string; name: string; room_id: string }>;
  users: Array<{ _id: string; name: string; email: string }>;
  materials?: Array<{ _id: string; name: string; quantity: number }>;
  onDelete?: (timetable: Timetable) => void;
}

export default function TimetableModal({
  visible,
  onClose,
  onSuccess,
  timetable,
  rooms = [],
  users = [],
  materials = [],
  onDelete,
}: TimetableModalProps) {
  const [loading, setLoading] = useState(false);
  const [showMaterialRequest, setShowMaterialRequest] = useState(false);
  const [formData, setFormData] = useState({
    schoolYear: "",
    semester: undefined as number | undefined,
    date: null as Dayjs | null,
    period: undefined as number | undefined,
    time: undefined as StudyTime | undefined,
    subject: "",
    room: "",
    className: "",
    lecturer: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (visible && timetable) {
      let d = timetable.date;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
        const [dd, mm, yyyy] = d.split("/");
        d = `${yyyy}-${mm}-${dd}`;
      }

      setFormData({
        schoolYear: timetable.schoolYear || "",
        semester: Number(timetable.semester) || undefined,
        date: d ? dayjs(d, "YYYY-MM-DD") : null,
        period: Number(timetable.period) || undefined,
        time: timetable.time || undefined,
        subject: timetable.subject || "",
        room:
          typeof timetable.room === "object"
            ? timetable.room._id || ""
            : timetable.room || "",
        className: timetable.className || "",
        lecturer:
          typeof timetable.lecturer === "object"
            ? timetable.lecturer._id || ""
            : timetable.lecturer || "",
      });
      setErrors({});
    }
  }, [visible, timetable]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.schoolYear.trim())
      newErrors.schoolYear = "Vui lòng nhập năm học";
    if (!formData.semester) newErrors.semester = "Vui lòng chọn học kỳ";
    if (!formData.date) newErrors.date = "Vui lòng chọn ngày";
    if (!formData.period) newErrors.period = "Vui lòng chọn ca học";
    if (!formData.time) newErrors.time = "Vui lòng chọn thời gian";
    if (!formData.subject.trim()) newErrors.subject = "Vui lòng nhập môn học";
    if (!formData.room) newErrors.room = "Vui lòng chọn phòng";
    if (!formData.className.trim()) newErrors.className = "Vui lòng nhập lớp";
    if (!formData.lecturer) newErrors.lecturer = "Vui lòng chọn giảng viên";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOk = async () => {
    if (!validate()) {
      message.error("Vui lòng kiểm tra lại thông tin nhập vào");
      return;
    }

    setLoading(true);
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      user = null;
    }
    try {
      const payload = {
        ...formData,
        _id: timetable?._id,
        date: formData.date?.format("YYYY-MM-DD"),
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

  if (!timetable || rooms.length === 0 || users.length === 0) {
    return (
      <FormModal
        open={visible}
        title="Chỉnh sửa thời khóa biểu"
        onCancel={onClose}
        onSubmit={() => {}}
        form={form}
        size="lg"
        twoColumns
      >
        <div style={{ padding: 32, textAlign: "center" }}>
          <b>Đang tải dữ liệu...</b>
        </div>
      </FormModal>
    );
  }

  const footerContent = (
    <div className="flex justify-between w-full">
      <div>
        {timetable && onDelete && (
          <Button
            danger
            onClick={() => {
              if (window.confirm("Bạn chắc chắn muốn xóa lịch dạy này?")) {
                onDelete(timetable);
                onClose();
              }
            }}
          >
            Xóa lịch dạy
          </Button>
        )}
      </div>
      <Space>
        <Button onClick={onClose}>Hủy</Button>
        <Button type="primary" onClick={handleOk} loading={loading}>
          Lưu
        </Button>
        <Button onClick={() => setShowMaterialRequest(true)}>
          Gửi yêu cầu vật tư
        </Button>
      </Space>
    </div>
  );

  return (
    <>
      <FormModal
        open={visible}
        title="Chỉnh sửa thời khóa biểu"
        onCancel={onClose}
        onSubmit={handleOk}
        loading={loading}
        form={form}
        size="lg"
        twoColumns
        initialValues={initialValues}
        footer={footerContent}
      >
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

        <Col span={24}>
          <Form.Item
            name="lecturer"
            label="Giảng viên"
            rules={[{ required: true, message: "Vui lòng chọn giảng viên" }]}
          >
            <Select
              showSearch
              placeholder="Chọn giảng viên"
              optionFilterProp="children"
            >
              {users.map((u) => (
                <Select.Option key={u._id} value={u._id}>
                  {u.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </FormModal>

      <CreateMaterialRequestFromTimetable
        visible={showMaterialRequest}
        onClose={() => setShowMaterialRequest(false)}
        timetable={timetable}
        materials={materials}
        rooms={rooms}
      />
    </>
  );
}
