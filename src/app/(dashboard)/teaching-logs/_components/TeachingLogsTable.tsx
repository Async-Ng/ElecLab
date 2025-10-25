"use client";
import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import { TeachingLog, TeachingLogStatus } from "../../../../types/teachingLog";
import { useAuth } from "../../../../hooks/useAuth";
import { UserRole } from "../../../../types/user";
import ExportLogsButton from "./ExportLogsButton";
import TeachingLogModal from "./TeachingLogModal";

const columns = [
  {
    title: "Ngày",
    dataIndex: ["timetable", "date"],
    key: "date",
    render: (value: string) => value,
  },
  {
    title: "Ca học",
    dataIndex: ["timetable", "period"],
    key: "period",
    render: (value: number) => `Ca ${value}`,
  },
  {
    title: "Phòng học",
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
      <span>
        {images.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`log-img-${idx}`}
            style={{ width: 60, marginRight: 8, borderRadius: 4 }}
          />
        ))}
      </span>
    ),
  },
];

const TeachingLogsTable: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<TeachingLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [editLog, setEditLog] = useState<TeachingLog | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);

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
    <>
      <ExportLogsButton logs={logs} />
      <Table
        columns={columns}
        dataSource={logs}
        rowKey={(record) => record._id}
        loading={loading}
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => {
            setEditLog(record);
            setModalOpen(true);
          },
        })}
      />
      <TeachingLogModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditLog(undefined);
        }}
        timetableId={
          typeof editLog?.timetable === "object"
            ? String(editLog?.timetable?._id || "")
            : String(editLog?.timetable || "")
        }
        log={editLog}
        onSuccess={() => {
          setModalOpen(false);
          setEditLog(undefined);
        }}
      />
    </>
  );
};

export default TeachingLogsTable;
