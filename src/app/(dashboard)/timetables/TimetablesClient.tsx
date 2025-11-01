"use client";

import { Typography } from "antd";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import { useEffect, useState, lazy, Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

// Lazy load components
const TimetableTable = lazy(() => import("./_components/TimetableTable"));
const ImportButtons = lazy(() => import("./_components/ImportButtons"));
const TimetableFilterBar = lazy(
  () => import("./_components/TimetableFilterBar")
);

interface TimetablesClientProps {
  initialData: Timetable[];
}

export default function TimetablesClient({
  initialData,
}: TimetablesClientProps) {
  const [data, setData] = useState<Timetable[]>(initialData);
  const [filtered, setFiltered] = useState<Timetable[]>(initialData);
  const [loading, setLoading] = useState(false);

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

  // Client-side refresh function
  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/timetables`);
      const rows = await res.json();
      setData(rows);
      setFiltered(rows);
    } catch (error) {
      console.error("Error fetching timetables:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto filter when any filter state changes
  useEffect(() => {
    setFiltered(
      data.filter((row) => {
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
        <Suspense
          fallback={<LoadingSpinner fullScreen={false} tip="Đang tải..." />}
        >
          <ImportButtons />
        </Suspense>
      </div>
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
