"use client";

import { useState, useMemo, lazy, Suspense } from "react";
import { Semester } from "@/types/timetable";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/common";
import {
  useTimetables,
  useRooms,
  useUsers,
  useTeachingLogs,
} from "@/hooks/stores";
import { Segmented, message } from "antd";
import { CalendarOutlined, TableOutlined } from "@ant-design/icons";

// Lazy load components
const TimetableCalendarView = lazy(
  () => import("./_components/TimetableCalendarView")
);
const TimetableTableView = lazy(
  () => import("./_components/TimetableTableView")
);
const TimetableModal = lazy(() => import("./_components/TimetableModal"));
const ImportButtons = lazy(() => import("./_components/ImportButtons"));
const TeachingLogModal = lazy(
  () => import("..//teaching-logs/_components/TeachingLogModal")
);

type ViewMode = "calendar" | "table";

export default function UserTimetablesClient() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  // Filter states
  const [schoolYear, setSchoolYear] = useState<string>("");
  const [semester, setSemester] = useState<Semester | "">("");
  const [className, setClassName] = useState<string>("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<any>(null);

  // Teaching Log Modal states
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>("");

  // Fetch user's own timetables (force user endpoint)
  const {
    timetables: data,
    loading,
    fetchTimetables,
  } = useTimetables({
    forceUserEndpoint: true,
  });

  // Fetch teaching logs to check which timetables have logs
  const { teachingLogs, fetchTeachingLogs } = useTeachingLogs();

  // Fetch rooms and users for modal
  const { rooms } = useRooms();
  // User không cần fetch tất cả users - chỉ admin mới cần
  // Khi user xem/sửa TKB, chỉ cần user hiện tại
  const { users } = useUsers();

  // Debug: Log rooms và users
  console.log("UserTimetablesClient - Data:", {
    roomsCount: rooms.length,
    usersCount: users.length,
    hasUser: !!user,
    userRoles: user?.roles,
  });

  // Tạo mảng users tối thiểu cho modal (chỉ user hiện tại)
  const modalUsers = useMemo(() => {
    if (users.length > 0) return users; // Admin có full list
    if (user) {
      // User thường chỉ có thông tin của chính họ
      return [
        {
          _id: user._id || "",
          staff_id: user.staff_id || "",
          name: user.name || "",
          email: user.email || "",
          password: "",
          roles: user.roles || [],
          rooms_manage: user.rooms_manage || [],
        },
      ];
    }
    return [];
  }, [users, user]);

  // Create map of timetable -> has log for quick lookup
  const timetableLogMap = useMemo(() => {
    const logMap = new Map<string, boolean>();
    teachingLogs.forEach((log) => {
      if (
        log.timetable &&
        typeof log.timetable === "object" &&
        log.timetable._id
      ) {
        logMap.set(log.timetable._id, true);
      } else if (typeof log.timetable === "string") {
        logMap.set(log.timetable, true);
      }
    });
    return logMap;
  }, [teachingLogs]);

  // Utility functions for date checking
  const isDateInPast = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    const timetableDate = new Date(dateString);
    return timetableDate < today;
  };

  const isDateInFuture = (dateString: string) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of day
    const timetableDate = new Date(dateString);
    return timetableDate > today;
  };

  // Filter timetables and add hasLog info + date status
  const filteredTimetables = useMemo(() => {
    return data
      .filter((tt) => {
        if (schoolYear && tt.schoolYear !== schoolYear) return false;
        if (semester && tt.semester !== semester) return false;
        if (className && !tt.className?.includes(className)) return false;
        return true;
      })
      .map((tt) => {
        const hasLog = timetableLogMap.has(tt._id || "");
        const isPast = isDateInPast(tt.date);
        const isFuture = isDateInFuture(tt.date);

        return {
          ...tt,
          hasLog,
          isPast,
          isFuture,
          isOverdue: isPast && !hasLog, // Đã qua ngày nhưng chưa ghi log
          canLog: !isFuture && !hasLog, // Có thể ghi log (không phải tương lai và chưa có log)
        };
      });
  }, [data, schoolYear, semester, className, timetableLogMap]);

  const handleAdd = (prefillData?: any) => {
    // Tạo object timetable với dữ liệu prefill
    if (prefillData) {
      setEditingTimetable({
        ...prefillData,
        lecturer: user?._id, // Auto fill lecturer
      });
    } else {
      setEditingTimetable(null);
    }
    setModalOpen(true);
  };

  // Handler cho việc chỉnh sửa TKB (dùng cho nút "Chỉnh sửa" trong table)
  const handleEditTimetable = (timetable: any) => {
    console.log("🔧 UserTimetablesClient - Edit timetable:", {
      timetableId: timetable._id,
      modalOpen,
      logModalOpen,
    });

    if (timetable._id) {
      // Đảm bảo chỉ mở 1 modal
      setLogModalOpen(false);
      setSelectedTimetableId("");

      setEditingTimetable(timetable);
      setModalOpen(true);
    }
  };

  // Handler cho việc ghi log (dùng cho calendar view và click row trong table)
  const handleCreateLog = (timetable: any) => {
    console.log("📋 UserTimetablesClient - Create log for timetable:", {
      timetableId: timetable._id,
      hasLog: timetable.hasLog,
      isFuture: timetable.isFuture,
      canLog: timetable.canLog,
      modalOpen,
      logModalOpen,
    });

    if (timetable._id) {
      // Nếu TKB đã có log rồi thì không cho phép ghi log nữa
      if (timetable.hasLog) {
        message.info("Tiết học này đã có nhật ký giảng dạy rồi!");
        return;
      }

      // Nếu TKB trong tương lai thì không cho ghi log
      if (timetable.isFuture) {
        message.warning("Không thể ghi log cho tiết học trong tương lai!");
        return;
      }

      // Kiểm tra điều kiện có thể ghi log
      if (!timetable.canLog) {
        message.warning("Không thể ghi log cho tiết học này!");
        return;
      }

      // Đảm bảo chỉ mở 1 modal
      setModalOpen(false);
      setEditingTimetable(null);

      // Chỉ mở modal ghi log khi chưa có log
      setSelectedTimetableId(timetable._id);
      setLogModalOpen(true);
    }
  };

  const handleModalSuccess = async () => {
    setModalOpen(false);
    setEditingTimetable(null);

    // Refresh timetables data
    if (user?._id && user?.roles) {
      await fetchTimetables(user._id, user.roles, true); // Force refresh
    }
  };

  const handleLogModalSuccess = async () => {
    setLogModalOpen(false);
    setSelectedTimetableId("");

    // Refresh both timetables and teaching logs data
    if (user?._id && user?.roles) {
      await Promise.all([
        fetchTimetables(user._id, user.roles, true),
        fetchTeachingLogs(user._id, user.roles, true), // Force refresh teaching logs
      ]);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <PageHeader
        title="Thời khóa biểu của tôi"
        description="Xem và quản lý thời khóa biểu giảng dạy của bạn"
        extra={
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Suspense fallback={null}>
              <ImportButtons />
            </Suspense>
            <Segmented
              value={viewMode}
              onChange={(value) => setViewMode(value as ViewMode)}
              options={[
                {
                  label: "Lịch",
                  value: "calendar",
                  icon: <CalendarOutlined />,
                },
                { label: "Bảng", value: "table", icon: <TableOutlined /> },
              ]}
            />
          </div>
        }
      />

      <Suspense fallback={<LoadingSpinner />}>
        {viewMode === "calendar" ? (
          <TimetableCalendarView
            timetables={filteredTimetables}
            loading={loading}
            onEdit={handleCreateLog} // Calendar chỉ ghi log
            onAdd={handleAdd}
            schoolYear={schoolYear}
            setSchoolYear={setSchoolYear}
            semester={semester}
            setSemester={setSemester}
            className={className}
            setClassName={setClassName}
          />
        ) : (
          <TimetableTableView
            timetables={filteredTimetables}
            loading={loading}
            onEdit={handleCreateLog} // Table: click row ghi log
            onEditTimetable={handleEditTimetable} // Table: nút "Chỉnh sửa" edit TKB
            onAdd={handleAdd}
            schoolYear={schoolYear}
            setSchoolYear={setSchoolYear}
            semester={semester}
            setSemester={setSemester}
            className={className}
            setClassName={setClassName}
          />
        )}
      </Suspense>

      {modalOpen && (
        <Suspense fallback={null}>
          <TimetableModal
            visible={modalOpen}
            onClose={() => setModalOpen(false)}
            onSuccess={handleModalSuccess}
            timetable={editingTimetable}
            rooms={rooms}
            users={modalUsers}
          />
        </Suspense>
      )}

      {logModalOpen && (
        <Suspense fallback={null}>
          <TeachingLogModal
            open={logModalOpen}
            onClose={() => setLogModalOpen(false)}
            timetableId={selectedTimetableId}
            onSuccess={handleLogModalSuccess}
          />
        </Suspense>
      )}
    </div>
  );
}
