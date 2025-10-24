"use client";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import {
  Alert,
  Modal,
  Table,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Popconfirm,
} from "antd";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";

interface ImportPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  data: Timetable[];
  onImport: (rows: Timetable[]) => void;
  rooms?: Array<{ room_id: string; _id: string; name: string }>;
  users?: Array<{ email: string; _id: string; name: string }>;
}

export default function ImportPreviewModal({
  visible,
  onClose,
  data,
  onImport,
  rooms = [],
  users = [],
}: ImportPreviewModalProps) {
  const [rows, setRows] = useState<(Timetable & { key: string | number })[]>(
    []
  );
  useEffect(() => {
    if (visible) {
      setRows((data || []).map((r, idx) => ({ ...r, key: idx })));
    }
  }, [visible, data]);

  function updateRow(key: string | number, patch: Partial<Timetable>) {
    setRows((d) => d.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function removeRow(key: string | number) {
    setRows((d) => d.filter((r) => r.key !== key));
  }
  const isValid = (r: Timetable) =>
    !!(
      r.schoolYear &&
      r.semester &&
      r.date &&
      r.period &&
      r.time &&
      r.subject &&
      r.room &&
      r.className &&
      r.lecturer
    );
  const invalidRoomRows = rows.filter(
    (r) =>
      r.room &&
      rooms.length > 0 &&
      !rooms.some((room) => room.room_id === r.room)
  );
  const invalidLecturerRows = rows.filter(
    (r) =>
      r.lecturer &&
      users.length > 0 &&
      !users.some((u) => u.email === r.lecturer)
  );
  const columns = [
    {
      title: "Năm học",
      dataIndex: "schoolYear",
      key: "schoolYear",
      render: (val: string, record: any) => {
        // Acceptable format: YYYY-YYYY
        const validYear = /^\d{4}-\d{4}$/.test(val);
        if (validYear) {
          return (
            <Input
              value={val}
              style={{ width: 100 }}
              onChange={(e) =>
                updateRow(record.key, { schoolYear: e.target.value })
              }
            />
          );
        }
        // If invalid, show year picker
        return (
          <DatePicker
            picker="year"
            style={{ width: 100 }}
            onChange={(date: dayjs.Dayjs | null) => {
              if (date) {
                const startYear = date.year();
                updateRow(record.key, {
                  schoolYear: `${startYear}-${startYear + 1}`,
                });
              }
            }}
            placeholder="Chọn năm học"
          />
        );
      },
    },
    {
      title: "Học kỳ",
      dataIndex: "semester",
      key: "semester",
      render: (val: number, record: any) => (
        <Select
          value={val}
          style={{ width: 80 }}
          onChange={(v) => updateRow(record.key, { semester: v })}
        >
          <Select.Option value={Semester.First}>HK1</Select.Option>
          <Select.Option value={Semester.Second}>HK2</Select.Option>
          <Select.Option value={Semester.Third}>HK3</Select.Option>
        </Select>
      ),
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (val: string, record: any) => {
        // Acceptable format: YYYY-MM-DD
        const validDate =
          /^\d{4}-\d{2}-\d{2}$/.test(val) && dayjs(val).isValid();
        if (validDate) {
          return (
            <Input
              value={val}
              style={{ width: 110 }}
              onChange={(e) => updateRow(record.key, { date: e.target.value })}
            />
          );
        }
        // If invalid, show date picker
        return (
          <DatePicker
            style={{ width: 110 }}
            onChange={(date) => {
              if (date) {
                updateRow(record.key, { date: date.format("YYYY-MM-DD") });
              }
            }}
            placeholder="Chọn ngày"
          />
        );
      },
    },
    {
      title: "Ca học",
      dataIndex: "period",
      key: "period",
      render: (val: number, record: any) => (
        <Select
          value={val}
          style={{ width: 80 }}
          onChange={(v) => updateRow(record.key, { period: v })}
        >
          <Select.Option value={Period.Period1}>Ca 1</Select.Option>
          <Select.Option value={Period.Period2}>Ca 2</Select.Option>
          <Select.Option value={Period.Period3}>Ca 3</Select.Option>
          <Select.Option value={Period.Period4}>Ca 4</Select.Option>
        </Select>
      ),
    },
    {
      title: "Giờ học",
      dataIndex: "time",
      key: "time",
      render: (val: string, record: any) => (
        <Select
          value={val as StudyTime}
          style={{ width: 120 }}
          onChange={(v) => updateRow(record.key, { time: v as StudyTime })}
        >
          {Object.values(StudyTime).map((t) => (
            <Select.Option key={t} value={t}>
              {t}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Môn học",
      dataIndex: "subject",
      key: "subject",
      render: (val: string, record: any) => (
        <Input
          value={val}
          style={{ width: 120 }}
          onChange={(e) => updateRow(record.key, { subject: e.target.value })}
        />
      ),
    },
    {
      title: "Phòng học",
      dataIndex: "room",
      key: "room",
      render: (val: string, record: any) => (
        <Select
          showSearch
          style={{ width: 150 }}
          value={val || undefined}
          placeholder="Chọn phòng theo mã phòng"
          optionFilterProp="children"
          onChange={(v) => updateRow(record.key, { room: v })}
          filterOption={(input, option) => {
            const label =
              typeof option?.children === "string" ? option.children : "";
            const value = typeof option?.value === "string" ? option.value : "";
            return (
              label.toLowerCase().includes(input.toLowerCase()) ||
              value.toLowerCase().includes(input.toLowerCase())
            );
          }}
        >
          {rooms.map((room) => (
            <Select.Option key={room.room_id} value={room.room_id}>
              {room.room_id} - {room.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
      render: (val: string, record: any) => (
        <Input
          value={val}
          style={{ width: 100 }}
          onChange={(e) => updateRow(record.key, { className: e.target.value })}
        />
      ),
    },
    {
      title: "Giảng viên",
      dataIndex: "lecturer",
      key: "lecturer",
      render: (val: string, record: any) => (
        <Select
          showSearch
          style={{ width: 150 }}
          value={val || undefined}
          placeholder="Chọn giảng viên theo email"
          optionFilterProp="children"
          onChange={(v) => updateRow(record.key, { lecturer: v })}
          filterOption={(input, option) => {
            const label =
              typeof option?.children === "string" ? option.children : "";
            const value = typeof option?.value === "string" ? option.value : "";
            return (
              label.toLowerCase().includes(input.toLowerCase()) ||
              value.toLowerCase().includes(input.toLowerCase())
            );
          }}
        >
          {users.map((u) => (
            <Select.Option key={u.email} value={u.email}>
              {u.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Trạng thái",
      key: "valid",
      render: (_: any, record: Timetable) => {
        if (!isValid(record)) return <Tag color="red">Thiếu trường</Tag>;
        if (!/^\d{4}-\d{4}$/.test(record.schoolYear)) {
          return <Tag color="orange">Năm học sai định dạng</Tag>;
        }
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(record.date) ||
          !dayjs(record.date).isValid()
        ) {
          return <Tag color="orange">Ngày sai định dạng</Tag>;
        }
        if (
          rooms.length > 0 &&
          record.room &&
          !rooms.some((room) => room.room_id === record.room)
        ) {
          return <Tag color="orange">Mã phòng không hợp lệ</Tag>;
        }
        if (
          users.length > 0 &&
          record.lecturer &&
          !users.some((u) => u.email === record.lecturer)
        ) {
          return <Tag color="orange">Giảng viên không hợp lệ</Tag>;
        }
        return <Tag color="green">Hợp lệ</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Popconfirm
            title="Xóa bản ghi này?"
            onConfirm={() => removeRow(record.key)}
          >
            <Button danger size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  const validCount = rows.filter(isValid).length;
  // Check for invalid schoolYear and date format
  const invalidSchoolYearRows = rows.filter(
    (r) => !/^\d{4}-\d{4}$/.test(r.schoolYear)
  );
  const invalidDateRows = rows.filter(
    (r) => !/^\d{4}-\d{2}-\d{2}$/.test(r.date) || !dayjs(r.date).isValid()
  );

  return (
    <Modal
      title="Xem trước dữ liệu import"
      open={visible}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            onClick={() => onImport(rows.filter(isValid))}
            disabled={validCount === 0}
          >
            Import {validCount} bản ghi
          </Button>
        </Space>
      }
      width="90vw"
      destroyOnHidden
    >
      <div style={{ marginBottom: 12 }}>
        <span>
          Hợp lệ: <b>{validCount}</b> &nbsp;|&nbsp; Tổng: <b>{rows.length}</b>
        </span>
      </div>
      {invalidSchoolYearRows.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message={`Có ${invalidSchoolYearRows.length} bản ghi có năm học không đúng định dạng (YYYY-YYYY). Vui lòng chọn lại năm học.`}
        />
      )}
      {invalidDateRows.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message={`Có ${invalidDateRows.length} bản ghi có ngày không đúng định dạng (YYYY-MM-DD). Vui lòng chọn lại ngày.`}
        />
      )}
      {invalidRoomRows.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message={`Có ${invalidRoomRows.length} bản ghi có mã phòng không hợp lệ (không tìm thấy trong hệ thống). Các bản ghi này sẽ không được liên kết phòng.`}
        />
      )}
      {invalidLecturerRows.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message={`Có ${invalidLecturerRows.length} bản ghi có email giảng viên không hợp lệ (không tìm thấy trong hệ thống). Các bản ghi này sẽ không được liên kết giảng viên.`}
        />
      )}
      <Table
        rowKey={(r) => r.key}
        dataSource={rows}
        columns={columns}
        pagination={{ pageSize: 8 }}
      />
    </Modal>
  );
}
