import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Tag,
  Modal,
  Descriptions,
} from "antd";
import { FileAddOutlined } from "@ant-design/icons";
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
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const { hasLog, isFuture } = useLessonLogStatus(
    lesson._id as string,
    lesson.date
  );

  // Responsive style objects
  const subjectTextStyle = {
    fontSize: "1.1em",
    marginRight: 12,
    wordBreak: "break-word" as const,
    whiteSpace: "normal" as const,
    maxWidth: "60vw",
  };
  const infoTextStyle = {
    fontSize: "1em",
    wordBreak: "break-word" as const,
    whiteSpace: "normal" as const,
    maxWidth: "30vw",
  };

  return (
    <>
      <Card
        size="small"
        key={lesson._id || lesson.className + lesson.date + lesson.period}
        style={{
          marginBottom: 16,
          borderRadius: 16,
          background: "linear-gradient(90deg, #e0f7fa 0%, #f6faff 100%)",
          border: "none",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          cursor: "pointer",
        }}
        bodyStyle={{ padding: 18 }}
        onClick={() => setDetailModalOpen(true)}
      >
        <Row gutter={[0, 8]}>
          <Col
            span={24}
            style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
          >
            <Text strong style={subjectTextStyle}>
              {lesson.subject}
            </Text>
            {statusInfo?.text && (
              <Tag
                color={statusInfo.color || "default"}
                style={{ marginLeft: 8 }}
              >
                {statusInfo.text}
              </Tag>
            )}
          </Col>
          <Col span={24} style={{ marginTop: 2 }}>
            <Row gutter={16} wrap>
              <Col>
                <Text type="secondary" style={infoTextStyle}>
                  Lớp: <b>{lesson.className}</b>
                </Text>
              </Col>
              <Col>
                <Text type="secondary" style={infoTextStyle}>
                  Phòng:{" "}
                  <b>
                    {typeof lesson.room === "string"
                      ? lesson.room
                      : lesson.room?.name}
                  </b>
                </Text>
              </Col>
              {/* Đã ghi log label removed as requested */}
            </Row>
          </Col>
          <Col span={24} style={{ textAlign: "right", marginTop: 8 }}>
            <Button
              icon={<FileAddOutlined />}
              type="primary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setLogModalOpen(true);
              }}
              disabled={isFuture || hasLog}
              style={{ fontSize: "1em" }}
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
      <Modal
        title="Chi tiết TKB"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Môn học">
            {lesson.subject}
          </Descriptions.Item>
          <Descriptions.Item label="Lớp">{lesson.className}</Descriptions.Item>
          <Descriptions.Item label="Phòng">
            {typeof lesson.room === "string" ? lesson.room : lesson.room?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày">
            {lesson.date
              ? new Date(lesson.date).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : ""}
          </Descriptions.Item>
          <Descriptions.Item label="Ca học">{lesson.period}</Descriptions.Item>
          <Descriptions.Item label="Giảng viên">
            {typeof lesson.lecturer === "object"
              ? lesson.lecturer?.name
              : lesson.lecturer}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú">
            {(lesson as any).note || ""}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </>
  );
}
