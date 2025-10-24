"use client";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";

interface TimetableTableProps {
  data: Timetable[];
}

const columns: ColumnsType<Timetable> = [
  {
    title: "Năm học",
    dataIndex: "schoolYear",
    key: "schoolYear",
  },
  {
    title: "Học kỳ",
    dataIndex: "semester",
    key: "semester",
    render: (value: Semester) => `HK${value}`,
  },
  {
    title: "Ngày",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Ca học",
    dataIndex: "period",
    key: "period",
    render: (value: Period) => `Ca ${value}`,
  },
  {
    title: "Giờ học",
    dataIndex: "time",
    key: "time",
    render: (value: StudyTime) => value,
  },
  {
    title: "Môn học",
    dataIndex: "subject",
    key: "subject",
  },
  {
    title: "Phòng học",
    dataIndex: "room",
    key: "room",
    render: (room: any) => (typeof room === "string" ? room : room?.name),
  },
  {
    title: "Lớp",
    dataIndex: "className",
    key: "className",
  },
  {
    title: "Giảng viên",
    dataIndex: "lecturer",
    key: "lecturer",
    render: (lecturer: any) =>
      typeof lecturer === "string" ? lecturer : lecturer?.name,
  },
];

export default function TimetableTable({ data }: TimetableTableProps) {
  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={(record) => record.className + record.date + record.period}
      pagination={{ pageSize: 10 }}
    />
  );
}
