"use client";
import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import { TeachingLog, TeachingLogStatus } from "../../../../types/teachingLog";
import { useAuth } from "../../../../hooks/useAuth";
import { UserRole } from "../../../../types/user";
import ExportLogsButton from "./ExportLogsButton";
import TeachingLogModal from "./TeachingLogModal";
import TeachingLogsFilter from "./TeachingLogsFilter";

function getColumns(isHead: boolean) {
  const base = [
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
      title: "Học kỳ",
      dataIndex: ["timetable", "semester"],
      key: "semester",
      render: (value: string | number) => value,
    },
    {
      title: "Năm học",
      dataIndex: ["timetable", "schoolYear"],
      key: "schoolYear",
      render: (value: string | number) => value,
    },
  ];
  if (isHead) {
    base.push({
      title: "Giảng viên",
      dataIndex: ["timetable", "lecturer"],
      key: "lecturer",
      render: (lecturer: any) => lecturer?.name || lecturer,
    });
  }
  base.push(
    {
      title: "Ghi chú",
      dataIndex: ["note"],
      key: "note",
      render: (value: string) => value,
    },
    {
      title: "Trạng thái",
      dataIndex: ["status"],
      key: "status",
      render: (status: TeachingLogStatus) => (
        <Tag color={status === TeachingLogStatus.NORMAL ? "green" : "red"}>
          {status}
        </Tag>
      ),
    }
  );
  return base;
}

const TeachingLogsTable: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<TeachingLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [editLog, setEditLog] = useState<TeachingLog | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<{
    semester?: string;
    schoolYear?: string;
    room?: string;
    lecturer?: string;
  }>({});

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

  // Lọc logs theo các trường filter
  const filteredLogs = logs.filter((log) => {
    const t = (log.timetable as any) || {};
    if (filters.semester && t.semester !== filters.semester) return false;
    if (filters.schoolYear && t.schoolYear !== filters.schoolYear) return false;
    if (filters.room) {
      const room = t.room;
      if (typeof room === "object" && room?._id !== filters.room) return false;
      if (typeof room === "string" && room !== filters.room) return false;
    }
    if (filters.lecturer) {
      const lec = t.lecturer;
      if (typeof lec === "object" && lec?._id !== filters.lecturer)
        return false;
      if (typeof lec === "string" && lec !== filters.lecturer) return false;
    }
    return true;
  });

  return (
    <>
      <TeachingLogsFilter logs={logs} filters={filters} onChange={setFilters} />
      <ExportLogsButton logs={filteredLogs} />
      <Table
        columns={getColumns(
          !!user?.roles?.includes(UserRole.Head_of_deparment)
        )}
        dataSource={filteredLogs}
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
