import { Select, DatePicker, Button, Col } from "antd";
import dayjs from "dayjs";
import React from "react";
import { Semester, Period, StudyTime, Timetable } from "@/types/timetable";
import FilterBar from "@/components/common/FilterBar";
import {
  SemesterSelect,
  PeriodSelect,
  StudyTimeSelect,
  SchoolYearSelect,
  SubjectSelect,
  ClassNameSelect,
} from "@/components/common/SelectFields";
import { useAuth } from "@/hooks/useAuth";
import { authFetch, getApiEndpoint } from "@/lib/apiClient";

interface TimetableFilterBarProps {
  data: Timetable[];
  schoolYear: string;
  setSchoolYear: (v: string) => void;
  semester: Semester | "";
  setSemester: (v: Semester | "") => void;
  date: string;
  setDate: (v: string) => void;
  period: Period | "";
  setPeriod: (v: Period | "") => void;
  time: StudyTime | "";
  setTime: (v: StudyTime | "") => void;
  subject: string;
  setSubject: (v: string) => void;
  room: string;
  setRoom: (v: string) => void;
  className: string;
  setClassName: (v: string) => void;
  lecturer: string;
  setLecturer: (v: string) => void;
  handleClear: () => void;
}

const TimetableFilterBar: React.FC<TimetableFilterBarProps> = ({
  data,
  schoolYear,
  setSchoolYear,
  semester,
  setSemester,
  date,
  setDate,
  period,
  setPeriod,
  time,
  setTime,
  subject,
  setSubject,
  room,
  setRoom,
  className,
  setClassName,
  lecturer,
  setLecturer,
  handleClear,
}) => {
  const schoolYearOptions = Array.from(new Set(data.map((r) => r.schoolYear)));
  const subjectOptions = Array.from(new Set(data.map((r) => r.subject)));
  const classOptions = Array.from(new Set(data.map((r) => r.className)));
  const [roomOptions, setRoomOptions] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [lecturerOptions, setLecturerOptions] = React.useState<string[]>([]);
  const { user } = useAuth();

  React.useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const roomsEndpoint = getApiEndpoint("rooms", user.roles);
        const usersEndpoint = getApiEndpoint("users", user.roles);

        const [roomsRes, lecturersRes] = await Promise.all([
          authFetch(roomsEndpoint, user._id!, user.roles),
          authFetch(`${usersEndpoint}?role=lecturer`, user._id!, user.roles),
        ]);

        let roomsData = { rooms: [] };
        let lecturersData = [];

        // Parse rooms response safely
        if (roomsRes.ok) {
          try {
            roomsData = await roomsRes.json();
          } catch (e) {
            console.error("TimetableFilterBar - Invalid JSON from rooms API");
          }
        } else {
          console.error(
            "TimetableFilterBar - Rooms API error:",
            roomsRes.status
          );
        }

        // Parse lecturers response safely
        if (lecturersRes.ok) {
          try {
            lecturersData = await lecturersRes.json();
          } catch (e) {
            console.error(
              "TimetableFilterBar - Invalid JSON from lecturers API"
            );
          }
        } else {
          console.error(
            "TimetableFilterBar - Lecturers API error:",
            lecturersRes.status
          );
        }

        // Xử lý rooms
        if (Array.isArray(roomsData.rooms)) {
          setRoomOptions(
            roomsData.rooms.map((r: any) => ({
              label: r.room_id + (r.name ? ` - ${r.name}` : ""),
              value: r.room_id,
            }))
          );
        } else {
          setRoomOptions([]);
        }

        // Xử lý lecturers
        setLecturerOptions(lecturersData.map((l: any) => l.name));
      } catch (error) {
        console.error("Error fetching data:", error);
        setRoomOptions([]);
        setLecturerOptions([]);
      }
    };

    fetchData();
  }, [user]);

  return (
    <FilterBar onClear={handleClear} clearText="Xóa lọc">
      <Col xs={24} sm={12} lg={6} className="mb-2">
        <SchoolYearSelect
          options={schoolYearOptions}
          value={schoolYear}
          onChange={setSchoolYear}
          style={{ width: "100%" }}
          allowClear
        />
      </Col>

      <Col xs={24} sm={12} lg={6} className="mb-2">
        <SemesterSelect
          value={semester}
          onChange={setSemester}
          style={{ width: "100%" }}
          allowClear
        />
      </Col>

      <Col xs={24} sm={12} lg={6} className="mb-2">
        <DatePicker
          format="DD/MM/YYYY"
          style={{ width: "100%" }}
          value={date ? dayjs(date, "DD/MM/YYYY") : null}
          onChange={(d) => setDate(d ? d.format("DD/MM/YYYY") : "")}
          placeholder="Ngày"
          allowClear
        />
      </Col>

      <Col xs={24} sm={12} lg={6} className="mb-2">
        <PeriodSelect
          value={period}
          onChange={setPeriod}
          style={{ width: "100%" }}
          allowClear
        />
      </Col>

      <Col xs={24} sm={12} lg={6} className="mb-2">
        <StudyTimeSelect
          value={time}
          onChange={setTime}
          style={{ width: "100%" }}
          allowClear
        />
      </Col>

      <Col xs={24} sm={12} lg={6} className="mb-2">
        <SubjectSelect
          options={subjectOptions}
          value={subject}
          onChange={setSubject}
          style={{ width: "100%" }}
          allowClear
        />
      </Col>

      <Col xs={24} sm={12} lg={6} className="mb-2">
        <Select
          style={{ width: "100%" }}
          placeholder="Phòng học"
          value={room || undefined}
          onChange={setRoom}
          options={roomOptions}
          allowClear
          showSearch
          optionFilterProp="label"
        />
      </Col>

      <Col xs={24} sm={12} lg={6} className="mb-2">
        <ClassNameSelect
          options={classOptions}
          value={className}
          onChange={setClassName}
          style={{ width: "100%" }}
          allowClear
        />
      </Col>

      <Col xs={24} sm={12} lg={6} className="mb-2">
        <Select
          style={{ width: "100%" }}
          placeholder="Giảng viên"
          value={lecturer || undefined}
          onChange={setLecturer}
          options={lecturerOptions.map((l) => ({ label: l, value: l }))}
          allowClear
        />
      </Col>
    </FilterBar>
  );
};

export default TimetableFilterBar;
