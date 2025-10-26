"use client";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  DatePicker,
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

function normalizeDate(val: any): string {
  let dateVal = String(val).trim();
  if (/^\d+$/.test(dateVal)) {
    // Excel serial
    const serial = Number(dateVal);
    const excelEpoch = new Date(1899, 11, 30);
    const dateObj = new Date(
      excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000
    );
    const d = dateObj.getDate().toString().padStart(2, "0");
    const m = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const y = dateObj.getFullYear();
    dateVal = `${d}/${m}/${y}`;
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    // Convert YYYY-MM-DD to DD/MM/YYYY
    const [y, m, d] = dateVal.split("-");
    dateVal = `${d}/${m}/${y}`;
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateVal)) {
    dateVal = dateVal.replace(/-/g, "/");
  }
  return dateVal;
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
      render: (val: string, record: any) => (
        <Input
          value={val}
          style={{ width: 100 }}
          onChange={(e) =>
            updateRow(record.key, { schoolYear: e.target.value })
          }
        />
      ),
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
        const formatted = normalizeDate(val);
        const isValidDate = dayjs(formatted, "DD/MM/YYYY", true).isValid();
        return (
          <DatePicker
            format="DD/MM/YYYY"
            value={isValidDate ? dayjs(formatted, "DD/MM/YYYY", true) : null}
            style={{ width: 120 }}
            onChange={(date) => {
              if (date && date.isValid()) {
                updateRow(record.key, { date: date.format("DD/MM/YYYY") });
              } else {
                updateRow(record.key, { date: "" });
              }
            }}
            placeholder={isValidDate ? undefined : "Chọn ngày"}
            open={isValidDate ? undefined : false}
            allowClear
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
        // Chuẩn hóa ngày
        const dateVal = normalizeDate(record.date);
        if (!isValid(record)) return <Tag color="red">Thiếu trường</Tag>;
        if (!/^\d{4}-\d{4}$/.test(record.schoolYear)) {
          return <Tag color="orange">Năm học sai định dạng</Tag>;
        }
        if (
          !/^\d{2}\/\d{2}\/\d{4}$/.test(dateVal) ||
          !dayjs(dateVal, "DD/MM/YYYY", true).isValid()
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
  ];
  const validCount = rows.filter(isValid).length;
  const invalidSchoolYearRows = rows.filter(
    (r) => !/^\d{4}-\d{4}$/.test(r.schoolYear)
  );
  const invalidDateRows = rows.filter((r) => {
    const dateVal = normalizeDate(r.date);
    return (
      !/^\d{2}\/\d{2}\/\d{4}$/.test(dateVal) ||
      !dayjs(dateVal, "DD/MM/YYYY", true).isValid()
    );
  });

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
        <>
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message={`Có ${invalidDateRows.length} bản ghi có ngày không đúng định dạng (DD/MM/YYYY). Vui lòng chọn lại ngày theo chuẩn ngày/tháng/năm.`}
          />
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 12 }}
            message={
              <div>
                <b>Chi tiết bản ghi sai:</b>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {invalidDateRows.map((row, idx) => (
                    <li key={row.key || idx}>
                      Dòng {idx + 1}: <b>{row.date}</b>
                    </li>
                  ))}
                </ul>
              </div>
            }
          />
        </>
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
