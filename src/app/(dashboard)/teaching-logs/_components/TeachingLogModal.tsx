import React, { useState } from "react";
import { Form, Input, Upload, Modal as AntModal, Button, Space } from "antd";
import { message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { TeachingLog, TeachingLogStatus } from "../../../../types/teachingLog";
import { Timetable } from "../../../../types/timetable";
import TeachingLogDetail from "./TeachingLogDetail";
import { BaseModal, FormField } from "@/components/common";
import { CreateMaterialRequestFromTimetable } from "@/components/materialRequest/CreateMaterialRequestFromTimetable";

interface TeachingLogModalProps {
  open: boolean;
  onClose: () => void;
  timetableId: string;
  log?: TeachingLog;
  onSuccess?: () => void;
  materials?: Array<{ _id: string; name: string; quantity: number }>;
  rooms?: Array<{ _id: string; room_id: string; name: string }>;
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
  materials = [],
  rooms = [],
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | undefined>();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [showMaterialRequest, setShowMaterialRequest] = useState(false);

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
      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lưu thất bại");
      }

      message.success(
        log ? "Cập nhật nhật ký thành công!" : "Tạo nhật ký mới thành công!"
      );

      setLoading(false);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      message.error(err?.message || "Có lỗi xảy ra khi lưu nhật ký");
      setLoading(false);
    }
  };

  const isOwner = (() => {
    if (!log || !log.timetable || typeof log.timetable !== "object")
      return true; // Tạo mới
    const lec = log.timetable.lecturer;
    const lecturerId = typeof lec === "object" ? lec._id || "" : lec || "";
    return currentUser?._id === lecturerId;
  })();

  // Get timetable from log if available
  const timetable: Timetable | undefined =
    log?.timetable && typeof log.timetable === "object"
      ? log.timetable
      : undefined;

  // Custom footer with material request button
  const footerContent = (
    <Space style={{ width: "100%", justifyContent: "flex-end" }}>
      <Button onClick={onClose}>Hủy</Button>
      {isOwner && (
        <>
          <Button type="primary" onClick={handleOk} loading={loading}>
            Lưu
          </Button>
          {timetable && (
            <Button onClick={() => setShowMaterialRequest(true)}>
              Gửi yêu cầu vật tư
            </Button>
          )}
        </>
      )}
    </Space>
  );

  return (
    <>
      <BaseModal
        open={open}
        title={log ? "Chi tiết nhật ký ca dạy" : "Tạo nhật ký ca dạy"}
        onCancel={onClose}
        customFooter={footerContent}
        width={900}
      >
        {log && <TeachingLogDetail log={log} />}

        {/* Chỉ hiển thị form nếu là chủ sở hữu hoặc tạo mới */}
        {isOwner && (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              note: log?.note || "",
              status: log?.status || TeachingLogStatus.NORMAL,
            }}
          >
            <FormField
              name="status"
              label="Trạng thái"
              type="select"
              options={statusOptions}
              rules={[{ required: true }]}
            />

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

            <AntModal
              open={previewVisible}
              footer={null}
              onCancel={() => setPreviewVisible(false)}
            >
              <img alt="preview" style={{ width: "100%" }} src={previewImage} />
            </AntModal>
          </Form>
        )}
      </BaseModal>

      {timetable && (
        <CreateMaterialRequestFromTimetable
          visible={showMaterialRequest}
          onClose={() => setShowMaterialRequest(false)}
          timetable={timetable}
          materials={materials}
          rooms={rooms}
        />
      )}
    </>
  );
};

export default TeachingLogModal;
