import React, { useMemo, useEffect, useState, useCallback } from "react";
import { Row, Col, Select } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { authFetch, getApiEndpoint } from "@/lib/apiClient";

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
    const { user } = useAuth();
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
      if (!user) return;

      const fetchData = async () => {
        try {
          const roomsEndpoint = getApiEndpoint("rooms", user.roles);

          console.log(
            "TeachingLogsFilter - Calling rooms endpoint:",
            roomsEndpoint
          );

          const roomsRes = await authFetch(
            roomsEndpoint,
            user._id!,
            user.roles
          );

          console.log("TeachingLogsFilter - Rooms API response:", {
            status: roomsRes.status,
            ok: roomsRes.ok,
          });

          let roomsData = { rooms: [] };

          // Check if response is OK and is JSON
          if (roomsRes.ok) {
            const roomsText = await roomsRes.text();
            try {
              roomsData = JSON.parse(roomsText);
            } catch (e) {
              console.error(
                "TeachingLogsFilter - Invalid JSON from rooms API:",
                roomsText.substring(0, 100)
              );
              roomsData = { rooms: [] };
            }
          } else {
            console.error(
              "TeachingLogsFilter - Rooms API error:",
              roomsRes.status,
              roomsRes.statusText
            );
          }

          // Extract lecturers from existing logs data instead of API call
          const lecturerList = Array.from(
            new Set(
              logs
                .map((log) => {
                  const timetable = log.timetable;
                  if (timetable?.lecturer) {
                    const lecturer = timetable.lecturer;
                    return typeof lecturer === "object"
                      ? { id: lecturer._id || lecturer.id, name: lecturer.name }
                      : null;
                  }
                  return null;
                })
                .filter(Boolean)
            )
          );

          const roomList = Array.isArray(roomsData.rooms)
            ? roomsData.rooms
            : [];
          setRooms(roomList.map((r: any) => ({ value: r._id, label: r.name })));
          setLecturers(
            lecturerList.map((lecturer: any) => ({
              value: lecturer.id,
              label: lecturer.name,
            }))
          );
        } catch (error) {
          console.error("Error fetching filter data:", error);
          setRooms([]);
          setLecturers([]);
        }
      };

      fetchData();
    }, [user, logs]);

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
