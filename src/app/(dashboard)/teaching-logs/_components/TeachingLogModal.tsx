import React, { useState } from "react";
import { Form, Input, Upload, Modal as AntModal, App, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { TeachingLog, TeachingLogStatus } from "../../../../types/teachingLog";
import TeachingLogDetail from "./TeachingLogDetail";
import { BaseModal, FormField } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { authFetch, getApiEndpoint } from "@/lib/apiClient";

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
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | undefined>();
  const [previewVisible, setPreviewVisible] = useState(false);

  console.log("TeachingLogModal - Props:", {
    open,
    timetableId,
    hasLog: !!log,
    userId: user?._id,
  });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      console.log("TeachingLogModal - Creating log:", {
        timetableId,
        values,
        user: user?._id,
        roles: user?.roles,
      });

      // Kiểm tra quyền: chỉ chủ sở hữu mới được edit
      let lecturerId = "";
      if (log && log.timetable && typeof log.timetable === "object") {
        const lec = log.timetable.lecturer;
        lecturerId = typeof lec === "object" ? lec._id || "" : lec || "";
      }
      if (log && lecturerId && user?._id !== lecturerId) {
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
      // Sử dụng user endpoint (không có dấu / ở đầu resource)
      const endpoint = getApiEndpoint("teaching-logs", user?.roles || []);
      const url = log ? `${endpoint}/${log._id}` : endpoint;

      console.log("TeachingLogModal - Calling API:", {
        method,
        url,
        timetableId,
        hasImages: fileList.length > 0,
      });

      try {
        // Encode roles to base64 to avoid ISO-8859-1 encoding issues with Vietnamese characters
        const roleString = JSON.stringify(user?.roles || []);
        const encodedRole = btoa(unescape(encodeURIComponent(roleString)));

        const response = await fetch(url, {
          method,
          body: formData,
          headers: {
            "x-user-id": user?._id || "",
            "x-user-role": encodedRole,
          },
        });

        console.log("TeachingLogModal - Response:", {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("TeachingLogModal - Error response:", errorData);
          throw new Error(errorData.error || "Lưu thất bại");
        }

        const result = await response.json();
        console.log("TeachingLogModal - Success result:", result);

        message.success(
          log ? "Cập nhật nhật ký thành công!" : "Tạo nhật ký mới thành công!"
        );

        setLoading(false);
        onSuccess?.();
        onClose();
      } catch (fetchError: any) {
        console.error("TeachingLogModal - Fetch error:", fetchError);
        throw fetchError;
      }
    } catch (err: any) {
      console.error("TeachingLogModal - Outer error:", err);
      message.error(err?.message || "Có lỗi xảy ra khi lưu nhật ký");
      setLoading(false);
    }
  };

  const isOwner = (() => {
    if (!log || !log.timetable) {
      console.log("TeachingLogModal - isOwner: true (new log)");
      return true; // Tạo mới
    }

    const timetable = log.timetable;
    let lecturerId = "";

    if (typeof timetable === "object" && timetable.lecturer) {
      const lec = timetable.lecturer;
      lecturerId = typeof lec === "object" ? lec._id || "" : lec || "";
    } else if (typeof timetable === "string") {
      // Handle case where timetable is just an ID
      lecturerId = "";
    }

    const isOwnerResult = user?._id === lecturerId;

    console.log("TeachingLogModal - isOwner check:", {
      userId: user?._id,
      lecturerId,
      isOwner: isOwnerResult,
      timetableType: typeof timetable,
    });

    return isOwnerResult;
  })();

  return (
    <BaseModal
      open={open}
      title={log ? "Chi tiết nhật ký ca dạy" : "Tạo nhật ký ca dạy"}
      onCancel={onClose}
      onOk={isOwner ? handleOk : undefined}
      loading={loading}
      width={900}
      okText={log && !isOwner ? undefined : log ? "Cập nhật" : "Tạo mới"}
      cancelText={log && !isOwner ? "Đóng" : "Hủy"}
    >
      {log && <TeachingLogDetail log={log} />}

      {/* Thông báo nếu không phải owner */}
      {log && !isOwner && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
            marginTop: "16px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, color: "#595959" }}>
            Bạn chỉ có thể xem nhật ký này. Chỉ giảng viên phụ trách mới có thể
            chỉnh sửa.
          </p>
        </div>
      )}

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
  );
};

export default TeachingLogModal;
