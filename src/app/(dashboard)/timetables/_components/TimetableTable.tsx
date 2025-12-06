"use client";
import TimetableModal from "./TimetableModal";
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import { SmartTable, SmartTableColumn } from "@/components/table";
import { useTimetables } from "@/hooks/stores";
import { EditOutlined } from "@ant-design/icons";
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
    if (!user?._id || !user?.roles || user.roles.length === 0) return;

    const fetchData = async () => {
      try {
        // Fetch rooms
        const roomsEndpoint = getApiEndpoint("rooms", user.roles);
        const roomsRes = await authFetch(roomsEndpoint, user._id, user.roles);
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRooms(
            (roomsData.rooms || []).map((r: any) => ({
              _id: r._id,
              name: r.name,
              room_id: r.room_id,
            }))
          );
        }

        // Fetch users - only for admins
        const usersEndpoint = getApiEndpoint("users", user.roles);
        const usersRes = await authFetch(usersEndpoint, user._id, user.roles);
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(
            (usersData || []).map((u: any) => ({
              _id: u._id,
              name: u.name,
              email: u.email,
            }))
          );
        } else {
          // If user is not admin (API returns 403/404), create minimal user array with current user
          setUsers([
            {
              _id: user._id,
              name: user.name || "",
              email: user.email || "",
            },
          ]);
        }

        // Fetch materials
        const materialsEndpoint = getApiEndpoint("materials", user.roles);
        const materialsRes = await authFetch(
          materialsEndpoint,
          user._id,
          user.roles
        );
        if (materialsRes.ok) {
          const materialsData = await materialsRes.json();
          setMaterials(
            (Array.isArray(materialsData)
              ? materialsData
              : materialsData.materials || []
            ).map((m: any) => ({
              _id: m._id,
              name: m.name,
              quantity: m.quantity,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // On error, still create minimal user array with current user
        setUsers([
          {
            _id: user._id,
            name: user.name || "",
            email: user.email || "",
          },
        ]);
      }
    };

    fetchData();
  }, [user]);

  const handleEdit = (record: Timetable) => {
    setEditRecord(record);
    setEditVisible(true);
  };
  const handleEditSuccess = async (updated: Timetable) => {
    setTableData((prev) =>
      prev.map((item) => (item._id === updated._id ? updated : item))
    );
    // Refetch timetables to get latest data (force bypass cache)
    // If active role is User, fetch only that user's timetables; if Admin, fetch all
    const role = activeRole || user?.roles?.[0];
    const userId = role === UserRole.User ? user?._id : undefined;
    await fetchTimetables(role, userId, true);
  };

  // Helper function to check if user can edit a timetable
  const canEdit = (record: Timetable): boolean => {
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
    const baseColumns: SmartTableColumn<Timetable>[] = [
      {
        key: "schoolYear",
        title: "Năm học",
        dataIndex: "schoolYear",
        width: "10%",
        mobile: true,
      },
      {
        key: "semester",
        title: "Học kỳ",
        dataIndex: "semester",
        width: "8%",
        mobile: true,
        render: (value: Semester) => `HK${value}`,
      },
      {
        key: "date",
        title: "Ngày",
        dataIndex: "date",
        width: "12%",
        mobile: true,
        render: (value: string) => formatDate(value),
      },
      {
        key: "period",
        title: "Ca học",
        dataIndex: "period",
        width: "8%",
        render: (value: Period) => `Ca ${value}`,
      },
      {
        key: "time",
        title: "Giờ học",
        dataIndex: "time",
        width: "10%",
        render: (value: StudyTime) => value,
      },
      {
        key: "subject",
        title: "Môn học",
        dataIndex: "subject",
        width: "15%",
        mobile: true,
      },
      {
        key: "room",
        title: "Phòng học",
        dataIndex: "room",
        width: "12%",
        render: (room: any) =>
          typeof room === "string" ? room : room?.name || "-",
      },
      {
        key: "className",
        title: "Lớp",
        dataIndex: "className",
        width: "10%",
      },
    ];

    // Add lecturer column only for admin
    if (isAdmin) {
      baseColumns.push({
        key: "lecturer",
        title: "Giảng viên",
        dataIndex: "lecturer",
        width: "15%",
        render: (lecturer: any) =>
          typeof lecturer === "string" ? lecturer : lecturer?.name || "-",
      });
    }

    return baseColumns;
  }, [isAdmin]);

  return (
    <>
      <SmartTable
        data={tableData}
        columns={columns}
        loading={false}
        rowKey="_id"
        emptyState={{
          title: "Chưa có thời khóa biểu",
          description:
            "Thời khóa biểu sẽ xuất hiện sau khi được thêm vào hệ thống",
          illustration: "search",
        }}
        stickyHeader
        zebraStriping
        cardConfig={{
          title: (record) => record.subject || "Môn học",
          subtitle: (record) => {
            const date = formatDate(record.date);
            return `${date} • Ca ${record.period} • ${
              typeof record.room === "string"
                ? record.room
                : record.room?.name || "-"
            }`;
          },
          meta: (record) =>
            `${record.schoolYear} • HK${record.semester} • ${
              record.className || "-"
            }`,
        }}
        onRowClick={canEdit ? handleEdit : undefined}
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
