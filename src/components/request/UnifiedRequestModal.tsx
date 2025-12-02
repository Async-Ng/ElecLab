/**
 * Unified Request Modal
 * Modal để tạo/edit request (general hoặc material)
 * Auto-detect type và render form tương ứng
 */

"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Tabs from "@/components/ui/Tabs";
import GeneralRequestForm from "./GeneralRequestForm";
import MaterialRequestForm from "./MaterialRequestForm";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/lib/apiClient";
import {
  UnifiedRequestType,
  GENERAL_REQUEST_TYPES,
  MATERIAL_REQUEST_TYPES,
} from "@/types/unifiedRequest";
import {
  EditOutlined,
  PlusOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (request: any) => void;
  initialData?: any;
  isEdit?: boolean;
}

export default function RequestModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEdit = false,
}: RequestModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("general");
  const [materials, setMaterials] = useState<any[]>([]);
  const [generalFormData, setGeneralFormData] = useState<any>({});
  const [materialFormData, setMaterialFormData] = useState<any>({});
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);
  const { user } = useAuth();

  // Load materials on mount
  useEffect(() => {
    if (isOpen) {
      loadMaterials();

      // Initialize form data
      if (initialData) {
        if (MATERIAL_REQUEST_TYPES.includes(initialData.type)) {
          setMaterialFormData(initialData);
          setActiveTab("material");
        } else {
          setGeneralFormData(initialData);
          setActiveTab("general");
        }
      } else {
        setGeneralFormData({});
        setMaterialFormData({});
        setActiveTab("general");
      }
      setAlertMessage(null);
    }
  }, [isOpen, initialData]);

  const loadMaterials = async () => {
    try {
      const response = await fetch("/api/admin/materials");
      if (response.ok) {
        const data = await response.json();
        setMaterials(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error loading materials:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user?._id) {
        setAlertMessage({
          type: "error",
          message: "User not authenticated",
        });
        return;
      }

      const formData =
        activeTab === "general" ? generalFormData : materialFormData;

      // Validate based on active tab
      if (!formData.type) {
        setAlertMessage({
          type: "error",
          message: "Vui lòng chọn loại yêu cầu",
        });
        return;
      }

      if (activeTab === "general") {
        if (!formData.title || formData.title.length < 5) {
          setAlertMessage({
            type: "error",
            message: "Tiêu đề phải từ 5 ký tự trở lên",
          });
          return;
        }
      }

      if (!formData.description || formData.description.length < 10) {
        setAlertMessage({
          type: "error",
          message: "Mô tả phải từ 10 ký tự trở lên",
        });
        return;
      }

      if (
        activeTab === "material" &&
        (!formData.materials || formData.materials.length === 0)
      ) {
        setAlertMessage({
          type: "error",
          message: "Vui lòng thêm ít nhất một vật tư",
        });
        return;
      }

      setSubmitting(true);

      // Prepare payload
      const payload: any = {
        type: formData.type,
        title: formData.title || formData.description?.substring(0, 50),
        description: formData.description,
        priority: formData.priority || "Trung bình",
      };

      // Add type-specific fields
      if (GENERAL_REQUEST_TYPES.includes(formData.type)) {
        payload.attachments = formData.attachments || [];
      } else if (MATERIAL_REQUEST_TYPES.includes(formData.type)) {
        payload.materials = formData.materials || [];
        payload.roomId = formData.roomId;
      }

      const endpoint = "/api/unified-requests";
      const method = isEdit ? "PUT" : "POST";

      const response = await authFetch(endpoint, user._id, user.roles, {
        method,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create request");
      }

      const data = await response.json();
      setAlertMessage({
        type: "success",
        message: isEdit ? "Cập nhật thành công!" : "Tạo yêu cầu thành công!",
      });

      setTimeout(() => {
        onSuccess?.(data.data);
        onClose();
      }, 1500);
    } catch (error: any) {
      setAlertMessage({
        type: "error",
        message: error.message || "Có lỗi xảy ra",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            {isEdit ? (
              <EditOutlined className="text-orange-600 text-lg" />
            ) : (
              <PlusOutlined className="text-orange-600 text-lg" />
            )}
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {isEdit ? "Chỉnh sửa yêu cầu" : "Tạo yêu cầu mới"}
            </div>
            <div className="text-xs text-gray-500">
              {isEdit
                ? "Cập nhật thông tin yêu cầu"
                : "Gửi yêu cầu chung hoặc vật tư"}
            </div>
          </div>
        </div>
      }
      size="lg"
    >
      <div className="space-y-4">
        {alertMessage && (
          <Alert
            type={alertMessage.type}
            message={alertMessage.message}
            onClose={() => setAlertMessage(null)}
          />
        )}

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "general",
              label: "📋 Yêu Cầu Chung",
              children: (
                <GeneralRequestForm
                  formData={generalFormData}
                  onChange={setGeneralFormData}
                  isLoading={submitting}
                  isEdit={isEdit}
                />
              ),
            },
            {
              key: "material",
              label: "📦 Yêu Cầu Vật Tư",
              children: (
                <MaterialRequestForm
                  formData={materialFormData}
                  onChange={setMaterialFormData}
                  isLoading={submitting}
                  isEdit={isEdit}
                  materials={materials}
                />
              ),
            },
          ]}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            {isEdit ? "Cập nhật" : "Tạo"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
