import { Card, Typography, Badge } from "antd";
import LessonCard from "./LessonCard";
import { Timetable } from "@/types/timetable";
import { Dayjs } from "dayjs";
import { brandColors, gradients } from "@/styles/theme";

interface TimetableGridProps {
  items: Timetable[];
  days: Dayjs[];
  allPeriods: number[];
  statusInfo: (row: Timetable) => any;
}

const { Text } = Typography;

const PERIOD_LABELS = ["Ca 1", "Ca 2", "Ca 3", "Ca 4"];
const DAY_NAMES = [
  "Chủ Nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

export default function TimetableGrid({
  items,
  days,
  allPeriods,
  statusInfo,
}: TimetableGridProps) {
  const getLessonsForCell = (day: Dayjs, period: number) => {
    return items.filter((it) => {
      let itemDate = it.date;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(itemDate)) {
        const [dd, mm, yyyy] = itemDate.split("/");
        itemDate = `${yyyy}-${mm}-${dd}`;
      }
      return (
        itemDate === day.format("YYYY-MM-DD") && Number(it.period) === period
      );
    });
  };

  const isToday = (day: Dayjs) => {
    return day.format("YYYY-MM-DD") === new Date().toISOString().split("T")[0];
  };

  return (
    <div
      style={{
        background: brandColors.background,
        borderRadius: 12,
        padding: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      className="sm:p-6"
    >
      {/* Header - Days of week */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "60px repeat(7, 1fr)",
          gap: "8px",
          marginBottom: "12px",
        }}
        className="sm:grid-cols-[100px_repeat(7,1fr)] sm:gap-3 sm:mb-4 overflow-x-auto"
      >
        <div style={{ padding: "12px" }}></div>
        {days.map((day, index) => {
          const isCurrentDay = isToday(day);
          return (
            <Card
              key={day.toString()}
              size="small"
              style={{
                textAlign: "center",
                background: isCurrentDay ? gradients.primary : "white",
                border: isCurrentDay
                  ? "none"
                  : `1px solid ${brandColors.border}`,
                borderRadius: 8,
                boxShadow: isCurrentDay
                  ? `0 4px 12px ${brandColors.primary}40`
                  : "none",
                minWidth: "80px",
              }}
              bodyStyle={{ padding: "8px 4px" }}
              className="sm:body-style-[padding:12px_8px]"
            >
              <Text
                strong
                style={{
                  display: "block",
                  fontSize: "11px",
                  color: isCurrentDay ? "white" : brandColors.textSecondary,
                  marginBottom: 4,
                }}
                className="sm:text-xs"
              >
                {DAY_NAMES[index]}
              </Text>
              <Text
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: isCurrentDay ? "white" : brandColors.textPrimary,
                }}
                className="sm:text-base"
              >
                {day.format("DD/MM")}
              </Text>
              {isCurrentDay && (
                <Badge
                  status="processing"
                  text={
                    <Text style={{ color: "white", fontSize: "10px" }}>
                      Hôm nay
                    </Text>
                  }
                  style={{ marginTop: 4 }}
                  className="hidden sm:inline-flex"
                />
              )}
            </Card>
          );
        })}
      </div>

      {/* Time slots grid */}
      {allPeriods.map((period) => (
        <div
          key={period}
          style={{
            display: "grid",
            gridTemplateColumns: "60px repeat(7, 1fr)",
            gap: "8px",
            marginBottom: "8px",
          }}
          className="sm:grid-cols-[100px_repeat(7,1fr)] sm:gap-3 sm:mb-3 overflow-x-auto"
        >
          {/* Period label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: gradients.accent,
              borderRadius: 8,
              padding: "8px 4px",
              boxShadow: `0 2px 8px ${brandColors.accent}30`,
              minWidth: "50px",
            }}
            className="sm:p-3"
          >
            <Text
              strong
              style={{
                color: "white",
                fontSize: "12px",
                textAlign: "center",
              }}
              className="sm:text-sm"
            >
              {PERIOD_LABELS[period - 1]}
            </Text>
          </div>

          {/* Lessons for each day */}
          {days.map((day) => {
            const lessons = getLessonsForCell(day, period);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toString() + period}
                style={{
                  background: isCurrentDay
                    ? `${brandColors.primaryLight}80`
                    : "white",
                  border: isCurrentDay
                    ? `2px dashed ${brandColors.primary}50`
                    : `1px solid ${brandColors.border}`,
                  borderRadius: 8,
                  padding: lessons.length > 0 ? "6px" : "8px",
                  minHeight: "100px",
                  minWidth: "80px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                className="sm:min-h-[120px] sm:p-2"
                onMouseEnter={(e) => {
                  if (lessons.length === 0) {
                    e.currentTarget.style.background = isCurrentDay
                      ? `${brandColors.primaryLight}CC`
                      : brandColors.backgroundSecondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (lessons.length === 0) {
                    e.currentTarget.style.background = isCurrentDay
                      ? `${brandColors.primaryLight}80`
                      : "white";
                  }
                }}
              >
                {lessons.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      opacity: 0.3,
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{ fontSize: 20 }}
                      className="sm:text-2xl"
                    >
                      —
                    </Text>
                  </div>
                ) : (
                  lessons.map((lesson) => (
                    <LessonCard
                      key={
                        lesson._id ||
                        `${lesson.className}-${lesson.date}-${lesson.period}`
                      }
                      lesson={lesson}
                      statusInfo={statusInfo(lesson)}
                    />
                  ))
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
