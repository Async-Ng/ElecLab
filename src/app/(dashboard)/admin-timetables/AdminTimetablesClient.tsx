"use client";

import { useState, useMemo, lazy, Suspense } from "react";
import { Semester, Period, StudyTime, Timetable } from "@/types/timetable";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/common";
import { useTimetables, useRooms, useUsers } from "@/hooks/stores";

// Lazy load components
const TimetableTable = lazy(
  () => import("../timetables/_components/TimetableTable")
);
const TimetableFilterBar = lazy(
  () => import("../timetables/_components/TimetableFilterBar")
);
const ImportButtons = lazy(
  () => import("../timetables/_components/ImportButtons")
);
const TimetableModal = lazy(
  () => import("../timetables/_components/TimetableModal")
);

export default function AdminTimetablesClient() {
  const { user } = useAuth();

  // Filter states
  const [schoolYear, setSchoolYear] = useState<string>("");
  const [semester, setSemester] = useState<Semester | "">("");
  const [date, setDate] = useState<string>("");
  const [week, setWeek] = useState<number | "">("");
  const [period, setPeriod] = useState<Period | "">("");
  const [time, setTime] = useState<StudyTime | "">("");
  const [subject, setSubject] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const [lecturer, setLecturer] = useState<string>("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(
    null
  );

  // Fetch ALL timetables (admin endpoint - no forceUserEndpoint)
  const { timetables: data } = useTimetables();

  // Fetch rooms and users for modal
  const { rooms } = useRooms();
  const { users } = useUsers();

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
        (!week || row.week === week) &&
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
    week,
    period,
    time,
    subject,
    room,
    className,
    lecturer,
    data,
  ]);

  const handleClear = () => {
    setSchoolYear("");
    setSemester("");
    setDate("");
    setWeek("");
    setPeriod("");
    setTime("");
    setSubject("");
    setRoom("");
    setClassName("");
    setLecturer("");
  };

  const handleEdit = (timetable: Timetable) => {
    setEditingTimetable(timetable);
    setModalOpen(true);
  };

  const handleModalSuccess = (updated: Timetable) => {
    setModalOpen(false);
    setEditingTimetable(null);
    // Refresh will happen automatically via Zustand
  };

  return (
    <div style={{ padding: "24px" }}>
      <PageHeader
        title="Quản lý thời khóa biểu"
        description="Quản lý tất cả thời khóa biểu giảng dạy"
        extra={
          <Suspense fallback={null}>
            <ImportButtons />
          </Suspense>
        }
      />

      <Suspense fallback={<LoadingSpinner />}>
        <TimetableFilterBar
          data={data}
          schoolYear={schoolYear}
          setSchoolYear={setSchoolYear}
          semester={semester}
          setSemester={setSemester}
          date={date}
          setDate={setDate}
          week={week}
          setWeek={setWeek}
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
          handleClear={handleClear}
        />

        <TimetableTable
          data={filtered}
          onEdit={handleEdit}
          isUserView={false}
        />
      </Suspense>

      {modalOpen && (
        <Suspense fallback={null}>
          <TimetableModal
            visible={modalOpen}
            onClose={() => setModalOpen(false)}
            onSuccess={handleModalSuccess}
            timetable={editingTimetable}
            rooms={rooms}
            users={users}
          />
        </Suspense>
      )}
    </div>
  );
}
