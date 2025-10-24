import { Card, Tag, Tooltip, Button } from "antd";
import { Timetable } from "@/types/timetable";

interface LessonCardProps {
  lesson: Timetable;
  statusInfo: ReturnType<typeof getStatusInfo>;
  onDetail: () => void;
}

// You can move getStatusInfo to a shared utils file if needed
function getStatusInfo(row: Timetable) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const isFuture = row.date > todayISO;
  if (isFuture)
    return {
      color: undefined,
      text: "Chưa diễn ra",
      canClick: false,
      isEdit: false,
    };
  if (row.date === todayISO)
    return { color: "blue", text: "Hôm nay", canClick: true, isEdit: false };
  return { color: "red", text: "Quá hạn", canClick: true, isEdit: false };
}

export default function LessonCard({
  lesson,
  statusInfo,
  onDetail,
}: LessonCardProps) {
  return (
    <Card
      size="small"
      key={lesson._id || lesson.className + lesson.date + lesson.period}
      style={{
        marginBottom: 8,
        borderRadius: 8,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        background: "#fafcff",
      }}
      className="hover:shadow transition-shadow"
    >
      <div style={{ fontWeight: 500, wordBreak: "break-word" }}>
        <span>{lesson.className}</span>
        <span> – </span>
        <span>{lesson.subject}</span>
      </div>
      <div style={{ fontSize: 12, color: "#888" }}>
        Phòng{" "}
        {typeof lesson.room === "string" ? lesson.room : lesson.room?.name}
      </div>
      <div style={{ fontSize: 12, color: "#888" }}>
        Giáo viên:{" "}
        {typeof lesson.lecturer === "string"
          ? lesson.lecturer
          : lesson.lecturer?.name}
      </div>
      <div style={{ fontSize: 12, color: "#888" }}>
        Thời gian: {lesson.time}
      </div>
      <div
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        <Tooltip title={statusInfo.isEdit ? "Sửa" : "Xem chi tiết"}>
          <Button
            size="small"
            type={statusInfo.isEdit ? "default" : "primary"}
            disabled={!statusInfo.canClick}
            onClick={onDetail}
          >
            {statusInfo.isEdit ? "Sửa" : "Chi tiết"}
          </Button>
        </Tooltip>
      </div>
    </Card>
  );
}
