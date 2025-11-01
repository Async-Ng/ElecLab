import React, { useState } from "react";
import { Modal, Form, Input, Select, Upload, Button } from "antd";
import { message } from "antd";
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
  const [previewImage, setPreviewImage] = useState<string | undefined>();
  const [previewVisible, setPreviewVisible] = useState(false);
  // Lấy user hiện tại
  let currentUser: any = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {}

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      // Kiểm tra quyền: chỉ chủ sở hữu mới được edit
      let lecturerId = "";
      if (log && log.timetable && typeof log.timetable === "object") {
        const lec = log.timetable.lecturer;
        lecturerId = typeof lec === "object" ? lec._id || "" : lec || "";
      }
      if (log && lecturerId && currentUser?._id !== lecturerId) {
        message.error("Bạn không có quyền chỉnh sửa nhật ký này!");
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("timetable", timetableId);
      formData.append("note", values.note || "");
      formData.append("status", values.status);
      fileList.forEach((file: any) => {
        if (file.originFileObj) {
          formData.append("images", file.originFileObj);
        }
      });
      const method = log ? "PUT" : "POST";
      const url = log
        ? `/api/teaching-logs/${log._id}?userId=${encodeURIComponent(
            currentUser?._id || ""
          )}`
        : "/api/teaching-logs";
      await fetch(url, {
        method,
        body: formData,
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
      destroyOnHidden
      width={900}
    >
      {log && <TeachingLogDetail log={log} />}
      {/* Chỉ hiển thị form nếu là chủ sở hữu hoặc tạo mới */}
      {(!log ||
        (log.timetable &&
          typeof log.timetable === "object" &&
          (() => {
            const lec = log.timetable.lecturer;
            const lecturerId =
              typeof lec === "object" ? lec._id || "" : lec || "";
            return currentUser?._id === lecturerId;
          })())) && (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            note: log?.note || "",
            status: log?.status || TeachingLogStatus.NORMAL,
          }}
        >
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true }]}
          >
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Ảnh minh họa">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              multiple
              showUploadList={{ showPreviewIcon: true }}
              onPreview={async (file) => {
                let src = file.url || file.thumbUrl;
                if (!src && file.originFileObj) {
                  src = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    if (file.originFileObj)
                      reader.readAsDataURL(file.originFileObj);
                    reader.onload = () => resolve(reader.result as string);
                  });
                }
                setPreviewImage(src);
                setPreviewVisible(true);
              }}
            >
              <div>
                <UploadOutlined /> Tải ảnh lên
              </div>
            </Upload>
          </Form.Item>
          <Modal
            open={previewVisible}
            footer={null}
            onCancel={() => setPreviewVisible(false)}
          >
            <img alt="preview" style={{ width: "100%" }} src={previewImage} />
          </Modal>
        </Form>
      )}
    </Modal>
  );
};

export default TeachingLogModal;
