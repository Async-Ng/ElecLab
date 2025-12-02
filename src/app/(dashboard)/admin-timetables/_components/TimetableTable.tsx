"use client";
import TimetableModal from "./TimetableModal";
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import { SmartTable, SmartTableColumn } from "@/components/table";
import { Popconfirm } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useTimetables } from "@/hooks/stores";
import { getApiEndpoint, authFetch } from "@/lib/apiClient";

interface TimetableTableProps {
  data: Timetable[];
}

export default function TimetableTable({ data }: TimetableTableProps) {
  const [editVisible, setEditVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<Timetable | null>(null);
  const [tableData, setTableData] = useState<Timetable[]>(data);
  const [rooms, setRooms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const { user, hasRole } = useAuth();

  // Load active role from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("activeRole");
      setActiveRole(stored);
    }
  }, []);

  const { fetchTimetables } = useTimetables({
    userRole: user?.roles?.[0],
  });

  // Kiểm tra xem user có phải Admin không
  const isAdmin = hasRole && (hasRole("Admin") || hasRole("Quản lý"));

  React.useEffect(() => {
    setTableData(data);
  }, [data]);

  React.useEffect(() => {
    if (!user?._id || !activeRole) return;

    // Fetch rooms
    const roomsUrl = getApiEndpoint("rooms", activeRole);
    authFetch(roomsUrl, user._id, activeRole)
      .then((res) => res.json())
      .then((d) =>
        setRooms(
          (d.rooms || []).map((r: any) => ({
            _id: r._id,
            name: r.name,
            room_id: r.room_id,
          }))
        )
      )
      .catch((err) => console.error("Error fetching rooms:", err));

    // Fetch users
    const usersUrl = getApiEndpoint("users", activeRole);
    authFetch(usersUrl, user._id, activeRole)
      .then((res) => res.json())
      .then((d) =>
        setUsers(
          (d || []).map((u: any) => ({
            _id: u._id,
            name: u.name,
            email: u.email,
          }))
        )
      )
      .catch((err) => console.error("Error fetching users:", err));

    // Fetch materials
    const materialsUrl = getApiEndpoint("materials", activeRole);
    authFetch(materialsUrl, user._id, activeRole)
      .then((res) => res.json())
      .then((d) =>
        setMaterials(
          (Array.isArray(d) ? d : d.materials || []).map((m: any) => ({
            _id: m._id,
            name: m.name,
            quantity: m.quantity,
          }))
        )
      )
      .catch((err) => console.error("Error fetching materials:", err));
  }, [user?._id, activeRole]);

  const handleEdit = (record: Timetable) => {
    setEditRecord(record);
    setEditVisible(true);
  };

  const handleDelete = async (record: Timetable) => {
    try {
      const role = activeRole || user?.roles?.[0];
      const endpoint = getApiEndpoint("timetables", role);

      const response = await authFetch(
        `${endpoint}/${record._id}`,
        user?._id || "",
        role,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Remove from local state
        setTableData((prev) => prev.filter((item) => item._id !== record._id));
        // Refetch to ensure consistency
        const userId = role === UserRole.User ? user?._id : undefined;
        await fetchTimetables(role, userId, true);
      } else {
        console.error("Failed to delete timetable");
      }
    } catch (error) {
      console.error("Error deleting timetable:", error);
    }
  };

  const handleEditSuccess = async (updated: Timetable) => {
    setTableData((prev) =>
      prev.map((item) => (item._id === updated._id ? updated : item))
    );
    // Refetch timetables to get latest data (force bypass cache)
    const role = activeRole || user?.roles?.[0];
    const userId = role === UserRole.User ? user?._id : undefined;
    await fetchTimetables(role, userId, true);
  };

  // Helper to check if user can edit/delete
  const canModify = (record: Timetable): boolean => {
    const isOwner =
      user &&
      (record.lecturer === user._id ||
        (typeof record.lecturer === "object" &&
          record.lecturer._id === user._id));
    return !!(isAdmin || isOwner);
  };

  // Date formatting helper
  const formatDate = (value: string): string => {
    let dateStr = String(value).trim();
    // Excel serial
    if (/^\d+$/.test(dateStr)) {
      const serial = Number(dateStr);
      const excelEpoch = new Date(1899, 11, 30);
      const dateObj = new Date(
        excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000
      );
      const d = dateObj.getDate().toString().padStart(2, "0");
      const m = (dateObj.getMonth() + 1).toString().padStart(2, "0");
      const y = dateObj.getFullYear();
      dateStr = `${d}/${m}/${y}`;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split("-");
      dateStr = `${d}/${m}/${y}`;
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      dateStr = dateStr.replace(/-/g, "/");
    }
    // Validate DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      return dateStr;
    }
    return "";
  };

  const columns: SmartTableColumn<Timetable>[] = useMemo(() => {
    const cols: SmartTableColumn<Timetable>[] = [
      {
        key: "semester-year",
        title: "Học kỳ / Năm học",
        dataIndex: "semester",
        width: "12%",
        mobile: true,
        render: (semester: Semester, record) => (
          <div>
            <div
              style={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}
            >
              HK{semester}
            </div>
            <div style={{ color: "#64748B", fontSize: "14px" }}>
              {record.schoolYear}
            </div>
          </div>
        ),
      },
      {
        key: "date",
        title: "Ngày học",
        dataIndex: "date",
        width: "10%",
        mobile: true,
        render: (value: string) => {
          const formatted = formatDate(value);
          return (
            <span
              style={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}
            >
              {formatted}
            </span>
          );
        },
      },
      {
        key: "period-time",
        title: "Ca học / Giờ",
        dataIndex: "period",
        width: "12%",
        render: (period: Period, record) => (
          <div>
            <div
              style={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}
            >
              Ca {period}
            </div>
            <div style={{ color: "#64748B", fontSize: "14px" }}>
              {record.time}
            </div>
          </div>
        ),
      },
      {
        key: "subject",
        title: "Môn học",
        dataIndex: "subject",
        width: "15%",
        mobile: true,
        render: (value: string) => (
          <span style={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}>
            {value}
          </span>
        ),
      },
      {
        key: "room-class",
        title: "Phòng học / Lớp",
        dataIndex: "room",
        width: "14%",
        render: (room: any, record) => (
          <div>
            <div
              style={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}
            >
              {typeof room === "string" ? room : room?.name || "-"}
            </div>
            <div style={{ color: "#64748B", fontSize: "14px" }}>
              Lớp: {record.className || "-"}
            </div>
          </div>
        ),
      },
    ];

    // Add lecturer column for admin
    if (isAdmin) {
      cols.push({
        key: "lecturer",
        title: "Giảng viên",
        dataIndex: "lecturer",
        width: "15%",
        render: (lecturer: any) => (
          <span style={{ color: "#334155", fontSize: "15px" }}>
            {typeof lecturer === "string" ? lecturer : lecturer?.name || "-"}
          </span>
        ),
      });
    }

    return cols;
  }, [isAdmin]);

  return (
    <>
      <SmartTable
        data={tableData}
        columns={columns}
        loading={false}
        rowKey="_id"
        emptyState={{
          title: "Chưa có lịch dạy nào",
          description: "Thêm lịch dạy mới để bắt đầu quản lý",
          illustration: "search",
          icon: <CalendarOutlined />,
        }}
        stickyHeader
        zebraStriping
        cardConfig={{
          title: (record) => record.subject || "Môn học",
          subtitle: (record) => {
            const date = formatDate(record.date);
            const room =
              typeof record.room === "string"
                ? record.room
                : record.room?.name || "-";
            return `${date} • Ca ${record.period} • ${room}`;
          },
          meta: (record) =>
            `HK${record.semester} • ${record.schoolYear} • Lớp: ${
              record.className || "-"
            }`,
          badge: isAdmin
            ? (record) => {
                const lecturer =
                  typeof record.lecturer === "string"
                    ? record.lecturer
                    : record.lecturer?.name || "-";
                return (
                  <span style={{ fontSize: "13px", color: "#64748B" }}>
                    {lecturer}
                  </span>
                );
              }
            : undefined,
        }}
        actions={[
          {
            key: "edit",
            label: "Sửa",
            icon: <EditOutlined />,
            onClick: handleEdit,
            tooltip: "Chỉnh sửa lịch dạy",
            visible: canModify,
          },
          {
            key: "delete",
            label: "Xóa",
            icon: <DeleteOutlined />,
            onClick: (record) => {
              // Wrap in Popconfirm for confirmation
              // Note: SmartTable actions don't directly support Popconfirm,
              // so we handle it via a custom render in the action onClick
              if (window.confirm("Bạn chắc chắn muốn xóa lịch dạy này?")) {
                handleDelete(record);
              }
            },
            danger: true,
            tooltip: "Xóa lịch dạy",
            visible: canModify,
          },
        ]}
      />
      <TimetableModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSuccess={handleEditSuccess}
        timetable={editRecord}
        rooms={rooms}
        users={users}
        materials={materials}
      />
    </>
  );
}
