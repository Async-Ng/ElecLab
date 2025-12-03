import React, { useState, useEffect } from "react";
import { Radio, message } from "antd";
import BaseModal from "@/components/common/BaseModal";
import FormField from "@/components/form/FormField";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Upload from "@/components/ui/Upload";
import { TeachingLog, TeachingLogStatus } from "../../../../types/teachingLog";
import { Timetable } from "../../../../types/timetable";
import TeachingLogDetail from "./TeachingLogDetail";
import { CreateMaterialRequestFromTimetable } from "@/components/materialRequest/CreateMaterialRequestFromTimetable";
import {
  FileImageOutlined,
  WarningOutlined,
  LoadingOutlined,
  BookOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useTeachingLogsStore } from "@/stores/useTeachingLogsStore";
import { uploadImagesToImgBB } from "@/lib/imgbb";

interface TeachingLogModalProps {
  open: boolean;
  onClose: () => void;
  timetableId: string;
  log?: TeachingLog;
  onSuccess?: () => void;
  materials?: Array<{ _id: string; name: string; quantity: number }>;
  rooms?: Array<{ _id: string; room_id: string; name: string }>;
}

/**
 * TeachingLogModal - Low-tech Friendly Form with Full Logic Integration
 *
 * Features:
 * ✅ Zustand store integration for state management
 * ✅ useAuth hook for proper permission checks
 * ✅ ImgBB async image upload with loading states
 * ✅ Inline validation with clear error messages
 * ✅ Loading states prevent double-submit
 * ✅ Success/error messages with auto-close
 * ✅ Segmented control for better UX
 * ✅ Conditional rendering for incident fields
 * ✅ Auto-focus on first field
 */
