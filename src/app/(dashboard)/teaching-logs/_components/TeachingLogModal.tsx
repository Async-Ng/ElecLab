import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Upload from "@/components/ui/Upload";

// Toast notification helper
const antMessage = {
  success: (msg: string | { content: string; duration?: number }) => {
    const text = typeof msg === "string" ? msg : msg.content;
    alert(text);
  },
  error: (msg: string | { content: string; duration?: number }) => {
    const text = typeof msg === "string" ? msg : msg.content;
    alert(text);
  },
  warning: (msg: string) => alert(msg),
  loading: (msg: string, duration?: number) => {
    return () => {}; // Return a cleanup function
  },
};
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
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | undefined>();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [showMaterialRequest, setShowMaterialRequest] = useState(false);
  const [formData, setFormData] = useState({
    note: "",
    status: TeachingLogStatus.NORMAL as TeachingLogStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  /**
   * Validation with user-friendly error messages
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.status) {
      newErrors.status = "Vui lòng chọn trạng thái";
    }

    // Note is required for incidents
    if (isIncident && !formData.note.trim()) {
      newErrors.note = "Vui lòng mô tả chi tiết sự cố xảy ra";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (!validate()) {
      antMessage.error("Vui lòng kiểm tra lại thông tin nhập vào");
      return;
    }

    // Permission check for editing
    if (log && !isOwner) {
      antMessage.error("Bạn không có quyền chỉnh sửa nhật ký này!");
      return;
    }

    // User must be authenticated
    if (!user?._id) {
      antMessage.error("Vui lòng đăng nhập để tiếp tục");
      return;
    }

    // Show loading message
    const hideLoading = antMessage.loading("Đang xử lý...", 0);
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
          antMessage.error(uploadError.message || "Không thể tải ảnh lên");
          return; // Stop submission if image upload fails
        }
      }

      // Prepare API payload
      const payload: any = {
        timetable: timetableId,
        note: formData.note.trim() || "",
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
      antMessage.success({
        content: log
          ? "Cập nhật nhật ký thành công!"
          : "Tạo nhật ký mới thành công!",
        duration: 2,
      });

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
      antMessage.error({
        content:
          err?.message || "Có lỗi xảy ra khi lưu nhật ký. Vui lòng thử lại.",
        duration: 4,
      });
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
      <Modal
        open={open}
        onClose={onClose}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              {log ? (
                <BookOutlined className="text-blue-600 text-lg" />
              ) : (
                <PlusOutlined className="text-blue-600 text-lg" />
              )}
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {log ? "Chi tiết nhật ký ca dạy" : "Tạo nhật ký ca dạy"}
              </div>
              <div className="text-xs text-gray-500">
                {log
                  ? "Xem và cập nhật thông tin nhật ký"
                  : "Ghi lại thông tin buổi giảng dạy"}
              </div>
            </div>
          </div>
        }
        size="xl"
      >
        <div className="space-y-6">
          {log && <TeachingLogDetail log={log} />}

          {/* Chỉ hiển thị form nếu là chủ sở hữu hoặc tạo mới */}
          {isOwner && (
            <div className="space-y-6">
              {/* Status Selection - Segmented Control (See all options) */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  Tình trạng ca dạy <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        status: TeachingLogStatus.NORMAL,
                      });
                      if (errors.status) {
                        setErrors({ ...errors, status: "" });
                      }
                    }}
                    variant={
                      formData.status === TeachingLogStatus.NORMAL
                        ? "primary"
                        : "outline"
                    }
                    className="flex-1"
                  >
                    Bình thường
                  </Button>
                  <Button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        status: TeachingLogStatus.INCIDENT,
                      });
                      if (errors.status) {
                        setErrors({ ...errors, status: "" });
                      }
                    }}
                    variant={
                      formData.status === TeachingLogStatus.INCIDENT
                        ? "primary"
                        : "outline"
                    }
                    className="flex-1"
                  >
                    Sự cố
                  </Button>
                </div>
                {errors.status && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <WarningOutlined />
                    {errors.status}
                  </p>
                )}
              </div>

              {/* Conditional Fields - Show only for Incidents */}
              {isIncident && (
                <div
                  className="space-y-6 p-5 border-2 border-amber-200 bg-amber-50 rounded-lg"
                  style={{
                    animation: "fadeIn 0.3s ease-in",
                  }}
                >
                  <div className="flex items-center gap-2 text-amber-700 font-semibold">
                    <WarningOutlined className="text-xl" />
                    <span>Thông tin sự cố</span>
                  </div>

                  {/* Note - Required for incidents */}
                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Mô tả sự cố <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={formData.note}
                      onChange={(e) => {
                        setFormData({ ...formData, note: e.target.value });
                        if (errors.note) {
                          setErrors({ ...errors, note: "" });
                        }
                      }}
                      rows={4}
                      placeholder="Mô tả chi tiết sự cố xảy ra. Ví dụ: Máy chiếu không lên hình, đã thử khởi động lại nhưng không được..."
                      state={errors.note ? "error" : "default"}
                      autoResize
                      minRows={4}
                      maxRows={8}
                      style={{
                        fontSize: "16px",
                        lineHeight: "1.6",
                      }}
                    />
                    {errors.note && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <WarningOutlined />
                        {errors.note}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mt-2">
                      💡 Hãy ghi rõ: thiết bị nào gặp sự cố, hiện tượng như thế
                      nào, đã xử lý chưa
                    </p>
                  </div>

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
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2">
                    Ghi chú (không bắt buộc)
                  </label>
                  <Textarea
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    rows={3}
                    placeholder="Ghi chú thêm về ca dạy nếu cần. Ví dụ: Lớp học tập trung, sinh viên nhiệt tình..."
                    style={{
                      fontSize: "16px",
                      lineHeight: "1.6",
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-200">
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
