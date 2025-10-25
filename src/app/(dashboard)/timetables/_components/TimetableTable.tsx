"use client";
import { Table, Button } from "antd";
import TimetableModal from "./TimetableModal";
import React, { useState } from "react";
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
  {
    title: "Chỉnh sửa",
    key: "actions",
    render: (_: any, record: Timetable) => (
      <Button type="link" onClick={() => handleEdit(record)}>
        Chỉnh sửa
      </Button>
    ),
  },
];

export default function TimetableTable({ data }: TimetableTableProps) {
  const [editVisible, setEditVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<Timetable | null>(null);
  const [tableData, setTableData] = useState<Timetable[]>(data);
  const [rooms, setRooms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  React.useEffect(() => {
    setTableData(data);
  }, [data]);
  React.useEffect(() => {
  fetch("/api/rooms?userRole=Admin")
      .then((res) => res.json())
      .then((d) =>
        setRooms(
          (d.rooms || []).map((r: any) => ({
            _id: r._id,
            name: r.name,
            room_id: r.room_id,
          }))
        )
      );
    fetch("/api/users")
      .then((res) => res.json())
      .then((d) =>
        setUsers(
          (d || []).map((u: any) => ({
            _id: u._id,
            name: u.name,
            email: u.email,
          }))
        )
      );
  }, []);

  const handleEdit = (record: Timetable) => {
    setEditRecord(record);
    setEditVisible(true);
  };
  const handleEditSuccess = (updated: Timetable) => {
    setTableData((prev) =>
      prev.map((item) => (item._id === updated._id ? updated : item))
    );
  };

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
    {
      title: "Chỉnh sửa",
      key: "actions",
      render: (_: any, record: Timetable) => (
        <Button type="link" onClick={() => handleEdit(record)}>
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey={(record) =>
          record._id || record.className + record.date + record.period
        }
        pagination={{ pageSize: 10 }}
      />
      <TimetableModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSuccess={handleEditSuccess}
        timetable={editRecord}
        rooms={rooms}
        users={users}
      />
    </>
  );
}
