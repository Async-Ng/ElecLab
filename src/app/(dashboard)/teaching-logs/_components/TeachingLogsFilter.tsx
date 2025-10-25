import React, { useMemo, useEffect, useState } from "react";
import { Row, Col, Select } from "antd";

export interface TeachingLogsFilterProps {
  logs: any[];
  filters: {
    semester?: string;
    schoolYear?: string;
    room?: string;
    lecturer?: string;
  };
  onChange: (filters: TeachingLogsFilterProps["filters"]) => void;
}

const TeachingLogsFilter: React.FC<TeachingLogsFilterProps> = ({
  logs,
  filters,
  onChange,
}) => {
  const semesters = useMemo(
    () =>
      Array.from(
        new Set(logs.map((l) => l.timetable?.semester).filter(Boolean))
      ),
    [logs]
  );
  const schoolYears = useMemo(
    () =>
      Array.from(
        new Set(logs.map((l) => l.timetable?.schoolYear).filter(Boolean))
      ),
    [logs]
  );
  const rooms = useMemo(
    () =>
      Array.from(
        new Set(
          logs
            .map((l) => l.timetable?.room?.name || l.timetable?.room)
            .filter(Boolean)
        )
      ),
    [logs]
  );

  // Lấy danh sách giảng viên từ API
  const [lecturers, setLecturers] = useState<
    { value: string; label: string }[]
  >([]);
  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const res = await fetch("/api/users?role=Lecture");
        const data = await res.json();
        setLecturers(
          Array.isArray(data)
            ? data.map((u: any) => ({ value: u._id, label: u.name }))
            : []
        );
      } catch {
        setLecturers([]);
      }
    };
    fetchLecturers();
  }, []);

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col span={6}>
        <Select
          allowClear
          placeholder="Học kỳ"
          style={{ width: "100%" }}
          value={filters.semester}
          onChange={(v) => onChange({ ...filters, semester: v })}
          options={semesters.map((s) => ({ value: s, label: s }))}
        />
      </Col>
      <Col span={6}>
        <Select
          allowClear
          placeholder="Năm học"
          style={{ width: "100%" }}
          value={filters.schoolYear}
          onChange={(v) => onChange({ ...filters, schoolYear: v })}
          options={schoolYears.map((sy) => ({ value: sy, label: sy }))}
        />
      </Col>
      <Col span={6}>
        <Select
          allowClear
          placeholder="Phòng học"
          style={{ width: "100%" }}
          value={filters.room}
          onChange={(v) => onChange({ ...filters, room: v })}
          options={rooms.map((r) => ({ value: r, label: r }))}
        />
      </Col>
      <Col span={6}>
        <Select
          allowClear
          placeholder="Giảng viên"
          style={{ width: "100%" }}
          value={filters.lecturer}
          onChange={(v) => onChange({ ...filters, lecturer: v })}
          options={lecturers}
        />
      </Col>
    </Row>
  );
};

export default TeachingLogsFilter;
