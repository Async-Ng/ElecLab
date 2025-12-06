"use client";
import React, { useState, useEffect } from "react";
import { DatePicker, message, Button, Space, Select as AntSelect } from "antd";
import dayjs, { Dayjs } from "dayjs";
import viVN from "antd/es/date-picker/locale/vi_VN";
import { Timetable, StudyTime } from "@/types/timetable";
import BaseModal from "@/components/common/BaseModal";
import FormField from "@/components/form/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { CreateMaterialRequestFromTimetable } from "@/components/requests/CreateMaterialRequestFromTimetable";

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
      <BaseModal
        open={visible}
        title="Chỉnh sửa thời khóa biểu"
        onCancel={onClose}
        size="lg"
        showFooter={false}
      >
        <div className="p-8 text-center">
          <b>Đang tải dữ liệu...</b>
        </div>
      </BaseModal>
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
      <BaseModal
        open={visible}
        title="Chỉnh sửa thời khóa biểu"
        onCancel={onClose}
        size="lg"
        customFooter={footerContent}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Năm học" required error={errors.schoolYear}>
            <Input
              placeholder="VD: 2024-2025"
              value={formData.schoolYear}
              onChange={(e) => handleChange("schoolYear", e.target.value)}
            />
          </FormField>

          <FormField label="Học kỳ" required error={errors.semester}>
            <Select
              placeholder="Chọn học kỳ"
              value={formData.semester?.toString()}
              onChange={(value) => handleChange("semester", Number(value))}
              options={[
                { value: "1", label: "HK1" },
                { value: "2", label: "HK2" },
                { value: "3", label: "HK3" },
              ]}
              fullWidth
            />
          </FormField>

          <FormField label="Ngày" required error={errors.date}>
            <DatePicker
              format="DD/MM/YYYY"
              locale={viVN}
              style={{ width: "100%" }}
              placeholder="Chọn ngày"
              value={formData.date}
              onChange={(date) => handleChange("date", date)}
            />
          </FormField>

          <FormField label="Ca học" required error={errors.period}>
            <Select
              placeholder="Chọn ca học"
              value={formData.period?.toString()}
              onChange={(value) => handleChange("period", Number(value))}
              options={[
                { value: "1", label: "Ca 1" },
                { value: "2", label: "Ca 2" },
                { value: "3", label: "Ca 3" },
                { value: "4", label: "Ca 4" },
              ]}
              fullWidth
            />
          </FormField>

          <FormField label="Giờ học" required error={errors.time}>
            <Select
              placeholder="Chọn giờ học"
              value={formData.time}
              onChange={(value) => handleChange("time", value as StudyTime)}
              options={Object.values(StudyTime).map((t) => ({
                value: t,
                label: t,
              }))}
              fullWidth
            />
          </FormField>

          <FormField label="Môn học" required error={errors.subject}>
            <Input
              placeholder="VD: TN Máy điện"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
            />
          </FormField>

          <FormField label="Phòng học" required error={errors.room}>
            <AntSelect
              showSearch
              placeholder="Chọn phòng học"
              optionFilterProp="children"
              value={formData.room}
              onChange={(value) => handleChange("room", value)}
              style={{ width: "100%" }}
              getPopupContainer={(trigger) =>
                trigger.parentElement || document.body
              }
              dropdownStyle={{ zIndex: 10000 }}
              filterOption={(input, option) =>
                String(option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {rooms.map((r) => (
                <AntSelect.Option key={r._id} value={r._id}>
                  {r.room_id} - {r.name}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </FormField>

          <FormField label="Lớp" required error={errors.className}>
            <Input
              placeholder="VD: C23A.ĐL2"
              value={formData.className}
              onChange={(e) => handleChange("className", e.target.value)}
            />
          </FormField>

          <div className="col-span-2">
            <FormField label="Giảng viên" required error={errors.lecturer}>
              <AntSelect
                showSearch
                placeholder="Chọn giảng viên"
                optionFilterProp="children"
                value={formData.lecturer}
                onChange={(value) => handleChange("lecturer", value)}
                style={{ width: "100%" }}
                getPopupContainer={(trigger) =>
                  trigger.parentElement || document.body
                }
                dropdownStyle={{ zIndex: 10000 }}
                filterOption={(input, option) =>
                  String(option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {users.map((u) => (
                  <AntSelect.Option key={u._id} value={u._id}>
                    {u.name}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </FormField>
          </div>
        </div>
      </BaseModal>

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
