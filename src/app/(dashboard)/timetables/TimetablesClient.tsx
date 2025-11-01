"use client";

import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import { useEffect, useState, lazy, Suspense, useMemo } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";
import { PageHeader } from "@/components/common";
import { useTimetables } from "@/hooks/stores";

// Lazy load components
const TimetableTable = lazy(() => import("./_components/TimetableTable"));
const ImportButtons = lazy(() => import("./_components/ImportButtons"));
const TimetableFilterBar = lazy(
  () => import("./_components/TimetableFilterBar")
);

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

  // Determine user role
  const isAdmin = useMemo(() => {
    if (!user?.roles || user.roles.length === 0) return false;
    return user.roles.some((role) => {
      const roleStr = String(role);
      return (
        roleStr === UserRole.Admin ||
        roleStr === "Quản lý" ||
        roleStr === "Admin"
      );
    });
  }, [user?.roles]);

  const userRole = isAdmin ? "Admin" : "User";

  // Use Zustand store with auto-fetch and caching
  const { timetables: data } = useTimetables({
    userRole,
    userId: user?._id,
  });

  // Auto filter when any filter state changes
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

  return (
    <div style={{ padding: "24px" }}>
      <PageHeader
        title="Thời khóa biểu"
        description="Quản lý thời khóa biểu giảng dạy"
        extra={
          <Suspense fallback={<LoadingSpinner fullScreen={false} tip="Đang tải..." />}>
            <ImportButtons />
          </Suspense>
        }
      />
      
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
