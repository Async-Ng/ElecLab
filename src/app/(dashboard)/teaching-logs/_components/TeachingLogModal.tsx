import React, { useState } from "react";
import { Modal, Form, Input, Select, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { TeachingLog, TeachingLogStatus } from "../../../../types/teachingLog";
import TeachingLogDetail from "./TeachingLogDetail";

interface TeachingLogModalProps {
  open: boolean;
  onClose: () => void;
  timetableId: string;
  log?: TeachingLog;
  onSuccess?: () => void;
}

const statusOptions = [
  { value: TeachingLogStatus.NORMAL, label: TeachingLogStatus.NORMAL },
  { value: TeachingLogStatus.INCIDENT, label: TeachingLogStatus.INCIDENT },
];

const TeachingLogModal: React.FC<TeachingLogModalProps> = ({
  open,
  onClose,
  timetableId,
  log,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      // Upload images first (simulate, replace with real upload if needed)
      let imageUrls: string[] = log?.imageUrl || [];
      if (fileList.length > 0) {
        // TODO: upload files to server and get URLs
        imageUrls = fileList.map((f) => f.url || f.thumbUrl || "");
      }
      const payload = {
        timetable: timetableId,
        note: values.note,
        status: values.status,
        imageUrl: imageUrls,
      };
      const method = log ? "PUT" : "POST";
      const url = log ? `/api/teaching-logs/${log._id}` : "/api/teaching-logs";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setLoading(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      setLoading(false);
    }
  };

  const timetable =
    log?.timetable && typeof log.timetable === "object"
      ? log.timetable
      : undefined;

  return (
    <Modal
      open={open}
      title={log ? "Chi tiết nhật ký ca dạy" : "Tạo nhật ký ca dạy"}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose
      width={900}
    >
      {log && <TeachingLogDetail log={log} />}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          note: log?.note || "",
          status: log?.status || TeachingLogStatus.NORMAL,
        }}
      >
        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true }]}
        >
          <Select options={statusOptions} />
        </Form.Item>
        <Form.Item label="Ảnh minh họa">
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            multiple
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>
        {log?.imageUrl?.length ? (
          <div style={{ marginBottom: 8 }}>
            {log.imageUrl.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="log-img"
                style={{ width: 60, marginRight: 8, borderRadius: 4 }}
              />
            ))}
          </div>
        ) : null}
      </Form>
    </Modal>
  );
};

export default TeachingLogModal;
