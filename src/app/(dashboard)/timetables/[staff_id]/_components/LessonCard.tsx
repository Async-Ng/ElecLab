import {
  Card,
  Typography,
  Button,
  Tag,
  Modal,
  Descriptions,
  Space,
  Tooltip,
} from "antd";
import {
  FileAddOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BookOutlined,
  HomeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Timetable } from "@/types/timetable";
import TeachingLogModal from "@/app/(dashboard)/teaching-logs/_components/TeachingLogModal";
import { useState } from "react";
import { useLessonLogStatus } from "@/hooks/useLessonLogStatus";
import { brandColors } from "@/styles/theme";

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

  // Get status color
  const getStatusColor = () => {
    if (hasLog) return brandColors.success;
    if (isFuture) return brandColors.textDisabled;
    return statusInfo?.color === "red"
      ? brandColors.error
      : brandColors.primary;
  };

  const getGradient = () => {
    if (hasLog) {
      return `linear-gradient(135deg, ${brandColors.primaryLight} 0%, #f0f9ff 100%)`;
    }
    if (isFuture) {
      return `linear-gradient(135deg, ${brandColors.backgroundSecondary} 0%, #f5f5f5 100%)`;
    }
    if (statusInfo?.color === "red") {
      return `linear-gradient(135deg, ${brandColors.accentLight} 0%, #ffccc7 100%)`;
    }
    return `linear-gradient(135deg, ${brandColors.primaryLight} 0%, #bae7ff 100%)`;
  };

  return (
    <>
      <Card
        size="small"
        hoverable
        style={{
          background: getGradient(),
          border: `2px solid ${getStatusColor()}`,
          borderRadius: 6,
          cursor: "pointer",
          transition: "all 0.3s ease",
          height: "100%",
        }}
        styles={{ body: { padding: "8px" } }}
        className="sm:body-style-[padding:12px] sm:rounded-lg"
        onClick={() => setDetailModalOpen(true)}
      >
        <Space
          direction="vertical"
          size="small"
          style={{ width: "100%" }}
          className="space-y-1 sm:space-y-2"
        >
          {/* Subject with status icon */}
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: 6 }}
            className="sm:gap-2"
          >
            <BookOutlined
              style={{
                color: getStatusColor(),
                fontSize: 14,
                marginTop: 2,
              }}
              className="sm:text-base"
            />
            <div style={{ flex: 1 }}>
              <Text
                strong
                style={{
                  fontSize: "11px",
                  display: "block",
                  lineHeight: "1.3",
                  color: brandColors.textPrimary,
                }}
                className="sm:text-sm sm:leading-normal"
              >
                {lesson.subject}
              </Text>
            </div>
          </div>

          {/* Class and Room info */}
          <Space
            size={3}
            wrap
            style={{ fontSize: "10px" }}
            className="sm:text-xs sm:space-x-1"
          >
            <Tooltip title="Lớp học">
              <Tag
                icon={<TeamOutlined />}
                color="blue"
                style={{ margin: 0, fontSize: "9px" }}
                className="sm:text-[10px]"
              >
                {lesson.className}
              </Tag>
            </Tooltip>
            <Tooltip title="Phòng học">
              <Tag
                icon={<HomeOutlined />}
                color="green"
                style={{ margin: 0, fontSize: "9px" }}
                className="sm:text-[10px]"
              >
                {typeof lesson.room === "string"
                  ? lesson.room
                  : lesson.room?.name}
              </Tag>
            </Tooltip>
          </Space>

          {/* Status tag - hidden on mobile */}
          {statusInfo?.text && (
            <Tag
              icon={
                hasLog ? (
                  <CheckCircleOutlined />
                ) : isFuture ? (
                  <ClockCircleOutlined />
                ) : null
              }
              color={hasLog ? "success" : statusInfo.color || "default"}
              style={{
                margin: 0,
                fontSize: "9px",
                borderRadius: 4,
              }}
              className="hidden sm:inline-flex sm:text-[10px]"
            >
              {hasLog ? "Đã ghi log" : statusInfo.text}
            </Tag>
          )}

          {/* Action button */}
          <Button
            icon={<FileAddOutlined />}
            type={hasLog ? "default" : "primary"}
            size="small"
            block
            onClick={(e) => {
              e.stopPropagation();
              setLogModalOpen(true);
            }}
            disabled={isFuture || hasLog}
            style={{
              fontSize: "9px",
              height: 24,
              marginTop: 4,
              padding: "0 6px",
            }}
            className="sm:text-[10px] sm:h-7 sm:mt-1 sm:px-2"
          >
            <span className="hidden sm:inline">
              {isFuture
                ? "Chưa đến ngày"
                : hasLog
                ? "Đã ghi nhật ký"
                : "Ghi nhật ký"}
            </span>
            <span className="sm:hidden">
              {isFuture ? "Chưa đến" : hasLog ? "Đã ghi" : "Ghi log"}
            </span>
          </Button>
        </Space>

        <TeachingLogModal
          open={logModalOpen}
          onClose={() => setLogModalOpen(false)}
          timetableId={lesson._id as string}
          onSuccess={() => setLogModalOpen(false)}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <BookOutlined style={{ color: brandColors.primary }} />
            <span>Chi tiết tiết học</span>
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
          !isFuture && !hasLog && (
            <Button
              key="log"
              type="primary"
              icon={<FileAddOutlined />}
              onClick={() => {
                setDetailModalOpen(false);
                setLogModalOpen(true);
              }}
            >
              <span className="hidden sm:inline">Ghi nhật ký</span>
              <span className="sm:hidden">Ghi log</span>
            </Button>
          ),
        ]}
        width="90%"
        style={{ maxWidth: 600 }}
        className="responsive-modal"
      >
        <Descriptions
          column={{ xs: 1, sm: 1 }}
          bordered
          size="small"
          className="sm:size-middle"
        >
          <Descriptions.Item label="Môn học">
            <Text strong>{lesson.subject}</Text>
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
          <Descriptions.Item label="Trạng thái">
            <Tag
              icon={hasLog ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              color={hasLog ? "success" : statusInfo?.color || "default"}
            >
              {hasLog ? "Đã ghi nhật ký" : statusInfo?.text || "Chưa ghi"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú">
            {(lesson as any).note || "Không có ghi chú"}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </>
  );
}
