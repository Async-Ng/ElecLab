"use client";
import React, { useState } from "react";
import { Form, Input, Select, DatePicker, message, Col } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import viVN from "antd/es/date-picker/locale/vi_VN";
import { Timetable, StudyTime } from "@/types/timetable";
import { Room } from "@/types/room";
import { User } from "@/types/user";
import FormModal from "@/components/common/FormModal";
import { useAuth } from "@/hooks/useAuth";
import { authFetch, getApiEndpoint } from "@/lib/apiClient";
import {
  isWeekValidForSemester,
  getWeekValidationError,
  getDateValidationError,
} from "@/shared/utils/semesterValidation";

// Configure dayjs
dayjs.extend(customParseFormat);

interface TimetableModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (updated: Timetable) => void;
  timetable: Timetable | null;
  rooms: Room[];
  users: User[];
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
  const { user } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  // Watch semester changes to update week validation hint
  const handleSemesterChange = (value: number) => {
    setSelectedSemester(value);
    // Trigger week field revalidation when semester changes
    form.validateFields(["week"]);
  };

  // Prepare initial values for form
  const initialValues = React.useMemo(() => {
    if (!timetable) return null; // Không có data prefill
    if (rooms.length === 0) return null; // Chưa load xong rooms

    let d = timetable.date;
    // Chuyển đổi format ngày nếu cần
    if (typeof d === "string") {
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
        const [dd, mm, yyyy] = d.split("/");
        d = `${yyyy}-${mm}-${dd}`;
      }
    }

    return {
      schoolYear: timetable.schoolYear || "",
      semester: timetable.semester ? Number(timetable.semester) : undefined,
      date: d ? dayjs(d, "YYYY-MM-DD") : null,
      week: timetable.week || undefined,
      period: timetable.period ? Number(timetable.period) : undefined,
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
          : timetable.lecturer || user?._id, // Auto fill với user hiện tại nếu không có
      note: timetable.note || "",
    };
  }, [timetable, rooms, user]);

  const handleOk = async () => {
    // Nếu không phải chủ sở hữu, chỉ đóng modal
    if (!isOwner) {
      onClose();
      return;
    }

    if (!user) {
      message.error("Vui lòng đăng nhập để thực hiện cập nhật");
      onClose();
      return;
    }

    setLoading(true);
    try {
      const values = await form.validateFields();

      // Validate week for semester
      const weekError = getWeekValidationError(values.semester, values.week);
      if (weekError) {
        message.error(weekError);
        setLoading(false);
        return;
      }

      // Validate date
      const dateStr = values.date.format("DD/MM/YYYY");
      const dateError = getDateValidationError(dateStr);
      if (dateError) {
        message.error(dateError);
        setLoading(false);
        return;
      }

      // Xác định method: POST (tạo mới) hoặc PUT (cập nhật)
      const isUpdate = !!timetable?._id;
      const method = isUpdate ? "PUT" : "POST";

      const payload = {
        ...values,
        ...(isUpdate && { _id: timetable._id }), // Chỉ thêm _id khi update
        date: values.date.format("YYYY-MM-DD"),
      };

      const endpoint = getApiEndpoint("timetables", user.roles);
      const res = await authFetch(endpoint, user._id!, user.roles, {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error ||
            (isUpdate ? "Cập nhật thất bại" : "Tạo mới thất bại")
        );
      }

      const updated = await res.json();
      message.success(
        isUpdate
          ? "Cập nhật thời khóa biểu thành công!"
          : "Tạo mới thời khóa biểu thành công!"
      );
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

  // Kiểm tra quyền sở hữu
  const currentUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isOwner = React.useMemo(() => {
    if (!timetable || !timetable._id) return true; // Tạo mới (không có _id)
    const lecturerId =
      typeof timetable.lecturer === "object"
        ? timetable.lecturer._id
        : timetable.lecturer;
    return currentUser?._id === lecturerId;
  }, [timetable, currentUser]);

  // Chỉ hiển thị loading khi đang xem/sửa TKB nhưng chưa có đủ dữ liệu rooms
  // Khi tạo mới (không có _id), cũng cần chờ rooms load xong
  if (rooms.length === 0) {
    return (
      <FormModal
        open={visible}
        title={timetable?._id ? "Xem thời khóa biểu" : "Thêm thời khóa biểu"}
        onCancel={onClose}
        onSubmit={() => {}}
        form={form}
        width={800}
        twoColumns
      >
        <div style={{ padding: 32, textAlign: "center" }}>
          <b>Đang tải dữ liệu phòng học...</b>
        </div>
      </FormModal>
    );
  }

  return (
    <FormModal
      open={visible}
      title={
        !timetable?._id
          ? "Thêm thời khóa biểu"
          : isOwner
          ? "Chỉnh sửa thời khóa biểu"
          : "Xem thời khóa biểu"
      }
      onCancel={onClose}
      onSubmit={handleOk}
      loading={loading}
      form={form}
      width={800}
      twoColumns
      initialValues={initialValues}
      okText={isOwner ? "Lưu" : "Đóng"}
    >
      {!isOwner && (
        <Col span={24}>
          <div
            style={{
              padding: "12px",
              background: "#fff7e6",
              border: "1px solid #ffd591",
              borderRadius: "4px",
              marginBottom: "16px",
            }}
          >
            <strong>Lưu ý:</strong> Bạn chỉ có thể xem thông tin. Chỉ giảng viên
            được phân công mới có thể chỉnh sửa.
          </div>
        </Col>
      )}
      <Col span={12}>
        <Form.Item
          name="schoolYear"
          label="Năm học"
          rules={[{ required: true, message: "Vui lòng nhập năm học" }]}
        >
          <Input placeholder="VD: 2024-2025" disabled={!isOwner} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name="semester"
          label="Học kỳ"
          rules={[{ required: true, message: "Vui lòng chọn học kỳ" }]}
        >
          <Select
            placeholder="Chọn học kỳ"
            disabled={!isOwner}
            onChange={handleSemesterChange}
          >
            <Select.Option value={1}>HK1 (Tuần 1-20)</Select.Option>
            <Select.Option value={2}>HK2 (Tuần 21-40)</Select.Option>
            <Select.Option value={3}>HK3 (Tuần 41-52)</Select.Option>
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
            disabled={!isOwner}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name="week"
          label="Tuần"
          rules={[
            { required: true, message: "Vui lòng nhập tuần" },
            {
              pattern: /^([1-9]|[1-4][0-9]|5[0-2])$/,
              message: "Tuần phải từ 1 đến 52",
            },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                const semester = form.getFieldValue("semester");
                if (!semester) return Promise.resolve();

                if (isWeekValidForSemester(semester, value)) {
                  return Promise.resolve();
                }

                const error = getWeekValidationError(semester, value);
                return Promise.reject(new Error(error));
              },
              message: "Tuần không phù hợp với học kỳ",
            },
          ]}
          extra={
            selectedSemester ? (
              <span style={{ color: "#1890ff", fontSize: 12 }}>
                {selectedSemester === 1 && "HK1: Nhập tuần từ 1 đến 20"}
                {selectedSemester === 2 && "HK2: Nhập tuần từ 21 đến 40"}
                {selectedSemester === 3 && "HK3: Nhập tuần từ 41 đến 52"}
              </span>
            ) : (
              <span style={{ color: "#999", fontSize: 12 }}>
                Chọn học kỳ trước để xem phạm vi tuần
              </span>
            )
          }
        >
          <Input
            type="number"
            min={1}
            max={52}
            placeholder="1-52"
            disabled={!isOwner}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name="period"
          label="Ca học"
          rules={[{ required: true, message: "Vui lòng chọn ca học" }]}
        >
          <Select placeholder="Chọn ca học" disabled={!isOwner}>
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
          <Select placeholder="Chọn giờ học" disabled={!isOwner}>
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
          <Input placeholder="VD: TN Máy điện" disabled={!isOwner} />
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
            disabled={!isOwner}
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
          <Input placeholder="VD: C23A.ĐL2" disabled={!isOwner} />
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
            disabled={!isOwner}
          >
            {users.map((u) => (
              <Select.Option key={u._id} value={u._id}>
                {u.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      {timetable?._id && (
        <Col span={24}>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea
              placeholder="Nhập ghi chú cho tiết dạy này (tuỳ chọn)"
              rows={3}
              disabled={!isOwner}
            />
          </Form.Item>
        </Col>
      )}
    </FormModal>
  );
}
