"use client";

import React from "react";
import { Select, DatePicker } from "antd";
import viVN from "antd/es/date-picker/locale/vi_VN";
import { Semester } from "@/types/timetable";
import { Dayjs } from "dayjs";

type FilterBarProps = {
  schoolYear: string;
  setSchoolYear: (v: string) => void;
  semester: Semester | null;
  setSemester: (v: Semester | null) => void;
  schoolYearOptions: string[];
  weekStart: Dayjs;
  setWeekStart: (d: Dayjs) => void;
};

export default function FilterBar({
  schoolYear,
  setSchoolYear,
  semester,
  setSemester,
  schoolYearOptions,
  weekStart,
  setWeekStart,
}: FilterBarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        marginBottom: 16,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Select
        style={{ minWidth: 120 }}
        placeholder="Năm học"
        value={schoolYear || undefined}
        onChange={setSchoolYear}
        options={schoolYearOptions.map((y: string) => ({ label: y, value: y }))}
        allowClear
      />
      <Select
        style={{ minWidth: 120 }}
        placeholder="Học kỳ"
        value={semester ?? undefined}
        onChange={(v) => setSemester(v as Semester)}
        options={[
          { label: "HK1", value: Semester.First },
          { label: "HK2", value: Semester.Second },
          { label: "HK3", value: Semester.Third },
        ]}
        allowClear
      />
      <DatePicker
        picker="week"
        value={weekStart}
        format="DD/MM/YYYY"
        onChange={(d) => d && setWeekStart(d.startOf("week"))}
        style={{ width: 120 }}
        placeholder="Chọn tuần"
        locale={viVN}
      />
    </div>
  );
}
