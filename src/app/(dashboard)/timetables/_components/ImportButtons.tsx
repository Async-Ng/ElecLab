"use client";
import React, { useState, useRef, useEffect } from "react";
import { message } from "antd";
import ImportPreviewModal from "./ImportPreviewModal";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import { Room } from "@/types/room";
import { User } from "@/types/user";
import { useAuth } from "@/hooks/useAuth";
import ActionButtons from "@/components/common/ActionButtons";
import { cachedFetch } from "@/lib/requestCache";

export default function ImportButtons() {
  const { isAdmin, user } = useAuth();
  const isUserAdmin = isAdmin();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Tối ưu: Gộp 2 fetch calls thành Promise.all + sử dụng cachedFetch để lấy phòng và giảng viên
    Promise.all([
      cachedFetch("/api/rooms?userRole=Admin"),
      cachedFetch("/api/users"),
    ])
      .then(([roomsData, usersData]) => {
        // Xử lý rooms
        setRooms(
          (roomsData.rooms || []).map((r: any) => ({
            _id: r._id,
            room_id: r.room_id,
            name: r.name || "",
            location: r.location || "",
            users_manage: r.users_manage || [],
          }))
        );

        // Xử lý users
        setUsers(
          (usersData || []).map((u: any) => ({
            _id: u._id,
            staff_id: u.staff_id,
            name: u.name || "",
            email: u.email,
            password: "",
            roles: u.roles || [],
            rooms_manage: u.rooms_manage || [],
          }))
        );
      })
      .catch((error) => {
        console.error("Error fetching rooms and users:", error);
        setRooms([]);
        setUsers([]);
      });
  }, []);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<Timetable[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const XLSX = await import("xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      // Map dữ liệu từ file sang type Timetable
      const preview: Timetable[] = rows
        .map((r, idx) => {
          // Parse date to DD/MM/YYYY if possible
          let rawDate = r["Ngày"];
          let formattedDate = String(rawDate).trim();
          // Excel serial date detection and conversion
          if (typeof rawDate === "number" && !isNaN(rawDate)) {
            // Excel epoch: 1899-12-30
            // Sử dụng UTC để tránh vấn đề timezone
            const excelEpoch = Date.UTC(1899, 11, 30);
            const dateInMs = excelEpoch + rawDate * 24 * 60 * 60 * 1000;
            const dateObj = new Date(dateInMs);
            const d = dateObj.getUTCDate().toString().padStart(2, "0");
            const m = (dateObj.getUTCMonth() + 1).toString().padStart(2, "0");
            const y = dateObj.getUTCFullYear();
            formattedDate = `${d}/${m}/${y}`;
          } else if (/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
            // Convert YYYY-MM-DD to DD/MM/YYYY
            const [y, m, d] = formattedDate.split("-");
            formattedDate = `${d}/${m}/${y}`;
          } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(formattedDate)) {
            // Already DD/MM/YYYY
            formattedDate = formattedDate;
          } else if (/^\d{2}-\d{2}-\d{4}$/.test(formattedDate)) {
            // Convert DD-MM-YYYY to DD/MM/YYYY
            formattedDate = formattedDate.replace(/-/g, "/");
          }

          // Map giờ học từ Ca (để đảm bảo khớp với enum StudyTime)
          let timeValue = String(r["Giờ học"] || "").trim();
          const periodValue = Number(r["Ca"]);

          // Nếu giờ học trống hoặc không hợp lệ, tự động map từ Ca
          const timeMapping: { [key: number]: StudyTime } = {
            1: StudyTime.Period1, // 07:00-09:15
            2: StudyTime.Period2, // 09:30-11:45
            3: StudyTime.Period3, // 12:30-14:45
            4: StudyTime.Period4, // 15:00-17:15
          };

          // Sử dụng mapping từ Ca nếu có
          if (periodValue && timeMapping[periodValue]) {
            timeValue = timeMapping[periodValue];
          } else if (
            !Object.values(StudyTime).includes(timeValue as StudyTime)
          ) {
            // Nếu giá trị không hợp lệ, dùng Period1 làm mặc định
            timeValue = StudyTime.Period1;
          }

          return {
            schoolYear: String(r["Năm học"] || "").trim(),
            semester: Number(r["Học kỳ"] || Semester.First),
            date: formattedDate,
            period: Number(r["Ca"] || Period.Period1),
            time: timeValue as StudyTime,
            subject: String(r["Môn học"] || "").trim(),
            room: String(r["Phòng học"] || "").trim(),
            className: String(r["Lớp"] || "").trim(),
            // Nếu không phải Admin và file không có cột Giảng viên, tự động gán user hiện tại
            lecturer: isUserAdmin
              ? String(r["Giảng viên"] || "").trim()
              : user?.email || "",
          };
        })
        .filter((row) => {
          // Bỏ qua các dòng trống (tất cả các trường đều trống)
          return (
            row.schoolYear ||
            row.date ||
            row.subject ||
            row.room ||
            row.className ||
            (isUserAdmin && row.lecturer)
          );
        });
      setPreviewRows(preview);
      setPreviewOpen(true);
    } catch (err) {
      message.error("Import thất bại");
    }
  }

  async function handleDownloadTemplate() {
    try {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Template");

      // Định nghĩa headers
      const headers = isUserAdmin
        ? [
            "Năm học",
            "Học kỳ",
            "Ngày",
            "Ca",
            "Giờ học",
            "Môn học",
            "Phòng học",
            "Lớp",
            "Giảng viên",
          ]
        : [
            "Năm học",
            "Học kỳ",
            "Ngày",
            "Ca",
            "Giờ học",
            "Môn học",
            "Phòng học",
            "Lớp",
          ];

      worksheet.addRow(headers);

      // Không thêm dòng mẫu nữa - người dùng bắt đầu nhập từ dòng 2

      // Định nghĩa các giá trị cho dropdown
      const roomValues = rooms.map((r) => r.room_id);

      // Thêm data validation và formula cho 100 dòng (bắt đầu từ dòng 2)
      for (let row = 2; row <= 101; row++) {
        // Cột B: Học kỳ (dropdown 1, 2, 3)
        worksheet.getCell(`B${row}`).dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: ['"1,2,3"'],
          showErrorMessage: true,
          errorTitle: "Giá trị không hợp lệ",
          error: "Vui lòng chọn 1, 2 hoặc 3",
        };

        // Cột D: Ca (dropdown 1, 2, 3, 4)
        worksheet.getCell(`D${row}`).dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: ['"1,2,3,4"'],
          showErrorMessage: true,
          errorTitle: "Giá trị không hợp lệ",
          error: "Vui lòng chọn 1, 2, 3 hoặc 4",
        };

        // Cột E: Giờ học - TỰ ĐỘNG từ Ca học (áp dụng cho tất cả các dòng từ row 2)
        worksheet.getCell(`E${row}`).value = {
          formula: `IF(D${row}=1,"07:00-09:15",IF(D${row}=2,"09:30-11:45",IF(D${row}=3,"12:30-14:45",IF(D${row}=4,"15:00-17:15",""))))`,
        };

        // Cột G: Phòng học (dropdown nếu có danh sách phòng)
        if (roomValues.length > 0) {
          // Excel có giới hạn 255 ký tự cho formula, nếu quá nhiều phòng thì bỏ qua
          const roomFormula = roomValues.join(",");
          if (roomFormula.length < 255) {
            worksheet.getCell(`G${row}`).dataValidation = {
              type: "list",
              allowBlank: false,
              formulae: [`"${roomFormula}"`],
              showErrorMessage: true,
              errorTitle: "Giá trị không hợp lệ",
              error: "Vui lòng chọn mã phòng từ danh sách",
            };
          }
        }
      }

      // Định dạng header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      // Định dạng cột Giờ học để người dùng biết nó tự động
      const timeColumnIndex = 5; // Cột E
      worksheet.getColumn(timeColumnIndex).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF0F8FF" }, // Màu xanh nhạt
      };

      // Auto width cho các cột
      worksheet.columns = headers.map((header, index) => ({
        key: header,
        width:
          index === 2
            ? 12
            : index === 4 || index === 5 || index === 6
            ? 16
            : 12,
      }));

      // Tạo sheet hướng dẫn
      const instructionSheet = workbook.addWorksheet("Hướng dẫn");
      const instructions = [
        ["HƯỚNG DẪN SỬ DỤNG TEMPLATE"],
        [""],
        ["1. Năm học: Nhập theo định dạng YYYY-YYYY (ví dụ: 2024-2025)"],
        ["2. Học kỳ: Chọn từ dropdown (1, 2, hoặc 3)"],
        ["3. Ngày: Nhập theo định dạng DD/MM/YYYY (ví dụ: 05/08/2024)"],
        ["4. Ca: Chọn từ dropdown (1, 2, 3, hoặc 4)"],
        ["5. Giờ học: TỰ ĐỘNG cập nhật khi chọn Ca (KHÔNG CẦN NHẬP)"],
        ["   - Ca 1 → 07:00-09:15"],
        ["   - Ca 2 → 09:30-11:45"],
        ["   - Ca 3 → 12:30-14:45"],
        ["   - Ca 4 → 15:00-17:15"],
        ["6. Môn học: Nhập tên môn học"],
        ["7. Phòng học: Chọn từ dropdown mã phòng (nếu có danh sách)"],
        ["8. Lớp: Nhập tên lớp"],
      ];

      if (isUserAdmin) {
        instructions.push([
          "9. Giảng viên: Nhập EMAIL của giảng viên (ví dụ: abc@hcmct.edu.vn)",
        ]);
      }

      instructions.push(
        [""],
        ["LƯU Ý QUAN TRỌNG:"],
        [
          "- Cột 'Giờ học' có nền màu XANH NHẠT - nghĩa là TỰ ĐỘNG, không cần nhập",
        ],
        ["- Khi bạn chọn Ca, Giờ học sẽ tự động điền tương ứng"],
        ["- Các ô có dropdown sẽ hiển thị mũi tên xuống khi click vào"],
        ["- Không được để trống các trường bắt buộc"],
        ["- Ngày phải đúng định dạng DD/MM/YYYY"]
      );

      instructionSheet.addRows(instructions);
      instructionSheet.getRow(1).font = { bold: true, size: 14 };
      instructionSheet.getColumn(1).width = 80;

      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "timetable-template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      message.success("Đã tải template thành công");
    } catch (err) {
      console.error("Error creating template:", err);
      message.error("Không thể tạo file mẫu");
    }
  }

  async function handleImport(rows: Timetable[]) {
    // Mapping phòng và giảng viên sang _id
    const mappedRows = rows.map((row) => {
      let roomId: string | Room = row.room;
      let lecturerId: string | User = row.lecturer;
      if (typeof roomId === "string") {
        const roomCode = roomId.trim();
        const foundRoom = rooms.find(
          (r) => typeof r.room_id === "string" && r.room_id.trim() === roomCode
        );
        if (foundRoom && foundRoom._id) roomId = foundRoom._id;
      }
      if (typeof lecturerId === "string") {
        const lecturerEmail = lecturerId.trim();
        const foundUser = users.find(
          (u) => typeof u.email === "string" && u.email.trim() === lecturerEmail
        );
        if (foundUser && foundUser._id) lecturerId = foundUser._id;
      }
      return { ...row, room: roomId, lecturer: lecturerId };
    });
    try {
      const res = await fetch("/api/timetables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mappedRows),
      });
      if (res.ok) {
        message.success("Đã import thời khóa biểu");
      } else {
        const errorData = await res.json();

        message.error(`Import thất bại: ${errorData.error || "Unknown error"}`);
      }
    } catch (err) {
      message.error("Import thất bại");
    }
  }

  return (
    <>
      <ImportPreviewModal
        visible={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={previewRows}
        onImport={(rows) => {
          handleImport(rows);
          setPreviewOpen(false);
        }}
        rooms={rooms.map((r) => ({
          room_id: r.room_id,
          _id: r._id || "",
          name: r.name || "",
        }))}
        users={users.map((u) => ({
          email: u.email,
          _id: u._id || "",
          name: u.name || "",
        }))}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <ActionButtons
        onImport={() => fileInputRef.current?.click()}
        onDownloadTemplate={handleDownloadTemplate}
        importText="Import thời khóa biểu"
        templateText="Tải template mẫu"
      />
    </>
  );
}
