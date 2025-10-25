import React from "react";
import { Modal, Table } from "antd";

interface ExportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  logs: any[];
}

const columns = [
  { title: "Học kỳ", dataIndex: ["timetable", "semester"], key: "semester" },
  {
    title: "Năm học",
    dataIndex: ["timetable", "schoolYear"],
    key: "schoolYear",
  },
  { title: "Ngày", dataIndex: ["timetable", "date"], key: "date" },
  { title: "Ca học", dataIndex: ["timetable", "period"], key: "period" },
  {
    title: "Phòng học",
    dataIndex: ["timetable", "room"],
    key: "room",
    render: (room: any) => room?.name || room,
  },
  {
    title: "Giảng viên",
    dataIndex: ["timetable", "lecturer"],
    key: "lecturer",
    render: (lec: any) => lec?.name || lec,
  },
  { title: "Ghi chú", dataIndex: "note", key: "note" },
  { title: "Trạng thái", dataIndex: "status", key: "status" },
];

const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  open,
  onClose,
  logs,
}) => {
  return (
    <Modal
      title="Xem trước dữ liệu sẽ xuất"
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <Table
        columns={columns}
        dataSource={logs}
        rowKey={(record) => record._id}
        pagination={{ pageSize: 10 }}
        size="small"
        scroll={{ x: true }}
      />
    </Modal>
  );
};

export default ExportPreviewModal;
