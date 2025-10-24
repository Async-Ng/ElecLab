"use client";
import TimetableTable from "./_components/TimetableTable";
import ImportButtons from "./_components/ImportButtons";
import { Timetable } from "@/types/timetable";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

export default function TimetablePage() {
  const { user } = useAuth();
  const [data, setData] = useState<Timetable[]>([]);
  const [filtered, setFiltered] = useState<Timetable[]>([]);

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams({
      userId: user._id || "",
      userRole: user.roles?.[0] || "",
    });
    fetch(`/api/timetables?${params}`)
      .then((res) => res.json())
      .then((rows) => {
        setData(rows);
        setFiltered(rows);
      });
  }, [user]);

  return (
    <div>
      <h1>Thời khóa biểu</h1>
      <ImportButtons />
      <TimetableTable data={filtered} />
    </div>
  );
}
