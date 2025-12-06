/**
 * General Request Form
 * Form để tạo/edit yêu cầu chung (Tài liệu, Phòng học, Lịch dạy, Khác)
 */

"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import {
  UnifiedRequestType,
  UnifiedRequestPriority,
  GENERAL_REQUEST_TYPES,
  UnifiedRequestTypeLabels,
  UnifiedRequestPriorityLabels,
} from "@/types/unifiedRequest";

interface GeneralRequestFormProps {
  formData: any;
  onChange: (data: any) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export default function GeneralRequestForm({
  formData,
  onChange,
  isLoading = false,
  isEdit = false,
}: GeneralRequestFormProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Loại Yêu Cầu <span className="text-red-500">*</span>
        </label>
        <Select
          value={formData.type || ""}
          onChange={(value) => handleChange("type", value)}
          placeholder="Chọn loại yêu cầu"
          disabled={isLoading}
          options={GENERAL_REQUEST_TYPES.map((type) => ({
            value: type,
            label: UnifiedRequestTypeLabels[type as UnifiedRequestType],
          }))}
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiêu Đề <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Nhập tiêu đề yêu cầu"
          disabled={isLoading}
          maxLength={100}
        />
        <div className="text-xs text-gray-500 mt-1">Từ 5-100 ký tự</div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô Tả Chi Tiết <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Mô tả chi tiết về yêu cầu của bạn"
          disabled={isLoading}
          rows={4}
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="text-xs text-gray-500 mt-1">
          {formData.description?.length || 0}/500 (Tối thiểu 10 ký tự)
        </div>
      </div>

      {/* Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mức Độ Ưu Tiên <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.priority || "Trung bình"}
            onChange={(value) => handleChange("priority", value)}
            placeholder="Chọn mức độ ưu tiên"
            disabled={isLoading}
            options={Object.values(UnifiedRequestPriority).map((priority) => ({
              value: priority,
              label:
                UnifiedRequestPriorityLabels[
                  priority as UnifiedRequestPriority
                ],
            }))}
          />
        </div>
      </div>

      {/* Attachments hint */}
      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
        💡 Hiện tại chưa hỗ trợ đính kèm file trực tiếp. Vui lòng liên hệ admin
        để thêm file.
      </div>
    </div>
  );
}
