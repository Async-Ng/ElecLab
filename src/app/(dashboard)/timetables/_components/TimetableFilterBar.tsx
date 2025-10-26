import { Select, DatePicker, Space, Button } from "antd";
import dayjs from "dayjs";
import React from "react";
import { Semester, Period, StudyTime, Timetable } from "@/types/timetable";

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

  React.useEffect(() => {
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.rooms)) {
          setRoomOptions(
            data.rooms.map((r: any) => ({
              label: r.room_id + (r.name ? ` - ${r.name}` : ""),
              value: r.room_id,
            }))
          );
        } else {
          setRoomOptions([]);
        }
      });
    fetch("/api/users?role=lecturer")
      .then((res) => res.json())
      .then((lecturers) => {
        setLecturerOptions(lecturers.map((l: any) => l.name));
      });
  }, []);

  return (
    <div style={{ marginBottom: 16 }}>
      <Space wrap style={{ marginBottom: 8 }}>
        <Select
          style={{ minWidth: 160 }}
          placeholder="Năm học"
          value={schoolYear || undefined}
          onChange={setSchoolYear}
          options={schoolYearOptions.map((y) => ({ label: y, value: y }))}
          allowClear
        />
        <Select
          style={{ minWidth: 140 }}
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
        <DatePicker
          format="DD/MM/YYYY"
          style={{ width: 160 }}
          value={date ? dayjs(date, "DD/MM/YYYY") : null}
          onChange={(d) => setDate(d ? d.format("DD/MM/YYYY") : "")}
          placeholder="Ngày"
          allowClear
        />
        <Select
          style={{ minWidth: 140 }}
          placeholder="Ca học"
          value={period || undefined}
          onChange={setPeriod}
          options={[
            { label: "Ca 1", value: Period.Period1 },
            { label: "Ca 2", value: Period.Period2 },
            { label: "Ca 3", value: Period.Period3 },
            { label: "Ca 4", value: Period.Period4 },
          ]}
          allowClear
        />
        <Select
          style={{ minWidth: 160 }}
          placeholder="Giờ học"
          value={time || undefined}
          onChange={setTime}
          options={Object.values(StudyTime).map((t) => ({
            label: t,
            value: t,
          }))}
          allowClear
        />
      </Space>
      <Space wrap style={{ marginBottom: 8 }}>
        <Select
          style={{ minWidth: 180 }}
          placeholder="Môn học"
          value={subject || undefined}
          onChange={setSubject}
          options={subjectOptions.map((s) => ({ label: s, value: s }))}
          allowClear
        />
        <Select
          style={{ minWidth: 220 }}
          placeholder="Phòng học"
          value={room || undefined}
          onChange={setRoom}
          options={roomOptions}
          allowClear
          showSearch
          optionFilterProp="label"
        />
        <Select
          style={{ minWidth: 180 }}
          placeholder="Lớp"
          value={className || undefined}
          onChange={setClassName}
          options={classOptions.map((c) => ({ label: c, value: c }))}
          allowClear
        />
        <Select
          style={{ minWidth: 220 }}
          placeholder="Giảng viên"
          value={lecturer || undefined}
          onChange={setLecturer}
          options={lecturerOptions.map((l) => ({ label: l, value: l }))}
          allowClear
        />
        <Button onClick={handleClear}>Xóa lọc</Button>
      </Space>
    </div>
  );
};

export default TimetableFilterBar;
