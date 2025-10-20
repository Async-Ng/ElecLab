"use client";

import React from "react";
import dayjs from "dayjs";
import { TimetableItem } from "../services/convertTimetable";

interface TimetableGridProps {
  data: TimetableItem[];
  weekDates: string[]; // danh sách ngày trong tuần dạng "DD/MM/YYYY"
}

export function TimetableGrid({ data, weekDates }: TimetableGridProps) {
  // Các khung giờ cố định (từ cột E bạn nói)
  const timeSlots = [
    { label: "Sáng", range: "7:00-11:45" },
    { label: "Chiều", range: "12:30-17:15" },
    // Nếu bạn có thêm buổi tối, thêm vào đây
    // { label: "Tối", range: "17:30-21:00" },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl shadow-md border border-gray-200 bg-white">
      <table className="w-full text-sm text-center border-collapse">
        <thead className="bg-gray-100 text-gray-700 text-base">
          <tr>
            <th className="p-3 border w-32">Ca học</th>
            {weekDates.map((date) => (
              <th key={date} className="p-3 border">
                {dayjs(date, "DD/MM/YYYY").format("dddd - DD/MM")}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {timeSlots.map((slot) => (
            <tr key={slot.label}>
              <td className="border font-medium bg-gray-50">
                <div>{slot.label}</div>
                <div className="text-xs text-gray-500">{slot.range}</div>
              </td>

              {weekDates.map((date) => {
                // Tìm phần tử khớp ngày + giờ học
                const cell = data.find(
                  (item) =>
                    item.date === date &&
                    item.time.trim() === slot.range.trim()
                );

                return (
                  <td
                    key={`${slot.label}-${date}`}
                    className="border min-w-[160px] p-2 align-top hover:bg-blue-50 transition-colors"
                  >
                    {cell ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-blue-700">
                          {cell.subject}
                        </div>
                        <div className="text-gray-600 text-sm">{cell.className}</div>
                        <div className="text-gray-500 text-xs">{cell.room}</div>
                        <div className="text-gray-400 text-xs italic">
                          {cell.teacher}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs italic">Trống</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
