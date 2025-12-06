"use client";

import React, { useMemo, useState } from "react";
import { Select as AntSelect, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/vi";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { brandColors } from "@/styles/theme";
import "./calendar-custom.css";

dayjs.extend(isoWeek);
dayjs.locale("vi");

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
  const [messageApi, contextHolder] = message.useMessage();
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
      return (
        <div className="min-h-[100px] bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
          {/* Empty cell */}
        </div>
      );
    }

    const roomName =
      typeof tt.room === "object" && tt.room?.name ? tt.room.name : "";
    const periodConfig = PERIOD_CONFIG[period];

    const ttWithLog = tt as TimetableWithLog;

    // Determine styles based on status
    const getCellClasses = () => {
      if (ttWithLog.hasLog) {
        return "bg-white border-l-4 border-l-gray-400 cursor-default";
      } else if (ttWithLog.isOverdue) {
        return "bg-white border-l-4 border-l-orange-500 cursor-pointer hover:shadow-xl";
      } else if (ttWithLog.isFuture) {
        return "bg-white border-l-4 border-l-blue-400 cursor-default";
      } else {
        return "bg-white border-l-4 border-l-cyan-500 cursor-pointer hover:shadow-xl";
      }
    };

    const getHoverClasses = () => {
      if (ttWithLog.canLog || ttWithLog.isOverdue) {
        return "hover:-translate-y-0.5";
      }
      return "";
    };

    // Smart click handler based on status
    const handleCellClick = () => {
      if (ttWithLog.hasLog) {
        messageApi.info("Tiết học này đã có nhật ký giảng dạy rồi!");
        return;
      }

      if (ttWithLog.isFuture) {
        messageApi.warning("Chưa đến giờ học, không thể ghi nhật ký!");
        return;
      }

      if (ttWithLog.canLog) {
        onCreateLog(tt);
        return;
      }

      onEdit(tt);
    };

    return (
      <div
        className={`min-h-[100px] p-4 rounded-xl transition-all duration-200 shadow-sm border border-gray-200 ${getCellClasses()} ${getHoverClasses()}`}
        onClick={handleCellClick}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-bold text-base text-gray-900 mb-1 leading-tight">
              {tt.subject}
            </h4>
            <p className="text-sm font-medium text-gray-700">{tt.className}</p>
          </div>
          {/* Badge for different statuses */}
          {ttWithLog.hasLog && (
            <Badge
              variant="success"
              className="text-xs px-2 py-1 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Đã ghi
            </Badge>
          )}
          {ttWithLog.isOverdue && (
            <Badge
              variant="error"
              className="text-xs px-2 py-1 flex items-center gap-1 animate-pulse"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Quá hạn
            </Badge>
          )}
          {ttWithLog.isFuture && (
            <Badge
              variant="info"
              className="text-xs px-2 py-1 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              Sắp tới
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          {roomName && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="font-medium">{roomName}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5 w-fit">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {periodConfig.studyTime}
          </div>
          {tt.note && (
            <div
              className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100 italic line-clamp-2"
              title={tt.note}
            >
              {tt.note}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {contextHolder}
      <Card className="mt-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <AntSelect
            placeholder="Năm học"
            value={schoolYear || undefined}
            onChange={(value) => setSchoolYear(value || "")}
            allowClear
            className="w-full"
            size="large"
            options={schoolYears.map((year) => ({
              label: year,
              value: year,
            }))}
          />
          <AntSelect
            placeholder="Học kỳ"
            value={semester || undefined}
            onChange={(value) => setSemester(value as Semester | "")}
            allowClear
            className="w-full"
            size="large"
            options={[
              { label: "Học kỳ 1", value: Semester.First },
              { label: "Học kỳ 2", value: Semester.Second },
              { label: "Học kỳ 3", value: Semester.Third },
            ]}
          />
          <AntSelect
            placeholder="Lớp"
            value={className || undefined}
            onChange={(value) => setClassName(value || "")}
            allowClear
            className="w-full"
            size="large"
            options={classes.map((cls) => ({
              label: cls,
              value: cls,
            }))}
          />
        </div>

        {!loading && timetables.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Chưa có lịch giảng dạy
          </div>
        ) : (
          <div>
            {/* Week Navigation */}
            <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
              <Button
                variant="outline"
                size="sm"
                leftIcon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                }
                onClick={goToPreviousWeek}
              >
                Tuần trước
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="primary" size="sm" onClick={goToToday}>
                  Hôm nay
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                rightIcon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                }
                onClick={goToNextWeek}
              >
                Tuần sau
              </Button>
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-cyan-500 rounded-full" />
                <span className="text-sm font-medium text-gray-700">
                  Có thể ghi log
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-orange-500 rounded-full" />
                <span className="text-sm font-medium text-gray-700">
                  Quá hạn
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-gray-400 rounded-full" />
                <span className="text-sm font-medium text-gray-700">
                  Đã ghi log
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-blue-400 rounded-full" />
                <span className="text-sm font-medium text-gray-700">
                  Sắp tới
                </span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full border-collapse min-w-[800px] bg-white">
                <thead>
                  <tr>
                    <th className="p-4 text-white font-semibold border-r border-gray-300 min-w-[120px] sticky left-0 z-10 bg-gradient-primary">
                      Ca học
                    </th>
                    {weekDays.map((day) => (
                      <th
                        key={day.format("YYYY-MM-DD")}
                        className={`p-4 text-white font-semibold border-r border-gray-300 last:border-r-0 min-w-[180px] ${
                          day.isSame(dayjs(), "day")
                            ? "bg-gradient-success"
                            : "bg-gradient-primary-secondary"
                        }`}
                      >
                        <div className="font-bold text-base">
                          {capitalize(day.format("dddd"))}
                        </div>
                        <div className="text-sm font-normal opacity-90 mt-0.5">
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
                        <td className="p-4 bg-gray-50 font-semibold border-r border-t border-gray-200 align-top sticky left-0 z-[5]">
                          <div className="font-bold text-brand-primary text-base">
                            {periodConfig.label}
                          </div>
                          <div className="text-xs text-gray-600 mt-1 font-medium">
                            {periodConfig.studyTime}
                          </div>
                        </td>
                        {weekDays.map((day) => {
                          const dateKey = day.format("YYYY-MM-DD");
                          const tt = timetableGrid[dateKey]?.[period];
                          return (
                            <td
                              key={dateKey}
                              className={`p-3 border-r border-t border-gray-200 last:border-r-0 align-top transition-colors ${
                                day.isSame(dayjs(), "day")
                                  ? "bg-green-50/20"
                                  : "bg-gray-50/30"
                              }`}
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
    </>
  );
}
