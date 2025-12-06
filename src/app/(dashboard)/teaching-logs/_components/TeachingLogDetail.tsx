import React from "react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { TeachingLog, TeachingLogStatus } from "../../../../types/teachingLog";
import {
  Timetable,
  Period,
  StudyTime,
  Semester,
} from "../../../../types/timetable";
import ImagePreviewGroup from "./ImagePreviewGroup";
import { formatDateVN } from "@/shared/utils/date";

interface TeachingLogDetailProps {
  log: TeachingLog;
}

const TeachingLogDetail: React.FC<TeachingLogDetailProps> = ({ log }) => {
  const timetable: Timetable | undefined =
    log?.timetable && typeof log.timetable === "object"
      ? log.timetable
      : undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Thông tin thời khóa biểu</h3>
        <div className="border border-gray-200 rounded-md divide-y">
          <div className="flex py-2 px-3">
            <span className="w-32 text-sm font-medium text-gray-700">
              Môn học
            </span>
            <span className="flex-1 text-sm text-gray-900">
              {timetable?.subject}
            </span>
          </div>
          <div className="flex py-2 px-3">
            <span className="w-32 text-sm font-medium text-gray-700">Lớp</span>
            <span className="flex-1 text-sm text-gray-900">
              {timetable?.className}
            </span>
          </div>
          <div className="flex py-2 px-3">
            <span className="w-32 text-sm font-medium text-gray-700">
              Phòng học
            </span>
            <span className="flex-1 text-sm text-gray-900">
              {typeof timetable?.room === "object"
                ? timetable?.room?.name
                : timetable?.room}
            </span>
          </div>
          <div className="flex py-2 px-3">
            <span className="w-32 text-sm font-medium text-gray-700">
              Giảng viên
            </span>
            <span className="flex-1 text-sm text-gray-900">
              {typeof timetable?.lecturer === "object"
                ? timetable?.lecturer?.name
                : timetable?.lecturer}
            </span>
          </div>
          <div className="flex py-2 px-3">
            <span className="w-32 text-sm font-medium text-gray-700">Ngày</span>
            <span className="flex-1 text-sm text-gray-900">
              {formatDateVN(timetable?.date)}
            </span>
          </div>
          <div className="flex py-2 px-3">
            <span className="w-32 text-sm font-medium text-gray-700">
              Ca học
            </span>
            <span className="flex-1 text-sm text-gray-900">
              {timetable?.period}
            </span>
          </div>
          <div className="flex py-2 px-3">
            <span className="w-32 text-sm font-medium text-gray-700">
              Thời gian
            </span>
            <span className="flex-1 text-sm text-gray-900">
              {timetable?.time}
            </span>
          </div>
          <div className="flex py-2 px-3">
            <span className="w-32 text-sm font-medium text-gray-700">
              Năm học
            </span>
            <span className="flex-1 text-sm text-gray-900">
              {timetable?.schoolYear}
            </span>
          </div>
          <div className="flex py-2 px-3">
            <span className="w-32 text-sm font-medium text-gray-700">
              Học kỳ
            </span>
            <span className="flex-1 text-sm text-gray-900">
              {timetable?.semester}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Thông tin nhật ký ca dạy</h3>
        <div className="border border-gray-200 rounded-md divide-y">
          <div className="flex py-2 px-3">
            <span className="w-32 text-sm font-medium text-gray-700">
              Ghi chú
            </span>
            <span className="flex-1 text-sm text-gray-900">
              {log?.note || (
                <span className="text-gray-400 italic">Không có ghi chú</span>
              )}
            </span>
          </div>
          <div className="flex py-2 px-3">
            <span className="w-32 text-sm font-medium text-gray-700">
              Trạng thái
            </span>
            <span className="flex-1 text-sm">
              <Badge
                variant={
                  log?.status === TeachingLogStatus.NORMAL
                    ? "success"
                    : "danger"
                }
              >
                {log?.status}
              </Badge>
            </span>
          </div>
          <div className="flex py-2 px-3">
            <span className="w-32 text-sm font-medium text-gray-700">
              Ngày tạo
            </span>
            <span className="flex-1 text-sm text-gray-900">
              {formatDateVN(log?.createdAt)}
            </span>
          </div>
          <div className="flex py-2 px-3">
            <span className="w-32 text-sm font-medium text-gray-700">
              Ngày cập nhật
            </span>
            <span className="flex-1 text-sm text-gray-900">
              {formatDateVN(log?.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="col-span-1 md:col-span-2">
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              🖼️ Ảnh minh họa
              {log?.images?.length > 0 && (
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  ({log.images.length} ảnh)
                </span>
              )}
            </h3>
          </div>
          {log?.images?.length > 0 ? (
            <ImagePreviewGroup images={log.images} />
          ) : (
            <div className="text-center py-10 text-gray-400 text-sm">
              <div className="text-5xl mb-3 opacity-30">🖼️</div>
              <div>Chưa có ảnh minh họa</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TeachingLogDetail;
