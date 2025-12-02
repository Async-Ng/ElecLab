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
import { SmartTable, SmartTableColumn } from "@/components/table";
import { useTeachingLogs } from "@/hooks/stores";
import { EyeOutlined } from "@ant-design/icons";

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
  const {
    teachingLogs: logs,
    loading,
    fetchTeachingLogs,
  } = useTeachingLogs({
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

  // Check if user is admin
  const isAdmin = user?.roles?.includes(UserRole.Admin);

  // Define columns with SmartTable API
  const columns: SmartTableColumn<TeachingLog>[] = useMemo(() => {
    const baseColumns: SmartTableColumn<TeachingLog>[] = [
      {
        key: "semester",
        title: "Học kỳ",
        dataIndex: ["timetable", "semester"],
        width: "8%",
        mobile: true,
      },
      {
        key: "schoolYear",
        title: "Năm học",
        dataIndex: ["timetable", "schoolYear"],
        width: "10%",
        mobile: true,
      },
      {
        key: "date",
        title: "Ngày",
        dataIndex: ["timetable", "date"],
        width: "12%",
        mobile: true,
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
        key: "period",
        title: "Ca học",
        dataIndex: ["timetable", "period"],
        width: "8%",
        render: (value: number) => `Ca ${value}`,
      },
      {
        key: "room",
        title: "Phòng học",
        dataIndex: ["timetable", "room"],
        width: "12%",
        render: (room: any) => room?.name || room || "-",
      },
      {
        key: "subject",
        title: "Môn học",
        dataIndex: ["timetable", "subject"],
        width: "15%",
        mobile: true,
        render: (subject: any) => subject?.name || subject || "-",
      },
    ];

    // Add lecturer column only for admin
    if (isAdmin) {
      baseColumns.push({
        key: "lecturer",
        title: "Giảng viên",
        dataIndex: ["timetable", "lecturer"],
        width: "15%",
        render: (lecturer: any) => lecturer?.name || lecturer || "-",
      });
    }

    // Add note and status columns
    baseColumns.push(
      {
        key: "note",
        title: "Ghi chú",
        dataIndex: "note",
        width: "20%",
        render: (value: string) => (
          <span className="line-clamp-2" title={value}>
            {value || "-"}
          </span>
        ),
      },
      {
        key: "status",
        title: "Trạng thái",
        dataIndex: "status",
        width: "10%",
        mobile: true,
        isStatus: true, // Auto-render as Badge
        render: (status: TeachingLogStatus) => {
          // Custom status rendering with specific variants
          const variant =
            status === TeachingLogStatus.NORMAL ? "success" : "warning";
          const label =
            status === TeachingLogStatus.NORMAL ? "Bình thường" : "Sự cố";
          return (
            <Badge variant={variant} size="md">
              {label}
            </Badge>
          );
        },
      }
    );

    return baseColumns;
  }, [isAdmin]);

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

      <SmartTable
        data={filteredLogs}
        columns={columns}
        loading={false}
        rowKey="_id"
        onRowClick={(record) => {
          setEditLog(record);
          setModalOpen(true);
        }}
        emptyState={{
          title: "Chưa có nhật ký giảng dạy",
          description:
            "Nhật ký sẽ xuất hiện sau khi bạn ghi log cho các ca học",
          illustration: "search",
        }}
        stickyHeader
        zebraStriping
        cardConfig={{
          title: (record) => {
            const t = (record.timetable as any) || {};
            return t.subject?.name || t.subject || "Môn học";
          },
          subtitle: (record) => {
            const t = (record.timetable as any) || {};
            const date = t.date
              ? new Date(t.date).toLocaleDateString("vi-VN")
              : "";
            return `${date} • Ca ${t.period || "-"} • ${
              t.room?.name || t.room || "-"
            }`;
          },
          badge: (record) => {
            const variant =
              record.status === TeachingLogStatus.NORMAL
                ? "success"
                : "warning";
            const label =
              record.status === TeachingLogStatus.NORMAL
                ? "Bình thường"
                : "Sự cố";
            return (
              <Badge variant={variant} size="sm">
                {label}
              </Badge>
            );
          },
        }}
        actions={[
          {
            key: "view",
            label: "Xem chi tiết",
            icon: <EyeOutlined />,
            onClick: (record) => {
              setEditLog(record);
              setModalOpen(true);
            },
            tooltip: "Xem và chỉnh sửa nhật ký",
          },
        ]}
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
          await fetchTeachingLogs(user?._id, user?.roles, true);
        }}
      />
    </div>
  );
};

export default TeachingLogsTable;
