"use client";

import React, { useEffect, useState } from "react";
import { getTimetables, createTimetable } from "../services/timetableAPI";
import { importTimetableFromFile } from "../services/excelImporter";
import { Timetable } from "../services/types";
import TimetableTable from "../components/TimetableTable";

export default function TimetablePage() {
  const [data, setData] = useState<Timetable[]>([]);

  useEffect(() => {
    getTimetables().then(setData);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imported = await importTimetableFromFile(file);
    for (const row of imported) await createTimetable(row);
    const newData = await getTimetables();
    setData(newData);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">📚 Quản lý Thời khóa biểu</h1>

      <input type="file" accept=".xlsx" onChange={handleFileUpload} className="mb-4" />

      <TimetableTable data={data} />
    </div>
  );
}
