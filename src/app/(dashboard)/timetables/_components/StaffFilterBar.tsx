"use client";
import React from "react";
import { Select } from "antd";
import { Semester } from "@/types/timetable";

interface StaffFilterBarProps {
  schoolYear: string;
  setSchoolYear: (v: string) => void;
  semester: Semester | null;
  setSemester: (v: Semester | null) => void;
  schoolYearOptions: string[];
  className: string;
  setClassName: (v: string) => void;
  roomFilter: string;
  setRoomFilter: (v: string) => void;
  classOptions: string[];
  roomOptions: string[];
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}

export default function StaffFilterBar({
  schoolYear,
  setSchoolYear,
  semester,
  setSemester,
  schoolYearOptions,
  className,
  setClassName,
  roomFilter,
  setRoomFilter,
  classOptions,
  roomOptions,
  onPrevWeek,
  onNextWeek,
}: StaffFilterBarProps) {
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
        options={schoolYearOptions.map((y) => ({ label: y, value: y }))}
        allowClear
      />
      <Select
        style={{ minWidth: 120 }}
        placeholder="Học kỳ"
        value={semester || undefined}
        onChange={setSemester}
        options={[
          { label: "HK1", value: Semester.First },
          { label: "HK2", value: Semester.Second },
          { label: "HK3", value: Semester.Third },
        ]}
        allowClear
      />
      <Select
        style={{ minWidth: 120 }}
        placeholder="Lớp"
        value={className || undefined}
        onChange={setClassName}
        options={classOptions.map((c) => ({ label: c, value: c }))}
        allowClear
      />
      <Select
        style={{ minWidth: 120, width: 300 }}
        placeholder="Phòng"
        value={roomFilter || undefined}
        onChange={setRoomFilter}
        options={roomOptions.map((r) => ({ label: r, value: r }))}
        allowClear
      />
      {/* Nút xem tuần trước/tuần sau */}
      {onPrevWeek && (
        <button
          type="button"
          onClick={onPrevWeek}
          style={{ padding: "4px 12px" }}
        >
          Tuần trước
        </button>
      )}
      {onNextWeek && (
        <button
          type="button"
          onClick={onNextWeek}
          style={{ padding: "4px 12px" }}
        >
          Tuần sau
        </button>
      )}
    </div>
  );
}
