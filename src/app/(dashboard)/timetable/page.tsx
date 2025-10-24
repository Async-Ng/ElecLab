"use client";
import TimetableTable from "./_components/TimetableTable";
import ImportButtons from "./_components/ImportButtons";
import TimetableFilters from "./_components/TimetableFilters";
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

  function handleFilter(values: any) {
    let result = [...data];
    Object.entries(values).forEach(([key, val]) => {
      if (val !== undefined && val !== "") {
        result = result.filter(
          (row) => String(row[key as keyof Timetable]) === String(val)
        );
      }
    });
    setFiltered(result);
  }

  return (
    <div>
      <h1>Thời khóa biểu</h1>
      <ImportButtons />
      <TimetableFilters onFilter={handleFilter} />
      <TimetableTable data={filtered} />
    </div>
  );
}
