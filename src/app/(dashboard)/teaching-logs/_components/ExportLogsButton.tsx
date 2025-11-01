import React, { useMemo, useState, useEffect } from "react";
import { Button, Select, Modal, Row, Col } from "antd";
import ExportPreviewModal from "./ExportPreviewModal";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { formatDateVN } from "@/shared/utils/date";
import { useAuth } from "@/hooks/useAuth";
import { authFetch, getApiEndpoint } from "@/lib/apiClient";

interface ExportLogsButtonProps {
  logs: any[];
}

function mapLogsToExcelRows(logs: any[]) {
  return logs.map((log) => ({
    "Học kỳ": log.timetable?.semester || "",
    "Năm học": log.timetable?.schoolYear || "",
    Ngày: formatDateVN(log.timetable?.date) || "",
    "Ca học": log.timetable?.period || "",
    "Phòng học": log.timetable?.room?.name || log.timetable?.room || "",
    "Giảng viên":
      log.timetable?.lecturer?.name || log.timetable?.lecturer || "",
    "Ghi chú": log.note || "",
    "Trạng thái": log.status || "",
    Ảnh: Array.isArray(log.images)
      ? log.images
          .map((img: string) => `data:image/jpeg;base64,${img}`)
          .join(", ")
      : log.images || "",
  }));
}

const ExportLogsButton: React.FC<ExportLogsButtonProps> = ({ logs }) => {
  // All filter state and options logic moved to below (see previous patch)

  const [semester, setSemester] = useState<string | undefined>();
  const [schoolYear, setSchoolYear] = useState<string | undefined>();
  const [room, setRoom] = useState<string | undefined>();
  const [lecturer, setLecturer] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { user } = useAuth();

  // Fixed semester options
  const semesters = [
    { value: "1", label: "Học kỳ 1" },
    { value: "2", label: "Học kỳ 2" },
    { value: "3", label: "Học kỳ 3" },
  ];

  // School years from logs
  const schoolYears = useMemo(
    () =>
      Array.from(
        new Set(logs.map((l) => l.timetable?.schoolYear).filter(Boolean))
      ),
    [logs]
  );

  // Fetch rooms from API
  const [rooms, setRooms] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    if (!user) return;

    const fetchRooms = async () => {
      try {
        const endpoint = getApiEndpoint("rooms", user.roles);
        const res = await authFetch(endpoint, user._id!, user.roles);
        const data = await res.json();
        const roomList = Array.isArray(data.rooms) ? data.rooms : [];
        setRooms(roomList.map((r: any) => ({ value: r._id, label: r.name })));
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setRooms([]);
      }
    };
    fetchRooms();
  }, [user]);

  // Extract lecturers from logs data instead of API call
  const [lecturers, setLecturers] = useState<
    { value: string; label: string }[]
  >([]);
  useEffect(() => {
    // Extract unique lecturers from logs data
    const lecturerList = Array.from(
      new Map(
        logs
          .map((log) => {
            const timetable = log.timetable;
            if (timetable?.lecturer) {
              const lecturer = timetable.lecturer;
              if (typeof lecturer === "object" && lecturer.name) {
                return [
                  lecturer._id || lecturer.id,
                  {
                    id: lecturer._id || lecturer.id,
                    name: lecturer.name,
                  },
                ];
              }
            }
            return null;
          })
          .filter(Boolean)
      ).values()
    );

    setLecturers(
      lecturerList.map((lecturer: any) => ({
        value: lecturer.id,
        label: lecturer.name,
      }))
    );
  }, [logs]);

  // Filter logs using same logic as TeachingLogsTable
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const t = log.timetable || {};
      if (semester && t.semester !== semester) return false;
      if (schoolYear && t.schoolYear !== schoolYear) return false;
      if (room) {
        const r = t.room;
        if (typeof r === "object" && r?._id !== room) return false;
        if (typeof r === "string" && r !== room) return false;
      }
      if (lecturer) {
        const lec = t.lecturer;
        if (typeof lec === "object" && lec?._id !== lecturer) return false;
        if (typeof lec === "string" && lec !== lecturer) return false;
      }
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
        footer={[
          <Button key="preview" onClick={() => setPreviewOpen(true)}>
            Xem trước dữ liệu sẽ xuất
          </Button>,
          <Button
            key="export"
            type="primary"
            onClick={handleExport}
            disabled={!filteredLogs.length}
          >
            Xuất file Excel
          </Button>,
          <Button key="cancel" onClick={() => setModalOpen(false)}>
            Hủy
          </Button>,
        ]}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
          <Col span={12}>
            <Select
              allowClear
              placeholder="Học kỳ"
              style={{ width: "100%" }}
              value={semester}
              onChange={setSemester}
              options={semesters}
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
              options={rooms}
            />
          </Col>
          <Col span={12}>
            <Select
              allowClear
              placeholder="Giảng viên"
              style={{ width: "100%" }}
              value={lecturer}
              onChange={setLecturer}
              options={lecturers}
            />
          </Col>
        </Row>
        <div style={{ color: "#888", fontSize: 13 }}>
          Chọn các trường để lọc dữ liệu trước khi xuất file Excel. Nếu không
          chọn sẽ xuất toàn bộ.
        </div>
      </Modal>

      <ExportPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        logs={filteredLogs}
      />
    </>
  );
};

export default ExportLogsButton;
