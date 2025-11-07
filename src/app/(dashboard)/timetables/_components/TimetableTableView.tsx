"use client";

import React, { useMemo } from "react";
import { Button, Card, Select, Row, Col, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Timetable, Semester } from "@/types/timetable";
import TimetableTable from "./TimetableTable";

// Extended type for timetable with hasLog property
type TimetableWithLog = Timetable & { hasLog?: boolean };

interface TimetableTableViewProps {
  timetables: TimetableWithLog[];
  loading: boolean;
  onEdit: (timetable: TimetableWithLog) => void; // Click row → ghi log
  onEditTimetable?: (timetable: TimetableWithLog) => void; // Nút "Chỉnh sửa" → edit TKB
  onAdd: (prefillData?: any) => void;
  schoolYear: string;
  setSchoolYear: (value: string) => void;
  semester: Semester | "";
  setSemester: (value: Semester | "") => void;
  className: string;
  setClassName: (value: string) => void;
  week?: number | "";
  setWeek?: (value: number | "") => void;
}

export default function TimetableTableView({
  timetables,
  loading,
  onEdit,
  onEditTimetable,
  onAdd,
  schoolYear,
  setSchoolYear,
  semester,
  setSemester,
  className,
  setClassName,
  week = "",
  setWeek = () => {},
}: TimetableTableViewProps) {
  // Get unique values for filters
  const schoolYears = useMemo(
    () =>
      Array.from(new Set(timetables.map((t) => t.schoolYear).filter(Boolean))),
    [timetables]
  );

  const classes = useMemo(
    () =>
      Array.from(new Set(timetables.map((t) => t.className).filter(Boolean))),
    [timetables]
  );

  const handleClearFilters = () => {
    setSchoolYear("");
    setSemester("");
    setClassName("");
    setWeek("");
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8} md={6}>
          <Select
            placeholder="Năm học"
            value={schoolYear || undefined}
            onChange={setSchoolYear}
            allowClear
            style={{ width: "100%" }}
          >
            {schoolYears.map((year) => (
              <Select.Option key={year} value={year}>
                {year}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Select
            placeholder="Học kỳ"
            value={semester || undefined}
            onChange={setSemester}
            allowClear
            style={{ width: "100%" }}
          >
            <Select.Option value={1}>Học kỳ 1</Select.Option>
            <Select.Option value={2}>Học kỳ 2</Select.Option>
            <Select.Option value={3}>Học kỳ 3</Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Select
            placeholder="Lớp"
            value={className || undefined}
            onChange={setClassName}
            allowClear
            style={{ width: "100%" }}
          >
            {classes.map((cls) => (
              <Select.Option key={cls} value={cls}>
                {cls}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Select
            placeholder="Tuần"
            value={week || undefined}
            onChange={setWeek}
            allowClear
            style={{ width: "100%" }}
          >
            {Array.from({ length: 13 }, (_, i) => (
              <Select.Option key={i + 1} value={i + 1}>
                Tuần {i + 1}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={24} md={6} style={{ textAlign: "right" }}>
          <Space>
            <Button onClick={handleClearFilters}>Xóa lọc</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              Thêm lịch dạy
            </Button>
          </Space>
        </Col>
      </Row>

      <TimetableTable
        data={timetables}
        loading={loading}
        onEdit={onEdit} // Click row → ghi log
        onEditTimetable={onEditTimetable} // Nút "Chỉnh sửa" → edit TKB
        isUserView={true}
      />
    </Card>
  );
}
