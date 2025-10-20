import React, { useState } from "react";
import { Timetable } from "../services/types";
import { updateTimetable } from "../services/timetableAPI";

interface Props {
  timetable: Timetable;
}

export default function TimetableForm({ timetable }: Props) {
  const [status, setStatus] = useState(timetable.status || "Bình thường");
  const [note, setNote] = useState(timetable.note || "");
  const [file, setFile] = useState<File | null>(null);

  const handleConfirm = async () => {
    if (status === "Có sự cố" && (!note || !file)) {
      alert("⚠️ Vui lòng nhập ghi chú và tải file minh chứng!");
      return;
    }

    let attachmentUrl = timetable.attachment || "";

    // (Ở môi trường thực tế bạn sẽ upload file lên Cloudinary hoặc S3)
    if (file) {
      attachmentUrl = URL.createObjectURL(file); // demo tạm
    }

    await updateTimetable(timetable.id!, {
      status,
      note,
      attachment: attachmentUrl,
    });

    alert("✅ Đã cập nhật tình trạng buổi học!");
  };

  return (
    <div className="p-4 border rounded-xl shadow bg-white space-y-3">
      <div className="flex items-center gap-3">
        <label>Tình trạng:</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "Bình thường" | "Có sự cố")}
          className="border px-3 py-1 rounded"
        >
          <option value="Bình thường">Bình thường</option>
          <option value="Có sự cố">Có sự cố</option>
        </select>
      </div>

      {status === "Có sự cố" && (
        <div className="space-y-3">
          <textarea
            placeholder="Mô tả sự cố..."
            className="w-full border p-2 rounded"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
      )}

      <button
        onClick={handleConfirm}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Xác nhận
      </button>
    </div>
  );
}
