import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekday from "dayjs/plugin/weekday";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/vi"; // ngôn ngữ tiếng Việt

// Kích hoạt plugin
dayjs.extend(isoWeek);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);
dayjs.locale("vi");

/**
 * Format ngày theo định dạng vi-VN (DD/MM/YYYY)
 * @param dateStr - Chuỗi ngày cần format (có thể là ISO, YYYY-MM-DD, hoặc DD/MM/YYYY)
 * @returns Chuỗi ngày theo format DD/MM/YYYY
 */
export const formatDateVN = (dateStr: string | undefined | null): string => {
  if (!dateStr) return "";

  // Nếu đã là DD/MM/YYYY thì giữ nguyên
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  // Nếu là YYYY-MM-DD hoặc ISO string, convert sang DD/MM/YYYY
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  } catch (e) {
    return dateStr;
  }

  return dateStr;
};

export default dayjs;
