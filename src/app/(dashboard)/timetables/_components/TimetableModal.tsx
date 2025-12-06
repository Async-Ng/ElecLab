"use client";
import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Col,
  Button,
  Space,
} from "antd";
import dayjs from "dayjs";
import viVN from "antd/es/date-picker/locale/vi_VN";
import { Timetable, StudyTime } from "@/types/timetable";
import FormModal from "@/components/common/FormModal";
import { CreateMaterialRequestFromTimetable } from "@/components/requests/CreateMaterialRequestFromTimetable";
import { createAuthHeaders } from "@/lib/apiClient";

interface TimetableModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (updated: Timetable) => void;
  timetable: Timetable | null;
  rooms: Array<{ _id: string; name: string; room_id: string }>;
  users: Array<{ _id: string; name: string; email: string }>;
  materials?: Array<{ _id: string; name: string; quantity: number }>;
}

export default function TimetableModal({
  visible,
  onClose,
  onSuccess,
  timetable,
  rooms = [],
  users = [],
  materials = [],
}: TimetableModalProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [showMaterialRequest, setShowMaterialRequest] = useState(false);

  // Prepare initial values for form
  const initialValues = React.useMemo(() => {
    if (!timetable) {
      // Mode: CREATE - return default values
      return {
        schoolYear: "",
        semester: undefined,
        date: null,
        period: undefined,
        time: undefined,
        subject: "",
        room: undefined,
        className: "",
        lecturer: undefined,
      };
    }

    // Mode: EDIT or CREATE with prefill - return timetable data
    let d = timetable.date;

    // Parse date in multiple formats
    if (typeof d === "string") {
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
        // DD/MM/YYYY format
        const [dd, mm, yyyy] = d.split("/");
        d = `${yyyy}-${mm}-${dd}`;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        // YYYY-MM-DD format - already correct
        // do nothing
      }
    }

    return {
      schoolYear: timetable.schoolYear || "",
      semester: Number(timetable.semester) || undefined,
      date: d ? dayjs(d, "YYYY-MM-DD") : null,
      period: Number(timetable.period) || undefined,
      time: timetable.time || undefined,
      subject: timetable.subject || "",
      room:
        typeof timetable.room === "object"
          ? timetable.room._id
          : timetable.room || undefined,
      className: timetable.className || "",
      lecturer:
        typeof timetable.lecturer === "object"
          ? timetable.lecturer._id
          : timetable.lecturer || undefined,
    };
  }, [timetable]);

  const handleOk = async () => {
    setLoading(true);
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      user = null;
    }

    if (!user?._id || !user?.roles) {
      messageApi.error("Không tìm thấy thông tin người dùng");
      setLoading(false);
      return;
    }

    try {
      const values = await form.validateFields();
      const isEdit = !!timetable?._id;

      const payload = {
        ...values,
        _id: timetable?._id,
        date: values.date.format("YYYY-MM-DD"),
        userId: user._id,
        userRole: user.roles,
      };

      const headers = createAuthHeaders(user._id, user.roles);

      const res = await fetch("/api/user/timetables", {
        method: isEdit ? "PUT" : "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || `${isEdit ? "Cập nhật" : "Tạo"} thất bại`
        );
      }

      const updated = await res.json();
      messageApi.success(
        `${isEdit ? "Cập nhật" : "Tạo"} thời khóa biểu thành công!`
      );
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      messageApi.error(
        err?.message || "Có lỗi xảy ra khi xử lý thời khóa biểu"
      );
    } finally {
      setLoading(false);
    }
  };

  if (rooms.length === 0 || users.length === 0) {
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
        <div className="p-8 text-center">
          <b>Đang tải dữ liệu...</b>
        </div>
      </FormModal>
    );
  }

  const footerContent = (
    <Space style={{ width: "100%", justifyContent: "flex-end" }}>
      <Button onClick={onClose}>Hủy</Button>
      <Button type="primary" onClick={handleOk} loading={loading}>
        {timetable?._id ? "Lưu" : "Tạo mới"}
      </Button>
      {timetable?._id && (
        <Button onClick={() => setShowMaterialRequest(true)}>
          Gửi yêu cầu vật tư
        </Button>
      )}
    </Space>
  );

  return (
    <>
      <FormModal
        open={visible}
        title={
          timetable?._id
            ? "Chỉnh sửa thời khóa biểu"
            : "Thêm thời khóa biểu mới"
        }
        onCancel={onClose}
        onSubmit={handleOk}
        loading={loading}
        form={form}
        size="lg"
        twoColumns
        initialValues={initialValues}
        footer={footerContent}
      >
        {contextHolder}
        <Col span={12}>
          <Form.Item
            name="schoolYear"
            label="Năm học"
            rules={[{ required: true, message: "Vui lòng nhập năm học" }]}
          >
            <Input placeholder="Nhập năm học (VD: 2024-2025)..." size="large" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="semester"
            label="Học kỳ"
            rules={[{ required: true, message: "Vui lòng chọn học kỳ" }]}
          >
            <Select
              placeholder="Chọn học kỳ..."
              size="large"
              getPopupContainer={(trigger) => trigger.parentElement}
              popupMatchSelectWidth={false}
            >
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
              placeholder="Chọn ngày học..."
              size="large"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="period"
            label="Ca học"
            rules={[{ required: true, message: "Vui lòng chọn ca học" }]}
          >
            <Select
              placeholder="Chọn ca học..."
              size="large"
              getPopupContainer={(trigger) => trigger.parentElement}
              popupMatchSelectWidth={false}
            >
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
            <Select
              placeholder="Chọn giờ học..."
              size="large"
              getPopupContainer={(trigger) => trigger.parentElement}
              popupMatchSelectWidth={false}
            >
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
            <Input
              placeholder="Nhập tên môn học (VD: TN Máy điện)..."
              size="large"
            />
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
              placeholder="Chọn phòng thí nghiệm..."
              optionFilterProp="children"
              size="large"
              getPopupContainer={(trigger) => trigger.parentElement}
              popupMatchSelectWidth={false}
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
            <Input placeholder="Nhập tên lớp (VD: C23A.ĐL2)..." size="large" />
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
              placeholder="Chọn giảng viên phụ trách..."
              optionFilterProp="children"
              size="large"
              getPopupContainer={(trigger) => trigger.parentElement}
              popupMatchSelectWidth={false}
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
        timetable={timetable!}
        materials={materials}
        rooms={rooms}
      />
    </>
  );
}
