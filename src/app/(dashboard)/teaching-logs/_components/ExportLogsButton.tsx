import React, { useMemo, useState } from "react";
import { Button, Select, Modal, Row, Col } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

interface ExportLogsButtonProps {
  logs: any[];
}

function mapLogsToExcelRows(logs: any[]) {
  return logs.map((log) => ({
    Ngày: log.timetable?.date || "",
    "Ca học": log.timetable?.period || "",
    "Phòng học": log.timetable?.room?.name || log.timetable?.room || "",
    "Học kỳ": log.timetable?.semester || "",
    "Năm học": log.timetable?.schoolYear || "",
    "Giảng viên": log.timetable?.staff?.name || log.timetable?.staff || "",
    "Ghi chú": log.note || "",
    "Trạng thái": log.status || "",
    Ảnh: Array.isArray(log.imageUrl)
      ? log.imageUrl.join(", ")
      : log.imageUrl || "",
  }));
}

const ExportLogsButton: React.FC<ExportLogsButtonProps> = ({ logs }) => {
  const semesters = useMemo(
    () =>
      Array.from(
        new Set(logs.map((l) => l.timetable?.semester).filter(Boolean))
      ),
    [logs]
  );
  const schoolYears = useMemo(
    () =>
      Array.from(
        new Set(logs.map((l) => l.timetable?.schoolYear).filter(Boolean))
      ),
    [logs]
  );
  const rooms = useMemo(
    () =>
      Array.from(
        new Set(
          logs
            .map((l) => l.timetable?.room?.name || l.timetable?.room)
            .filter(Boolean)
        )
      ),
    [logs]
  );
  const lecturers = useMemo(
    () =>
      Array.from(
        new Set(
          logs
            .map((l) => l.timetable?.staff?.name || l.timetable?.staff)
            .filter(Boolean)
        )
      ),
    [logs]
  );

  const [semester, setSemester] = useState<string | undefined>();
  const [schoolYear, setSchoolYear] = useState<string | undefined>();
  const [room, setRoom] = useState<string | undefined>();
  const [lecturer, setLecturer] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const t = log.timetable || {};
      if (semester && t.semester !== semester) return false;
      if (schoolYear && t.schoolYear !== schoolYear) return false;
      if (room && (t.room?.name || t.room) !== room) return false;
      if (lecturer && (t.staff?.name || t.staff) !== lecturer) return false;
      return true;
    });
  }, [logs, semester, schoolYear, room, lecturer]);

  const handleExport = () => {
    const excelRows = mapLogsToExcelRows(filteredLogs);
    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
    XLSX.writeFile(workbook, "teaching-logs.xlsx");
    setModalOpen(false);
  };

  return (
    <>
      <Button
        icon={<DownloadOutlined />}
        onClick={() => setModalOpen(true)}
        disabled={!logs.length}
        type="default"
        style={{ marginBottom: 16 }}
      >
        Export nhật ký ca dạy
      </Button>
      <Modal
        title="Lọc dữ liệu trước khi xuất"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleExport}
        okText="Xuất file Excel"
        cancelText="Hủy"
        width={600}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
          <Col span={12}>
            <Select
              allowClear
              placeholder="Học kỳ"
              style={{ width: "100%" }}
              value={semester}
              onChange={setSemester}
              options={semesters.map((s) => ({ value: s, label: s }))}
            />
          </Col>
          <Col span={12}>
            <Select
              allowClear
              placeholder="Năm học"
              style={{ width: "100%" }}
              value={schoolYear}
              onChange={setSchoolYear}
              options={schoolYears.map((sy) => ({ value: sy, label: sy }))}
            />
          </Col>
          <Col span={12}>
            <Select
              allowClear
              placeholder="Phòng học"
              style={{ width: "100%" }}
              value={room}
              onChange={setRoom}
              options={rooms.map((r) => ({ value: r, label: r }))}
            />
          </Col>
          <Col span={12}>
            <Select
              allowClear
              placeholder="Giảng viên"
              style={{ width: "100%" }}
              value={lecturer}
              onChange={setLecturer}
              options={lecturers.map((l) => ({ value: l, label: l }))}
            />
          </Col>
        </Row>
        <div style={{ color: "#888", fontSize: 13 }}>
          Chọn các trường để lọc dữ liệu trước khi xuất file Excel. Nếu không
          chọn sẽ xuất toàn bộ.
        </div>
      </Modal>
    </>
  );
};

export default ExportLogsButton;