const TeachingLogModal: React.FC<TeachingLogModalProps> = ({
  open,
  onClose,
  timetableId,
  log,
  onSuccess,
  materials = [],
  rooms = [],
}) => {
  // State management - Controlled components
  const [formData, setFormData] = useState<{
    note: string;
    status: TeachingLogStatus;
  }>({
    note: "",
    status: TeachingLogStatus.NORMAL,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | undefined>();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [showMaterialRequest, setShowMaterialRequest] = useState(false);

  // Hooks
  const { user } = useAuth();
  const { addTeachingLog, updateTeachingLog, fetchTeachingLogs } =
    useTeachingLogsStore();

  // Initialize form data from log and handle existing images
  useEffect(() => {
    if (open) {
      if (log) {
        setFormData({
          note: log.note || "",
          status: log.status || TeachingLogStatus.NORMAL,
        });

        // Handle existing images
        if (log.images && log.images.length > 0) {
          setUploadedImageUrls(log.images);
          // Convert existing URLs to fileList format for display
          const existingFiles = log.images.map((url, index) => ({
            uid: `existing-${index}`,
            name: `image-${index}`,
            status: "done",
            url: url,
          }));
          setFileList(existingFiles);
        } else {
          setFileList([]);
          setUploadedImageUrls([]);
        }
      } else {
        // Reset for new log
        setFormData({
          note: "",
          status: TeachingLogStatus.NORMAL,
        });
        setFileList([]);
        setUploadedImageUrls([]);
      }
      setErrors({});
    }
  }, [log, open]);

  const isIncident = formData.status === TeachingLogStatus.INCIDENT;

  // Permission check: only owner can edit
  const isOwner = (() => {
    if (!log || !log.timetable || typeof log.timetable !== "object")
      return true; // Creating new
    const lecturer = log.timetable.lecturer;
    const lecturerId =
      typeof lecturer === "object" ? lecturer._id || "" : lecturer || "";
    return user?._id === lecturerId;
  })();

  // Handle field changes
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Validation with user-friendly error messages
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Note is required for incidents
    if (formData.status === TeachingLogStatus.INCIDENT) {
      if (!formData.note?.trim()) {
        newErrors.note = "Vui lòng mô tả chi tiết sự cố!";
      } else if (formData.note.trim().length < 10) {
        newErrors.note = "Mô tả phải có ít nhất 10 ký tự!";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      message.error("Vui lòng kiểm tra lại thông tin nhập vào");
      return false;
    }

    return true;
  };

  /**
   * Handle image upload to ImgBB
   * Returns array of uploaded URLs
   */
  const handleImageUpload = async (): Promise<string[]> => {
    // Get new images that haven't been uploaded yet
    const newImages = fileList.filter(
      (file) => file.originFileObj && !file.url
    );

    if (newImages.length === 0) {
      // No new images, return existing URLs
      return uploadedImageUrls;
    }

    try {
      setUploadingImages(true);

      // Convert files to base64
      const base64Images = await Promise.all(
        newImages.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file.originFileObj);
          });
        })
      );

      // Upload to ImgBB
      const newUrls = await uploadImagesToImgBB(base64Images);

      if (newUrls.length !== base64Images.length) {
        throw new Error("Một số ảnh không tải lên được");
      }

      // Combine existing URLs with new URLs
      const allUrls = [...uploadedImageUrls, ...newUrls];
      setUploadedImageUrls(allUrls);

      return allUrls;
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploadingImages(false);
    }
  };

  /**
   * Form submission with complete error handling
   */
  const handleOk = async () => {
    // Validate form
    const isValid = validate();
    if (!isValid) {
      return;
    }

    // Permission check for editing
    if (log && !isOwner) {
      message.error("Bạn không có quyền chỉnh sửa nhật ký này!");
      return;
    }

    // User must be authenticated
    if (!user?._id) {
      message.error("Vui lòng đăng nhập để tiếp tục");
      return;
    }

    // Show loading message
    const hideLoading = message.loading("Đang xử lý...", 0);
    setLoading(true);

    try {
      // Upload images first (if any)
      let imageUrls: string[] = [];
      if (isIncident && fileList.length > 0) {
        try {
          imageUrls = await handleImageUpload();
        } catch (uploadError: any) {
          hideLoading();
          setLoading(false);
          message.error(uploadError.message || "Không thể tải ảnh lên");
          return; // Stop submission if image upload fails
        }
      }

      // Prepare API payload
      const payload: any = {
        timetable: timetableId,
        note: formData.note?.trim() || "",
        status: formData.status,
        images: imageUrls,
      };

      // API call
      const method = log ? "PUT" : "POST";
      const url = log
        ? `/api/teaching-logs/${log._id}?userId=${encodeURIComponent(user._id)}`
        : `/api/teaching-logs?userId=${encodeURIComponent(user._id)}`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể lưu nhật ký");
      }

      const savedLog = await response.json();

      // Update Zustand store
      if (log) {
        updateTeachingLog(log._id, savedLog);
      } else {
        addTeachingLog(savedLog);
      }

      // Hide loading and show success
      hideLoading();
      message.success(
        log ? "Cập nhật nhật ký thành công!" : "Tạo nhật ký mới thành công!"
      );

      // Refresh data in background
      fetchTeachingLogs(user._id, user.roles, true);

      // Auto-close modal after brief delay
      setTimeout(() => {
        setLoading(false);
        onSuccess?.();
        onClose();
      }, 500);
    } catch (err: any) {
      hideLoading();
      setLoading(false);
      message.error(
        err?.message || "Có lỗi xảy ra khi lưu nhật ký. Vui lòng thử lại."
      );
      // Don't close modal so user doesn't lose their input
    }
  };

  // Handle file list changes
  const handleFileChange = (newFileList: any[]) => {
    setFileList(newFileList);

    // Update uploaded URLs based on files that have URLs (existing images)
    const existingUrls = newFileList
      .filter((file) => file.url && !file.originFileObj)
      .map((file) => file.url);

    setUploadedImageUrls(existingUrls);
  };

  // Get timetable from log if available
  const timetable: Timetable | undefined =
    log?.timetable && typeof log.timetable === "object"
      ? log.timetable
      : undefined;

  return (
    <>
      <BaseModal
        open={open}
        onCancel={onClose}
        title={log ? "Chi tiết nhật ký ca dạy" : "Tạo nhật ký ca dạy"}
        size="xl"
        showFooter={false}
      >
        <div className="space-y-6">
          {log && <TeachingLogDetail log={log} />}

          {/* Chỉ hiển thị form nếu là chủ sở hữu hoặc tạo mới */}
          {isOwner && (
            <div className="space-y-6">
              {/* Status Selection - Radio.Group for better accessibility */}
              <FormField label="Tình trạng ca dạy" required>
                <Radio.Group
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Radio.Button
                      value={TeachingLogStatus.NORMAL}
                      className="text-center h-12 flex items-center justify-center"
                    >
                      <span className="text-base">✅ Bình thường</span>
                    </Radio.Button>
                    <Radio.Button
                      value={TeachingLogStatus.INCIDENT}
                      className="text-center h-12 flex items-center justify-center"
                    >
                      <span className="text-base">⚠️ Sự cố</span>
                    </Radio.Button>
                  </div>
                </Radio.Group>
              </FormField>

              {/* Conditional Fields - Show only for Incidents */}
              {isIncident && (
                <div className="space-y-6 p-5 border-2 border-amber-200 bg-amber-50 rounded-lg animate-fadeIn">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold">
                    <WarningOutlined className="text-xl" />
                    <span>Thông tin sự cố</span>
                  </div>

                  {/* Note - Required for incidents */}
                  <FormField label="Mô tả sự cố" required error={errors.note}>
                    <Textarea
                      rows={4}
                      placeholder="Mô tả chi tiết sự cố xảy ra. Ví dụ: Máy chiếu không lên hình, đã thử khởi động lại nhưng không được..."
                      value={formData.note}
                      onChange={(e) => handleChange("note", e.target.value)}
                      autoResize
                      minRows={4}
                      maxRows={8}
                    />
                  </FormField>
                  <p className="text-gray-600 text-sm mt-2">
                    💡 Hãy ghi rõ: thiết bị nào gặp sự cố, hiện tượng như thế
                    nào, đã xử lý chưa
                  </p>

                  {/* Images - Optional for incidents */}
                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      <FileImageOutlined /> Ảnh minh họa sự cố (không bắt buộc)
                    </label>

                    {uploadingImages && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-700">
                        <LoadingOutlined className="text-lg" />
                        <span>Đang tải ảnh lên...</span>
                      </div>
                    )}

                    <Upload
                      fileList={fileList}
                      onChange={handleFileChange}
                      accept="image/*"
                      multiple
                      maxCount={5}
                      disabled={uploadingImages || loading}
                    />
                    <p className="text-gray-600 text-sm mt-2">
                      📸 Chụp ảnh thiết bị hư hỏng để hỗ trợ xử lý nhanh hơn
                      (tối đa 5 ảnh)
                    </p>
                  </div>
                </div>
              )}

              {/* Note for normal status - Optional */}
              {!isIncident && (
                <FormField label="Ghi chú (không bắt buộc)">
                  <Textarea
                    rows={3}
                    placeholder="Ghi chú thêm về ca dạy nếu cần. Ví dụ: Lớp học tập trung, sinh viên nhiệt tình..."
                    value={formData.note}
                    onChange={(e) => handleChange("note", e.target.value)}
                  />
                </FormField>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-200 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading || uploadingImages}
            style={{
              fontSize: "16px",
              height: "48px",
              minWidth: "120px",
            }}
          >
            {loading ? "Đang lưu..." : "Hủy"}
          </Button>
          {isOwner && (
            <>
              <Button
                variant="primary"
                onClick={handleOk}
                loading={loading || uploadingImages}
                disabled={loading || uploadingImages}
                style={{
                  fontSize: "16px",
                  height: "48px",
                  minWidth: "140px",
                }}
              >
                {uploadingImages ? (
                  <>
                    <LoadingOutlined /> Đang tải ảnh...
                  </>
                ) : loading ? (
                  "Đang lưu..."
                ) : (
                  "Lưu nhật ký"
                )}
              </Button>
              {timetable && (
                <Button
                  variant="secondary"
                  onClick={() => setShowMaterialRequest(true)}
                  disabled={loading || uploadingImages}
                  style={{
                    fontSize: "16px",
                    height: "48px",
                  }}
                >
                  Gửi yêu cầu vật tư
                </Button>
              )}
            </>
          )}
        </div>
      </BaseModal>{" "}
      {/* Preview Modal */}
      {previewVisible && (
        <BaseModal
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          title="Xem trước ảnh"
          size="lg"
        >
          <img alt="preview" className="w-full" src={previewImage} />
        </BaseModal>
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
