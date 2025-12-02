"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import LoadingSpinner from "@/components/LoadingSpinner";
import Tabs from "@/components/ui/Tabs";
import { useAuth } from "@/hooks/useAuth";
import { useUnifiedRequestsStore } from "@/stores/useUnifiedRequestsStore";
import {
  UnifiedRequestType,
  UnifiedRequestStatus,
  UnifiedRequestTypeLabels,
  UnifiedRequestStatusLabels,
  isMaterialRequest,
  GENERAL_REQUEST_TYPES,
  MATERIAL_REQUEST_TYPES,
} from "@/types/unifiedRequest";
import { authFetch } from "@/lib/apiClient";

interface MyRequestsListProps {
  onEdit?: (request: any) => void;
  onRefresh?: () => void;
}

export function MyRequestsList({ onEdit, onRefresh }: MyRequestsListProps) {
  const { user } = useAuth();
  const { requests, loading, fetchRequests } = useUnifiedRequestsStore();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);

  // Fetch requests on mount
  useEffect(() => {
    if (user?._id) {
      fetchRequests(user._id, user.roles || []);
    }
  }, [user]);

  // Filter requests based on tab
  const getFilteredRequests = () => {
    const userRequests = requests.filter(
      (req) => req.requester._id === user?._id
    );

    if (activeTab === "general") {
      return userRequests.filter((req) =>
        GENERAL_REQUEST_TYPES.includes(req.type)
      );
    } else if (activeTab === "material") {
      return userRequests.filter((req) =>
        MATERIAL_REQUEST_TYPES.includes(req.type)
      );
    }
    return userRequests;
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa yêu cầu này? Chỉ có thể xóa yêu cầu chờ duyệt."
      )
    ) {
      return;
    }

    try {
      setDeleting(id);
      const response = await authFetch(
        `/api/unified-requests/${id}`,
        user?._id!,
        user?.roles || [],
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete request");
      }

      setAlertMessage({
        type: "success",
        message: "Xóa yêu cầu thành công!",
      });
      setTimeout(() => setAlertMessage(null), 3000);
      onRefresh?.();
    } catch (error: any) {
      setAlertMessage({
        type: "error",
        message: error.message || "Có lỗi xảy ra",
      });
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadgeVariant = (
    status: UnifiedRequestStatus
  ): "success" | "error" | "warning" | "info" | "default" => {
    switch (status) {
      case "Chờ duyệt":
        return "warning";
      case "Chấp thuận":
        return "success";
      case "Từ chối":
        return "error";
      case "Đang xử lý":
        return "info";
      case "Hoàn thành":
        return "success";
      default:
        return "default";
    }
  };

  const getPriorityBadgeVariant = (
    priority: string
  ): "success" | "error" | "warning" | "info" | "default" => {
    switch (priority) {
      case "Thấp":
        return "info";
      case "Trung bình":
        return "default";
      case "Cao":
        return "error";
      default:
        return "default";
    }
  };

  const filteredRequests = getFilteredRequests();

  return (
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
            key: "all",
            label: "Tất Cả",
            children: <></>,
            icon: (
              <Badge variant="info" className="ml-2">
                {requests.length}
              </Badge>
            ),
          },
          {
            key: "general",
            label: "📋 Yêu Cầu Chung",
            children: <></>,
            icon: (
              <Badge variant="default" className="ml-2">
                {
                  requests.filter((r) => GENERAL_REQUEST_TYPES.includes(r.type))
                    .length
                }
              </Badge>
            ),
          },
          {
            key: "material",
            label: "🛍️ Yêu Cầu Vật Tư",
            children: <></>,
            icon: (
              <Badge variant="default" className="ml-2">
                {
                  requests.filter((r) =>
                    MATERIAL_REQUEST_TYPES.includes(r.type)
                  ).length
                }
              </Badge>
            ),
          },
        ]}
      />

      {loading ? (
        <div className="text-center py-12">
          <LoadingSpinner tip="Đang tải danh sách yêu cầu..." />
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">Chưa có yêu cầu nào</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <Card
              key={request._id}
              className="hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Title & Type */}
                <div className="md:col-span-4">
                  <div className="font-medium text-gray-900">
                    {request.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {
                      UnifiedRequestTypeLabels[
                        request.type as UnifiedRequestType
                      ]
                    }
                  </div>
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <Badge variant={getStatusBadgeVariant(request.status)}>
                    {UnifiedRequestStatusLabels[request.status]}
                  </Badge>
                </div>

                {/* Priority */}
                <div className="md:col-span-2">
                  <Badge variant={getPriorityBadgeVariant(request.priority)}>
                    {request.priority}
                  </Badge>
                </div>

                {/* Date */}
                <div className="md:col-span-2 text-sm text-gray-600">
                  {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex gap-2 justify-end">
                  {request.status === "Chờ duyệt" && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onEdit?.(request)}
                      >
                        ✏️ Sửa
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(request._id)}
                        loading={deleting === request._id}
                      >
                        🗑️ Xóa
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredRequests.length > 0 && (
        <div className="text-center text-sm text-gray-600 mt-4">
          Tổng {filteredRequests.length} yêu cầu
        </div>
      )}
    </div>
  );
}
