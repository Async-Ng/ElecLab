import React, { useMemo, useState, useEffect } from "react";
import { Button, Select, Modal, Row, Col, message } from "antd";
import ExportPreviewModal from "./ExportPreviewModal";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { formatDateVN } from "@/shared/utils/date";
import { useAuth } from "@/hooks/useAuth";
import { authFetch, getApiEndpoint } from "@/lib/apiClient";

interface ExportLogsButtonProps {
  logs: any[];
}

function mapLogsToExcelRows(logs: any[]) {
  return logs.map((log) => ({
    "Học kỳ": log.timetable?.semester || "",
    "Tuần": log.timetable?.week || "",
    "Năm học": log.timetable?.schoolYear || "",
    "Ngày": formatDateVN(log.timetable?.date) || "",
    "Ca học": log.timetable?.period || "",
    "Phòng học": log.timetable?.room?.name || log.timetable?.room || "",
    "Giảng viên":
      log.timetable?.lecturer?.name || log.timetable?.lecturer || "",
    "Trạng thái": log.status || "",
    "Ghi chú": log.note || "",
  }));
}

const ExportLogsButton: React.FC<ExportLogsButtonProps> = ({ logs }) => {
  const [semester, setSemester] = useState<string | undefined>();
  const [schoolYear, setSchoolYear] = useState<string | undefined>();
  const [room, setRoom] = useState<string | undefined>();
  const [lecturer, setLecturer] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  const isUserAdmin = isAdmin();

  const semesters = [
    { value: "1", label: "Học kỳ 1" },
    { value: "2", label: "Học kỳ 2" },
    { value: "3", label: "Học kỳ 3" },
  ];

  const schoolYears = useMemo(
    () =>
      Array.from(
        new Set(logs.map((l) => l.timetable?.schoolYear).filter(Boolean))
      ),
    [logs]
  );

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

  const [lecturers, setLecturers] = useState<
    { value: string; label: string }[]
  >([]);
  useEffect(() => {
    const lecturerMap = new Map<string, { id: string; name: string }>();

    logs.forEach((log) => {
      const timetable = log.timetable;
      if (timetable?.lecturer) {
        const lecturer = timetable.lecturer;
        if (typeof lecturer === "object" && lecturer.name) {
          const id = lecturer._id || lecturer.id;
          if (id && !lecturerMap.has(id)) {
            lecturerMap.set(id, { id, name: lecturer.name });
          }
        }
      }
    });

    setLecturers(
      Array.from(lecturerMap.values()).map((lecturer) => ({
        value: lecturer.id,
        label: lecturer.name,
      }))
    );
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const result = logs.filter((log) => {
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

    return result;
  }, [logs, semester, schoolYear, room, lecturer]);

  const handleExport = async () => {
    if (filteredLogs.length === 0) {
      Modal.warning({
        title: "Không có dữ liệu",
        content: "Vui lòng chọn lọc để hiển thị dữ liệu trước khi xuất.",
      });
      return;
    }

    try {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();

      const exportDate = dayjs().format("DD/MM/YYYY HH:mm:ss");
      const semesterLabel = semester
        ? semesters.find((s) => s.value === semester)?.label || ""
        : "Tất cả";
      const schoolYearLabel = schoolYear || "Tất cả";

      const statusCounts = filteredLogs.reduce((acc, log) => {
        const status = log.status || "Không rõ";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate by semester from filteredLogs to match the filtered data
      const countBySemester = {
        HK1: filteredLogs.filter((l) => String(l.timetable?.semester) === "1")
          .length,
        HK2: filteredLogs.filter((l) => String(l.timetable?.semester) === "2")
          .length,
        HK3: filteredLogs.filter((l) => String(l.timetable?.semester) === "3")
          .length,
      };

      // === STYLING ===
      const headerFill: any = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2C5F2D" },
      };
      const headerFont: any = {
        bold: true,
        size: 14,
        color: { argb: "FFFFFFFF" },
      };

      const titleFill: any = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1565C0" },
      };
      const titleFont: any = {
        bold: true,
        size: 16,
        color: { argb: "FFFFFFFF" },
      };

      const sectionFill: any = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0D47A1" },
      };
      const sectionFont: any = {
        bold: true,
        size: 12,
        color: { argb: "FFFFFFFF" },
      };

      const labelFill: any = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE3F2FD" },
      };
      const labelFont: any = { bold: true, size: 11 };

      const valueFill: any = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F5F5" },
      };
      const valueFont: any = { size: 11 };

      const highlightFill: any = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF57C00" },
      };
      const highlightFont: any = {
        bold: true,
        size: 11,
        color: { argb: "FFFFFFFF" },
      };

      const tableLabelFill: any = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1565C0" },
      };
      const tableLabelFont: any = {
        bold: true,
        size: 11,
        color: { argb: "FFFFFFFF" },
      };

      const centerAlignment: any = {
        horizontal: "center",
        vertical: "center",
        wrapText: false,
      };
      const leftAlignment: any = {
        horizontal: "left",
        vertical: "center",
        wrapText: false,
      };

      const calculateWidth = (text: string | number): number => {
        const str = String(text || "");
        // Optimized for 15.6" screen - with generous padding on both sides
        const baseWidth = Math.max(str.length * 1.1 + 4, 10);
        return Math.min(baseWidth, 35);
      };

      // === SHEET 1: METADATA & STATISTICS ===
      const metadataSheet = workbook.addWorksheet("Báo Cáo");

      // Set columns first before any merge operations
      metadataSheet.columns = [
        { width: 22 },
        { width: 35 },
        { width: 14 },
        { width: 14 },
        { width: 18 },
        { width: 24 },
        { width: 14 },
        { width: 24 },
      ];

      let currentRow = 1;

      // === 1. HEADER ===
      let row = metadataSheet.getRow(currentRow);
      row.values = ["TRƯỜNG CAO ĐẲNG GIAO THÔNG VẬN TẢI HỒ CHÍ MINH"];
      row.getCell(1).fill = headerFill;
      row.getCell(1).font = headerFont;
      row.getCell(1).alignment = centerAlignment;
      metadataSheet.mergeCells(`A${currentRow}:H${currentRow}`);
      row.height = 28;
      currentRow++;

      // === 2. TITLE ===
      row = metadataSheet.getRow(currentRow);
      row.values = ["BÁO CÁO NHẬT KÝ CA DẠY"];
      row.getCell(1).fill = titleFill;
      row.getCell(1).font = titleFont;
      row.getCell(1).alignment = centerAlignment;
      metadataSheet.mergeCells(`A${currentRow}:H${currentRow}`);
      row.height = 32;
      currentRow++;

      currentRow++;

      // === 3. THÔNG TIN BÁO CÁO ===
      row = metadataSheet.getRow(currentRow);
      row.values = ["THÔNG TIN BÁO CÁO"];
      row.getCell(1).fill = sectionFill;
      row.getCell(1).font = sectionFont;
      metadataSheet.mergeCells(`A${currentRow}:H${currentRow}`);
      currentRow++;

      // Ngày xuất & Người xuất
      row = metadataSheet.getRow(currentRow);
      row.getCell(1).value = "Ngày xuất:";
      row.getCell(2).value = exportDate;
      row.getCell(4).value = "Người xuất:";
      row.getCell(5).value = user?.name || "";
      row.getCell(1).fill = labelFill;
      row.getCell(1).font = labelFont;
      row.getCell(2).fill = valueFill;
      row.getCell(2).font = valueFont;
      row.getCell(4).fill = labelFill;
      row.getCell(4).font = labelFont;
      row.getCell(5).fill = valueFill;
      row.getCell(5).font = valueFont;
      row.getCell(1).alignment = leftAlignment;
      row.getCell(2).alignment = centerAlignment;
      row.getCell(4).alignment = leftAlignment;
      row.getCell(5).alignment = centerAlignment;
      currentRow++;

      // Vai trò
      row = metadataSheet.getRow(currentRow);
      row.getCell(1).value = "Vai trò:";
      row.getCell(2).value =
        user?.position || (isUserAdmin ? "Trưởng khoa" : "Giảng viên");
      row.getCell(1).fill = labelFill;
      row.getCell(1).font = labelFont;
      row.getCell(2).fill = valueFill;
      row.getCell(2).font = valueFont;
      row.getCell(1).alignment = leftAlignment;
      row.getCell(2).alignment = centerAlignment;
      currentRow++;

      // Năm học & Học kỳ
      row = metadataSheet.getRow(currentRow);
      row.getCell(1).value = "Năm học:";
      row.getCell(2).value = schoolYearLabel;
      row.getCell(4).value = "Học kỳ:";
      row.getCell(5).value = semesterLabel;
      row.getCell(1).fill = labelFill;
      row.getCell(1).font = labelFont;
      row.getCell(2).fill = valueFill;
      row.getCell(2).font = valueFont;
      row.getCell(4).fill = labelFill;
      row.getCell(4).font = labelFont;
      row.getCell(5).fill = valueFill;
      row.getCell(5).font = valueFont;
      row.getCell(1).alignment = leftAlignment;
      row.getCell(2).alignment = centerAlignment;
      row.getCell(4).alignment = leftAlignment;
      row.getCell(5).alignment = centerAlignment;
      currentRow++;

      currentRow++;

      // === 4. THỐNG KÊ TỔNG HỢP ===
      row = metadataSheet.getRow(currentRow);
      row.values = ["THỐNG KÊ TỔNG HỢP"];
      row.getCell(1).fill = sectionFill;
      row.getCell(1).font = sectionFont;
      metadataSheet.mergeCells(`A${currentRow}:H${currentRow}`);
      currentRow++;

      row = metadataSheet.getRow(currentRow);
      row.getCell(1).value = "Tổng số nhật ký:";
      row.getCell(2).value = filteredLogs.length;
      row.getCell(1).fill = labelFill;
      row.getCell(1).font = labelFont;
      row.getCell(2).fill = highlightFill;
      row.getCell(2).font = highlightFont;
      row.getCell(1).alignment = leftAlignment;
      row.getCell(2).alignment = centerAlignment;
      currentRow++;

      ["HK1", "HK2", "HK3"].forEach((hk, idx) => {
        row = metadataSheet.getRow(currentRow);
        row.getCell(1).value = `${hk}:`;
        row.getCell(2).value =
          countBySemester[hk as keyof typeof countBySemester];
        row.getCell(1).fill = labelFill;
        row.getCell(1).font = labelFont;
        row.getCell(2).fill = highlightFill;
        row.getCell(2).font = highlightFont;
        row.getCell(1).alignment = leftAlignment;
        row.getCell(2).alignment = centerAlignment;
        currentRow++;
      });

      currentRow++;

      // === 5. THỐNG KÊ THEO TRẠNG THÁI ===
      row = metadataSheet.getRow(currentRow);
      row.values = ["THỐNG KÊ THEO TRẠNG THÁI"];
      row.getCell(1).fill = sectionFill;
      row.getCell(1).font = sectionFont;
      metadataSheet.mergeCells(`A${currentRow}:H${currentRow}`);
      currentRow++;

      Object.entries(statusCounts).forEach(([status, count]) => {
        row = metadataSheet.getRow(currentRow);
        row.getCell(1).value = status;
        row.getCell(2).value = count as any;
        row.getCell(1).fill = labelFill;
        row.getCell(1).font = labelFont;
        row.getCell(2).fill = highlightFill;
        row.getCell(2).font = highlightFont;
        row.getCell(1).alignment = leftAlignment;
        row.getCell(2).alignment = centerAlignment;
        currentRow++;
      });

      // === SHEET 2: DATA TABLE ===
      const dataSheet = workbook.addWorksheet("Chi Tiết");

      // Set columns first - with more spacing and room for content
      dataSheet.columns = [
        { width: 13 }, // Học kỳ
        { width: 10 }, // Tuần (new)
        { width: 16 }, // Năm học
        { width: 16 }, // Ngày
        { width: 13 }, // Ca học
        { width: 28 }, // Phòng học (dynamic min 28)
        { width: 38 }, // Giảng viên (dynamic, large)
        { width: 14 }, // Trạng thái
        { width: 28 }, // Ghi chú (dynamic min 28)
      ];

      currentRow = 1;

      // Header
      row = dataSheet.getRow(currentRow);
      row.values = ["TRƯỜNG CAO ĐẲNG GIAO THÔNG VẬN TẢI HỒ CHÍ MINH"];
      row.getCell(1).fill = headerFill;
      row.getCell(1).font = headerFont;
      row.getCell(1).alignment = centerAlignment;
      dataSheet.mergeCells(`A${currentRow}:H${currentRow}`);
      row.height = 28;
      currentRow++;

      // Title
      row = dataSheet.getRow(currentRow);
      row.values = ["CHI TIẾT NHẬT KÝ CA DẠY"];
      row.getCell(1).fill = titleFill;
      row.getCell(1).font = titleFont;
      row.getCell(1).alignment = centerAlignment;
      dataSheet.mergeCells(`A${currentRow}:H${currentRow}`);
      row.height = 32;
      currentRow += 2;

      // === DATA TABLE ===
      const excelRows = mapLogsToExcelRows(filteredLogs);
      const dataHeaders = Object.keys(excelRows[0] || {});

      row = dataSheet.getRow(currentRow);
      dataHeaders.forEach((header, idx) => {
        const cell = row.getCell(idx + 1);
        cell.value = header;
        cell.fill = tableLabelFill;
        cell.font = tableLabelFont;
        cell.alignment = centerAlignment;
        cell.border = {
          top: { style: "medium" },
          bottom: { style: "medium" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });
      row.height = 24; // Add header row height
      currentRow++;

      excelRows.forEach((rowData: any, idx: number) => {
        row = dataSheet.getRow(currentRow);
        row.height = 18; // Add data row height for better spacing
        dataHeaders.forEach((header, colIdx) => {
          const cell = row.getCell(colIdx + 1);
          cell.value = rowData[header] || "";
          cell.fill =
            idx % 2 === 0
              ? {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFFFFFFF" },
                }
              : {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFF9F9F9" },
                };
          cell.alignment = centerAlignment;
          cell.border = {
            bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
          };
        });
        currentRow++;
      });

      // Calculate dynamic width for flexible columns (Phòng học, Giảng viên, Ghi chú)
      const dynamicColumnIndices = {
        "Phòng học": 4, // Column E (index 4)
        "Giảng viên": 5, // Column F (index 5)
        "Ghi chú": 7, // Column H (index 7)
      };

      const columnWidths: { [key: number]: number } = {};

      // Initialize with minimum widths for dynamic columns
      Object.values(dynamicColumnIndices).forEach((idx) => {
        columnWidths[idx] = 28; // Minimum width for dynamic columns
      });

      // Calculate max width for each dynamic column
      excelRows.forEach((rowData: any) => {
        dataHeaders.forEach((header, colIdx) => {
          if (
            dynamicColumnIndices[header as keyof typeof dynamicColumnIndices]
          ) {
            const content = rowData[header] || "";
            const width = calculateWidth(content);
            if (width > columnWidths[colIdx]) {
              columnWidths[colIdx] = width;
            }
          }
        });
      });

      // Update dynamic columns width with ensured minimum
      Object.entries(columnWidths).forEach(([idx, width]) => {
        const colNum = parseInt(idx);
        if (dataSheet.columns[colNum]) {
          dataSheet.columns[colNum].width = Math.max(width, 28); // Ensure minimum 28
        }
      });

      // === EXPORT ===
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `teaching-logs-${dayjs().format("DD-MM-YYYY")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      message.success("Đã xuất báo cáo thành công");
      setModalOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      message.error("Không thể xuất file báo cáo");
    }
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
          {isUserAdmin && (
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
          )}
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
