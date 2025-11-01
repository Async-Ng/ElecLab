"use client";
import { Typography } from "antd";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, lazy, Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

// Lazy load components
const TimetableTable = lazy(() => import("./_components/TimetableTable"));
const ImportButtons = lazy(() => import("./_components/ImportButtons"));
const TimetableFilterBar = lazy(
  () => import("./_components/TimetableFilterBar")
);

export default function TimetablePage() {
  const { user } = useAuth();
  const [data, setData] = useState<Timetable[]>([]);
  const [filtered, setFiltered] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    setLoading(true);
    fetch(`/api/timetables`)
      .then((res) => res.json())
      .then((rows) => {
        setData(rows);
        setFiltered(rows);
      })
      .finally(() => setLoading(false));
  }, []);

  // Auto filter when any filter state changes
  useEffect(() => {
    setFiltered(
      data.filter((row) => {
        return (
          (!schoolYear || row.schoolYear === schoolYear) &&
          (!semester || row.semester === semester) &&
          (!date || row.date === date) &&
          (!period || row.period === period) &&
          (!time || row.time === time) &&
          (!subject ||
            row.subject?.toLowerCase().includes(subject.toLowerCase())) &&
          (!room ||
            (typeof row.room === "string" ? row.room : row.room?.name) ===
              room) &&
          (!className ||
            row.className?.toLowerCase().includes(className.toLowerCase())) &&
          (!lecturer ||
            (typeof row.lecturer === "string"
              ? row.lecturer
              : row.lecturer?.name) === lecturer)
        );
      })
    );
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

  if (loading) {
    return <LoadingSpinner tip="Đang tải thời khóa biểu..." />;
  }

  return (
    <div>
      <Typography.Title level={3}>Thời khóa biểu</Typography.Title>
      <div className="flex">
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
              setFiltered(data);
            }}
          />
        </Suspense>
        <Suspense fallback={<LoadingSpinner tip="Đang tải nút import..." />}>
          <ImportButtons />
        </Suspense>
      </div>
      <Suspense
        fallback={<LoadingSpinner tip="Đang tải bảng thời khóa biểu..." />}
      >
        <TimetableTable data={filtered} />
      </Suspense>
    </div>
  );
}
