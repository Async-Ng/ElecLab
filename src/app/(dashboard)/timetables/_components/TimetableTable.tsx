"use client";
import TimetableModal from "./TimetableModal";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { ColumnsType } from "antd/es/table";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import { DataTable } from "@/components/common";
import { Button } from "antd";
import { useTimetables } from "@/hooks/stores";
import { authFetch, getApiEndpoint } from "@/lib/apiClient";

// Extended type for timetable with hasLog and date status properties
type TimetableWithLog = Timetable & {
  hasLog?: boolean;
  isPast?: boolean;
  isFuture?: boolean;
  isOverdue?: boolean;
  canLog?: boolean;
};

interface TimetableTableProps {
  data: TimetableWithLog[];
  onEdit?: (record: TimetableWithLog) => void; // Click row → ghi log
  onEditTimetable?: (record: TimetableWithLog) => void; // Nút "Chỉnh sửa" → edit TKB
  isUserView?: boolean; // true = user view (limited actions), false = admin view (full actions)
  loading?: boolean;
}

export default function TimetableTable({
  data,
  onEdit: externalOnEdit,
  onEditTimetable: externalOnEditTimetable,
  isUserView = false,
  loading = false,
}: TimetableTableProps) {
  const [editVisible, setEditVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<Timetable | null>(null);
  const [tableData, setTableData] = useState<Timetable[]>(data);
  const [rooms, setRooms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const { user, isAdmin } = useAuth();
  const { fetchTimetables } = useTimetables();

  // Kiểm tra xem user có phải Admin không - ưu tiên role Admin
  const isUserAdmin = isAdmin();

  React.useEffect(() => {
    setTableData(data);
  }, [data]);

  React.useEffect(() => {
    // Fetch rooms and users data
    if (!user) return;

    Promise.all([
      authFetch(getApiEndpoint("rooms", user.roles), user._id!, user.roles),
      authFetch(getApiEndpoint("users", user.roles), user._id!, user.roles),
    ])
      .then(async ([roomsRes, usersRes]) => {
        const roomsData = await roomsRes.json();
        const usersData = await usersRes.json();

        // Xử lý rooms
        setRooms(
          (roomsData.rooms || []).map((r: any) => ({
            _id: r._id,
            name: r.name,
            room_id: r.room_id,
          }))
        );

        // Xử lý users
        setUsers(
          (usersData || []).map((u: any) => ({
            _id: u._id,
            name: u.name,
            email: u.email,
          }))
        );
      })
      .catch((error) => {
        console.error("Error fetching rooms and users:", error);
        setRooms([]);
        setUsers([]);
      });
  }, [user]);

  // Handler cho nút "Chỉnh sửa" - dùng để edit TKB
  const handleEditTimetable = (record: TimetableWithLog) => {
    console.log("🔧 TimetableTable - Button Edit clicked:", record._id);
    if (externalOnEditTimetable) {
      // Use external timetable edit handler
      externalOnEditTimetable(record);
    } else {
      // Use internal modal for TKB editing
      setEditRecord(record);
      setEditVisible(true);
    }
  };

  // Handler cho click row - dùng để ghi log
  const handleRowClick = (record: TimetableWithLog) => {
    console.log("📋 TimetableTable - Row clicked:", record._id);
    if (externalOnEdit) {
      // Use external handler for logging
      externalOnEdit(record);
    }
  };

  const handleEditSuccess = async (updated: Timetable) => {
    if (!user) return;
    setTableData((prev) =>
      prev.map((item) => (item._id === updated._id ? updated : item))
    );
    // Refetch timetables to get latest data (force bypass cache)
    const forceUserEndpoint = isUserView;
    await fetchTimetables(user._id!, user.roles, true, forceUserEndpoint);
  };

  const columns: ColumnsType<TimetableWithLog> = [
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
      render: (value: string) => {
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
      },
    },
    {
      title: "Tuần",
      dataIndex: "week",
      key: "week",
      width: 60,
      render: (value: number) => value || "-",
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
      render: (value: string, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{value}</span>
          {/* Badge for different statuses */}
          {record.hasLog && (
            <span
              style={{
                backgroundColor: "#52c41a",
                color: "white",
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "10px",
                fontWeight: "normal",
              }}
              title="Đã có nhật ký giảng dạy"
            >
              ✓ ĐÃ GHI
            </span>
          )}
          {record.isOverdue && (
            <span
              style={{
                backgroundColor: "#ff7a45",
                color: "white",
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "10px",
                fontWeight: "normal",
              }}
              title="Quá hạn ghi log"
            >
              ⚠ QUÁ HẠN
            </span>
          )}
          {record.isFuture && (
            <span
              style={{
                backgroundColor: "#91d5ff",
                color: "#1890ff",
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "10px",
                fontWeight: "normal",
              }}
              title="Tiết học trong tương lai"
            >
              ⏳ TƯƠNG LAI
            </span>
          )}
        </div>
      ),
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
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note: string) =>
        note ? (
          <span
            style={{ color: "#8c8c8c", fontSize: "12px", fontStyle: "italic" }}
            title={note}
          >
            {note.length > 30 ? note.substring(0, 30) + "..." : note}
          </span>
        ) : (
          "-"
        ),
    },
    ...(isUserAdmin
      ? [
          {
            title: "Giảng viên",
            dataIndex: "lecturer",
            key: "lecturer",
            render: (lecturer: any) =>
              typeof lecturer === "string" ? lecturer : lecturer?.name,
          },
        ]
      : []),
    {
      title: "Hành động",
      key: "actions",
      width: 220,
      render: (_: any, record: Timetable) => {
        // User view: chỉ hiển thị nếu là owner
        // Admin view: hiển thị cho tất cả
        if (isUserView) {
          const isOwner =
            user &&
            (record.lecturer === user._id ||
              (typeof record.lecturer === "object" &&
                record.lecturer._id === user._id));
          if (!isOwner) return null;
        } else {
          // Admin view - kiểm tra có quyền admin
          if (!isUserAdmin) return null;
        }

        return (
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              type="primary"
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Ngăn event bubbling lên row click
                handleRowClick(record);
              }}
            >
              Ghi Log
            </Button>
            <Button
              type="default"
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Ngăn event bubbling lên row click
                handleEditTimetable(record);
              }}
            >
              Chỉnh sửa TKB
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        data={tableData}
        columns={columns}
        loading={loading}
        showActions={false}
      />
      {!externalOnEditTimetable && (
        <TimetableModal
          visible={editVisible}
          onClose={() => setEditVisible(false)}
          onSuccess={handleEditSuccess}
          timetable={editRecord}
          rooms={rooms}
          users={users}
        />
      )}
    </>
  );
}
