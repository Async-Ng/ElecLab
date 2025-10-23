// app/timetable/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Radio,
  Space,
  Upload,
  Card,
  Row,
  Col,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  TimetableEntry,
  SESSIONS,
  ViewMode,
  NoteStatus,
} from "@/types/timetable";

dayjs.extend(isoWeek);

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function TimetablePage() {
  const [form] = Form.useForm();
  const [detailForm] = Form.useForm();
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("isoWeek"),
    dayjs().endOf("isoWeek"),
  ]);
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [forceRender, setForceRender] = useState(false);

  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchTimetables();
  }, [dateRange]);

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const [start, end] = dateRange;
      const response = await fetch(
        `/api/timetable?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      const result = await response.json();
      if (result.success) {
        setTimetables(result.data);
      }
    } catch (error) {
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === "week") {
      setDateRange([dayjs().startOf("isoWeek"), dayjs().endOf("isoWeek")]);
    } else {
      setDateRange([dayjs().startOf("month"), dayjs().endOf("month")]);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const selectedDate = values.date;
      const academicYear = `${selectedDate.year()}-${selectedDate.year() + 1}`;

      const payload = {
        academicYear,
        semester: values.semester,
        date: selectedDate.toDate(),
        sessions: selectedSessions,
        subject: values.subject,
        room: values.room,
        class: values.class,
        instructor: values.instructor,
        noteStatus: "normal" as NoteStatus,
      };

      const response = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        message.success("Thêm thời khóa biểu thành công");
        setIsModalOpen(false);
        form.resetFields();
        setSelectedSessions([]);
        fetchTimetables();
      } else {
        message.error(result.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      message.error("Không thể thêm thời khóa biểu");
    }
  };

  const showDetailModal = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    detailForm.setFieldsValue({
      ...entry,
      date: dayjs(entry.date),
      noteStatus: entry.noteStatus || "normal",
      incidentNote: entry.incidentNote || "",
      incidentImages: entry.incidentImages || [],
    });
    setIsDetailModalOpen(true);
  };

  const getSessionTime = (sessionNumbers: number[]) => {
    if (!sessionNumbers || sessionNumbers.length === 0) return "";
    const sessions = sessionNumbers.map((num) =>
      SESSIONS.find((s) => s.sessionNumber === num)
    );
    const validSessions = sessions.filter(Boolean);
    if (validSessions.length === 0) return "";
    return `${validSessions[0]?.startTime}-${
      validSessions[validSessions.length - 1]?.endTime
    }`;
  };

  const generateWeekColumns = () => {
    const columns: any[] = [
      {
        title: "Từ",
        dataIndex: "period",
        key: "period",
        width: 150,
        fixed: "left",
        render: (text: string) => <div className="font-semibold">{text}</div>,
      },
    ];

    const start = dateRange[0];
    for (let i = 0; i < 7; i++) {
      const date = start.add(i, "day");
      const dayName = [
        "Chủ nhật",
        "Thứ hai",
        "Thứ ba",
        "Thứ tư",
        "Thứ năm",
        "Thứ sáu",
        "Thứ bảy",
      ][date.day()];

      columns.push({
        title: (
          <div className="text-center">
            <div className="font-semibold">{dayName}</div>
            <div className="text-xs text-gray-500">{date.format("DD/MM")}</div>
          </div>
        ),
        dataIndex: `day${i}`,
        key: `day${i}`,
        width: 200,
        render: (entries: TimetableEntry[]) => {
          if (!entries || entries.length === 0)
            return <div className="h-20"></div>;

          return (
            <div className="space-y-1">
              {entries.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => showDetailModal(entry)}
                >
                  <div className="text-xs font-semibold text-blue-900">
                    {entry.subject}
                  </div>
                  <div className="text-xs text-gray-600">{entry.room}</div>
                  <div className="text-xs text-gray-500">{entry.class}</div>
                </div>
              ))}
            </div>
          );
        },
      });
    }

    const handleEditToggle = () => {
      if (isEditing) {
        // Hủy chỉnh sửa
        detailForm.setFieldsValue({
          ...selectedEntry,
          date: dayjs(selectedEntry?.date),
          noteStatus: selectedEntry?.noteStatus || "normal",
          incidentNote: selectedEntry?.incidentNote || "",
          incidentImages: selectedEntry?.incidentImages || [],
        });
        setIsEditing(false);
      } else {
        // Bật chế độ chỉnh sửa
        setIsEditing(true);
      }
    };
    return columns;
  };

  const generateWeekData = () => {
    const periods = [
      { name: "Ca 1", time: "7:00-9h30", sessions: [1] },
      { name: "Ca 2", time: "9h45-11:45", sessions: [2] },
      { name: "Ca 3", time: "12:30-14h45", sessions: [3] },
      { name: "Ca 4", time: "15:00-17:15", sessions: [4] },
    ];

    return periods.map((period, pIdx) => {
      const row: any = {
        key: `period-${pIdx}`,
        period: (
          <div>
            <div className="font-semibold">{period.name}</div>
            <div className="text-xs text-gray-500">{period.time}</div>
          </div>
        ),
      };

      const start = dateRange[0];
      for (let i = 0; i < 7; i++) {
        const date = start.add(i, "day");
        const dayEntries = timetables.filter((t) => {
          const tDate = dayjs(t.date);
          return (
            tDate.isSame(date, "day") &&
            t.sessions.some((s) => period.sessions.includes(s))
          );
        });
        row[`day${i}`] = dayEntries;
      }

      return row;
    });
  };
  const handleUpdateNote = async () => {
    try {
      const values = detailForm.getFieldsValue();
      const response = await fetch(`/api/timetable/${selectedEntry?._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();
      if (result.success) {
        message.success("Đã cập nhật buổi học.");
        setIsEditing(false);
        fetchTimetables();
      } else {
        message.error(result.error || "Không thể lưu.");
      }
    } catch (error) {
      message.error("Không thể cập nhật ghi chú.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Thời Khóa Biểu</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            size="large"
          >
            Thêm mới
          </Button>
        </div>

        <Card className="mb-4">
          <Space size="large">
            <Radio.Group
              value={viewMode}
              onChange={(e) => handleViewModeChange(e.target.value)}
            >
              <Radio.Button value="week">Xem theo tuần</Radio.Button>
              <Radio.Button value="month">Xem theo tháng</Radio.Button>
            </Radio.Group>

            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0], dates[1]]);
                }
              }}
              format="DD/MM/YYYY"
            />
          </Space>
        </Card>

        <Card>
          <Table
            columns={generateWeekColumns()}
            dataSource={generateWeekData()}
            loading={loading}
            pagination={false}
            scroll={{ x: 1400 }}
            bordered
          />
        </Card>

        <Modal
          title="Thêm Thời Khóa Biểu"
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
            setSelectedSessions([]);
          }}
          onOk={() => form.submit()}
          width={700}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="date"
                  label="Thời gian"
                  rules={[{ required: true }]}
                >
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="semester"
                  label="Học kỳ"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Chọn học kỳ">
                    <Select.Option value="1">Học kỳ 1</Select.Option>
                    <Select.Option value="2">Học kỳ 2</Select.Option>
                    <Select.Option value="3">Học kỳ 3</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Ca học" required>
              <Select
                mode="multiple"
                placeholder="Chọn ca học"
                value={selectedSessions}
                onChange={setSelectedSessions}
              >
                {SESSIONS.map((session) => (
                  <Select.Option
                    key={session.sessionNumber}
                    value={session.sessionNumber}
                  >
                    Ca {session.sessionNumber} ({session.startTime} -{" "}
                    {session.endTime})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="subject"
                  label="Môn học"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Nhập môn học" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="room"
                  label="Phòng học"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Nhập phòng học" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="class"
                  label="Lớp"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Nhập lớp" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="instructor"
                  label="Giảng viên"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Nhập tên giảng viên" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        <Modal
          title="Chi Tiết Buổi Học"
          open={isDetailModalOpen}
          onCancel={() => {
            if (isEditing) {
              Modal.confirm({
                title: "Hủy chỉnh sửa?",
                content: "Mọi thay đổi chưa lưu sẽ bị mất.",
                okText: "Hủy chỉnh sửa",
                cancelText: "Tiếp tục chỉnh sửa",
                onOk: () => {
                  detailForm.setFieldsValue(selectedEntry);
                  setIsEditing(false);
                },
              });
            } else {
              setIsDetailModalOpen(false);
            }
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                if (isEditing) {
                  Modal.confirm({
                    title: "Hủy chỉnh sửa?",
                    content: "Mọi thay đổi chưa lưu sẽ bị mất.",
                    okText: "Hủy chỉnh sửa",
                    cancelText: "Tiếp tục chỉnh sửa",
                    onOk: () => {
                      detailForm.setFieldsValue(selectedEntry);
                      setIsEditing(false);
                    },
                  });
                } else {
                  setIsDetailModalOpen(false);
                }
              }}
            >
              {isEditing ? "Hủy chỉnh sửa" : "Đóng"}
            </Button>,
            <Button
              key="edit"
              type="primary"
              onClick={() => {
                if (isEditing) {
                  handleUpdateNote();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              {isEditing ? "Lưu" : "Sửa"}
            </Button>,
          ]}
          width={700}
        >
          <Form form={detailForm} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Năm học" name="academicYear">
                  <Input disabled={!isEditing} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Học kỳ" name="semester">
                  <Input disabled={!isEditing} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Thời gian" name="date">
                  <Input disabled={!isEditing} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Giờ học">
                  <Input
                    value={
                      selectedEntry
                        ? getSessionTime(selectedEntry.sessions)
                        : ""
                    }
                    disabled
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Môn học" name="subject">
                  <Input disabled={!isEditing} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Phòng học" name="room">
                  <Input disabled={!isEditing} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Lớp" name="class">
                  <Input disabled={!isEditing} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Giảng viên" name="instructor">
                  <Input disabled={!isEditing} />
                </Form.Item>
              </Col>
            </Row>

            {/* Toggle trạng thái */}
            <Form.Item label="Trạng thái buổi học" name="noteStatus">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    border: "2px solid #d9d9d9",
                    borderRadius: "25px",
                    overflow: "hidden",
                    width: "240px",
                    height: "40px",
                    cursor: isEditing ? "pointer" : "not-allowed",
                    userSelect: "none",
                  }}
                >
                  {["normal", "incident"].map((status) => {
                    const active =
                      detailForm.getFieldValue("noteStatus") === status;
                    const isNormal = status === "normal";
                    return (
                      <div
                        key={status}
                        onClick={() => {
                          if (!isEditing) return;
                          detailForm.setFieldValue("noteStatus", status);
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: active
                            ? isNormal
                              ? "#16a34a"
                              : "#dc2626"
                            : "transparent",
                          color: active ? "#fff" : "#555",
                          fontWeight: 600,
                          textAlign: "center",
                          lineHeight: "36px",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {isNormal ? "Bình thường" : "Sự cố"}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Form.Item>

            <Form.Item name="incidentNote" label="Ghi chú sự cố">
              <TextArea
                rows={4}
                placeholder="Nhập mô tả sự cố..."
                disabled={!isEditing}
              />
            </Form.Item>

            <Form.Item name="incidentImages" label="Ảnh sự cố">
              <Upload
                listType="picture-card"
                maxCount={5}
                beforeUpload={() => false}
                disabled={!isEditing}
              >
                {isEditing && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
