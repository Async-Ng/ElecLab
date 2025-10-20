"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { normalizeTimetableData, TimetableItem } from "../../../shared/utils/convertTimetable";

export default function TimetableList() {
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/timetable")
      .then((res) => res.json())
      .then((json) => {
        const formatted = normalizeTimetableData(json.data);
        setTimetable(formatted);
      })
      .catch((err) => console.error("Error loading timetable:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-gray-500">Đang tải dữ liệu...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">📅 Lịch Giảng Dạy</h2>
      <div className="grid gap-4">
        {timetable.map((item) => (
          <div
            key={`${item.index}-${item.date}`}
            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <div className="font-bold text-lg text-blue-700">{item.subject}</div>
            <div className="text-gray-600 text-sm mt-1">
              <p>🗓️ Ngày: {item.date}</p>
              <p>⏰ Giờ học: {item.time}</p>
              <p>🏫 Phòng: {item.room}</p>
              <p>👨‍🏫 Giảng viên: {item.teacher}</p>
              <p>🧑‍🎓 Lớp: {item.className}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
