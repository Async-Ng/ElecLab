"use client";

import React from "react";
import { Button, message, Space } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { MaterialCategory, MaterialStatus } from "@/types/material";

type Props = {
  onImported?: () => void;
  setLoading?: (v: boolean) => void;
};

export default function ImportButtons({ onImported, setLoading }: Props) {
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

      const created: any[] = [];
      for (const r of rows) {
        const payload = {
          material_id: String(r.material_id || r["Mã vật tư"] || "").trim(),
          name: String(r.name || r["Tên"] || "").trim(),
          category: String(r.category || r["Danh mục"] || "").trim(),
          status: String(r.status || r["Tình trạng"] || "").trim(),
          place_used: String(r.place_used || r["Vị trí sử dụng"] || "").trim(),
        };
        if (!payload.material_id || !payload.name || !payload.category)
          continue;
        const res = await fetch("/api/materials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) created.push(await res.json());
      }
      message.success(`Đã import ${created.length} bản ghi`);
      onImported?.();
    } catch (err) {
      console.error(err);
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
      console.error(err);
      message.error("Không thể tạo file mẫu");
    }
  }

  return (
    <Space>
      <input
        type="file"
        accept=".xlsx,.xls,csv"
        style={{ display: "none" }}
        id="materials-import-input"
        onChange={handleFileChange}
      />
      <label htmlFor="materials-import-input">
        <Button icon={<UploadOutlined />}>Import</Button>
      </label>
      <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
        Tải mẫu
      </Button>
    </Space>
  );
}
