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
  CalendarOutlined,
  UserOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { Timetable } from "@/types/timetable";
import TeachingLogModal from "@/app/(dashboard)/teaching-logs/_components/TeachingLogModal";
import { CreateMaterialRequestFromTimetable } from "@/components/materialRequest/CreateMaterialRequestFromTimetable";
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
  materials?: Array<{ _id: string; name: string; quantity: number }>;
  rooms?: Array<{ _id: string; room_id: string; name: string }>;
}

export default function LessonCard({
  lesson,
  statusInfo,
  materials = [],
  rooms = [],
}: LessonCardProps) {
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
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
        </Space>

        <TeachingLogModal
          open={logModalOpen}
          onClose={() => setLogModalOpen(false)}
          timetableId={lesson._id as string}
          onSuccess={() => setLogModalOpen(false)}
          materials={materials}
          rooms={rooms}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: brandColors.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookOutlined
                style={{ color: brandColors.primary, fontSize: "20px" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: brandColors.textPrimary,
                }}
              >
                {lesson.subject}
              </div>
              <div
                style={{ fontSize: "12px", color: brandColors.textSecondary }}
              >
                Chi tiết tiết học
              </div>
            </div>
          </div>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        width="98%"
        style={{ maxWidth: "1200px" }}
        styles={{ body: { padding: "24px" } }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="material"
            type="dashed"
            onClick={() => {
              setDetailModalOpen(false);
              setMaterialModalOpen(true);
            }}
          >
            📦 Gửi yêu cầu vật tư
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
      >
        <Descriptions
          column={{ xs: 1, sm: 2, md: 4, lg: 4 }}
          bordered
          size="middle"
          style={{ marginBottom: "24px" }}
          contentStyle={{ paddingRight: "24px" }}
          labelStyle={{ paddingRight: "24px", fontWeight: 600 }}
        >
          {/* Row 1 */}
          <Descriptions.Item
            label={
              <span
                style={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <BookOutlined /> Môn học
              </span>
            }
          >
            <Text
              strong
              style={{
                fontSize: "14px",
                color: brandColors.primary,
                wordBreak: "break-word",
              }}
            >
              {lesson.subject}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span
                style={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <TeamOutlined /> Lớp
              </span>
            }
          >
            <Text style={{ fontSize: "14px", wordBreak: "break-word" }}>
              {lesson.className}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span
                style={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <HomeOutlined /> Phòng
              </span>
            }
          >
            <Text
              style={{
                fontSize: "14px",
                color: brandColors.success,
                wordBreak: "break-word",
              }}
            >
              {typeof lesson.room === "string"
                ? lesson.room
                : lesson.room?.name}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span
                style={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CalendarOutlined /> Ngày
              </span>
            }
          >
            <Text style={{ fontSize: "14px", wordBreak: "break-word" }}>
              {lesson.date
                ? new Date(lesson.date).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : ""}
            </Text>
          </Descriptions.Item>
          {/* Row 2 */}
          <Descriptions.Item
            label={
              <span
                style={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ClockCircleOutlined /> Ca
              </span>
            }
          >
            <Tag color="blue" style={{ fontSize: "13px", padding: "4px 10px" }}>
              Ca {lesson.period}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span
                style={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <UserOutlined /> Giảng viên
              </span>
            }
          >
            <Text style={{ fontSize: "14px", wordBreak: "break-word" }}>
              {typeof lesson.lecturer === "object"
                ? lesson.lecturer?.name
                : lesson.lecturer}
            </Text>
          </Descriptions.Item>{" "}
          {/* Row 3 */}
          <Descriptions.Item
            label={
              <span
                style={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CheckCircleOutlined /> Trạng thái
              </span>
            }
          >
            <Tag
              icon={hasLog ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              color={hasLog ? "success" : statusInfo?.color || "default"}
              style={{ fontSize: "12px", padding: "4px 10px" }}
            >
              {hasLog ? "Đã ghi nhật ký" : `${statusInfo?.text || "Chưa ghi"}`}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span
                style={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FormOutlined /> Ghi chú
              </span>
            }
            span={3}
          >
            <Text
              style={{
                fontSize: "14px",
                color: brandColors.textSecondary,
                wordBreak: "break-word",
              }}
            >
              {String(
                (lesson as unknown as { note?: string }).note ??
                  "Không có ghi chú"
              )}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Modal>

      <CreateMaterialRequestFromTimetable
        visible={materialModalOpen}
        onClose={() => setMaterialModalOpen(false)}
        timetable={lesson}
        materials={materials}
        rooms={rooms}
      />
    </>
  );
}
