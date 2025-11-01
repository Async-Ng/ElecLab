/**
 * Common Select Field Components
 * Reusable select components for frequently used fields like semester, period, time, etc.
 */

import React from "react";
import { Select, SelectProps } from "antd";
import { Semester, Period, StudyTime } from "@/types/timetable";

// Semester Select
interface SemesterSelectProps extends Omit<SelectProps, "options"> {
  value?: Semester | "" | null;
  onChange?: (value: Semester | "") => void;
}

export function SemesterSelect({
  value,
  onChange,
  placeholder = "Học kỳ",
  ...props
}: SemesterSelectProps) {
  return (
    <Select
      placeholder={placeholder}
      value={value ?? undefined}
      onChange={onChange}
      options={[
        { label: "HK1", value: Semester.First },
        { label: "HK2", value: Semester.Second },
        { label: "HK3", value: Semester.Third },
      ]}
      {...props}
    />
  );
}

// Period Select
interface PeriodSelectProps extends Omit<SelectProps, "options"> {
  value?: Period | "" | null;
  onChange?: (value: Period | "") => void;
}

export function PeriodSelect({
  value,
  onChange,
  placeholder = "Ca học",
  ...props
}: PeriodSelectProps) {
  return (
    <Select
      placeholder={placeholder}
      value={value ?? undefined}
      onChange={onChange}
      options={[
        { label: "Ca 1", value: Period.Period1 },
        { label: "Ca 2", value: Period.Period2 },
        { label: "Ca 3", value: Period.Period3 },
        { label: "Ca 4", value: Period.Period4 },
      ]}
      {...props}
    />
  );
}

// StudyTime Select
interface StudyTimeSelectProps extends Omit<SelectProps, "options"> {
  value?: StudyTime | "" | null;
  onChange?: (value: StudyTime | "") => void;
}

export function StudyTimeSelect({
  value,
  onChange,
  placeholder = "Giờ học",
  ...props
}: StudyTimeSelectProps) {
  return (
    <Select
      placeholder={placeholder}
      value={value ?? undefined}
      onChange={onChange}
      options={Object.values(StudyTime).map((t) => ({
        label: t,
        value: t,
      }))}
      {...props}
    />
  );
}

// School Year Select
interface SchoolYearSelectProps extends Omit<SelectProps, "options"> {
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}

export function SchoolYearSelect({
  options,
  value,
  onChange,
  placeholder = "Năm học",
  ...props
}: SchoolYearSelectProps) {
  return (
    <Select
      placeholder={placeholder}
      value={value || undefined}
      onChange={onChange}
      options={options.map((y) => ({ label: y, value: y }))}
      {...props}
    />
  );
}

// Subject Select
interface SubjectSelectProps extends Omit<SelectProps, "options"> {
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}

export function SubjectSelect({
  options,
  value,
  onChange,
  placeholder = "Môn học",
  ...props
}: SubjectSelectProps) {
  return (
    <Select
      placeholder={placeholder}
      value={value || undefined}
      onChange={onChange}
      options={options.map((s) => ({ label: s, value: s }))}
      {...props}
    />
  );
}

// Class Name Select
interface ClassNameSelectProps extends Omit<SelectProps, "options"> {
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}

export function ClassNameSelect({
  options,
  value,
  onChange,
  placeholder = "Lớp",
  ...props
}: ClassNameSelectProps) {
  return (
    <Select
      placeholder={placeholder}
      value={value || undefined}
      onChange={onChange}
      options={options.map((c) => ({ label: c, value: c }))}
      {...props}
    />
  );
}
