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
import { UnifiedRequestTypeLabels } from "@/types/unifiedRequest";
import { authFetch } from "@/lib/apiClient";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Tag } from "antd";

export default function AdminRequestsPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { requests, loading, fetchRequests } = useUnifiedRequestsStore();
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

  if (authLoading || loading) {
    return <LoadingSpinner tip="Đang tải..." />;
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
        message: approved ? "Đã phê duyệt yêu cầu" : "Đã từ chối yêu cầu",
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

  const getStatusTag = (status: string) => {
    switch (status) {
      case "Chờ duyệt":
        return { color: "warning", text: "Chờ duyệt" };
      case "Chấp thuận":
        return { color: "success", text: "Đã chấp thuận" };
      case "Từ chối":
        return { color: "error", text: "Đã từ chối" };
      case "Đang xử lý":
        return { color: "processing", text: "Đang xử lý" };
      case "Hoàn thành":
        return { color: "default", text: "Hoàn thành" };
      default:
        return { color: "default", text: status };
    }
  };

  const renderRequestList = (filteredRequests: any[]) => (
    <div className="space-y-3">
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          Không có yêu cầu nào
        </div>
      ) : (
        filteredRequests.map((request) => {
          const statusTag = getStatusTag(request.status);

          return (
            <Card
              key={request._id}
              className="hover:shadow-md transition-shadow p-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Requester Info */}
                <div className="md:col-span-2">
                  <div className="text-[15px] font-semibold text-gray-800">
                    {request.requester?.name}
                  </div>
                  <div className="text-[13px] text-gray-500 mt-0.5">
                    {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>

                {/* Request Info */}
                <div className="md:col-span-3">
                  <div className="font-semibold text-gray-800 text-[15px] mb-1">
                    {request.title}
                  </div>
                  <div className="text-[14px] text-gray-600">
                    {
                      UnifiedRequestTypeLabels[
                        request.type as keyof typeof UnifiedRequestTypeLabels
                      ]
                    }
                  </div>
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <Tag
                    color={statusTag.color}
                    className="text-[14px] px-3 py-1 border-0"
                  >
                    {statusTag.text}
                  </Tag>
                </div>

                {/* Priority */}
                <div className="md:col-span-2">
                  <div className="text-[14px] text-gray-600">
                    {request.priority}
                  </div>
                </div>

                {/* Actions */}
                <div className="md:col-span-3 flex justify-end gap-2">
                  {request.status === "Chờ duyệt" && (
                    <>
                      <Button
                        onClick={() => handleReview(request._id, true)}
                        loading={reviewing === request._id}
                        variant="primary"
                        className="bg-green-600 hover:bg-green-700 border-green-600"
                      >
                        <CheckCircleOutlined className="mr-1" />
                        Duyệt
                      </Button>
                      <Button
                        onClick={() => handleReview(request._id, false)}
                        loading={reviewing === request._id}
                        variant="danger"
                      >
                        <CloseCircleOutlined className="mr-1" />
                        Từ chối
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );

  const pendingRequests = requests.filter((r) => r.status === "Chờ duyệt");
  const approvedRequests = requests.filter((r) => r.status === "Chấp thuận");
  const processingRequests = requests.filter((r) => r.status === "Đang xử lý");
  const completedRequests = requests.filter((r) => r.status === "Hoàn thành");

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
          items={[
            {
              key: "pending",
              label: (
                <span className="flex items-center gap-2">
                  Chờ Duyệt
                  <Badge variant="warning">{pendingRequests.length}</Badge>
                </span>
              ),
              children: renderRequestList(pendingRequests),
            },
            {
              key: "approved",
              label: (
                <span className="flex items-center gap-2">
                  Đã Duyệt
                  <Badge variant="success">{approvedRequests.length}</Badge>
                </span>
              ),
              children: renderRequestList(approvedRequests),
            },
            {
              key: "processing",
              label: (
                <span className="flex items-center gap-2">
                  Đang Xử Lý
                  <Badge variant="info">{processingRequests.length}</Badge>
                </span>
              ),
              children: renderRequestList(processingRequests),
            },
            {
              key: "completed",
              label: (
                <span className="flex items-center gap-2">
                  Hoàn Thành
                  <Badge variant="default">{completedRequests.length}</Badge>
                </span>
              ),
              children: renderRequestList(completedRequests),
            },
          ]}
        />
      </Card>
    </div>
  );
}
