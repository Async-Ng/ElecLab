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
  // Học kỳ cố định
  const semesters = [
    { value: 1, label: "Học kỳ 1" },
    { value: 2, label: "Học kỳ 2" },
    { value: 3, label: "Học kỳ 3" },
  ];
  const schoolYears = useMemo(
    () =>
      Array.from(
        new Set(logs.map((l) => l.timetable?.schoolYear).filter(Boolean))
      ),
    [logs]
  );
  // Lấy danh sách phòng học từ API
  const [rooms, setRooms] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("/api/rooms");
        const data = await res.json();
        const roomList = Array.isArray(data.rooms) ? data.rooms : [];
        setRooms(roomList.map((r: any) => ({ value: r._id, label: r.name })));
      } catch {
        setRooms([]);
      }
    };
    fetchRooms();
  }, []);

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
          options={semesters}
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
          options={rooms}
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
