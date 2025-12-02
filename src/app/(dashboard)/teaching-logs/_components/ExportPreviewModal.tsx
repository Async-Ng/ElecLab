import React from "react";
import Modal from "@/components/ui/Modal";
import { DataTable } from "@/components/common";
import dayjs from "dayjs";

interface ExportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  logs: any[];
}

const columns = [
  {
    title: "Năm học",
    dataIndex: ["timetable", "schoolYear"],
    key: "schoolYear",
  },
  { title: "Học kỳ", dataIndex: ["timetable", "semester"], key: "semester" },
  { title: "Tuần", dataIndex: ["timetable", "week"], key: "week" },
  {
    title: "Ngày",
    dataIndex: ["timetable", "date"],
    key: "date",
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
  { title: "Ca học", dataIndex: ["timetable", "period"], key: "period" },
  {
    title: "Phòng học",
    dataIndex: ["timetable", "room"],
    key: "room",
    render: (room: any) => room?.name || room,
  },
  {
    title: "Môn học",
    dataIndex: ["timetable", "subject"],
    key: "subject",
    render: (subject: any) => subject?.name || subject || "",
  },
  {
    title: "Giảng viên",
    dataIndex: ["timetable", "lecturer"],
    key: "lecturer",
    render: (lec: any) => lec?.name || lec,
  },
  { title: "Trạng thái", dataIndex: "status", key: "status" },
  { title: "Ghi chú", dataIndex: "note", key: "note" },
];

const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  open,
  onClose,
  logs,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Xem trước dữ liệu sẽ xuất"
      size="xl"
    >
      <DataTable
        data={logs}
        columns={columns}
        loading={false}
        showActions={false}
      />
    </Modal>
  );
};

export default ExportPreviewModal;
