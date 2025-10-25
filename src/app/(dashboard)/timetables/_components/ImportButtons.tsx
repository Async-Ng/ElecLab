"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button, message, Space } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import ImportPreviewModal from "./ImportPreviewModal";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import { Room } from "@/types/room";
import { User } from "@/types/user";
export default function ImportButtons() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    // Lấy danh sách phòng
    fetch("/api/rooms?userRole=Head_of_deparment")
      .then((res) => res.json())
      .then((data) =>
        setRooms(
          (data.rooms || []).map((r: any) => ({
            _id: r._id,
            room_id: r.room_id,
            name: r.name || "",
            location: r.location || "",
            users_manage: r.users_manage || [],
          }))
        )
      );
    // Lấy danh sách giảng viên
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) =>
        setUsers(
          (data || []).map((u: any) => ({
            _id: u._id,
            staff_id: u.staff_id,
            name: u.name || "",
            email: u.email,
            password: "",
            roles: u.roles || [],
            rooms_manage: u.rooms_manage || [],
          }))
        )
      );
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
      const preview: Timetable[] = rows.map((r, idx) => ({
        schoolYear: String(r["Năm học"] || "").trim(),
        semester: Number(r["Học kỳ"] || Semester.First),
        date: String(r["Ngày"] || "").trim(),
        period: Number(r["Ca"] || Period.Period1),
        time: String(r["Giờ học"] || StudyTime.Period1) as StudyTime,
        subject: String(r["Môn học"] || "").trim(),
        room: String(r["Phòng học"] || "").trim(),
        className: String(r["Lớp"] || "").trim(),
        lecturer: String(r["Giảng viên"] || "").trim(),
      }));
      setPreviewRows(preview);
      setPreviewOpen(true);
    } catch (err) {
      console.error(err);
      message.error("Import thất bại");
    }
  }

  async function handleDownloadTemplate() {
    try {
      const XLSX = await import("xlsx");
      const headers = [
        [
          "Năm học",
          "Học kỳ",
          "Ngày",
          "Ca",
          "Giờ học",
          "Môn học",
          "Phòng học",
          "Lớp",
          "Giảng viên",
        ],
      ];
      const sample = [
        [
          "2024-2025",
          1,
          "2024-08-05",
          1,
          "07:00-09:15",
          "TN Máy điện",
          "P.TNMĐ_CS3",
          "C23A.ĐL2",
          "Thầy Phạm Hữu Tấn",
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet([...headers, ...sample]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "timetable-template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      message.error("Không thể tạo file mẫu");
    }
  }

  async function handleImport(rows: Timetable[]) {
    // Mapping phòng và giảng viên sang _id
    const mappedRows = rows.map((row) => {
      let roomId = row.room;
      let lecturerId = row.lecturer;
      if (typeof roomId === "string") {
        const roomCode = roomId.trim();
        const foundRoom = rooms.find(
          (r) => typeof r.room_id === "string" && r.room_id.trim() === roomCode
        );
        if (foundRoom) roomId = foundRoom._id;
      }
      if (typeof lecturerId === "string") {
        const lecturerEmail = lecturerId.trim();
        const foundUser = users.find(
          (u) => typeof u.email === "string" && u.email.trim() === lecturerEmail
        );
        if (foundUser) lecturerId = foundUser._id;
      }
      return { ...row, room: roomId, lecturer: lecturerId };
    });
    try {
      console.log("IMPORT PAYLOAD:", JSON.stringify(mappedRows, null, 2));
      const res = await fetch("/api/timetables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mappedRows),
      });
      if (res.ok) {
        message.success("Đã import thời khóa biểu");
      } else {
        const errorData = await res.json();
        console.error("IMPORT ERROR:", errorData);
        message.error(`Import thất bại: ${errorData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("IMPORT EXCEPTION:", err);
      message.error("Import thất bại");
    }
  }

  return (
    <Space>
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
      <Button
        icon={<UploadOutlined />}
        onClick={() => fileInputRef.current?.click()}
      >
        Import thời khóa biểu
      </Button>
      <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
        Tải template mẫu
      </Button>
    </Space>
  );
}
