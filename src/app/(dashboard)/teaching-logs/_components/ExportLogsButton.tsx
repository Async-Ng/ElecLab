import React, { useMemo, useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ExportPreviewModal from "./ExportPreviewModal";
import * as XLSX from "xlsx";
import { useAuth } from "@/hooks/useAuth";
import { getApiEndpoint, authFetch } from "@/lib/apiClient";

interface ExportLogsButtonProps {
  logs: any[];
}

function mapLogsToExcelRows(logs: any[]) {
  return logs.map((log) => ({
    "Học kỳ": log.timetable?.semester || "",
    "Năm học": log.timetable?.schoolYear || "",
    Ngày: log.timetable?.date || "",
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
  const { user } = useAuth();
  // All filter state and options logic moved to below (see previous patch)

  const [semester, setSemester] = useState<string | undefined>();
  const [schoolYear, setSchoolYear] = useState<string | undefined>();
  const [room, setRoom] = useState<string | undefined>();
  const [lecturer, setLecturer] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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
    if (!user?._id || !user?.roles || user.roles.length === 0) return;

    const fetchRooms = async () => {
      try {
        const roomsEndpoint = getApiEndpoint("rooms", user.roles);
        const res = await authFetch(roomsEndpoint, user._id, user.roles);
        const data = await res.json();
        const roomList = Array.isArray(data.rooms) ? data.rooms : [];
        setRooms(roomList.map((r: any) => ({ value: r._id, label: r.name })));
      } catch {
        setRooms([]);
      }
    };
    fetchRooms();
  }, [user]);

  // Fetch lecturers from API
  const [lecturers, setLecturers] = useState<
    { value: string; label: string }[]
  >([]);
  useEffect(() => {
    if (!user?._id || !user?.roles || user.roles.length === 0) return;

    const fetchLecturers = async () => {
      try {
        const usersEndpoint = getApiEndpoint("users", user.roles);
        const res = await authFetch(usersEndpoint, user._id, user.roles);
        const data = await res.json();
        setLecturers(
          Array.isArray(data)
            ? data.map((u: any) => ({ value: u._id, label: u.name }))
            : []
        );
      } catch {
        setLecturers([]);
      }
    };
    fetchLecturers();
  }, [user]);

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
        variant="outline"
        onClick={() => setModalOpen(true)}
        disabled={!logs.length}
      >
        📄 Export nhật ký ca dạy
      </Button>
      {modalOpen && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Lọc dữ liệu trước khi xuất"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={semester}
                onChange={setSemester}
                options={[{ value: "", label: "Học kỳ" }, ...semesters]}
                placeholder="Học kỳ"
              />
              <Select
                value={schoolYear}
                onChange={setSchoolYear}
                options={[
                  { value: "", label: "Năm học" },
                  ...schoolYears.map((sy) => ({ value: sy, label: sy })),
                ]}
                placeholder="Năm học"
              />
              <Select
                value={room}
                onChange={setRoom}
                options={[{ value: "", label: "Phòng học" }, ...rooms]}
                placeholder="Phòng học"
              />
              <Select
                value={lecturer}
                onChange={setLecturer}
                options={[{ value: "", label: "Giảng viên" }, ...lecturers]}
                placeholder="Giảng viên"
              />
            </div>
            <div className="text-sm text-gray-600">
              Chọn các trường để lọc dữ liệu trước khi xuất file Excel. Nếu
              không chọn sẽ xuất toàn bộ.
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Hủy
              </Button>
              <Button variant="secondary" onClick={() => setPreviewOpen(true)}>
                Xem trước dữ liệu sẽ xuất
              </Button>
              <Button
                variant="primary"
                onClick={handleExport}
                disabled={!filteredLogs.length}
              >
                Xuất file Excel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <ExportPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        logs={filteredLogs}
      />
    </>
  );
};

export default ExportLogsButton;
