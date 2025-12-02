"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Select,
  Row,
  Col,
  Empty,
  Badge,
  Typography,
  message as antMessage,
} from "antd";
import { PlusOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/vi"; // Import Vietnamese locale
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import "./calendar-custom.css";

dayjs.extend(isoWeek);
dayjs.locale("vi"); // Set default locale to Vietnamese

const { Text } = Typography;

// Extended type for timetable with hasLog and date status properties
type TimetableWithLog = Timetable & {
  hasLog?: boolean;
  isPast?: boolean;
  isFuture?: boolean;
  isOverdue?: boolean;
  canLog?: boolean;
};

interface TimetableCalendarViewProps {
  timetables: TimetableWithLog[];
  loading: boolean;
  onEdit: (timetable: TimetableWithLog) => void;
  onCreateLog: (timetable: TimetableWithLog) => void;
  onAdd: (prefillData?: {
    date: string;
    period: Period;
    time: StudyTime;
    schoolYear?: string;
    semester?: Semester;
    className?: string;
  }) => void;
  schoolYear: string;
  setSchoolYear: (value: string) => void;
  semester: Semester | "";
  setSemester: (value: Semester | "") => void;
  className: string;
  setClassName: (value: string) => void;
  materials?: Array<{ _id: string; name: string; quantity: number }>;
  rooms?: Array<{ _id: string; room_id: string; name: string }>;
}

// Map Period enum to StudyTime enum and time ranges for calendar
const PERIOD_CONFIG: Record<
  Period,
  {
    studyTime: StudyTime;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
    label: string;
  }
> = {
  [Period.Period1]: {
    studyTime: StudyTime.Period1,
    startHour: 7,
    startMinute: 0,
    endHour: 9,
    endMinute: 15,
    label: "Ca 1",
  },
  [Period.Period2]: {
    studyTime: StudyTime.Period2,
    startHour: 9,
    startMinute: 30,
    endHour: 11,
    endMinute: 45,
    label: "Ca 2",
  },
  [Period.Period3]: {
    studyTime: StudyTime.Period3,
    startHour: 12,
    startMinute: 30,
    endHour: 14,
    endMinute: 45,
    label: "Ca 3",
  },
  [Period.Period4]: {
    studyTime: StudyTime.Period4,
    startHour: 15,
    startMinute: 0,
    endHour: 17,
    endMinute: 15,
    label: "Ca 4",
  },
};

export default function TimetableCalendarView({
  timetables,
  loading,
  onEdit,
  onCreateLog,
  onAdd,
  schoolYear,
  setSchoolYear,
  semester,
  setSemester,
  className,
  setClassName,
  materials = [],
  rooms = [],
}: TimetableCalendarViewProps) {
  const [currentWeek, setCurrentWeek] = useState(dayjs());

  // Get semester week from current week's timetables
  const getSemesterWeekFromData = (date: Dayjs): number => {
    // Tìm timetable có ngày trong tuần hiện tại
    const dateStr = date.format("DD/MM/YYYY");

    const timetablesInWeek = timetables.filter((tt) => {
      const ttDate = dayjs(tt.date, "DD/MM/YYYY");
      return (
        ttDate.isoWeek() === date.isoWeek() && ttDate.year() === date.year()
      );
    });

    if (timetablesInWeek.length > 0) {
      // Lấy tuần từ timetable đầu tiên
      return timetablesInWeek[0].week || 0;
    }

    return 0;
  };

  const semesterWeek = getSemesterWeekFromData(currentWeek);

  // Helper function to capitalize first letter
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

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

  // Get days of current week (Monday to Saturday)
  const weekDays = useMemo(() => {
    const startOfWeek = currentWeek.startOf("isoWeek"); // Monday
    return Array.from({ length: 6 }, (_, i) => startOfWeek.add(i, "day"));
  }, [currentWeek.valueOf()]); // Use valueOf() to get timestamp for dependency

  // Group timetables by date and period
  const timetableGrid = useMemo(() => {
    const grid: Record<string, Record<Period, Timetable | null>> = {};

    weekDays.forEach((day) => {
      const dateKey = day.format("YYYY-MM-DD");
      grid[dateKey] = {
        [Period.Period1]: null,
        [Period.Period2]: null,
        [Period.Period3]: null,
        [Period.Period4]: null,
      };
    });

    let matchedCount = 0;
    timetables.forEach((tt) => {
      // Parse date with multiple format support
      let dateKey = "";

      if (!tt.date) {
        return;
      }

      // Try parsing with DD/MM/YYYY format first (from database)
      let parsedDate = dayjs(tt.date, "DD/MM/YYYY");

      // If still invalid, try YYYY-MM-DD
      if (!parsedDate.isValid()) {
        parsedDate = dayjs(tt.date, "YYYY-MM-DD");
      }

      // Last resort: auto-detect
      if (!parsedDate.isValid()) {
        parsedDate = dayjs(tt.date);
      }

      if (!parsedDate.isValid()) {
        return;
      }

      dateKey = parsedDate.format("YYYY-MM-DD");

      if (grid[dateKey]) {
        grid[dateKey][tt.period] = tt;
        matchedCount++;
      }
    });

    return grid;
  }, [timetables, weekDays]);

  // Check if there is any timetable in the current week's grid
  const hasAny = React.useMemo(() => {
    try {
      return Object.values(timetableGrid).some((dayObj) =>
        Object.values(dayObj).some((cell) => cell !== null)
      );
    } catch (e) {
      return false;
    }
  }, [timetableGrid]);

  const goToPreviousWeek = () => {
    setCurrentWeek(currentWeek.subtract(1, "week"));
  };

  const goToNextWeek = () => {
    setCurrentWeek(currentWeek.add(1, "week"));
  };

  const goToToday = () => {
    setCurrentWeek(dayjs());
  };

  const renderTimetableCell = (
    tt: Timetable | null,
    day: Dayjs,
    period: Period
  ) => {
    if (!tt) {
      const periodConfig = PERIOD_CONFIG[period];
      return (
        <div
          className="timetable-cell empty"
          onClick={() =>
            onAdd({
              date: day.format("YYYY-MM-DD"),
              period: period,
              time: periodConfig.studyTime,
              schoolYear: schoolYear || undefined,
              semester: semester || undefined,
              className: className || undefined,
            })
          }
          style={{
            minHeight: "80px",
            border: "1px dashed #d9d9d9",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#bfbfbf",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#fafafa";
            e.currentTarget.style.borderColor = "#1890ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = "#d9d9d9";
          }}
        >
          <PlusOutlined />
        </div>
      );
    }

    const roomName =
      typeof tt.room === "object" && tt.room?.name ? tt.room.name : "";
    const periodConfig = PERIOD_CONFIG[period];

    const ttWithLog = tt as TimetableWithLog;

    // Determine colors and cursor based on status
    const getCardStyle = () => {
      if (ttWithLog.hasLog) {
        return {
          backgroundColor: "#f0f0f0", // Gray if has log (read-only)
          border: "1px solid #d9d9d9",
          cursor: "default",
          opacity: 0.85,
        };
      } else if (ttWithLog.isOverdue) {
        return {
          backgroundColor: "#fff2e8", // Orange background for overdue
          border: "2px solid #ff7a45",
          cursor: "pointer",
          opacity: 1,
        };
      } else if (ttWithLog.isFuture) {
        return {
          backgroundColor: "#f0f8ff", // Light blue for future
          border: "1px solid #91d5ff",
          cursor: "default",
          opacity: 1,
        };
      } else {
        return {
          backgroundColor: "#e6fffb", // Light cyan for available to log
          border: "1px solid #13c2c2",
          cursor: "pointer",
          opacity: 1,
        };
      }
    };

    const cardStyle = getCardStyle();

    // Smart click handler based on status
    const handleCellClick = () => {
      // Scenario 1: Already has log - just show info message
      if (ttWithLog.hasLog) {
        antMessage.info({
          content: "Tiết học này đã có nhật ký giảng dạy rồi!",
          duration: 2,
        });
        return;
      }

      // Scenario 2: Future timetable - show warning
      if (ttWithLog.isFuture) {
        antMessage.warning({
          content: "Chưa đến giờ học, không thể ghi nhật ký!",
          duration: 2,
        });
        return;
      }

      // Scenario 3: Can log (past or today, no log yet) - open TeachingLogModal
      if (ttWithLog.canLog) {
        onCreateLog(tt);
        return;
      }

      // Scenario 4: Default - open edit modal (for admin/special cases)
      onEdit(tt);
    };

    return (
      <div
        className="timetable-cell filled"
        onClick={handleCellClick}
        style={{
          minHeight: "80px",
          padding: "8px",
          ...cardStyle,
          borderRadius: "4px",
          transition: "all 0.3s",
        }}
        onMouseEnter={(e) => {
          if (ttWithLog.canLog) {
            e.currentTarget.style.backgroundColor = "#b5f5ec";
            e.currentTarget.style.boxShadow =
              "0 2px 8px rgba(19, 194, 194, 0.3)";
          } else if (ttWithLog.isOverdue) {
            e.currentTarget.style.backgroundColor = "#ffe7ba";
            e.currentTarget.style.boxShadow =
              "0 2px 8px rgba(255, 122, 69, 0.3)";
          } else if (ttWithLog.hasLog) {
            e.currentTarget.style.backgroundColor = "#e8e8e8";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = cardStyle.backgroundColor;
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div
          style={{
            fontWeight: 600,
            color: "#1890ff",
            fontSize: "13px",
            marginBottom: "4px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{tt.subject}</span>
          {/* Badge for different statuses */}
          {ttWithLog.hasLog && (
            <span
              style={{
                backgroundColor: "#52c41a",
                color: "white",
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "10px",
                fontWeight: "normal",
              }}
              title="Đã có nhật ký giảng dạy"
            >
              ✓ ĐÃ GHI
            </span>
          )}
          {ttWithLog.isOverdue && (
            <span
              style={{
                backgroundColor: "#ff7a45",
                color: "white",
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "10px",
                fontWeight: "normal",
              }}
              title="Quá hạn ghi log"
            >
              ⚠ QUÁ HẠN
            </span>
          )}
          {ttWithLog.isFuture && (
            <span
              style={{
                backgroundColor: "#91d5ff",
                color: "#1890ff",
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "10px",
                fontWeight: "normal",
              }}
              title="Tiết học trong tương lai"
            >
              ⏳ TƯƠNG LAI
            </span>
          )}
        </div>
        <div style={{ fontSize: "12px", color: "#595959" }}>
          <div>{tt.className}</div>
          {roomName && <div>📍 {roomName}</div>}
          <div style={{ color: "#8c8c8c", fontSize: "11px", marginTop: "2px" }}>
            {periodConfig.studyTime}
          </div>
          {tt.note && (
            <div
              style={{
                color: "#8c8c8c",
                fontSize: "11px",
                marginTop: "4px",
                fontStyle: "italic",
                borderTop: "1px solid #f0f0f0",
                paddingTop: "4px",
              }}
              title={tt.note}
            >
              📝{" "}
              {tt.note.length > 30 ? tt.note.substring(0, 30) + "..." : tt.note}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
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
        <Col xs={24} sm={8}>
          <Select
            placeholder="Học kỳ"
            value={semester || undefined}
            onChange={setSemester}
            allowClear
            style={{ width: "100%" }}
          >
            <Select.Option value={Semester.First}>Học kỳ 1</Select.Option>
            <Select.Option value={Semester.Second}>Học kỳ 2</Select.Option>
            <Select.Option value={Semester.Third}>Học kỳ 3</Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={8}>
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
      </Row>

      {!loading && timetables.length === 0 ? (
        <Empty description="Chưa có lịch giảng dạy" />
      ) : (
        <div>
          {/* Week Navigation */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              padding: "12px 16px",
              backgroundColor: "#fafafa",
              borderRadius: "4px",
            }}
          >
            <Button icon={<LeftOutlined />} onClick={goToPreviousWeek}>
              Tuần trước
            </Button>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Button onClick={goToToday}>Hôm nay</Button>
            </div>
            <Button icon={<RightOutlined />} onClick={goToNextWeek}>
              Tuần sau
            </Button>
          </div>

          {/* Status Legend */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "#fafafa",
              borderRadius: "4px",
              fontSize: "13px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#e6fffb",
                  border: "1px solid #13c2c2",
                  borderRadius: "2px",
                }}
              />
              <span>Có thể ghi log</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#fff2e8",
                  border: "2px solid #ff7a45",
                  borderRadius: "2px",
                }}
              />
              <span>⚠ Quá hạn</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#f0f0f0",
                  border: "1px solid #d9d9d9",
                  borderRadius: "2px",
                }}
              />
              <span>✓ Đã ghi log</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#f0f8ff",
                  border: "1px solid #91d5ff",
                  borderRadius: "2px",
                }}
              />
              <span>⏳ Tương lai</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "800px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      padding: "12px",
                      backgroundColor: "#1890ff",
                      color: "white",
                      fontWeight: 600,
                      border: "1px solid #0050b3",
                      minWidth: "100px",
                      position: "sticky",
                      left: 0,
                      zIndex: 10,
                    }}
                  >
                    Ca học
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.format("YYYY-MM-DD")}
                      style={{
                        padding: "12px",
                        backgroundColor: day.isSame(dayjs(), "day")
                          ? "#52c41a"
                          : "#1890ff",
                        color: "white",
                        fontWeight: 600,
                        border: "1px solid #0050b3",
                        minWidth: "150px",
                      }}
                    >
                      <div>{capitalize(day.format("dddd"))}</div>
                      <div style={{ fontSize: "12px", fontWeight: 400 }}>
                        {day.format("DD/MM/YYYY")}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  Period.Period1,
                  Period.Period2,
                  Period.Period3,
                  Period.Period4,
                ].map((period) => {
                  const periodConfig = PERIOD_CONFIG[period];
                  return (
                    <tr key={period}>
                      <td
                        style={{
                          padding: "12px",
                          backgroundColor: "#fafafa",
                          fontWeight: 600,
                          border: "1px solid #d9d9d9",
                          verticalAlign: "top",
                          position: "sticky",
                          left: 0,
                          zIndex: 5,
                        }}
                      >
                        <div style={{ color: "#1890ff" }}>
                          {periodConfig.label}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#8c8c8c",
                            marginTop: "4px",
                          }}
                        >
                          {periodConfig.studyTime}
                        </div>
                      </td>
                      {weekDays.map((day) => {
                        const dateKey = day.format("YYYY-MM-DD");
                        const tt = timetableGrid[dateKey]?.[period];
                        return (
                          <td
                            key={dateKey}
                            style={{
                              padding: "8px",
                              border: "1px solid #d9d9d9",
                              backgroundColor: day.isSame(dayjs(), "day")
                                ? "#f6ffed"
                                : "white",
                              verticalAlign: "top",
                            }}
                          >
                            {renderTimetableCell(tt, day, period)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
