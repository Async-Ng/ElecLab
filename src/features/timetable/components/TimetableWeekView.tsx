"use client";

import { Table, Button, Space } from "antd";
import { Timetable } from "../services/types";
import React, { useState } from "react";
import NoteModal from "./NoteModal";

interface Props {
  data: Timetable[];
  onUpdate: (id: string, data: Partial<Timetable>) => void;
}

export default function TimetableWeekView({ data, onUpdate }: Props) {
  const [selected, setSelected] = useState<Timetable | null>(null);
  const [open, setOpen] = useState(false);

  const columns = [
    { title: "Ngày", dataIndex: "date", key: "date" },
    { title: "Ca", dataIndex: "session", key: "session" },
    { title: "Giờ", dataIndex: "time", key: "time" },
    { title: "Môn học", dataIndex: "subject", key: "subject" },
    { title: "Phòng", dataIndex: "room", key: "room" },
    { title: "Lớp", dataIndex: "className", key: "className" },
    { title: "Giảng viên", dataIndex: "teacher", key: "teacher" },
    {
      title: "Tình trạng",
      key: "status",
      render: (_: any, record: Timetable) => (
        <span
          className={
            record.status === "Có sự cố"
              ? "text-red-500 font-semibold"
              : "text-green-600"
          }
        >
          {record.status || "Bình thường"}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Timetable) => (
        <Space>
          <Button
            size="small"
            type="primary"
            onClick={() => {
              setSelected(record);
              setOpen(true);
            }}
          >
            Ghi chú
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(r) => r.id || `${r.date}-${r.className}`}
        pagination={{ pageSize: 10 }}
      />

      <NoteModal
        open={open}
        onClose={() => setOpen(false)}
        record={selected}
        onSubmit={(updated) => {
          if (selected?.id) {
            onUpdate(selected.id, updated);
          }
        }}
      />
    </>
  );
}
