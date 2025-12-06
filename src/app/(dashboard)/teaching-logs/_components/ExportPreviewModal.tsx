import React, { useMemo } from "react";
import { Table, Button } from "antd";
import {
  FileExcelOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import BaseModal from "@/components/common/BaseModal";
import Card from "@/components/ui/Card";
import dayjs from "dayjs";

interface ExportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  logs: any[];
  onConfirmExport?: () => void;
}

const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  open,
  onClose,
  logs,
  onConfirmExport,
}) => {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalCount = logs.length;
    const completedCount = logs.filter(
      (log) => log.status === "Hoàn thành" || log.status === "Completed"
    ).length;
    const incidentCount = logs.filter(
      (log) => log.status === "Có sự cố" || log.status === "Incident"
    ).length;

    return {
      totalCount,
      completedCount,
      incidentCount,
    };
  }, [logs]);

  const columns = [
    {
      title: "Năm học",
      dataIndex: ["timetable", "schoolYear"],
      key: "schoolYear",
      width: 100,
    },
    {
      title: "Học kỳ",
      dataIndex: ["timetable", "semester"],
      key: "semester",
      width: 80,
    },
    {
      title: "Tuần",
      dataIndex: ["timetable", "week"],
      key: "week",
      width: 70,
    },
    {
      title: "Ngày",
      dataIndex: ["timetable", "date"],
      key: "date",
      width: 110,
      render: (value: string) => {
        // Format DD/MM/YYYY
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          const [y, m, d] = value.split("-");
          return `${d}/${m}/${y}`;
        }
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
          return value;
        }
        if (dayjs(value).isValid()) {
          return dayjs(value).format("DD/MM/YYYY");
        }
        return value;
      },
    },
    {
      title: "Ca học",
      dataIndex: ["timetable", "period"],
      key: "period",
      width: 80,
    },
    {
      title: "Phòng học",
      dataIndex: ["timetable", "room"],
      key: "room",
      width: 120,
      render: (room: any) => room?.name || room,
    },
    {
      title: "Môn học",
      dataIndex: ["timetable", "subject"],
      key: "subject",
      width: 150,
      render: (subject: any) => subject?.name || subject || "",
    },
    {
      title: "Giảng viên",
      dataIndex: ["timetable", "lecturer"],
      key: "lecturer",
      width: 150,
      render: (lec: any) => lec?.name || lec,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const isCompleted = status === "Hoàn thành" || status === "Completed";
        return (
          <span
            className={
              isCompleted
                ? "text-green-600 font-medium"
                : "text-red-600 font-medium"
            }
          >
            {status}
          </span>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      width: 200,
      ellipsis: true,
    },
  ];

  return (
    <BaseModal
      open={open}
      onCancel={onClose}
      title="Xem trước file Export"
      size="full"
      showFooter={false}
    >
      {/* Stats Dashboard */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng số bản ghi</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalCount}
              </p>
            </div>
            <InfoCircleOutlined className="text-4xl text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.completedCount}
              </p>
            </div>
            <CheckCircleOutlined className="text-4xl text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Có sự cố</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.incidentCount}
              </p>
            </div>
            <CloseCircleOutlined className="text-4xl text-red-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Data Table with Sticky Header */}
      <Table
        dataSource={logs}
        columns={columns}
        rowKey={(record) => record._id || Math.random()}
        scroll={{ x: "max-content", y: 500 }}
        pagination={{ pageSize: 10 }}
        sticky
      />

      {/* Action Footer */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
        <Button onClick={onClose} size="large">
          Đóng
        </Button>
        {onConfirmExport && (
          <Button
            type="primary"
            size="large"
            icon={<FileExcelOutlined />}
            onClick={onConfirmExport}
          >
            Xuất file Excel
          </Button>
        )}
      </div>
    </BaseModal>
  );
};

export default ExportPreviewModal;
