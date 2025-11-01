"use client";
import TimetableModal from "./TimetableModal";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { ColumnsType } from "antd/es/table";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import { DataTable } from "@/components/common";
import { Button } from "antd";
import { useTimetables } from "@/hooks/stores";
import { cachedFetch } from "@/lib/requestCache";

interface TimetableTableProps {
  data: Timetable[];
}

export default function TimetableTable({ data }: TimetableTableProps) {
  const [editVisible, setEditVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<Timetable | null>(null);
  const [tableData, setTableData] = useState<Timetable[]>(data);
  const [rooms, setRooms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const { user, isAdmin } = useAuth();
  const { fetchTimetables } = useTimetables({
    userRole: isAdmin() ? "Admin" : "User",
    userId: user?._id,
  });

  // Kiểm tra xem user có phải Admin không - ưu tiên role Admin
  const isUserAdmin = isAdmin();

  React.useEffect(() => {
    setTableData(data);
  }, [data]);

  React.useEffect(() => {
    // Tối ưu: Gộp 2 fetch calls thành Promise.all + sử dụng cachedFetch
    Promise.all([
      cachedFetch("/api/rooms?userRole=Admin"),
      cachedFetch("/api/users"),
    ])
      .then(([roomsData, usersData]) => {
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
  }, []);

  const handleEdit = (record: Timetable) => {
    setEditRecord(record);
    setEditVisible(true);
  };
  const handleEditSuccess = async (updated: Timetable) => {
    setTableData((prev) =>
      prev.map((item) => (item._id === updated._id ? updated : item))
    );
    // Refetch timetables to get latest data (force bypass cache)
    await fetchTimetables(isAdmin() ? "Admin" : "User", user?._id, true);
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
      title: "Chỉnh sửa",
      key: "actions",
      render: (_: any, record: Timetable) => {
        // Chỉ hiển thị nếu là lecturer của TKB (chủ sở hữu)
        const isOwner =
          user &&
          (record.lecturer === user._id ||
            (typeof record.lecturer === "object" &&
              record.lecturer._id === user._id));
        if (isOwner) {
          return (
            <Button type="link" onClick={() => handleEdit(record)}>
              Chỉnh sửa
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <>
      <DataTable
        data={tableData}
        columns={columns}
        loading={false}
        showActions={false}
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
