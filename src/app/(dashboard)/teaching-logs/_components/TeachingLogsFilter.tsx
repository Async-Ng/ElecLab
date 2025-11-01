import React, { useMemo, useEffect, useState, useCallback } from "react";
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

const TeachingLogsFilter: React.FC<TeachingLogsFilterProps> = React.memo(
  ({ logs, filters, onChange }) => {
    const semesters = useMemo(
      () => [
        { value: 1, label: "Học kỳ 1" },
        { value: 2, label: "Học kỳ 2" },
        { value: 3, label: "Học kỳ 3" },
      ],
      []
    );

    const schoolYears = useMemo(
      () =>
        Array.from(
          new Set(logs.map((l) => l.timetable?.schoolYear).filter(Boolean))
        ),
      [logs]
    );

    const [rooms, setRooms] = useState<{ value: string; label: string }[]>([]);
    const [lecturers, setLecturers] = useState<
      { value: string; label: string }[]
    >([]);

    useEffect(() => {
      Promise.all([
        fetch("/api/rooms").then((res) => res.json()),
        fetch("/api/users?role=Lecture").then((res) => res.json()),
      ])
        .then(([roomsData, usersData]) => {
          const roomList = Array.isArray(roomsData.rooms)
            ? roomsData.rooms
            : [];
          setRooms(roomList.map((r: any) => ({ value: r._id, label: r.name })));
          setLecturers(
            Array.isArray(usersData)
              ? usersData.map((u: any) => ({ value: u._id, label: u.name }))
              : []
          );
        })
        .catch(() => {
          setRooms([]);
          setLecturers([]);
        });
    }, []);

    const handleChange = useCallback(
      (key: string) => (v: any) => {
        onChange({ ...filters, [key]: v });
      },
      [onChange, filters]
    );

    const schoolYearOptions = useMemo(
      () => schoolYears.map((sy) => ({ value: sy, label: sy })),
      [schoolYears]
    );

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Select
            allowClear
            placeholder="Học kỳ"
            style={{ width: "100%" }}
            value={filters.semester}
            onChange={handleChange("semester")}
            options={semesters}
          />
        </Col>
        <Col span={6}>
          <Select
            allowClear
            placeholder="Năm học"
            style={{ width: "100%" }}
            value={filters.schoolYear}
            onChange={handleChange("schoolYear")}
            options={schoolYearOptions}
          />
        </Col>
        <Col span={6}>
          <Select
            allowClear
            placeholder="Phòng học"
            style={{ width: "100%" }}
            value={filters.room}
            onChange={handleChange("room")}
            options={rooms}
          />
        </Col>
        <Col span={6}>
          <Select
            allowClear
            placeholder="Giảng viên"
            style={{ width: "100%" }}
            value={filters.lecturer}
            onChange={handleChange("lecturer")}
            options={lecturers}
          />
        </Col>
      </Row>
    );
  }
);

export default TeachingLogsFilter;
