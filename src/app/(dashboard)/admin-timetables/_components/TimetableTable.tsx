"use client";
import TimetableModal from "./TimetableModal";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";
import type { ColumnsType } from "antd/es/table";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import { Table, Popconfirm, Empty } from "antd";
import Button from "@/components/ui/Button";
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
    // If active role is User, fetch only that user's timetables; if Admin, fetch all
    const role = activeRole || user?.roles?.[0];
    const userId = role === UserRole.User ? user?._id : undefined;
    await fetchTimetables(role, userId, true);
  };

  const columns: ColumnsType<Timetable> = [
    {
      title: "Học kỳ / Năm học",
      key: "semester-year",
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}>
            HK{record.semester}
          </div>
          <div style={{ color: "#64748B", fontSize: "14px" }}>
            {record.schoolYear}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày học",
      dataIndex: "date",
      key: "date",
      width: 120,
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
          return (
            <span
              style={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}
            >
              {dateStr}
            </span>
          );
        }
        return "";
      },
    },
    {
      title: "Ca học / Giờ",
      key: "period-time",
      width: 140,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}>
            Ca {record.period}
          </div>
          <div style={{ color: "#64748B", fontSize: "14px" }}>
            {record.time}
          </div>
        </div>
      ),
    },
    {
      title: "Môn học",
      dataIndex: "subject",
      key: "subject",
      width: 200,
      render: (value: string) => (
        <span style={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}>
          {value}
        </span>
      ),
    },
    {
      title: "Phòng học / Lớp",
      key: "room-class",
      width: 160,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#1E293B", fontSize: "15px" }}>
            {typeof record.room === "string" ? record.room : record.room?.name}
          </div>
          <div style={{ color: "#64748B", fontSize: "14px" }}>
            Lớp: {record.className}
          </div>
        </div>
      ),
    },
    ...(isAdmin
      ? [
          {
            title: "Giảng viên",
            dataIndex: "lecturer",
            key: "lecturer",
            width: 180,
            render: (lecturer: any) => (
              <span style={{ color: "#334155", fontSize: "15px" }}>
                {typeof lecturer === "string" ? lecturer : lecturer?.name}
              </span>
            ),
          },
        ]
      : []),
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      fixed: "right" as const,
      render: (_: any, record: Timetable) => {
        // Chỉ hiển thị nếu là Admin/Quản lý hoặc là lecturer của TKB
        const isOwner =
          user &&
          (record.lecturer === user._id ||
            (typeof record.lecturer === "object" &&
              record.lecturer._id === user._id));

        if (isAdmin || isOwner) {
          return (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                style={{
                  fontSize: "15px",
                  height: "40px",
                  paddingLeft: "16px",
                  paddingRight: "16px",
                }}
              >
                Sửa
              </Button>
              <Popconfirm
                title="Xóa lịch dạy"
                description="Bạn chắc chắn muốn xóa lịch dạy này?"
                onConfirm={() => handleDelete(record)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  style={{
                    fontSize: "15px",
                    height: "40px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                  }}
                >
                  Xóa
                </Button>
              </Popconfirm>
            </div>
          );
        }
        return null;
      },
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey={(record) => record._id || ""}
        loading={false}
        size="middle"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} lịch dạy`,
          pageSizeOptions: ["10", "20", "50"],
        }}
        rowClassName={(_, index) =>
          index % 2 === 0 ? "bg-white" : "bg-slate-50"
        }
        locale={{
          emptyText: (
            <Empty
              image={
                <CalendarOutlined style={{ fontSize: 64, color: "#94A3B8" }} />
              }
              imageStyle={{ height: 80 }}
              description={
                <div style={{ color: "#64748B", fontSize: "16px" }}>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                    Chưa có lịch dạy nào
                  </div>
                  <div style={{ fontSize: "14px" }}>
                    Thêm lịch dạy mới để bắt đầu quản lý
                  </div>
                </div>
              }
            />
          ),
        }}
        scroll={{ x: 1200 }}
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
