import { useEffect, useState } from "react";
import dayjs from "dayjs";

export function useLessonLogStatus(timetableId: string, lessonDate: string) {
  const [hasLog, setHasLog] = useState<boolean>(false);
  const [isFuture, setIsFuture] = useState<boolean>(false);

  useEffect(() => {
    if (!timetableId) return;
    // Kiểm tra ngày học có phải tương lai không
    setIsFuture(dayjs(lessonDate).isAfter(dayjs(), "day"));
    // Kiểm tra đã ghi log chưa
    fetch(`/api/teaching-logs?lessonId=${timetableId}`)
      .then((res) => res.json())
      .then((logs) => {
        setHasLog(Array.isArray(logs) && logs.length > 0);
      });
  }, [timetableId, lessonDate]);

  return { hasLog, isFuture };
}
