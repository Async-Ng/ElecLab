"use client";

import { Modal, Input, Upload, Button, Switch, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { Timetable } from "../services/types";

interface Props {
  open: boolean;
  onClose: () => void;
  record: Timetable | null;
  onSubmit: (data: Partial<Timetable>) => void;
}

export default function NoteModal({ open, onClose, record, onSubmit }: Props) {
  const [status, setStatus] = useState<"Bình thường" | "Có sự cố">("Bình thường");
  const [note, setNote] = useState("");
  const [fileList, setFileList] = useState<any[]>([]);

  const handleSubmit = () => {
    if (status === "Có sự cố" && !note) {
      message.error("Vui lòng nhập ghi chú khi có sự cố!");
      return;
    }
    onSubmit({
      ...record,
      status,
      note,
      evidenceUrl: fileList[0]?.name || "",
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      title={`Ghi chú buổi học - ${record?.subject || ""}`}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Xác nhận"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Tình trạng:</span>
          <Switch
            checkedChildren="Có sự cố"
            unCheckedChildren="Bình thường"
            onChange={(checked) => setStatus(checked ? "Có sự cố" : "Bình thường")}
          />
        </div>

        {status === "Có sự cố" && (
          <>
            <Input.TextArea
              rows={3}
              placeholder="Nhập mô tả sự cố..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Upload
              beforeUpload={(file) => {
                setFileList([file]);
                return false;
              }}
              fileList={fileList}
              onRemove={() => setFileList([])}
            >
              <Button icon={<UploadOutlined />}>Tải minh chứng</Button>
            </Upload>
          </>
        )}
      </div>
    </Modal>
  );
}
