"use client";

import React, { useState, useMemo } from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal, Upload, Input, Button, Radio, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import { useTimetable } from "@/features/timetable/hooks/useTimetable";
import { updateTimetable } from "@/features/timetable/services/timetableAPI";

const locales = {
  "vi": require("date-fns/locale/vi"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const { TextArea } = Input;

export default function TimetableCalendar() {
  const { data, loading, fetchData } = useTimetable();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<{ status: string; note: string; files: any[] }>({
    status: "normal",
    note: "",
    files: [],
  });
  const [saving, setSaving] = useState(false);

  const events = useMemo(
    () =>
      data.map((item: any) => ({
        id: item.id,
        title: `${item.className} - ${item.subject}`,
        start: new Date(item.date),
        end: new Date(item.date),
        allDay: true,
        resource: item,
      })),
    [data]
  );

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
    setForm({
      status: event.resource.status || "normal",
      note: event.resource.note || "",
      files: event.resource.files || [],
    });
    setIsModalOpen(true);
  };

  const handleUpload = ({ fileList }: any) => {
    setForm({ ...form, files: fileList });
  };

  const handleSave = async () => {
    if (form.status === "incident" && (!form.note || form.files.length === 0)) {
      Swal.fire("Thiếu dữ liệu!", "Vui lòng nhập ghi chú và tải ảnh minh chứng.", "warning");
      return;
    }

    Swal.fire({
      title: "Xác nhận ghi nhật ký?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Lưu lại",
    }).then(async (result) => {
      if (result.isConfirmed && selectedEvent) {
        setSaving(true);
        try {
          await updateTimetable(selectedEvent.id, {
            status: form.status,
            note: form.note,
            files: form.files.map((f) => f.name),
          });
          Swal.fire("Thành công!", "Đã cập nhật nhật ký buổi học.", "success");
          setIsModalOpen(false);
          fetchData();
        } catch (error) {
          Swal.fire("Lỗi!", "Không thể lưu dữ liệu.", "error");
        } finally {
          setSaving(false);
        }
      }
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4 text-blue-600">📅 Lịch giảng dạy</h1>

      <Spin spinning={loading}>
        <div style={{ height: "80vh" }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={[Views.MONTH, Views.WEEK]}
            defaultView={Views.WEEK}
            selectable
            popup
            onSelectEvent={handleSelectEvent}
            messages={{
              month: "Tháng",
              week: "Tuần",
              day: "Ngày",
              today: "Hôm nay",
            }}
          />
        </div>
      </Spin>

      <Modal
        open={isModalOpen}
        title="Chi tiết buổi học"
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedEvent && (
          <div className="space-y-3">
            <p><b>Lớp:</b> {selectedEvent.className}</p>
            <p><b>Môn học:</b> {selectedEvent.subject}</p>
            <p><b>Giảng viên:</b> {selectedEvent.teacher}</p>
            <p><b>Phòng:</b> {selectedEvent.room}</p>
            <p><b>Giờ học:</b> {selectedEvent.time}</p>
            <hr />

            <Radio.Group
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <Radio value="normal">Bình thường</Radio>
              <Radio value="incident">Có sự cố</Radio>
            </Radio.Group>

            {form.status === "incident" && (
              <>
                <Upload
                  multiple
                  beforeUpload={() => false}
                  onChange={handleUpload}
                  fileList={form.files}
                  listType="picture"
                >
                  <Button icon={<UploadOutlined />}>Tải ảnh minh chứng</Button>
                </Upload>

                {/* Preview hình nhỏ */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.files.map((f: any, i: number) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(f.originFileObj)}
                      alt="preview"
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  ))}
                </div>

                <TextArea
                  rows={3}
                  placeholder="Nhập ghi chú sự cố..."
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </>
            )}

            <Button
              type="primary"
              className="w-full mt-3"
              loading={saving}
              onClick={handleSave}
            >
              Ghi nhật ký
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
