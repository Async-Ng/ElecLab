"use client";
import React, { useState, useRef, useEffect } from "react";
import ImportPreviewModal from "@/app/(dashboard)/timetables/_components/ImportPreviewModal";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import { Room } from "@/types/room";
import { User, UserRole } from "@/types/user";
import { useAuth } from "@/hooks/useAuth";
import ActionButtons from "@/components/common/ActionButtons";
import { authFetch, getApiEndpoint } from "@/lib/apiClient";
import { useTimetablesStore } from "@/stores/useTimetablesStore";
import { useTeachingLogsStore } from "@/stores/useTeachingLogsStore";

// Toast notification helper
const showMessage = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg),
  warning: (msg: string) => alert(msg),
};

interface ImportButtonsProps {
  /** Override admin check for flexibility */
  isAdminMode?: boolean;
}

export default function ImportButtons({ isAdminMode }: ImportButtonsProps) {
  const { isAdmin, user } = useAuth();
  const isUserAdmin = isAdminMode !== undefined ? isAdminMode : isAdmin();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { fetchTimetables } = useTimetablesStore();
  const { fetchTeachingLogs } = useTeachingLogsStore();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const roomsEndpoint = getApiEndpoint("rooms", user.roles);

        // Chỉ admin mới cần fetch danh sách users
        // User thường không có quyền truy cập /api/user/users
        const shouldFetchUsers = isUserAdmin;

        const roomsRes = await authFetch(roomsEndpoint, user._id!, user.roles);
        const roomsData = await roomsRes.json();

        let usersData: any[] = [];
        if (shouldFetchUsers) {
          const usersEndpoint = getApiEndpoint("users", user.roles);
          const usersRes = await authFetch(
            usersEndpoint,
            user._id!,
            user.roles
          );
          usersData = await usersRes.json();
        }

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

        // Xử lý users (chỉ admin mới có danh sách đầy đủ)
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
      } catch (error) {
        setRooms([]);
        setUsers([]);
      }
    };

    fetchData();
  }, [user, isUserAdmin]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<Timetable[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    console.log("📁 File selected:", file?.name);
    if (!file) return;
    try {
      console.log("📊 Starting to read Excel file...");
      const XLSX = await import("xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      console.log("📋 Rows parsed:", rows.length);

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

          // Xử lý giảng viên: convert từ "Tên (Mã nhân viên)" sang email
          let lecturerValue = "";
          if (isUserAdmin) {
            const lecturerDisplay = String(r["Giảng viên"] || "").trim();
            if (lecturerDisplay) {
              // Tìm giảng viên theo display name "Tên (Mã nhân viên)"
              const foundLecturer = users.find(
                (u) =>
                  u.roles &&
                  u.roles.includes(UserRole.User) &&
                  `${u.name} (${u.staff_id})` === lecturerDisplay
              );
              lecturerValue = foundLecturer
                ? foundLecturer.email
                : lecturerDisplay;
            }
          }

          return {
            schoolYear: String(r["Năm học"] || "").trim(),
            semester: Number(r["Học kỳ"] || Semester.First),
            date: formattedDate,
            week: Number(r["Tuần"] || ""),
            period: Number(r["Ca"] || Period.Period1),
            time: timeValue as StudyTime,
            subject: String(r["Môn học"] || "").trim(),
            room: String(r["Phòng học"] || "").trim(),
            className: String(r["Lớp"] || "").trim(),
            // Sử dụng email giảng viên nếu admin, hoặc email user hiện tại
            lecturer: lecturerValue || user?.email || "",
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
      console.log("✅ Preview rows prepared:", preview.length);
      setPreviewRows(preview);
      setPreviewOpen(true);
      console.log("🎯 Modal should open now");
    } catch (err) {
      console.error("❌ Import error:", err);
      showMessage.error("Import thất bại");
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
            "Tuần",
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
            "Tuần",
            "Ca",
            "Giờ học",
            "Môn học",
            "Phòng học",
            "Lớp",
          ];

      worksheet.addRow(headers);

      // Định nghĩa các giá trị cho dropdown
      const roomValues = rooms.map((r) => r.room_id);
      // Lọc chỉ lấy giảng viên (users với role "User") - bỏ admin
      // Hiển thị: "Tên Giảng viên (Mã nhân viên)" nhưng lưu email để map
      const lecturerObjects = isUserAdmin
        ? users.filter((u) => u.roles && u.roles.includes(UserRole.User))
        : [];
      const lecturerValues = lecturerObjects.map(
        (u) => `${u.name} (${u.staff_id})`
      );

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

        // Cột D: Tuần (dropdown 1-52)
        worksheet.getCell(`D${row}`).dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: [
            '"1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52"',
          ],
          showErrorMessage: true,
          errorTitle: "Giá trị không hợp lệ",
          error: "Vui lòng chọn tuần từ 1 đến 52",
        };

        // Cột E: Ca (dropdown 1, 2, 3, 4)
        worksheet.getCell(`E${row}`).dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: ['"1,2,3,4"'],
          showErrorMessage: true,
          errorTitle: "Giá trị không hợp lệ",
          error: "Vui lòng chọn 1, 2, 3 hoặc 4",
        };

        // Cột F: Giờ học - TỰ ĐỘNG từ Ca học
        worksheet.getCell(`F${row}`).value = {
          formula: `IF(E${row}=1,"07:00-09:15",IF(E${row}=2,"09:30-11:45",IF(E${row}=3,"12:30-14:45",IF(E${row}=4,"15:00-17:15",""))))`,
        };

        // Cột H: Phòng học (dropdown nếu có danh sách phòng)
        if (roomValues.length > 0) {
          const roomFormula = roomValues.join(",");
          if (roomFormula.length < 255) {
            worksheet.getCell(`H${row}`).dataValidation = {
              type: "list",
              allowBlank: false,
              formulae: [`"${roomFormula}"`],
              showErrorMessage: true,
              errorTitle: "Giá trị không hợp lệ",
              error: "Vui lòng chọn mã phòng từ danh sách",
            };
          }
        }

        // Cột J: Giảng viên (dropdown nếu là admin và có danh sách giảng viên)
        if (isUserAdmin && lecturerValues.length > 0) {
          const lecturerFormula = lecturerValues.join(",");
          if (lecturerFormula.length < 255) {
            worksheet.getCell(`J${row}`).dataValidation = {
              type: "list",
              allowBlank: false,
              formulae: [`"${lecturerFormula}"`],
              showErrorMessage: true,
              errorTitle: "Giá trị không hợp lệ",
              error:
                "Vui lòng chọn giảng viên từ danh sách (Tên - Mã nhân viên)",
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
        ["   - HK 1: Tuần 1-20"],
        ["   - HK 2: Tuần 21-40"],
        ["   - HK 3: Tuần 41-52"],
        ["3. Ngày: Nhập theo định dạng DD/MM/YYYY (ví dụ: 05/08/2024)"],
        ["4. Tuần: Chọn từ dropdown (1-52) theo học kỳ"],
        ["5. Ca: Chọn từ dropdown (1, 2, 3, hoặc 4)"],
        ["6. Giờ học: TỰ ĐỘNG cập nhật khi chọn Ca (KHÔNG CẦN NHẬP)"],
        ["   - Ca 1 → 07:00-09:15"],
        ["   - Ca 2 → 09:30-11:45"],
        ["   - Ca 3 → 12:30-14:45"],
        ["   - Ca 4 → 15:00-17:15"],
        ["7. Môn học: Nhập tên môn học"],
        ["8. Phòng học: Chọn từ dropdown mã phòng"],
        ["9. Lớp: Nhập tên lớp"],
      ];

      if (isUserAdmin) {
        instructions.push([
          "10. Giảng viên: Chọn từ dropdown (hiển thị Tên - Mã nhân viên)",
        ]);
      }

      instructions.push(
        [""],
        ["LƯU Ý QUAN TRỌNG:"],
        [
          "- Cột 'Giờ học' TỰ ĐỘNG - không cần nhập, sẽ tự động điền khi chọn Ca",
        ],
        ["- Khi bạn chọn Ca, Giờ học sẽ tự động cập nhật tương ứng"],
        ["- Tuần phải phù hợp với học kỳ (HK1: 1-20, HK2: 21-40, HK3: 41-52)"],
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

      showMessage.success("Đã tải template thành công");
    } catch (err) {
      showMessage.error("Không thể tạo file mẫu");
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
      if (!user) {
        showMessage.error("Vui lòng đăng nhập để thực hiện import");
        return;
      }

      const endpoint = getApiEndpoint("timetables", user.roles);
      const res = await authFetch(endpoint, user._id!, user.roles, {
        method: "POST",
        body: JSON.stringify(mappedRows),
      });

      if (res.ok) {
        showMessage.success("Đã import thời khóa biểu");

        // Refresh both timetables and teaching logs data sau khi import thành công
        if (user._id && user.roles) {
          await Promise.all([
            fetchTimetables(user._id, user.roles, true), // Force refresh
            fetchTeachingLogs(user._id, user.roles, true), // Force refresh teaching logs
          ]);
        }
      } else {
        const errorData = await res.json();
        showMessage.error(
          `Import thất bại: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (err) {
      showMessage.error("Import thất bại");
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
          staff_id: u.staff_id || "",
          roles: u.roles || [],
        }))}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Upload timetable file"
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
