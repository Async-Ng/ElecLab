"use client";

import dayjs, { Dayjs } from "dayjs";
import { useState, useMemo, lazy, Suspense } from "react";
import { Timetable } from "@/types/timetable";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Segmented } from "antd";
import { CalendarOutlined, TableOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common";
import { useTimetables } from "@/hooks/stores";

// Lazy load components
const StaffFilterBar = lazy(() => import("../_components/StaffFilterBar"));
const TimetableGrid = lazy(() => import("./_components/TimetableGrid"));
const TimetableTable = lazy(() => import("../_components/TimetableTable"));

type ViewMode = "week" | "table";

export default function StaffTimetablePage() {
  const params = useParams();
  const staffId = params?.staff_id as string;

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [weekStart, setWeekStart] = useState<Dayjs>(dayjs().startOf("week"));

  // Use Zustand store with auto-fetch for this staff
  const { timetables, loading } = useTimetables({
    userRole: "User",
    userId: staffId,
  });

  // Week view helpers - memoized
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day")),
    [weekStart]
  );
  const allPeriods = [1, 2, 3, 4];

  // Status info helper
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

  // View mode toggle
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
    return <LoadingSpinner tip="Đang tải thời khóa biểu của bạn..." />;
  }

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
                  items={timetables}
                  days={days}
                  allPeriods={allPeriods}
                  statusInfo={statusInfo}
                />
              </div>
            </div>
          </Suspense>
        ) : (
          <Suspense fallback={<LoadingSpinner tip="Đang tải bảng..." />}>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <TimetableTable data={timetables} />
            </div>
          </Suspense>
        )}
      </div>
    </div>
  );
}
