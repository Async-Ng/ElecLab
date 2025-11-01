"use client";

import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState, lazy, Suspense } from "react";
import { Timetable, Semester } from "@/types/timetable";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

// Lazy load components
const StaffFilterBar = lazy(() => import("../_components/StaffFilterBar"));
const TimetableGrid = lazy(() => import("./_components/TimetableGrid"));
const LessonModal = lazy(() => import("./_components/LessonModal"));

export default function StaffTimetableWeekView() {
  const params = useParams();
  const staffId = params?.staff_id as string;
  const [weekStart, setWeekStart] = useState<Dayjs>(dayjs().startOf("week"));
  const [items, setItems] = useState<Timetable[]>([]);
  const [filtered, setFiltered] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolYear, setSchoolYear] = useState<string>("");
  const [semester, setSemester] = useState<Semester | null>(null);
  // Giữ lại các filter cũ nếu cần
  const [className, setClassName] = useState<string>("");
  const [roomFilter, setRoomFilter] = useState<string>("");
  const [modal, setModal] = useState<{ open: boolean; record?: Timetable }>({
    open: false,
  });
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [roomOptions, setRoomOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!staffId) return;
    setLoading(true);
    const params = new URLSearchParams({ userId: staffId });
    fetch(`/api/timetables?${params}`)
      .then((res) => res.json())
      .then((rows) => {
        setItems(rows);
        setFiltered(rows);
        setClassOptions(
          Array.from(
            new Set(rows.map((r: Timetable) => r.className))
          ) as string[]
        );
        setRoomOptions(
          Array.from(
            new Set(
              rows.map((r: Timetable) =>
                typeof r.room === "string" ? r.room : r.room?.name
              )
            )
          ) as string[]
        );
      })
      .finally(() => setLoading(false));
  }, [staffId]);

  // Lấy danh sách năm học có trong dữ liệu
  const schoolYearOptions = Array.from(
    new Set(items.map((row) => row.schoolYear))
  );

  useEffect(() => {
    let result = items;
    if (schoolYear) {
      result = result.filter((row) => row.schoolYear === schoolYear);
    }
    if (semester) {
      result = result.filter((row) => row.semester === semester);
    }
    if (className) {
      result = result.filter((row) => row.className === className);
    }
    if (roomFilter) {
      result = result.filter((row) => {
        if (typeof row.room === "string") return row.room === roomFilter;
        return row.room?.name === roomFilter;
      });
    }
    setFiltered(result);
  }, [schoolYear, semester, className, roomFilter, items]);

  // Tuần trước/tuần sau giữ nguyên
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));
  const allPeriods = [1, 2, 3, 4];

  function statusInfo(row: Timetable) {
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
  }

  // Callback tuần trước/tuần sau
  const handlePrevWeek = () => setWeekStart((prev) => prev.subtract(1, "week"));
  const handleNextWeek = () => setWeekStart((prev) => prev.add(1, "week"));

  if (loading) {
    return <LoadingSpinner tip="Đang tải thời khóa biểu của bạn..." />;
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        Thời khóa biểu cá nhân
      </h1>
      <Suspense
        fallback={
          <LoadingSpinner fullScreen={false} tip="Đang tải bộ lọc..." />
        }
      >
        <StaffFilterBar
          schoolYear={schoolYear}
          setSchoolYear={setSchoolYear}
          semester={semester}
          setSemester={setSemester}
          schoolYearOptions={schoolYearOptions}
          className={className}
          setClassName={setClassName}
          roomFilter={roomFilter}
          setRoomFilter={setRoomFilter}
          classOptions={classOptions}
          roomOptions={roomOptions}
          weekStart={weekStart}
          setWeekStart={setWeekStart}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
        />
      </Suspense>
      <div style={{ marginTop: 16 }}>
        <Suspense fallback={<LoadingSpinner tip="Đang tải lịch..." />}>
          <TimetableGrid
            items={filtered}
            days={days}
            allPeriods={allPeriods}
            statusInfo={statusInfo}
            onDetail={(lesson) => setModal({ open: true, record: lesson })}
          />
        </Suspense>
        {modal.open && (
          <Suspense
            fallback={<LoadingSpinner fullScreen={false} tip="Đang tải..." />}
          >
            <LessonModal
              modal={modal}
              onClose={() => setModal({ open: false })}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
