// src/features/timetable/services/timetableApi.ts

import { Timetable } from "./types";

/**
 * MockAPI endpoint chính
 * (Mỗi record tương ứng với 1 buổi học trong TKB)
 */
const API_URL = "https://6879244663f24f1fdca10af4.mockapi.io/schedule";
export async function updateTimetable(id: string, data: any) {
  const res = await fetch(
    `https://6879244663f24f1fdca10af4.mockapi.io/schedule/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  return await res.json();
}

export const timetableApi = {
  /**
   * 🔹 Lấy toàn bộ thời khóa biểu
   */
  getAll: async () => {
    const res = await fetch(API_URL);
    return await res.json();
  },

  /**
   * 🔹 Tạo nhiều bản ghi cùng lúc (import từ Excel)
   * MockAPI không hỗ trợ bulk upload nên phải gửi tuần tự
   */

  createMany: async (records: any[]) => {
    for (const record of records) {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
    }
  },

  /**
   * 🔹 Tạo một bản ghi mới
   */
  create: async (data: Timetable): Promise<Timetable> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Không thể tạo mới thời khóa biểu!");
    return await res.json();
  },

  /**
   * 🔹 Cập nhật một bản ghi (ghi chú, tình huống, v.v.)
   */
  update: async (id: string, data: Partial<Timetable>): Promise<Timetable> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Không thể cập nhật thời khóa biểu ID ${id}!`);
    return await res.json();
  },

  /**
   * 🔹 Xóa một bản ghi (nếu cần)
   */
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Không thể xóa bản ghi ID ${id}!`);
  },
};
