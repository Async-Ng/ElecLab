import React from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

interface ExportLogsButtonProps {
  logs: any[];
}

function convertToCSV(arr: any[]) {
  if (!arr.length) return "";
  const keys = Object.keys(arr[0]);
  const csvRows = [keys.join(",")];
  for (const row of arr) {
    csvRows.push(keys.map((k) => JSON.stringify(row[k] ?? "")).join(","));
  }
  return csvRows.join("\n");
}

const ExportLogsButton: React.FC<ExportLogsButtonProps> = ({ logs }) => {
  const handleExport = () => {
    const csv = convertToCSV(logs);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teaching-logs.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button
      icon={<DownloadOutlined />}
      onClick={handleExport}
      disabled={!logs.length}
      type="default"
      style={{ marginBottom: 16 }}
    >
      Export nhật ký ca dạy
    </Button>
  );
};

export default ExportLogsButton;
