"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import { useUnifiedRequestsStore } from "@/stores/useUnifiedRequestsStore";
import {
  UnifiedRequestTypeLabels,
  UnifiedRequestStatusLabels,
  UnifiedRequestType,
  UnifiedRequestStatus,
  GENERAL_REQUEST_TYPES,
  MATERIAL_REQUEST_TYPES,
} from "@/types/unifiedRequest";
import { authFetch } from "@/lib/apiClient";

export default function AdminRequestsPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { requests, loading, fetchRequests } = useUnifiedRequestsStore();
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin())) {
      router.push("/timetables");
    }
  }, [user, authLoading, isAdmin, router]);

  useEffect(() => {
    if (user?._id && isAdmin()) {
      fetchRequests(user._id, user.roles || []);
    }
  }, [user]);

  if (authLoading) {
    return <LoadingSpinner tip="Đang xác thực..." />;
  }

  if (!user || !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            Không được phép truy cập
          </p>
        </Card>
      </div>
    );
  }

  const getFilteredRequests = () => {
    if (activeTab === "pending") {
      return requests.filter((r) => r.status === "Chờ duyệt");
    } else if (activeTab === "approved") {
      return requests.filter((r) => r.status === "Chấp thuận");
    } else if (activeTab === "processing") {
      return requests.filter((r) => r.status === "Đang xử lý");
    } else if (activeTab === "completed") {
      return requests.filter((r) => r.status === "Hoàn thành");
    }
    return requests;
  };

  const handleReview = async (id: string, approved: boolean) => {
    try {
      setReviewing(id);
      const response = await authFetch(
        `/api/unified-requests/${id}/review`,
        user?._id!,
        user?.roles || [],
        {
          method: "PUT",
          body: JSON.stringify({
            status: approved ? "Chấp thuận" : "Từ chối",
            reviewNote: approved ? "Phê duyệt" : "Từ chối",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to review request");
      }

      setAlertMessage({
        type: "success",
        message: approved ? "Đã phê duyệt" : "Đã từ chối",
      });
      setTimeout(() => setAlertMessage(null), 3000);
      fetchRequests(user?._id!, user?.roles || []);
    } catch (error: any) {
      setAlertMessage({
        type: "error",
        message: error.message || "Có lỗi xảy ra",
      });
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      setReviewing(null);
    }
  };

  const filteredRequests = getFilteredRequests();

  return (
    <div className="p-6 space-y-6">
      {/* Alert Messages */}
      {alertMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Alert
            type={alertMessage.type}
            message={alertMessage.message}
            onClose={() => setAlertMessage(null)}
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📋 Quản Lý Yêu Cầu</h1>
        <Button
          onClick={() => fetchRequests(user?._id!, user?.roles || [])}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      <Card>
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            {
              id: "pending",
              label: (
                <span className="flex items-center gap-2">
                  Chờ Duyệt
                  <Badge variant="warning">
                    {requests.filter((r) => r.status === "Chờ duyệt").length}
                  </Badge>
                </span>
              ),
            },
            {
              id: "approved",
              label: (
                <span className="flex items-center gap-2">
                  Đã Duyệt
                  <Badge variant="success">
                    {requests.filter((r) => r.status === "Chấp thuận").length}
                  </Badge>
                </span>
              ),
            },
            {
              id: "processing",
              label: (
                <span className="flex items-center gap-2">
                  Đang Xử Lý
                  <Badge variant="info">
                    {requests.filter((r) => r.status === "Đang xử lý").length}
                  </Badge>
                </span>
              ),
            },
            {
              id: "completed",
              label: (
                <span className="flex items-center gap-2">
                  Hoàn Thành
                  <Badge variant="neutral">
                    {requests.filter((r) => r.status === "Hoàn thành").length}
                  </Badge>
                </span>
              ),
            },
          ]}
        >
          <div className="mt-4">
            {loading ? (
              <LoadingSpinner tip="Đang tải yêu cầu..." />
            ) : (
              <div className="space-y-3">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500">
                    Không có yêu cầu nào
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <Card
                      key={request._id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-2">
                          <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {request.requester?.name}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {new Date(request.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                        </div>
                        <div className="md:col-span-3">
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            {request.title}
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            {UnifiedRequestTypeLabels[request.type]}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <Badge
                            variant={
                              request.status === "Chờ duyệt"
                                ? "warning"
                                : request.status === "Chấp thuận"
                                ? "success"
                                : request.status === "Từ chối"
                                ? "error"
                                : request.status === "Đang xử lý"
                                ? "info"
                                : "neutral"
                            }
                          >
                            {UnifiedRequestStatusLabels[request.status]}
                          </Badge>
                        </div>
                        <div className="md:col-span-2">
                          <Badge
                            variant={
                              request.priority === "Cao"
                                ? "error"
                                : request.priority === "Trung bình"
                                ? "warning"
                                : "info"
                            }
                          >
                            {request.priority}
                          </Badge>
                        </div>
                        <div className="md:col-span-3 flex justify-end gap-2">
                          {request.status === "Chờ duyệt" && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleReview(request._id, true)}
                                loading={reviewing === request._id}
                              >
                                ✓ Duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleReview(request._id, false)}
                                loading={reviewing === request._id}
                              >
                                ✗ Từ chối
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
