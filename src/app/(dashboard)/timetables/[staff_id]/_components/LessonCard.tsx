import { Card, Typography, Row, Col, Button, Tag } from "antd";
import { BookOutlined, HomeOutlined, FileAddOutlined } from "@ant-design/icons";
import { Timetable } from "@/types/timetable";
import TeachingLogModal from "@/app/(dashboard)/teaching-logs/_components/TeachingLogModal";
import { useState } from "react";
import { useLessonLogStatus } from "@/hooks/useLessonLogStatus";

const { Text } = Typography;

interface LessonCardProps {
  lesson: Timetable;
  statusInfo?: {
    color?: string;
    text?: string;
    canClick?: boolean;
    isEdit?: boolean;
  };
}

export default function LessonCard({ lesson, statusInfo }: LessonCardProps) {
  const [logModalOpen, setLogModalOpen] = useState(false);
  const { hasLog, isFuture } = useLessonLogStatus(
    lesson._id as string,
    lesson.date
  );

  return (
    <Card
      size="small"
      key={lesson._id || lesson.className + lesson.date + lesson.period}
      style={{
        marginBottom: 16,
        borderRadius: 16,
        background: "linear-gradient(90deg, #e0f7fa 0%, #f6faff 100%)",
        border: "none",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
      bodyStyle={{ padding: 18 }}
    >
      <Row align="middle" gutter={16}>
        <Col>
          <BookOutlined style={{ fontSize: 32, color: "#1890ff" }} />
        </Col>
        <Col flex="auto">
          {statusInfo?.text && (
            <Tag
              color={statusInfo.color || "default"}
              style={{ marginBottom: 8 }}
            >
              {statusInfo.text}
            </Tag>
          )}
          <Text strong style={{ fontSize: 18 }}>
            {lesson.subject}
          </Text>
          <div>
            <Text type="secondary" style={{ fontSize: 15 }}>
              Lớp: <b>{lesson.className}</b>
            </Text>
          </div>
          <div>
            <HomeOutlined style={{ marginRight: 6, color: "#52c41a" }} />
            <Text type="secondary" style={{ fontSize: 15 }}>
              Phòng:{" "}
              <b>
                {typeof lesson.room === "string"
                  ? lesson.room
                  : lesson.room?.name}
              </b>
            </Text>
          </div>
          {hasLog && (
            <Tag color="green" style={{ marginTop: 8 }}>
              Đã ghi log
            </Tag>
          )}
        </Col>
        <Col>
          <Button
            icon={<FileAddOutlined />}
            type="primary"
            size="small"
            onClick={() => setLogModalOpen(true)}
            disabled={isFuture || hasLog}
          >
            {isFuture
              ? "Chưa đến ngày"
              : hasLog
              ? "Đã ghi log"
              : "Nhật ký ca dạy"}
          </Button>
        </Col>
      </Row>
      <TeachingLogModal
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        timetableId={lesson._id as string}
        onSuccess={() => setLogModalOpen(false)}
      />
    </Card>
  );
}
