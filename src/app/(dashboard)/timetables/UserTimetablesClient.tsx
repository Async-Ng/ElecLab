"use client";

import { useState, useMemo, lazy, Suspense } from "react";
import { Semester } from "@/types/timetable";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/common";
import Button from "@/components/ui/Button";
import {
  useTimetables,
  useRooms,
  useUsers,
  useTeachingLogs,
  useMaterials,
} from "@/hooks/stores";

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
  const [week, setWeek] = useState<number | "">("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<any>(null);

  // Teaching Log Modal states
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState<"info" | "warning">("info");

  // Fetch user's own timetables (force user endpoint)
  const {
    timetables: data,
    loading,
    fetchTimetables,
  } = useTimetables({
    userRole: "User",
    userId: user?._id,
  });

  // Fetch teaching logs to check which timetables have logs
  const { teachingLogs, fetchTeachingLogs } = useTeachingLogs();

  // Fetch rooms and users for modal
  const { rooms } = useRooms();
  // User không cần fetch tất cả users - chỉ admin mới cần
  // Khi user xem/sửa TKB, chỉ cần user hiện tại
  const { users } = useUsers();

  // Fetch materials for material request modal
  const { materials: rawMaterials } = useMaterials();
  const materials = rawMaterials.map((m) => ({
    _id: m._id || "",
    name: m.name,
    quantity: 10, // Default quantity since Material model doesn't have quantity field
  }));

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

  // Utility function to parse Vietnamese date format (DD/MM/YYYY or DD-MM-YYYY)
  const parseVietnameseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    // Handle DD/MM/YYYY or DD-MM-YYYY format
    let cleanDate = dateString.trim();

    // Replace dash with slash for consistency
    cleanDate = cleanDate.replace(/-/g, "/");

    // Check if it matches DD/MM/YYYY format
    const dateMatch = cleanDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      // Create date object (month is 0-indexed in JS)
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      // Validate the date is real (not Feb 30th, etc.)
      if (
        date.getFullYear() === parseInt(year) &&
        date.getMonth() === parseInt(month) - 1 &&
        date.getDate() === parseInt(day)
      ) {
        return date;
      }
    }

    return null;
  };

  // Utility functions for date checking
  const isDateInPast = (dateString: string) => {
    const timetableDate = parseVietnameseDate(dateString);
    if (!timetableDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    return timetableDate < today;
  };

  const isDateInFuture = (dateString: string) => {
    const timetableDate = parseVietnameseDate(dateString);
    if (!timetableDate) return false;

    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of day
    return timetableDate > today;
  };

  // Filter timetables and add hasLog info + date status
  const filteredTimetables = useMemo(() => {
    return data
      .filter((tt) => {
        if (schoolYear && tt.schoolYear !== schoolYear) return false;
        if (semester && tt.semester !== semester) return false;
        if (className && !tt.className?.includes(className)) return false;
        if (week && tt.week !== week) return false;
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
  }, [data, schoolYear, semester, className, week, timetableLogMap]);

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
    if (timetable._id) {
      // Nếu TKB đã có log rồi thì không cho phép ghi log nữa
      if (timetable.hasLog) {
        setAlertMsg("Tiết học này đã có nhật ký giảng dạy rồi!");
        setAlertType("info");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        return;
      }

      // Nếu TKB trong tương lai thì không cho ghi log
      if (timetable.isFuture) {
        setAlertMsg("Không thể ghi log cho tiết học trong tương lai!");
        setAlertType("warning");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        return;
      }

      // Kiểm tra điều kiện có thể ghi log
      if (!timetable.canLog) {
        setAlertMsg("Không thể ghi log cho tiết học này!");
        setAlertType("warning");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
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
      {showAlert && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg text-white ${
            alertType === "info" ? "bg-blue-500" : "bg-yellow-500"
          }`}
        >
          {alertMsg}
        </div>
      )}
      <PageHeader
        title="Thời khóa biểu của tôi"
        description="Xem và quản lý thời khóa biểu giảng dạy của bạn"
        extra={
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Suspense fallback={null}>
              <ImportButtons />
            </Suspense>
            <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-white">
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "calendar"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                📅 Lịch
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                📋 Bảng
              </button>
            </div>
          </div>
        }
      />

      <Suspense fallback={<LoadingSpinner />}>
        {viewMode === "calendar" ? (
          <TimetableCalendarView
            timetables={filteredTimetables}
            loading={loading}
            onEdit={handleEditTimetable} // Calendar: click để xem chi tiết
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
            week={week}
            setWeek={setWeek}
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
            materials={materials}
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
