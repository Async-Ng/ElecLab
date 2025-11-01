"use client";

import React from "react";
import { DatePicker, Col } from "antd";
import viVN from "antd/es/date-picker/locale/vi_VN";
import { Semester } from "@/types/timetable";
import { Dayjs } from "dayjs";
import FilterBar from "@/components/common/FilterBar";
import {
  SemesterSelect,
  SchoolYearSelect,
} from "@/components/common/SelectFields";

type FilterBarProps = {
  schoolYear: string;
  setSchoolYear: (v: string) => void;
  semester: Semester | null;
  setSemester: (v: Semester | null) => void;
  schoolYearOptions: string[];
  weekStart: Dayjs;
  setWeekStart: (d: Dayjs) => void;
};

export default function TimetableWeekFilterBar({
  schoolYear,
  setSchoolYear,
  semester,
  setSemester,
  schoolYearOptions,
  weekStart,
  setWeekStart,
}: FilterBarProps) {
  return (
    <FilterBar>
      <Col xs={24} sm={12} md={8}>
        <SchoolYearSelect
          options={schoolYearOptions}
          value={schoolYear}
          onChange={setSchoolYear}
          style={{ width: "100%" }}
          allowClear
        />
      </Col>

      <Col xs={24} sm={12} md={8}>
        <SemesterSelect
          value={semester}
          onChange={setSemester as any}
          style={{ width: "100%" }}
          allowClear
        />
      </Col>

      <Col xs={24} sm={12} md={8}>
        <DatePicker
          picker="week"
          value={weekStart}
          format="DD/MM/YYYY"
          onChange={(d) => d && setWeekStart(d.startOf("week"))}
          style={{ width: "100%" }}
          placeholder="Chọn tuần"
          locale={viVN}
        />
      </Col>
    </FilterBar>
  );
}
