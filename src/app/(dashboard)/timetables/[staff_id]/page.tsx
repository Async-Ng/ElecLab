"use client";
import FilterBar from "./_components/FilterBar";
import TimetableGrid from "./_components/TimetableGrid";
import LessonModal from "./_components/LessonModal";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { Timetable } from "@/types/timetable";
import { useParams } from "next/navigation";

export default function StaffTimetableWeekView() {
  const params = useParams();
  const staffId = params?.staff_id as string;
  const [weekStart, setWeekStart] = useState<Dayjs>(dayjs().startOf("week"));
  const [items, setItems] = useState<Timetable[]>([]);
  const [className, setClassName] = useState<string>("");
  const [roomFilter, setRoomFilter] = useState<string>("");
  const [modal, setModal] = useState<{ open: boolean; record?: Timetable }>({
    open: false,
  });
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [roomOptions, setRoomOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!staffId) return;
    const params = new URLSearchParams({
      userId: staffId,
      week: weekStart.format("YYYY-MM-DD"),
      className,
      room: roomFilter,
    });
    fetch(`/api/timetables/view?${params}`)
      .then((res) => res.json())
      .then((rows) => {
        setItems(rows);
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
      });
  }, [staffId, weekStart, className, roomFilter]);

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

  return (
    <div className="overflow-x-auto">
      <FilterBar
        weekStart={weekStart}
        setWeekStart={setWeekStart}
        className={className}
        setClassName={setClassName}
        roomFilter={roomFilter}
        setRoomFilter={setRoomFilter}
        classOptions={classOptions}
        roomOptions={roomOptions}
      />
      <TimetableGrid
        items={items}
        days={days}
        allPeriods={allPeriods}
        statusInfo={statusInfo}
        onDetail={(lesson) => setModal({ open: true, record: lesson })}
      />
      <LessonModal modal={modal} onClose={() => setModal({ open: false })} />
    </div>
  );
}
