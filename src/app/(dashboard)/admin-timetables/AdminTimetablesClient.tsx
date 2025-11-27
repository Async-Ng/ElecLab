"use client";

import dayjs, { Dayjs } from "dayjs";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import { useEffect, useState, lazy, Suspense, useMemo } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";
import { PageHeader } from "@/components/common";
import { useTimetables } from "@/hooks/stores";
import { Segmented } from "antd";
import { CalendarOutlined, TableOutlined } from "@ant-design/icons";

// Lazy load components
const TimetableTable = lazy(() => import("./_components/TimetableTable"));
const ImportButtons = lazy(() => import("./_components/ImportButtons"));
const TimetableFilterBar = lazy(
  () => import("./_components/TimetableFilterBar")
);
const StaffFilterBar = lazy(() => import("./_components/StaffFilterBar"));
const TimetableGrid = lazy(() => import("./_components/TimetableGrid"));

type ViewMode = "week" | "table";

export default function TimetablesClient() {
  const { user } = useAuth();

  // Filter states
  const [schoolYear, setSchoolYear] = useState<string>("");
  const [semester, setSemester] = useState<Semester | "">("");
  const [date, setDate] = useState<string>("");
  const [period, setPeriod] = useState<Period | "">("");
  const [time, setTime] = useState<StudyTime | "">("");
  const [subject, setSubject] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const [lecturer, setLecturer] = useState<string>("");

  // Week view state (for staff view)
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [weekStart, setWeekStart] = useState<Dayjs>(dayjs().startOf("week"));
  const [materials, setMaterials] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  // Determine user role - check active role from localStorage first
  const getActiveRole = useMemo(() => {
    const activeRoleStored =
      typeof window !== "undefined" ? localStorage.getItem("activeRole") : null;
    if (
      activeRoleStored &&
      user?.roles?.includes(activeRoleStored as UserRole)
    ) {
      return activeRoleStored as UserRole;
    }
    return user?.roles?.[0] || UserRole.User;
  }, [user?.roles]);

  // Fetch materials and rooms
  useEffect(() => {
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

  // Determine user role
  const isAdmin = useMemo(() => {
    if (!user?.roles || user.roles.length === 0) return false;
    return getActiveRole === UserRole.Admin;
  }, [user?.roles, getActiveRole]);

  const userRole = isAdmin ? "Admin" : "User";

  // Use Zustand store with auto-fetch and caching
  // - If current active role is "User": always fetch that user's personal timetable
  // - If current active role is "Admin": fetch all timetables (for management view)
  const { timetables: data, loading } = useTimetables({
    userRole: getActiveRole === UserRole.User ? "User" : "Admin",
    userId: getActiveRole === UserRole.User ? user?._id : undefined,
  });

  // Auto filter when any filter state changes (for admin view)
  const filtered = useMemo(() => {
    return data.filter((row) => {
      const roomStr =
        typeof row.room === "string" ? row.room : row.room?.name || "";
      const lecturerStr =
        typeof row.lecturer === "string"
          ? row.lecturer
          : row.lecturer?.name || "";

      return (
        (!schoolYear || row.schoolYear === schoolYear) &&
        (!semester || row.semester === semester) &&
        (!date || row.date === date) &&
        (!period || row.period === period) &&
        (!time || row.time === time) &&
        (!subject || row.subject.includes(subject)) &&
        (!room || roomStr.includes(room)) &&
        (!className || row.className.includes(className)) &&
        (!lecturer || lecturerStr.includes(lecturer))
      );
    });
  }, [
    schoolYear,
    semester,
    date,
    period,
    time,
    subject,
    room,
    className,
    lecturer,
    data,
  ]);

  // Week view helpers
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day")),
    [weekStart]
  );
  const allPeriods = [1, 2, 3, 4];

  // Status info helper (for week view)
  const statusInfo = (row: Timetable) => {
    const todayISO = dayjs().format("YYYY-MM-DD");
    const isFuture = row.date > todayISO;
    if (isFuture)
      return {
        color: undefined,
        text: "Chưa diễn ra",
        canClick: false,
        isEdit: false,
      };
    if (row.date === todayISO)
      return { color: "blue", text: "Hôm nay", canClick: true, isEdit: false };
    return { color: "red", text: "Quá hạn", canClick: true, isEdit: false };
  };

  // Week navigation handlers
  const handlePrevWeek = () => setWeekStart((prev) => prev.subtract(1, "week"));
  const handleNextWeek = () => setWeekStart((prev) => prev.add(1, "week"));

  // View mode toggle options
  const viewModeOptions = [
    {
      label: "Xem theo tuần",
      value: "week" as ViewMode,
      icon: <CalendarOutlined />,
    },
    {
      label: "Xem dạng bảng",
      value: "table" as ViewMode,
      icon: <TableOutlined />,
    },
  ];

  if (loading) {
    return <LoadingSpinner tip="Đang tải thời khóa biểu..." />;
  }

  // If current active role is User, show personal view only
  if (getActiveRole === UserRole.User) {
    return (
      <div style={{ padding: "24px" }}>
        <PageHeader title="Thời khóa biểu" description="TKB cá nhân của bạn" />

        <Suspense
          fallback={
            <LoadingSpinner fullScreen={false} tip="Đang tải bộ lọc..." />
          }
        >
          {viewMode === "week" && (
            <StaffFilterBar
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
            />
          )}
        </Suspense>

        <div className="mt-3 sm:mt-4">
          {viewMode === "week" ? (
            <Suspense fallback={<LoadingSpinner tip="Đang tải lịch tuần..." />}>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[800px] px-4 sm:px-0">
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <Segmented
                      value={viewMode}
                      onChange={(value) => setViewMode(value as ViewMode)}
                      options={viewModeOptions}
                      size="small"
                      className="sm:size-middle"
                    />
                  </div>
                  <TimetableGrid
                    items={data}
                    days={days}
                    allPeriods={allPeriods}
                    statusInfo={statusInfo}
                    materials={materials}
                    rooms={rooms}
                  />
                </div>
              </div>
            </Suspense>
          ) : (
            <Suspense fallback={<LoadingSpinner tip="Đang tải bảng..." />}>
              <div
                style={{ display: "flex", gap: "12px", marginBottom: "12px" }}
              >
                <Segmented
                  value={viewMode}
                  onChange={(value) => setViewMode(value as ViewMode)}
                  options={viewModeOptions}
                  size="small"
                  className="sm:size-middle"
                />
              </div>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <TimetableTable data={data} />
              </div>
            </Suspense>
          )}
        </div>
      </div>
    );
  }

  // If user is Admin, show management view (role switcher in sidebar handles role changes)
  if (isAdmin) {
    return (
      <div style={{ padding: "24px" }}>
        <PageHeader
          title="Thời khóa biểu"
          description="Quản lý thời khóa biểu giảng dạy"
          extra={
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <Suspense
                fallback={
                  <LoadingSpinner fullScreen={false} tip="Đang tải..." />
                }
              >
                <ImportButtons />
              </Suspense>
            </div>
          }
        />

        {/* ADMIN VIEW - Show all timetables with filters */}
        <Suspense
          fallback={
            <LoadingSpinner fullScreen={false} tip="Đang tải bộ lọc..." />
          }
        >
          <TimetableFilterBar
            data={data}
            schoolYear={schoolYear}
            setSchoolYear={setSchoolYear}
            semester={semester}
            setSemester={setSemester}
            date={date}
            setDate={setDate}
            period={period}
            setPeriod={setPeriod}
            time={time}
            setTime={setTime}
            subject={subject}
            setSubject={setSubject}
            room={room}
            setRoom={setRoom}
            className={className}
            setClassName={setClassName}
            lecturer={lecturer}
            setLecturer={setLecturer}
            handleClear={() => {
              setSchoolYear("");
              setSemester("");
              setDate("");
              setPeriod("");
              setTime("");
              setSubject("");
              setRoom("");
              setClassName("");
              setLecturer("");
            }}
          />
        </Suspense>

        <Suspense
          fallback={
            <LoadingSpinner
              fullScreen={false}
              tip="Đang tải bảng thời khóa biểu..."
            />
          }
        >
          <TimetableTable data={filtered} />
        </Suspense>
      </div>
    );
  }

  // STAFF VIEW - Show personal timetable with week/table toggle
  return (
    <div className="p-0 sm:p-4 lg:p-6">
      <PageHeader
        title="Thời khóa biểu cá nhân"
        description="Xem và quản lý lịch giảng dạy của bạn"
        extra={
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
            options={viewModeOptions}
            size="small"
            className="sm:size-middle"
          />
        }
      />

      <Suspense
        fallback={
          <LoadingSpinner fullScreen={false} tip="Đang tải bộ lọc..." />
        }
      >
        {viewMode === "week" && (
          <StaffFilterBar
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
          />
        )}
      </Suspense>

      <div className="mt-3 sm:mt-4">
        {viewMode === "week" ? (
          <Suspense fallback={<LoadingSpinner tip="Đang tải lịch tuần..." />}>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[800px] px-4 sm:px-0">
                <TimetableGrid
                  items={data}
                  days={days}
                  allPeriods={allPeriods}
                  statusInfo={statusInfo}
                  materials={materials}
                  rooms={rooms}
                />
              </div>
            </div>
          </Suspense>
        ) : (
          <Suspense fallback={<LoadingSpinner tip="Đang tải bảng..." />}>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <TimetableTable data={data} />
            </div>
          </Suspense>
        )}
      </div>
    </div>
  );
}
