"use client";
import React, { useState, useMemo, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import { TeachingLog, TeachingLogStatus } from "../../../../types/teachingLog";
import { useAuth } from "../../../../hooks/useAuth";
import { UserRole } from "../../../../types/user";
import ExportLogsButton from "./ExportLogsButton";
import TeachingLogModal from "./TeachingLogModal";
import TeachingLogsFilter from "./TeachingLogsFilter";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/common";
import { DataTable } from "@/components/common";
import { useTeachingLogs } from "@/hooks/stores";

function getColumns(isHead: boolean) {
  const base = [
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
    {
      title: "Ngày",
      dataIndex: ["timetable", "date"],
      key: "date",
      render: (value: string) => {
        if (!value) return "";
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        return d.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
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
      title: "Môn học",
      dataIndex: ["timetable", "subject"],
      key: "subject",
      render: (subject: any) => subject?.name || subject || "",
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
        <Badge
          variant={status === TeachingLogStatus.NORMAL ? "success" : "danger"}
        >
          {status}
        </Badge>
      ),
    }
  );
  return base;
}

const TeachingLogsTable: React.FC = () => {
  const { user } = useAuth();
  const [editLog, setEditLog] = useState<TeachingLog | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<{
    semester?: string;
    schoolYear?: string;
    room?: string;
    lecturer?: string;
  }>({});
  const [materials, setMaterials] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRole, setActiveRole] = useState<string | null>(null);

  // Load active role from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("activeRole");
      setActiveRole(stored);
    }
  }, []);

  // Use Zustand store with auto-fetch and caching
  // If active role is User, fetch only that user's logs; if Admin, fetch all
  const { teachingLogs: logs, loading } = useTeachingLogs({
    userId: activeRole === UserRole.User ? user?._id : undefined,
  });

  // Fetch materials and rooms for material requests
  React.useEffect(() => {
    fetch("/api/materials")
      .then((res) => res.json())
      .then((d) =>
        setMaterials(
          (Array.isArray(d) ? d : d.materials || []).map((m: any) => ({
            _id: m._id,
            name: m.name,
            quantity: m.quantity,
          }))
        )
      );
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((d) =>
        setRooms(
          (Array.isArray(d) ? d : d.rooms || []).map((r: any) => ({
            _id: r._id,
            room_id: r.room_id,
            name: r.name,
          }))
        )
      );
  }, []);

  // Lọc logs theo các trường filter
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const t = (log.timetable as any) || {};
      if (filters.semester && t.semester !== filters.semester) return false;
      if (filters.schoolYear && t.schoolYear !== filters.schoolYear)
        return false;
      if (filters.room) {
        const room = t.room;
        if (typeof room === "object" && room?._id !== filters.room)
          return false;
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
  }, [logs, filters]);

  if (loading) {
    return <LoadingSpinner tip="Đang tải nhật ký ca dạy..." />;
  }

  return (
    <div style={{ padding: "24px" }}>
      <PageHeader
        title="Nhật ký giảng dạy"
        description="Quản lý nhật ký các ca giảng dạy"
        extra={<ExportLogsButton logs={filteredLogs} />}
      />

      <TeachingLogsFilter logs={logs} filters={filters} onChange={setFilters} />

      <DataTable
        data={filteredLogs}
        columns={getColumns(!!user?.roles?.includes(UserRole.Admin))}
        loading={false}
        showActions={false}
        onRow={(record) => ({
          onClick: () => {
            setEditLog(record);
            setModalOpen(true);
          },
          style: { cursor: "pointer" },
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
        materials={materials}
        rooms={rooms}
        onSuccess={async () => {
          setModalOpen(false);
          setEditLog(undefined);
          // Refetch teaching logs to get latest data (force bypass cache)
          await fetchTeachingLogs(user?._id, true);
        }}
      />
    </div>
  );
};

export default TeachingLogsTable;
