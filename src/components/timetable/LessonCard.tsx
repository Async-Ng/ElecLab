"use client";
import React, { useState } from "react";
import { Modal, Descriptions, Button as AntButton, Tag, Tooltip } from "antd";
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
  ShoppingOutlined,
} from "@ant-design/icons";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Timetable } from "@/types/timetable";
import TeachingLogModal from "@/app/(dashboard)/teaching-logs/_components/TeachingLogModal";
import { CreateMaterialRequestFromTimetable } from "@/components/materialRequest/CreateMaterialRequestFromTimetable";
import { useLessonLogStatus } from "@/hooks/useLessonLogStatus";
import { cn } from "@/design-system/utilities";

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

  // Get status styles based on lesson state
  const getStatusStyle = () => {
    if (hasLog) {
      return {
        bgClass: "bg-gradient-to-br from-green-50 to-emerald-50",
        borderClass: "border-green-500",
        badgeVariant: "success" as const,
        statusText: "Đã ghi log",
        statusIcon: <CheckCircleOutlined />,
      };
    }
    if (isFuture) {
      return {
        bgClass: "bg-gradient-to-br from-gray-50 to-slate-50",
        borderClass: "border-gray-300",
        badgeVariant: "secondary" as const,
        statusText: "Sắp tới",
        statusIcon: <ClockCircleOutlined />,
      };
    }
    if (statusInfo?.color === "red") {
      return {
        bgClass: "bg-gradient-to-br from-red-50 to-rose-50",
        borderClass: "border-red-500",
        badgeVariant: "error" as const,
        statusText: statusInfo.text || "Cần ghi log",
        statusIcon: <ClockCircleOutlined />,
      };
    }
    return {
      bgClass: "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderClass: "border-blue-500",
      badgeVariant: "primary" as const,
      statusText: statusInfo?.text || "Chờ ghi",
      statusIcon: <ClockCircleOutlined />,
    };
  };

  const statusStyle = getStatusStyle();

  return (
    <>
      <div
        onClick={() => setDetailModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setDetailModalOpen(true);
          }
        }}
        role="button"
        tabIndex={0}
        className="cursor-pointer"
      >
        <Card
          hoverable
          padding="none"
          className={cn(
            "border-2 transition-all duration-300 h-full",
            "hover:shadow-xl hover:-translate-y-1",
            statusStyle.bgClass,
            statusStyle.borderClass
          )}
        >
          {/* Card Header - Subject */}
          <div className="p-3 sm:p-4 border-b border-gray-200/50">
          <div className="flex items-start gap-2 sm:gap-3">
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg",
                "flex items-center justify-center",
                hasLog
                  ? "bg-green-500/10"
                  : isFuture
                  ? "bg-gray-400/10"
                  : statusInfo?.color === "red"
                  ? "bg-red-500/10"
                  : "bg-blue-500/10"
              )}
            >
              <BookOutlined
                className={cn(
                  "text-base sm:text-lg",
                  hasLog
                    ? "text-green-600"
                    : isFuture
                    ? "text-gray-500"
                    : statusInfo?.color === "red"
                    ? "text-red-600"
                    : "text-blue-600"
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 leading-tight">
                {lesson.subject}
              </h3>
              {/* Mobile status badge */}
              <Badge
                variant={statusStyle.badgeVariant}
                className="mt-1.5 sm:hidden text-[10px]"
              >
                {statusStyle.statusIcon}
                <span className="ml-1">{statusStyle.statusText}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Card Body - Info Tags */}
        <div className="p-3 sm:p-4 space-y-2">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {/* Class Tag */}
            <Tooltip title="Lớp học">
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] sm:text-xs font-medium">
                <TeamOutlined className="text-[10px] sm:text-xs" />
                <span>{lesson.className}</span>
              </div>
            </Tooltip>

            {/* Room Tag */}
            <Tooltip title="Phòng học">
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] sm:text-xs font-medium">
                <HomeOutlined className="text-[10px] sm:text-xs" />
                <span>
                  {typeof lesson.room === "string"
                    ? lesson.room
                    : lesson.room?.room_id || lesson.room?.name}
                </span>
              </div>
            </Tooltip>

            {/* Period Tag */}
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-[10px] sm:text-xs font-medium">
              <CalendarOutlined className="text-[10px] sm:text-xs" />
              <span>Ca {lesson.period}</span>
            </div>
          </div>

          {/* Desktop status badge */}
          <Badge
            variant={statusStyle.badgeVariant}
            className="hidden sm:inline-flex text-xs"
          >
            {statusStyle.statusIcon}
            <span className="ml-1.5">{statusStyle.statusText}</span>
          </Badge>
        </div>
      </Card>
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BookOutlined className="text-blue-600 text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {lesson.subject}
              </div>
              <div className="text-xs text-gray-500">Chi tiết tiết học</div>
            </div>
          </div>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        width="98%"
        style={{ maxWidth: "1200px" }}
        styles={{ body: { padding: "24px" } }}
        footer={[
          <AntButton key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </AntButton>,
          <AntButton
            key="material"
            type="dashed"
            icon={<ShoppingOutlined />}
            onClick={() => {
              setDetailModalOpen(false);
              setMaterialModalOpen(true);
            }}
          >
            Yêu cầu vật tư
          </AntButton>,
          !isFuture && !hasLog && (
            <AntButton
              key="log"
              type="primary"
              icon={<FileAddOutlined />}
              onClick={() => {
                setDetailModalOpen(false);
                setLogModalOpen(true);
              }}
            >
              Ghi nhật ký
            </AntButton>
          ),
        ]}
      >
        <Descriptions
          column={{ xs: 1, sm: 2, md: 4 }}
          bordered
          size="middle"
          className="mb-6"
        >
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1.5 font-semibold">
                <BookOutlined /> Môn học
              </span>
            }
          >
            <span className="font-medium text-blue-600">{lesson.subject}</span>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1.5 font-semibold">
                <TeamOutlined /> Lớp
              </span>
            }
          >
            {lesson.className}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1.5 font-semibold">
                <HomeOutlined /> Phòng
              </span>
            }
          >
            <span className="font-medium text-green-600">
              {typeof lesson.room === "string"
                ? lesson.room
                : lesson.room?.name || lesson.room?.room_id}
            </span>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1.5 font-semibold">
                <CalendarOutlined /> Ngày
              </span>
            }
          >
            {lesson.date
              ? new Date(lesson.date).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : ""}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1.5 font-semibold">
                <ClockCircleOutlined /> Ca học
              </span>
            }
          >
            <Tag color="blue" className="text-sm">
              Ca {lesson.period} - {lesson.time}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1.5 font-semibold">
                <UserOutlined /> Giảng viên
              </span>
            }
          >
            {typeof lesson.lecturer === "object"
              ? lesson.lecturer?.name
              : lesson.lecturer}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircleOutlined /> Trạng thái
              </span>
            }
          >
            <Badge variant={statusStyle.badgeVariant}>
              {statusStyle.statusIcon}
              <span className="ml-1.5">{statusStyle.statusText}</span>
            </Badge>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1.5 font-semibold">
                <FormOutlined /> Ghi chú
              </span>
            }
          >
            <span className="text-gray-600">
              {String(
                (lesson as unknown as { note?: string }).note ||
                  "Không có ghi chú"
              )}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Modal>

      <TeachingLogModal
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        timetableId={lesson._id as string}
        onSuccess={() => setLogModalOpen(false)}
        materials={materials}
        rooms={rooms}
      />

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
