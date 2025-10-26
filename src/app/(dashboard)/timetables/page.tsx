"use client";
import { Typography } from "antd";
import TimetableTable from "./_components/TimetableTable";
import ImportButtons from "./_components/ImportButtons";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import TimetableFilterBar from "./_components/TimetableFilterBar";

export default function TimetablePage() {
  const { user } = useAuth();
  const [data, setData] = useState<Timetable[]>([]);
  const [filtered, setFiltered] = useState<Timetable[]>([]);

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
    fetch(`/api/timetables`)
      .then((res) => res.json())
      .then((rows) => {
        setData(rows);
        setFiltered(rows);
      });
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

  return (
    <div>
      <Typography.Title level={3}>Thời khóa biểu</Typography.Title>
      <div className="flex">
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
        <ImportButtons />
      </div>
      <TimetableTable data={filtered} />
    </div>
  );
}
