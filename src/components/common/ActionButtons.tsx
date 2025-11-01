import React from "react";
import { Space, Button } from "antd";
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";

interface ActionButton {
  text: string;
  icon?: React.ReactNode;
  onClick: () => void;
  type?: "primary" | "default" | "dashed" | "link" | "text";
  danger?: boolean;
  loading?: boolean;
}

interface ActionButtonsProps {
  onAdd?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onDownloadTemplate?: () => void;
  customButtons?: ActionButton[];
  addText?: string;
  importText?: string;
  exportText?: string;
  templateText?: string;
}

export default function ActionButtons({
  onAdd,
  onImport,
  onExport,
  onDownloadTemplate,
  customButtons = [],
  addText = "Thêm mới",
  importText = "Import",
  exportText = "Export",
  templateText = "Tải template",
}: ActionButtonsProps) {
  return (
    <Space wrap>
      {onAdd && (
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          {addText}
        </Button>
      )}
      {onImport && (
        <Button icon={<UploadOutlined />} onClick={onImport}>
          {importText}
        </Button>
      )}
      {onDownloadTemplate && (
        <Button icon={<DownloadOutlined />} onClick={onDownloadTemplate}>
          {templateText}
        </Button>
      )}
      {onExport && (
        <Button icon={<DownloadOutlined />} onClick={onExport}>
          {exportText}
        </Button>
      )}
      {customButtons.map((btn, index) => (
        <Button
          key={index}
          type={btn.type || "default"}
          icon={btn.icon}
          onClick={btn.onClick}
          danger={btn.danger}
          loading={btn.loading}
        >
          {btn.text}
        </Button>
      ))}
    </Space>
  );
}
