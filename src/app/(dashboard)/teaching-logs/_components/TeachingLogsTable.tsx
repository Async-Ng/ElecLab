"use client";
import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import { TeachingLog, TeachingLogStatus } from "../../../../types/teachingLog";
import { useAuth } from "../../../../hooks/useAuth";
import { UserRole } from "../../../../types/user";

const columns = [
  {
    title: "Thời gian",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (value: string) => new Date(value).toLocaleString(),
  },
  {
    title: "Giảng viên",
    dataIndex: ["timetable", "lecturer"],
    key: "lecturer",
    render: (lecturer: any) => lecturer?.name || lecturer,
  },
  {
    title: "Môn học",
    dataIndex: ["timetable", "subject"],
    key: "subject",
  },
  {
    title: "Lớp",
    dataIndex: ["timetable", "className"],
    key: "className",
  },
  {
    title: "Phòng",
    dataIndex: ["timetable", "room"],
    key: "room",
    render: (room: any) => room?.name || room,
  },
  {
    title: "Ghi chú",
    dataIndex: "note",
    key: "note",
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: TeachingLogStatus) => (
      <Tag color={status === TeachingLogStatus.NORMAL ? "green" : "red"}>
        {status}
      </Tag>
    ),
  },
  {
    title: "Ảnh",
    dataIndex: "imageUrl",
    key: "imageUrl",
    render: (images: string[] = []) => (
      <>
        {images.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`log-img-${idx}`}
            style={{ width: 60, marginRight: 8, borderRadius: 4 }}
          />
        ))}
      </>
    ),
  },
];

const TeachingLogsTable: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<TeachingLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const roleParam = user?.roles?.includes(UserRole.Head_of_deparment)
          ? "Head_of_deparment"
          : "Lecture";
        const userId = user?._id;
        const q = new URLSearchParams();
        if (userId) q.set("userId", userId);
        if (roleParam) q.set("userRole", roleParam);
        const res = await fetch(`/api/teaching-logs?${q.toString()}`);
        let data: TeachingLog[] = await res.json();
        setLogs(data);
      } catch (err) {
        setLogs([]);
      }
      setLoading(false);
    };
    fetchLogs();
  }, [user]);

  return (
    <Table
      columns={columns}
      dataSource={logs}
      rowKey={(record) => record._id}
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default TeachingLogsTable;
