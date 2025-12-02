import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Alert from "@/components/ui/Alert";
import Upload from "@/components/ui/Upload";
import { TeachingLog, TeachingLogStatus } from "../../../../types/teachingLog";
import { Timetable } from "../../../../types/timetable";
import TeachingLogDetail from "./TeachingLogDetail";
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
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | undefined>();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [showMaterialRequest, setShowMaterialRequest] = useState(false);
  const [formData, setFormData] = useState({
    note: "",
    status: TeachingLogStatus.NORMAL,
  });
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);

  // Initialize form data from log
  useEffect(() => {
    if (log) {
      setFormData({
        note: log.note || "",
        status: log.status || TeachingLogStatus.NORMAL,
      });
    }
  }, [log]);

  // Lấy user hiện tại
  let currentUser: any = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {}

  const handleOk = async () => {
    try {
      // Validate
      if (!formData.status) {
        setAlertMessage({
          type: "error",
          message: "Vui lòng chọn trạng thái",
        });
        return;
      }

      setLoading(true);

      // Kiểm tra quyền: chỉ chủ sở hữu mới được edit
      let lecturerId = "";
      if (log && log.timetable && typeof log.timetable === "object") {
        const lec = log.timetable.lecturer;
        lecturerId = typeof lec === "object" ? lec._id || "" : lec || "";
      }
      if (log && lecturerId && currentUser?._id !== lecturerId) {
        setAlertMessage({
          type: "error",
          message: "Bạn không có quyền chỉnh sửa nhật ký này!",
        });
        setLoading(false);
        return;
      }

      const formDataObj = new FormData();
      formDataObj.append("timetable", timetableId);
      formDataObj.append("note", formData.note || "");
      formDataObj.append("status", formData.status);
      fileList.forEach((file: any) => {
        if (file.originFileObj) {
          formDataObj.append("images", file.originFileObj);
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
        body: formDataObj,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lưu thất bại");
      }

      setAlertMessage({
        type: "success",
        message: log
          ? "Cập nhật nhật ký thành công!"
          : "Tạo nhật ký mới thành công!",
      });

      setTimeout(() => {
        setLoading(false);
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setAlertMessage({
        type: "error",
        message: err?.message || "Có lỗi xảy ra khi lưu nhật ký",
      });
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

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={log ? "Chi tiết nhật ký ca dạy" : "Tạo nhật ký ca dạy"}
        size="xl"
      >
        <div className="space-y-4">
          {alertMessage && (
            <Alert
              type={alertMessage.type}
              message={alertMessage.message}
              onClose={() => setAlertMessage(null)}
            />
          )}

          {log && <TeachingLogDetail log={log} />}

          {/* Chỉ hiển thị form nếu là chủ sở hữu hoặc tạo mới */}
          {isOwner && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.status}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as TeachingLogStatus,
                    })
                  }
                  options={statusOptions.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh minh họa
                </label>
                <Upload
                  fileList={fileList}
                  onChange={setFileList}
                  accept="image/*"
                  multiple
                />
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            {isOwner && (
              <>
                <Button variant="primary" onClick={handleOk} loading={loading}>
                  Lưu
                </Button>
                {timetable && (
                  <Button
                    variant="secondary"
                    onClick={() => setShowMaterialRequest(true)}
                  >
                    Gửi yêu cầu vật tư
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      {previewVisible && (
        <Modal
          open={previewVisible}
          onClose={() => setPreviewVisible(false)}
          title="Xem trước ảnh"
          size="lg"
        >
          <img alt="preview" style={{ width: "100%" }} src={previewImage} />
        </Modal>
      )}

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
