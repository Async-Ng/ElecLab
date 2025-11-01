"use client";

import React, { useState, useEffect } from "react";
import { Button, message, Space } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { MaterialCategory, MaterialStatus } from "@/types/material";
import ImportPreviewModal from "./ImportPreviewModal";

type Props = {
  onImported?: () => void;
  setLoading?: (v: boolean) => void;
};

export default function ImportButtons({ onImported, setLoading }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [rooms, setRooms] = useState<
    { room_id: string; _id: string; name: string }[]
  >([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Lấy danh sách phòng để map mã phòng sang _id
    fetch("/api/rooms?userRole=Admin")
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.rooms || []);
      });
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading?.(true);
      const XLSX = await import("xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      // prepare preview rows (keep original fields and computed ones)
      const preview: any[] = [];
      for (const [idx, r] of rows.entries()) {
        const material_id = String(
          r.material_id || r["Mã vật tư"] || ""
        ).trim();
        const name = String(r.name || r["Tên"] || "").trim();
        const category = String(r.category || r["Danh mục"] || "").trim();
        const status = String(r.status || r["Tình trạng"] || "").trim();
        const place_used = String(
          r.place_used || r["Vị trí sử dụng"] || ""
        ).trim();
        preview.push({
          key: idx,
          material_id,
          name,
          category,
          status,
          place_used,
        });
      }

      setPreviewRows(preview);
      setPreviewOpen(true);
    } catch (err) {
      message.error("Import thất bại");
    } finally {
      setLoading?.(false);
    }
  }

  async function handleDownloadTemplate() {
    try {
      const XLSX = await import("xlsx");
      const headers = [
        ["Mã vật tư", "Tên", "Danh mục", "Tình trạng", "Vị trí sử dụng"],
      ];
      const sample = [
        [
          "MAT-001",
          "Điện trở 10k",
          Object.values(MaterialCategory)[0],
          Object.values(MaterialStatus)[0],
          "Kho A",
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet([...headers, ...sample]);

      const categories = Object.values(MaterialCategory).join(",");
      const statuses = Object.values(MaterialStatus).join(",");
      ws["!dataValidation"] = [
        {
          sqref: "C2:C1000",
          type: "list",
          allowBlank: true,
          showInputMessage: true,
          showErrorMessage: true,
          formula1: `"${categories.replace(/\"/g, '"')}"`,
        },
        {
          sqref: "D2:D1000",
          type: "list",
          allowBlank: true,
          showInputMessage: true,
          showErrorMessage: true,
          formula1: `"${statuses.replace(/\"/g, '"')}"`,
        },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "materials-template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      message.error("Không thể tạo file mẫu");
    }
  }

  return (
    <Space>
      <ImportPreviewModal
        open={previewOpen}
        initialRows={previewRows}
        rooms={rooms}
        onCancel={() => setPreviewOpen(false)}
        onConfirm={async (rows) => {
          // rows already filtered to valid ones by modal
          if (!rows || rows.length === 0) {
            message.warning("Không có bản ghi hợp lệ để import");
            return;
          }
          setPreviewOpen(false);
          setLoading?.(true);
          // Map mã phòng sang _id
          const mappedRows = rows.map((r: any) => {
            let place_used_id = "";
            if (r.place_used) {
              const found = rooms.find((room) => room.room_id === r.place_used);
              if (found) place_used_id = found._id;
            }
            return {
              material_id: r.material_id,
              name: r.name,
              category: r.category,
              status: r.status,
              place_used: place_used_id || undefined,
              _room_id_input: r.place_used, // giữ lại để kiểm tra cảnh báo
            };
          });
          // Kiểm tra các bản ghi có mã phòng không hợp lệ
          const invalidRooms = mappedRows.filter(
            (r) => r._room_id_input && !r.place_used
          );
          if (invalidRooms.length > 0) {
            message.warning(
              `Có ${invalidRooms.length} bản ghi có mã phòng không hợp lệ và sẽ không được liên kết phòng. Kiểm tra lại cột 'Vị trí sử dụng'.`
            );
          }
          try {
            const res = await fetch("/api/materials", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                mappedRows.map(({ _room_id_input, ...rest }) => rest)
              ),
            });
            if (res.ok) {
              const data = await res.json();
              const inserted =
                data.insertedCount ?? (Array.isArray(data) ? data.length : 1);
              message.success(`Đã import ${inserted} bản ghi`);
              onImported?.();
            } else if (res.status === 207) {
              const data = await res.json().catch(() => ({}));
              const inserted = data.insertedCount ?? 0;
              message.warning(
                `Import một phần: ${inserted} bản ghi được import. Một số bản ghi bị trùng hoặc lỗi.`
              );
              onImported?.();
            } else {
              const err = await res.json().catch(() => ({}));

              message.error("Import thất bại");
            }
          } catch (err) {
            message.error("Import thất bại");
          } finally {
            setLoading?.(false);
          }
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,csv"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <Button
        icon={<UploadOutlined />}
        onClick={() => fileInputRef.current?.click()}
      >
        Import
      </Button>
      <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
        Tải mẫu
      </Button>
    </Space>
  );
}
