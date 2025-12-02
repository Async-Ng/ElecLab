/**
 * Material Request Form
 * Form để tạo/edit yêu cầu vật tư (Cấp phát, Sửa chữa)
 */

"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  UnifiedRequestType,
  UnifiedRequestPriority,
  MATERIAL_REQUEST_TYPES,
  UnifiedRequestTypeLabels,
  UnifiedRequestPriorityLabels,
} from "@/types/unifiedRequest";

interface MaterialItem {
  key: string;
  materialId: string;
  materialName: string;
  quantity: number;
  reason: string;
}

interface MaterialRequestFormProps {
  formData: any;
  onChange: (data: any) => void;
  isLoading?: boolean;
  isEdit?: boolean;
  materials?: any[];
}

export default function MaterialRequestForm({
  formData,
  onChange,
  isLoading = false,
  isEdit = false,
  materials = [],
}: MaterialRequestFormProps) {
  const [materialItems, setMaterialItems] = useState<MaterialItem[]>([]);

  // Initialize material items from formData
  useEffect(() => {
    if (formData.materials && Array.isArray(formData.materials)) {
      setMaterialItems(
        formData.materials.map((m: any, idx: number) => ({
          key: `${Date.now()}-${idx}`,
          materialId: m.materialId || "",
          materialName: m.materialName || "",
          quantity: m.quantity || 1,
          reason: m.reason || "",
        }))
      );
    }
  }, []);

  // Sync material items to formData whenever they change
  useEffect(() => {
    onChange({
      ...formData,
      materials: materialItems.map((item) => ({
        materialId: item.materialId,
        quantity: item.quantity,
        reason: item.reason,
      })),
    });
  }, [materialItems]);

  const handleChange = (field: string, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const handleAddMaterial = () => {
    const newKey = `${Date.now()}`;
    setMaterialItems([
      ...materialItems,
      {
        key: newKey,
        materialId: "",
        materialName: "",
        quantity: 1,
        reason: "",
      },
    ]);
  };

  const handleDeleteMaterial = (key: string) => {
    setMaterialItems(materialItems.filter((item) => item.key !== key));
  };

  const handleUpdateMaterial = (
    key: string,
    field: keyof MaterialItem,
    value: any
  ) => {
    setMaterialItems(
      materialItems.map((item) => {
        if (item.key === key) {
          // If updating materialId, also update materialName
          if (field === "materialId") {
            const selected = materials.find((m) => m._id === value);
            return {
              ...item,
              materialId: value,
              materialName: selected?.name || "",
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const isMaterialRepair = formData.type === "Sửa chữa vật tư";

  return (
    <div className="space-y-4">
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Loại Yêu Cầu Vật Tư <span className="text-red-500">*</span>
        </label>
        <Select
          value={formData.type || ""}
          onChange={(value) => handleChange("type", value)}
          placeholder="Chọn loại yêu cầu vật tư"
          disabled={isLoading}
          options={MATERIAL_REQUEST_TYPES.map((type) => ({
            value: type,
            label: UnifiedRequestTypeLabels[type as UnifiedRequestType],
          }))}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô Tả Yêu Cầu <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Mô tả chi tiết về yêu cầu"
          disabled={isLoading}
          rows={4}
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="text-xs text-gray-500 mt-1">
          {formData.description?.length || 0}/500 (Tối thiểu 10 ký tự)
        </div>
      </div>

      {/* Room selection (for repairs) */}
      {isMaterialRepair && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phòng (Nếu Sửa Chữa)
          </label>
          <Select
            value={formData.roomId || ""}
            onChange={(value) => handleChange("roomId", value)}
            placeholder="Chọn phòng (nếu có)"
            disabled={isLoading}
            options={[{ value: "", label: "-- Không chọn --" }]}
          />
        </div>
      )}

      {/* Materials List */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Danh Sách Vật Tư <span className="text-red-500">*</span>
        </label>

        <div className="space-y-3">
          {materialItems.map((item) => (
            <Card key={item.key} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Material Select */}
                <div className="md:col-span-5">
                  <label className="block text-xs text-gray-600 mb-1">
                    Vật Tư
                  </label>
                  <Select
                    value={item.materialId}
                    onChange={(value) =>
                      handleUpdateMaterial(item.key, "materialId", value)
                    }
                    placeholder="Chọn vật tư"
                    disabled={isLoading}
                    options={materials.map((mat) => ({
                      value: mat._id,
                      label: `${mat.name} (${mat.material_id})`,
                    }))}
                  />
                </div>

                {/* Quantity */}
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">
                    Số Lượng
                  </label>
                  <Input
                    type="number"
                    value={item.quantity.toString()}
                    onChange={(e) =>
                      handleUpdateMaterial(
                        item.key,
                        "quantity",
                        parseInt(e.target.value) || 1
                      )
                    }
                    min={1}
                    disabled={isLoading}
                  />
                </div>

                {/* Reason */}
                <div className="md:col-span-4">
                  <label className="block text-xs text-gray-600 mb-1">
                    Lý Do
                  </label>
                  <Input
                    value={item.reason}
                    onChange={(e) =>
                      handleUpdateMaterial(item.key, "reason", e.target.value)
                    }
                    placeholder="Lý do yêu cầu"
                    disabled={isLoading}
                  />
                </div>

                {/* Delete Button */}
                <div className="md:col-span-1 flex items-end">
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteMaterial(item.key)}
                    disabled={isLoading}
                    className="w-full"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {materialItems.length === 0 && (
          <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-md">
            Chưa có vật tư nào. Nhấn nút "Thêm Vật Tư" để bắt đầu.
          </div>
        )}

        <Button
          variant="outline"
          onClick={handleAddMaterial}
          disabled={isLoading}
          className="w-full mt-3"
        >
          ➕ Thêm Vật Tư
        </Button>
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
    </div>
  );
}
