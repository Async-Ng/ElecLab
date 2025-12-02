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
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { Tag } from "antd";

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

  // Get priority icon and color
  const getPriorityDisplay = (priority: string) => {
    switch (priority) {
      case "Cao":
        return {
          icon: <ArrowUpOutlined />,
          color: "error",
          text: "Ưu tiên cao",
        };
      case "Trung bình":
        return {
          icon: <MinusOutlined />,
          color: "warning",
          text: "Ưu tiên trung bình",
        };
      case "Thấp":
        return {
          icon: <ArrowDownOutlined />,
          color: "default",
          text: "Ưu tiên thấp",
        };
      default:
        return {
          icon: <MinusOutlined />,
          color: "default",
          text: priority,
        };
    }
  };

  // Get status tag
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
                  filteredRequests.map((request) => {
                    const statusTag = getStatusTag(request.status);
                    const priorityDisplay = getPriorityDisplay(
                      request.priority
                    );

                    return (
                      <Card
                        key={request._id}
                        className="hover:shadow-md transition-shadow"
                        style={{ padding: "20px" }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          {/* Requester Info */}
                          <div className="md:col-span-2">
                            <div
                              style={{
                                fontSize: "15px",
                                fontWeight: 600,
                                color: "#1E293B",
                              }}
                            >
                              {request.requester?.name}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#64748B",
                                marginTop: "2px",
                              }}
                            >
                              {new Date(request.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          </div>

                          {/* Request Info */}
                          <div className="md:col-span-3">
                            <div
                              style={{
                                fontWeight: 600,
                                color: "#1E293B",
                                fontSize: "15px",
                                marginBottom: "4px",
                              }}
                            >
                              {request.title}
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                color: "#64748B",
                              }}
                            >
                              {UnifiedRequestTypeLabels[request.type]}
                            </div>
                          </div>

                          {/* Status */}
                          <div className="md:col-span-2">
                            <Tag
                              color={statusTag.color}
                              style={{
                                fontSize: "14px",
                                padding: "4px 12px",
                                border: "none",
                              }}
                            >
                              {statusTag.text}
                            </Tag>
                          </div>

                          {/* Priority */}
                          <div className="md:col-span-2">
                            <Tag
                              color={priorityDisplay.color}
                              icon={priorityDisplay.icon}
                              style={{
                                fontSize: "14px",
                                padding: "4px 12px",
                                border: "none",
                              }}
                            >
                              {priorityDisplay.text}
                            </Tag>
                          </div>

                          {/* Actions */}
                          <div className="md:col-span-3 flex justify-end gap-2">
                            {request.status === "Chờ duyệt" && (
                              <>
                                <Button
                                  icon={<CheckCircleOutlined />}
                                  onClick={() =>
                                    handleReview(request._id, true)
                                  }
                                  loading={reviewing === request._id}
                                  className="bg-green-600 hover:bg-green-700"
                                  style={{
                                    backgroundColor: "#16A34A",
                                    borderColor: "#16A34A",
                                    color: "white",
                                    fontSize: "15px",
                                    height: "40px",
                                    paddingLeft: "16px",
                                    paddingRight: "16px",
                                    fontWeight: 600,
                                  }}
                                  onMouseEnter={(e: any) => {
                                    e.currentTarget.style.backgroundColor =
                                      "#15803D";
                                  }}
                                  onMouseLeave={(e: any) => {
                                    e.currentTarget.style.backgroundColor =
                                      "#16A34A";
                                  }}
                                >
                                  Duyệt
                                </Button>
                                <Button
                                  danger
                                  icon={<CloseCircleOutlined />}
                                  onClick={() =>
                                    handleReview(request._id, false)
                                  }
                                  loading={reviewing === request._id}
                                  style={{
                                    fontSize: "15px",
                                    height: "40px",
                                    paddingLeft: "16px",
                                    paddingRight: "16px",
                                    fontWeight: 600,
                                  }}
                                >
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
            )}
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
